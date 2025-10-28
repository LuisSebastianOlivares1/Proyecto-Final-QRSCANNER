const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');
const QRCode = require('qrcode');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../build')));

// Configuración de la base de datos
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'sistema_control_ingreso',
  charset: 'utf8mb4'
};

let pool;

async function createPool() {
  pool = mysql.createPool({
    ...dbConfig,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
  
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conectado a la base de datos MySQL');
    connection.release();
  } catch (error) {
    console.error('❌ Error conectando a la base de datos:', error.message);
  }
}

createPool();

const authenticateToken = (req, res, next) => {
  next();
};

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const [users] = await pool.execute(
      `SELECT u.*, e.nombre_completo, e.codigo_empleado 
       FROM usuarios_sistema u 
       LEFT JOIN empleados e ON u.empleado_id = e.id_empleado 
       WHERE u.username = ? AND u.estado = 'activo'`,
      [username]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = users[0];
    const validPassword = password === 'admin123';
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    res.json({
      id: user.id_usuario,
      username: user.username,
      role: user.rol,
      fullName: user.nombre_completo || user.username,
      employeeCode: user.codigo_empleado
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Obtener empleados
app.get('/api/employees', authenticateToken, async (req, res) => {
  try {
    const [employees] = await pool.execute(`
      SELECT 
        e.id_empleado as id,
        e.codigo_empleado,
        e.dni,
        e.nombre_completo as name,
        e.email,
        p.nombre_puesto as position,
        d.nombre_departamento as department,
        e.estado as status,
        e.qr_code as qrCode,
        e.fecha_contratacion as hireDate,
        h.hora_entrada as entryTime,
        h.hora_salida as exitTime,
        h.tolerancia_minutos as toleranceMinutes
      FROM empleados e
      JOIN puestos p ON e.puesto_id = p.id_puesto
      JOIN departamentos d ON e.departamento_id = d.id_departamento
      LEFT JOIN empleado_horarios eh ON e.id_empleado = eh.empleado_id AND eh.estado = 'activo'
      LEFT JOIN horarios_laborales h ON eh.horario_id = h.id_horario
      WHERE e.estado = 'activo'
      ORDER BY e.nombre_completo
    `);

    const today = new Date().toISOString().split('T')[0];
    const [attendance] = await pool.execute(
      `SELECT empleado_id, tipo_registro, hora_entrada as entryTime, hora_salida as exitTime 
       FROM registros_asistencia 
       WHERE fecha = ?`,
      [today]
    );

    const employeesWithAttendance = employees.map(emp => {
      const todayAttendance = attendance.filter(a => a.empleado_id === emp.id);
      const entrada = todayAttendance.find(a => a.tipo_registro === 'entrada');
      const salida = todayAttendance.find(a => a.tipo_registro === 'salida');
      
      return {
        ...emp,
        entryTime: entrada ? entrada.entryTime : emp.entryTime,
        exitTime: salida ? salida.exitTime : null,
        status: entrada ? 'puntual' : 'ausente'
      };
    });

    res.json(employeesWithAttendance);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Crear empleado (con DNI)
app.post('/api/employees', authenticateToken, async (req, res) => {
  try {
    const { name, email, position, department, phone, address, dni } = req.body;
    
    if (!dni) {
      return res.status(400).json({ error: 'El DNI es obligatorio' });
    }

    const [existingDNI] = await pool.execute(
      'SELECT id_empleado FROM empleados WHERE dni = ?',
      [dni]
    );
    if (existingDNI.length > 0) {
      return res.status(400).json({ error: 'El DNI ya está registrado' });
    }

    const [lastEmployee] = await pool.execute(
      'SELECT codigo_empleado FROM empleados ORDER BY id_empleado DESC LIMIT 1'
    );
    
    let nextCode = 'EMP001';
    if (lastEmployee.length > 0) {
      const lastNumber = parseInt(lastEmployee[0].codigo_empleado.replace('EMP', ''));
      nextCode = `EMP${String(lastNumber + 1).padStart(3, '0')}`;
    }

    const [puesto] = await pool.execute(
      'SELECT id_puesto FROM puestos WHERE nombre_puesto = ? LIMIT 1',
      [position]
    );
    
    const [departamento] = await pool.execute(
      'SELECT id_departamento FROM departamentos WHERE nombre_departamento = ? LIMIT 1',
      [department]
    );

    if (puesto.length === 0 || departamento.length === 0) {
      return res.status(400).json({ error: 'Puesto o departamento no válido' });
    }

    const puestoId = puesto[0].id_puesto;
    const departamentoId = departamento[0].id_departamento;

    const [result] = await pool.execute(
      `INSERT INTO empleados (
        codigo_empleado, dni, nombre_completo, email, telefono, 
        puesto_id, departamento_id, fecha_contratacion, qr_code, estado
      ) VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE(), ?, 'activo')`,
      [nextCode, dni, name, email, phone, puestoId, departamentoId, nextCode]
    );

    await pool.execute(
      `INSERT INTO empleado_horarios (empleado_id, horario_id, fecha_inicio, estado) 
       VALUES (?, 1, CURDATE(), 'activo')`,
      [result.insertId]
    );

    const [newEmployee] = await pool.execute(`
      SELECT 
        e.id_empleado as id,
        e.codigo_empleado,
        e.dni,
        e.nombre_completo as name,
        e.email,
        p.nombre_puesto as position,
        d.nombre_departamento as department,
        e.qr_code as qrCode,
        h.hora_entrada as entryTime
      FROM empleados e
      JOIN puestos p ON e.puesto_id = p.id_puesto
      JOIN departamentos d ON e.departamento_id = d.id_departamento
      LEFT JOIN empleado_horarios eh ON e.id_empleado = eh.empleado_id
      LEFT JOIN horarios_laborales h ON eh.horario_id = h.id_horario
      WHERE e.id_empleado = ?
    `, [result.insertId]);

    res.status(201).json(newEmployee[0]);
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Generar QR con SOLO el DNI
app.get('/api/qr/:employeeId', authenticateToken, async (req, res) => {
  try {
    const { employeeId } = req.params;

    const [employees] = await pool.execute(
      `SELECT id_empleado, dni FROM empleados WHERE id_empleado = ?`,
      [employeeId]
    );

    if (employees.length === 0) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }

    const employee = employees[0];
    if (!employee.dni) {
      return res.status(400).json({ error: 'El empleado no tiene DNI asignado' });
    }

    const qrContent = employee.dni;
    const qrImage = await QRCode.toDataURL(qrContent);

    await pool.execute(
      'UPDATE empleados SET qr_code = ? WHERE id_empleado = ?',
      [qrImage, employee.id_empleado]
    );

    res.json({ qrImage, dni: employee.dni });
  } catch (error) {
    console.error('Error generando QR:', error);
    res.status(500).json({ error: 'Error generando QR' });
  }
});

// Registrar asistencia (entrada o salida)
app.post('/api/attendance', authenticateToken, async (req, res) => {
  try {
    const { dni, tipoRegistro, latitud, longitud, direccionIp, dispositivo } = req.body;
    
    if (!dni || !tipoRegistro) {
      return res.status(400).json({ error: 'DNI y tipo de registro son obligatorios' });
    }

    const [employees] = await pool.execute(
      'SELECT id_empleado FROM empleados WHERE dni = ?',
      [dni]
    );

    if (employees.length === 0) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }

    const empleadoId = employees[0].id_empleado;
    const fechaActual = new Date().toISOString().split('T')[0];
    const horaActual = new Date().toTimeString().split(' ')[0];
    
    // Verificar si ya existe un registro del mismo tipo hoy
    const [existingRecords] = await pool.execute(
      'SELECT id_registro FROM registros_asistencia WHERE empleado_id = ? AND fecha = ? AND tipo_registro = ?',
      [empleadoId, fechaActual, tipoRegistro]
    );

    if (existingRecords.length > 0) {
      return res.status(400).json({ error: `Ya existe un registro de ${tipoRegistro} para hoy` });
    }

    // Actualizar registro existente o crear nuevo
    if (tipoRegistro === 'salida') {
      // Actualizar el registro de entrada existente
      const [result] = await pool.execute(
        `UPDATE registros_asistencia 
         SET hora_salida = ?, minutos_tardanza = 0, estado = 'puntual'
         WHERE empleado_id = ? AND fecha = ? AND tipo_registro = 'entrada'`,
        [horaActual, empleadoId, fechaActual]
      );

      if (result.affectedRows === 0) {
        return res.status(400).json({ error: 'No se puede registrar salida sin entrada' });
      }

      res.json({ 
        success: true,
        message: 'Salida registrada correctamente',
        timestamp: new Date().toISOString()
      });
    } else {
      // Crear nuevo registro de entrada
      const [result] = await pool.execute(
        `INSERT INTO registros_asistencia (
          empleado_id, fecha, hora_entrada, tipo_registro, metodo_registro,
          latitud, longitud, direccion_ip, dispositivo, minutos_tardanza, estado
        ) VALUES (?, ?, ?, ?, 'qr', ?, ?, ?, ?, 0, 'puntual')`,
        [empleadoId, fechaActual, horaActual, tipoRegistro, latitud, longitud, direccionIp, dispositivo]
      );

      res.json({ 
        success: true,
        message: 'Entrada registrada correctamente',
        registroId: result.insertId,
        timestamp: new Date().toISOString()
      });
    }
    
  } catch (error) {
    console.error('❌ Error registrando asistencia:', error);
    res.status(500).json({ 
      error: 'Error del servidor al registrar asistencia',
      details: error.message 
    });
  }
});

// Reportes mensuales
app.get('/api/reports/monthly', authenticateToken, async (req, res) => {
  try {
    const { mes, anio } = req.query;
    const currentMonth = mes || new Date().getMonth() + 1;
    const currentYear = anio || new Date().getFullYear();

    const [report] = await pool.execute(`
      SELECT 
        e.codigo_empleado,
        e.nombre_completo,
        d.nombre_departamento,
        p.nombre_puesto,
        COUNT(ra.id_registro) as dias_trabajados,
        COALESCE(SUM(ra.minutos_tardanza), 0) as total_tardanza_min,
        COALESCE(AVG(ra.minutos_tardanza), 0) as promedio_tardanza_min,
        SUM(CASE WHEN ra.estado = 'tardanza' THEN 1 ELSE 0 END) as dias_tardanza,
        SUM(CASE WHEN ra.estado = 'ausente' THEN 1 ELSE 0 END) as dias_ausente,
        SUM(CASE WHEN ra.estado = 'puntual' THEN 1 ELSE 0 END) as dias_puntual
      FROM empleados e
      JOIN departamentos d ON e.departamento_id = d.id_departamento
      JOIN puestos p ON e.puesto_id = p.id_puesto
      LEFT JOIN registros_asistencia ra ON e.id_empleado = ra.empleado_id 
        AND MONTH(ra.fecha) = ? AND YEAR(ra.fecha) = ?
      WHERE e.estado = 'activo'
      GROUP BY e.id_empleado
      ORDER BY d.nombre_departamento, e.nombre_completo
    `, [currentMonth, currentYear]);

    res.json(report);
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Departamentos
app.get('/api/departments', authenticateToken, async (req, res) => {
  try {
    const [departments] = await pool.execute(
      'SELECT id_departamento as id, nombre_departamento as name FROM departamentos WHERE estado = "activo"'
    );
    res.json(departments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Puestos
app.get('/api/positions', authenticateToken, async (req, res) => {
  try {
    const [positions] = await pool.execute(
      'SELECT id_puesto as id, nombre_puesto as name FROM puestos WHERE estado = "activo"'
    );
    res.json(positions);
  } catch (error) {
    console.error('Error fetching positions:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Debug
app.get('/api/debug/employees', authenticateToken, async (req, res) => {
  try {
    const [employees] = await pool.execute('SELECT * FROM empleados LIMIT 5');
    const [attendance] = await pool.execute('SELECT * FROM registros_asistencia LIMIT 5');
    res.json({ employees, attendance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Servir app React
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
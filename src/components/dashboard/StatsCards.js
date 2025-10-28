import React from 'react';
import { Users, Clock, AlertTriangle, Calendar } from 'lucide-react';

const StatsCards = ({ employees }) => {
  const stats = [
    {
      label: 'Total Empleados',
      value: employees.length,
      icon: Users,
      gradient: 'from-green-500 to-emerald-600',
      iconColor: 'text-green-200'
    },
    {
      label: 'Puntuales Hoy',
      value: employees.filter(emp => emp.tardiness === 0).length,
      icon: Clock,
      gradient: 'from-blue-500 to-cyan-600',
      iconColor: 'text-blue-200'
    },
    {
      label: 'Con Tardanza',
      value: employees.filter(emp => emp.tardiness > 0).length,
      icon: AlertTriangle,
      gradient: 'from-yellow-500 to-orange-600',
      iconColor: 'text-yellow-200'
    },
    {
      label: 'Tardanza Promedio',
      value: `${employees.length > 0 
        ? Math.round(employees.reduce((acc, emp) => acc + emp.tardiness, 0) / employees.length) 
        : 0} min`,
      icon: Calendar,
      gradient: 'from-purple-500 to-pink-600',
      iconColor: 'text-purple-200'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className={`bg-gradient-to-br ${stat.gradient} rounded-2xl p-6 text-white shadow-lg`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-opacity-80 text-sm font-medium">{stat.label}</p>
                <p className="text-3xl font-bold mt-1">{stat.value}</p>
              </div>
              <Icon className={`h-12 w-12 ${stat.iconColor}`} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;
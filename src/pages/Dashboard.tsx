import React from 'react';
import { useAuth } from "../context/AuthContext";
import VisibleIf from "../components/VisibleIf";
import { LayoutDashboard, Users, Activity, TrendingUp, Shield, Eye, Wrench, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: string;
  color: string;
  delay: number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, trend, color, delay }) => (
  <div 
    className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 p-6 hover:border-slate-600/50 transition-all duration-300 hover:shadow-xl"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    
    <div className="relative flex items-start justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-white mb-2">{value}</h3>
        {trend && (
          <div className="flex items-center gap-1 text-sm">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-400 font-medium">{trend}</span>
            <span className="text-slate-500">vs mes anterior</span>
          </div>
        )}
      </div>
      
      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
    </div>
  </div>
);

interface ActivityItemProps {
  title: string;
  time: string;
  type: 'success' | 'info' | 'warning';
  delay: number;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ title, time, type, delay }) => {
  const colors = {
    success: 'from-emerald-500 to-green-600',
    info: 'from-blue-500 to-cyan-600',
    warning: 'from-yellow-500 to-orange-600'
  };

  return (
    <div 
      className="flex items-start gap-4 p-4 rounded-xl bg-slate-800/30 hover:bg-slate-800/50 transition-all duration-200 border border-slate-700/30 hover:border-slate-600/50"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${colors[type]} mt-2 shadow-lg`}></div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-200">{title}</p>
        <p className="text-xs text-slate-500 mt-0.5">{time}</p>
      </div>
    </div>
  );
};

type Role = 'Administrador' | 'Supervisor' | 'Operador';

export default function Dashboard() {
  const { user } = useAuth();
  const rolNombre: Role = (user?.role as Role) ?? "Operador";
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Buenos días");
    else if (hour < 19) setGreeting("Buenas tardes");
    else setGreeting("Buenas noches");
  }, []);

  const roleConfig: Record<Role, { icon: React.ComponentType<{ className?: string }>; color: string; bgColor: string; textColor: string; borderColor: string; }> = {
    "Administrador": {
      icon: Shield,
      color: "from-emerald-500 to-green-600",
      bgColor: "bg-emerald-900/20",
      textColor: "text-emerald-300",
      borderColor: "border-emerald-500/30"
    },
    "Supervisor": {
      icon: Eye,
      color: "from-blue-500 to-cyan-600",
      bgColor: "bg-blue-900/20",
      textColor: "text-blue-300",
      borderColor: "border-blue-500/30"
    },
    "Operador": {
      icon: Wrench,
      color: "from-yellow-500 to-orange-600",
      bgColor: "bg-yellow-900/20",
      textColor: "text-yellow-300",
      borderColor: "border-yellow-500/30"
    }
  };

  const currentRole = roleConfig[rolNombre] || roleConfig["Operador"];
  const RoleIcon = currentRole.icon;

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 border border-slate-700/50 p-8 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-transparent"></div>
        
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${currentRole.color} flex items-center justify-center shadow-xl`}>
              <LayoutDashboard className="w-8 h-8 text-white" />
            </div>
            
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">
                {greeting}, {user?.name || "Usuario"}
              </h1>
              <p className="text-slate-400">
                Bienvenido a tu panel de control
              </p>
            </div>
          </div>

          <div className={`flex items-center gap-3 px-5 py-3 rounded-xl ${currentRole.bgColor} border ${currentRole.borderColor}`}>
            <RoleIcon className={`w-5 h-5 ${currentRole.textColor}`} />
            <div>
              <p className="text-xs text-slate-400">Rol actual</p>
              <p className={`font-semibold ${currentRole.textColor}`}>{rolNombre}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Vehículos" 
          value="124" 
          icon={Activity}
          trend="+12%"
          color="from-blue-500 to-cyan-600"
          delay={0}
        />
        <StatCard 
          title="En Operación" 
          value="98" 
          icon={TrendingUp}
          trend="+8%"
          color="from-emerald-500 to-green-600"
          delay={100}
        />
        <StatCard 
          title="Mantenimiento" 
          value="18" 
          icon={Wrench}
          color="from-yellow-500 to-orange-600"
          delay={200}
        />
        <StatCard 
          title="Usuarios" 
          value="45" 
          icon={Users}
          trend="+5%"
          color="from-purple-500 to-pink-600"
          delay={300}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-400" />
            Panel Específico
          </h2>

          <VisibleIf condition={rolNombre === "Administrador"}>
            <div className={`p-5 rounded-xl ${currentRole.bgColor} border ${currentRole.borderColor}`}>
              <div className="flex items-start gap-3 mb-4">
                <Shield className="w-6 h-6 text-emerald-400 mt-1" />
                <div>
                  <h3 className="font-semibold text-emerald-200 mb-2">
                    Panel de Administrador
                  </h3>
                  <p className="text-sm text-emerald-300/80">
                    Tienes acceso completo al sistema. Puedes gestionar usuarios, configuraciones y ver todos los reportes.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <button className="px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 rounded-lg text-sm font-medium transition-colors border border-emerald-500/30">
                  Gestionar Usuarios
                </button>
                <button className="px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 rounded-lg text-sm font-medium transition-colors border border-emerald-500/30">
                  Configuración
                </button>
              </div>
            </div>
          </VisibleIf>

          <VisibleIf condition={rolNombre === "Supervisor"}>
            <div className={`p-5 rounded-xl ${currentRole.bgColor} border ${currentRole.borderColor}`}>
              <div className="flex items-start gap-3 mb-4">
                <Eye className="w-6 h-6 text-blue-400 mt-1" />
                <div>
                  <h3 className="font-semibold text-blue-200 mb-2">
                    Panel de Supervisor
                  </h3>
                  <p className="text-sm text-blue-300/80">
                    Puedes supervisar operaciones, revisar reportes y gestionar el personal operativo.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <button className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded-lg text-sm font-medium transition-colors border border-blue-500/30">
                  Ver Reportes
                </button>
                <button className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded-lg text-sm font-medium transition-colors border border-blue-500/30">
                  Supervisar
                </button>
              </div>
            </div>
          </VisibleIf>

          <VisibleIf condition={rolNombre === "Operador"}>
            <div className={`p-5 rounded-xl ${currentRole.bgColor} border ${currentRole.borderColor}`}>
              <div className="flex items-start gap-3 mb-4">
                <Wrench className="w-6 h-6 text-yellow-400 mt-1" />
                <div>
                  <h3 className="font-semibold text-yellow-200 mb-2">
                    Panel de Operador
                  </h3>
                  <p className="text-sm text-yellow-300/80">
                    Gestiona las operaciones diarias, registra actividades y actualiza el estado de los vehículos.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <button className="px-4 py-2 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-300 rounded-lg text-sm font-medium transition-colors border border-yellow-500/30">
                  Registrar Actividad
                </button>
                <button className="px-4 py-2 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-300 rounded-lg text-sm font-medium transition-colors border border-yellow-500/30">
                  Ver Tareas
                </button>
              </div>
            </div>
          </VisibleIf>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            Actividad Reciente
          </h2>
          
          <div className="space-y-3">
            <ActivityItem 
              title="Vehículo #3421 entró en mantenimiento"
              time="Hace 15 minutos"
              type="warning"
              delay={0}
            />
            <ActivityItem 
              title="Nuevo usuario registrado: María González"
              time="Hace 1 hora"
              type="success"
              delay={100}
            />
            <ActivityItem 
              title="Reporte mensual generado"
              time="Hace 2 horas"
              type="info"
              delay={200}
            />
            <ActivityItem 
              title="Sistema actualizado correctamente"
              time="Hace 3 horas"
              type="success"
              delay={300}
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 p-6">
        <h2 className="text-xl font-bold text-white mb-4">Acciones Rápidas</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="group p-4 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-200">
            <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Activity className="w-6 h-6 text-blue-400" />
            </div>
            <p className="text-sm font-medium text-slate-200">Nuevo Registro</p>
          </button>
          
          <button className="group p-4 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-emerald-500/50 transition-all duration-200">
            <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
            </div>
            <p className="text-sm font-medium text-slate-200">Ver Reportes</p>
          </button>
          
          <button className="group p-4 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-purple-500/50 transition-all duration-200">
            <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6 text-purple-400" />
            </div>
            <p className="text-sm font-medium text-slate-200">Gestionar</p>
          </button>
          
          <button className="group p-4 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-yellow-500/50 transition-all duration-200">
            <div className="w-12 h-12 rounded-lg bg-yellow-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Wrench className="w-6 h-6 text-yellow-400" />
            </div>
            <p className="text-sm font-medium text-slate-200">Configurar</p>
          </button>
        </div>
      </div>
    </div>
  );
}
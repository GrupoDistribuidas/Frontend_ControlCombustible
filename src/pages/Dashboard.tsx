// src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import {
  BarChart3,
  Gauge,
  MapPin,
  Users as UsersIcon,
  RefreshCw,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line
} from "recharts";

import { reportsService } from "../services/reports.service";

import type {
  KPI,
  VehiculosPorTipo,
  VehiculosPorEstado,
  RutasPorProvincia,
  ChoferesTotales,
  AsignacionesPorEstado,
  ConsumoPromedio,
  DesviacionCombustible
} from "../types/reports";

import { ChartCard } from "../components/ChartCard"; // ← AQUÍ USAS TU NUEVO CHARTCARD
import toast from "react-hot-toast";

const COLORS = ["#22c55e", "#3b82f6", "#f97316", "#e11d48", "#a855f7"];

const ESTADOS_ASIGNACION = [
  "Asignada",
  "En Proceso",
  "Completada",
  "Cancelada",
  "Pausada"
];

export default function Dashboard() {
  const [loading, setLoading] = useState(false);

  const [kpis, setKpis] = useState<KPI | null>(null);
  const [consumoPromedio, setConsumoPromedio] =
    useState<ConsumoPromedio | null>(null);

  const [vehiculosPorTipo, setVehiculosPorTipo] = useState<VehiculosPorTipo[]>([]);
  const [vehiculosPorEstado, setVehiculosPorEstado] = useState<VehiculosPorEstado[]>([]);
  const [rutasPorProvincia, setRutasPorProvincia] = useState<RutasPorProvincia[]>([]);
  const [choferesTotales, setChoferesTotales] = useState<ChoferesTotales | null>(null);
  const [asignacionesPorEstado, setAsignacionesPorEstado] = useState<AsignacionesPorEstado[]>([]);
  const [desviacionesCombustible, setDesviacionesCombustible] = useState<DesviacionCombustible[]>([]);

  const loadReportsData = async () => {
    try {
      setLoading(true);

      const [
        kpiData,
        consumoData,
        vehTipo,
        vehEstado,
        rutasProv,
        choferesData,
        asignacionesEstado,
        desviacionesData
      ] = await Promise.all([
        reportsService.getKPIs(),
        reportsService.getConsumoPromedio(),
        reportsService.getVehiculosPorTipo(),
        reportsService.getVehiculosPorEstado(),
        reportsService.getRutasPorProvincia(),
        reportsService.getChoferesTotales(),
        reportsService.getAsignacionesPorEstado(),
        reportsService.getDesviacionesCombustible()
      ]);

      setKpis(kpiData);
      setConsumoPromedio(consumoData);
      setVehiculosPorTipo(vehTipo);
      setVehiculosPorEstado(vehEstado);
      setRutasPorProvincia(rutasProv);
      setChoferesTotales(choferesData);
      setAsignacionesPorEstado(asignacionesEstado);
      setDesviacionesCombustible(desviacionesData);

    } catch (error) {
      console.error("Error cargando dashboard", error);
      toast.error("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReportsData();
  }, []);

  const totalVehiculos = kpis?.vehiculos.totalGeneral ?? 0;
  const vehiculosActivos = kpis?.vehiculos.totalActivos ?? 0;

  const rutasActivas = kpis?.rutas.totalActivas ?? 0;
  const choferesActivos = choferesTotales?.totalActivos ?? 0;

  const consumoProm =
    consumoPromedio?.consumoPromedio ??
    kpis?.combustible.consumoPromedio ??
    0;

  // =======================
  // EXPORT DATASETS
  // =======================

  const vehiculosPorTipoExport = vehiculosPorTipo.map((v) => ({
    Tipo: v.tipoNombre,
    Cantidad: v.cantidad,
  }));

  const vehiculosPorEstadoExport = vehiculosPorEstado.map((v) => ({
    Estado: v.disponibilidad,
    Cantidad: v.cantidad,
  }));

  const rutasPorProvinciaExport = rutasPorProvincia.map((r) => ({
    Provincia: r.provincia,
    Total_Rutas: r.totalRutas,
    Activas: r.rutasActivas,
    Inactivas: r.rutasInactivas,
    Distancia_Total: r.distanciaTotal,
  }));

  const asignacionesPorEstadoCompleto = ESTADOS_ASIGNACION.map((estado) => {
    const encontrado = asignacionesPorEstado.find((a) => a.estadoNombre === estado);
    return {
      estadoNombre: estado,
      totalAsignaciones: encontrado ? encontrado.totalAsignaciones : 0,
    };
  });

  const asignacionesPorEstadoExport = asignacionesPorEstadoCompleto.map((a) => ({
    Estado: a.estadoNombre,
    Total_Asignaciones: a.totalAsignaciones,
  }));

  // Agrupar datos de desviaciones por vehículo
  const consumoPorVehiculo = desviacionesCombustible.reduce((acc, d) => {
    if (!acc[d.vehiculoNombre]) {
      acc[d.vehiculoNombre] = { vehiculo: d.vehiculoNombre, estimado: 0, real: 0, count: 0 };
    }
    acc[d.vehiculoNombre].estimado += d.combustibleEstimado;
    acc[d.vehiculoNombre].real += d.combustibleReal;
    acc[d.vehiculoNombre].count += 1;
    return acc;
  }, {} as Record<string, { vehiculo: string; estimado: number; real: number; count: number }>);

  const consumoPorVehiculoData = Object.values(consumoPorVehiculo).map((v) => ({
    vehiculo: v.vehiculo,
    estimado: v.count ? v.estimado / v.count : 0,
    real: v.count ? v.real / v.count : 0,
  }));

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 space-y-12">

      {/* ===================== HEADER ===================== */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-emerald-400">
            Buenas tardes, Usuario
          </h1>
          <p className="text-slate-400">
            Bienvenido a tu panel de combustible y logística.
          </p>
        </div>

        <button
          onClick={loadReportsData}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-slate-100 hover:bg-slate-700"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Actualizando..." : "Actualizar"}
        </button>
      </div>

      {/* ===================== KPI CARDS ===================== */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard
          icon={<BarChart3 className="w-6 h-6 text-sky-400" />}
          title="Total Vehículos"
          value={totalVehiculos}
          subtitle={`Activos: ${vehiculosActivos}`}
        />

        <KpiCard
          icon={<Gauge className="w-6 h-6 text-emerald-400" />}
          title="Consumo Promedio"
          value={consumoProm.toFixed(2)}
          subtitle="Galones / viaje"
        />

        <KpiCard
          icon={<UsersIcon className="w-6 h-6 text-amber-400" />}
          title="Choferes Activos"
          value={choferesActivos}
          subtitle={`Disponibles: ${choferesTotales?.totalDisponibles ?? 0}`}
        />

        <KpiCard
          icon={<MapPin className="w-6 h-6 text-fuchsia-400" />}
          title="Rutas Activas"
          value={rutasActivas}
          subtitle={`Total rutas: ${kpis?.rutas.totalGeneral ?? 0}`}
        />
      </div>

      {/* ===================== GRAFICOS ===================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ------- Vehículos por Tipo ------- */}
        <ChartCard
          title="Vehículos por Tipo"
          chartData={vehiculosPorTipoExport}
        >
          {vehiculosPorTipo.length === 0 ? (
            <EmptyChartMessage />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={vehiculosPorTipo}>
                <XAxis dataKey="tipoNombre" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="cantidad" radius={[6, 6, 0, 0]}>
                  {vehiculosPorTipo.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* ------- Vehículos por Estado ------- */}
        <ChartCard
          title="Vehículos por Estado"
          chartData={vehiculosPorEstadoExport}
        >
          {vehiculosPorEstado.length === 0 ? (
            <EmptyChartMessage />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={vehiculosPorEstado}
                  dataKey="cantidad"
                  nameKey="disponibilidad"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label
                >
                  {vehiculosPorEstado.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>

                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>


      </div>

      {/* ===================== RUTAS + ASIGNACIONES ===================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <ChartCard
          title="Rutas por Provincia"
          chartData={rutasPorProvinciaExport}
        >
          {rutasPorProvincia.length === 0 ? (
            <EmptyChartMessage />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={rutasPorProvincia}>
                <XAxis dataKey="provincia" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="totalRutas">
                  {rutasPorProvincia.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard
          title="Asignaciones por Estado"
          chartData={asignacionesPorEstadoExport}
        >
          {asignacionesPorEstadoCompleto.length === 0 ? (
            <EmptyChartMessage />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={asignacionesPorEstadoCompleto}>
                <XAxis dataKey="estadoNombre" stroke="#94a3b8" interval={0} />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="totalAsignaciones">
                  {asignacionesPorEstadoCompleto.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard
          title="Diferencia de Combustible por Ruta"
          chartData={desviacionesCombustible}
        >
          {desviacionesCombustible.length === 0 ? (
            <EmptyChartMessage />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs text-slate-200">
                <thead>
                  <tr>
                    <th className="px-2 py-1">Ruta</th>
                    <th className="px-2 py-1">Vehículo</th>
                    <th className="px-2 py-1">Estimado (gal)</th>
                    <th className="px-2 py-1">Real (gal)</th>
                    <th className="px-2 py-1">Diferencia</th>
                  </tr>
                </thead>
                <tbody>
                  {desviacionesCombustible.map((d, i) => (
                    <tr key={i} className="border-b border-slate-700/60">
                      <td className="px-2 py-1">{d.rutaNombre}</td>
                      <td className="px-2 py-1">{d.vehiculoNombre}</td>
                      <td className="px-2 py-1 text-right">{d.combustibleEstimado.toFixed(2)}</td>
                      <td className="px-2 py-1 text-right">{d.combustibleReal.toFixed(2)}</td>
                      <td className="px-2 py-1 text-right">{(d.combustibleReal - d.combustibleEstimado).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ChartCard>

        <ChartCard
          title="Consumo Estimado vs Real por Vehículo"
          chartData={consumoPorVehiculoData}
        >
          {consumoPorVehiculoData.length === 0 ? (
            <EmptyChartMessage />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={consumoPorVehiculoData}>
                <XAxis dataKey="vehiculo" stroke="#94a3b8" interval={0} angle={-20} textAnchor="end" height={60} />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="estimado" name="Estimado" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="real" name="Real" stroke="#22c55e" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

      </div>

    </div>
  );
}

// ===================== KPI CARD =====================
interface KpiCardProps {
  icon: React.ReactNode;
  title: string;
  value: number | string;
  subtitle?: string;
}

function KpiCard({ icon, title, value, subtitle }: KpiCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-950/90 p-4">
      <div className="flex items-center justify-between">
        <div className="rounded-xl bg-slate-900/80 p-2 border border-slate-700/60">
          {icon}
        </div>
        <span className="text-xs text-slate-500">Métrica principal</span>
      </div>
      <p className="text-sm text-slate-400">{title}</p>
      <p className="text-3xl font-extrabold text-slate-50">{value}</p>
      {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
    </div>
  );
}

// ===================== EMPTY CHART =====================
function EmptyChartMessage() {
  return (
    <div className="h-full flex items-center justify-center text-slate-500 text-sm border border-dashed border-slate-700/70 rounded-xl">
      No hay datos suficientes para este gráfico.
    </div>
  );
}

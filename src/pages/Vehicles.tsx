import { useEffect, useMemo, useState } from "react";
import { vehiclesService } from "../services/vehicles.service";
import TextField from "../components/TextField";
import Button from "../components/Button";
import { Fuel, Truck, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import type { TipoMaquinaria } from "../validation/vehicles";
import Modal from "../components/Modal";

export default function Vehicles() {
  const { user } = useAuth();

  // datos
  const [tipos, setTipos] = useState<TipoMaquinaria[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);

  // loading & feedback
  const [loadingTipos, setLoadingTipos] = useState(true);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  // filtros & paginación
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTipo, setSelectedTipo] = useState<number | "">("");
  const [selectedEstado, setSelectedEstado] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // export loaders
  const [exportCsvLoading, setExportCsvLoading] = useState(false);
  const [exportPdfLoading, setExportPdfLoading] = useState(false);

  // modal
  const [isModalOpen, setModalOpen] = useState(false);

  // permisos
  const canViewVehicles = user?.role === "Administrador" || user?.role === "Supervisor";
  const canCreateVehicles = user?.role === "Administrador";
  const canExportVehicles = user?.role === "Administrador" || user?.role === "Supervisor";

  // map de tipos
  const tiposMap = useMemo(() => {
    const map = new Map<number, string>();
    tipos.forEach((t) => map.set(t.id, t.nombre));
    return map;
  }, [tipos]);

  // filtro seguro
  const filteredVehicles = useMemo(() => {
    const term = (searchTerm ?? "").toLowerCase().trim();
    return vehicles.filter((v) => {
      const nombre = String(v.nombre ?? "").toLowerCase();
      const placa = String(v.placa ?? "").toLowerCase();
      const marca = String(v.marca ?? "").toLowerCase();
      const modelo = String(v.modelo ?? "").toLowerCase();
      const estado = String(v.disponible ?? "").toLowerCase().trim();

      const matchesSearch =
        term === "" ||
        nombre.includes(term) ||
        placa.includes(term) ||
        marca.includes(term) ||
        modelo.includes(term);

      const matchesTipo =
        selectedTipo === "" || Number(v.tipoMaquinariaId) === Number(selectedTipo);

      const matchesEstado =
        selectedEstado === "" || estado === selectedEstado.toLowerCase().trim();

      return matchesSearch && matchesTipo && matchesEstado;
    });
  }, [vehicles, searchTerm, selectedTipo, selectedEstado]);

  // paginación
  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);
  const paginatedVehicles = filteredVehicles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  async function loadBase64FromUrl(url: string): Promise<string | null> {
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const blob = await res.blob();
      return await new Promise((resolve) => {
        const fr = new FileReader();
        fr.onload = () => resolve(String(fr.result));
        fr.readAsDataURL(blob);
      });
    } catch {
      return null;
    }
  }
  // export CSV
  const handleExportCSV = async () => {
    if (!canExportVehicles || exportCsvLoading) return;

    setExportCsvLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 300));

      const headers = [
        "Nombre",
        "Placa",
        "Marca",
        "Modelo",
        "Tipo",
        "Estado",
        "Consumo (L/Km)",
        "Capacidad (L)",
      ];

      const esc = (val: any) => {
        const s = String(val ?? "");
        return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
      };

      const rows = filteredVehicles.map((v) => [
        esc(v.nombre),
        esc(v.placa),
        esc(v.marca),
        esc(v.modelo),
        esc(tiposMap.get(v.tipoMaquinariaId) ?? ""),
        esc(v.disponible),
        esc(v.consumoCombustibleKm),
        esc(v.capacidadCombustible),
      ]);

      const csv = [headers.map(esc).join(","), ...rows.map((r) => r.join(","))].join("\n");

      const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `vehiculos_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setOkMsg("✅ CSV exportado correctamente.");
    } catch {
      setServerError("❌ Error al exportar CSV.");
    } finally {
      setExportCsvLoading(false);
    }
  };
  const handleExportPDF = async () => {
  if (!canExportVehicles || exportPdfLoading) return;
  setExportPdfLoading(true);

  try {
    const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
      import("jspdf"),
      import("jspdf-autotable"),
    ]) as any;

    // Paleta (tailwind-like)
    const C = {
      slate950: [2, 6, 23],
      slate900: [15, 23, 42],
      slate850: [20, 29, 48],
      slate800: [30, 41, 59],
      slate700: [51, 65, 85],
      slate400: [148, 163, 184],
      slate300: [203, 213, 225],
      slate200: [226, 232, 240],
      emerald500: [16, 185, 129],
      yellow500: [234, 179, 8],
      red500: [239, 68, 68],
    };

    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const padX = 28;              // márgenes laterales
    const headerH = 86;           // alto del header

    // ---------- Header ----------
    doc.setFillColor(...C.slate900);
    doc.rect(0, 0, pageW, headerH, "F");

    // Logo opcional (si no carga, no rompe)
    try {
      const base64 = await loadBase64FromUrl("/logo.png"); // cambia la ruta si aplica
      if (base64) {
        const w = 120, h = 40;
        doc.addImage(base64, "PNG", pageW - padX - w, 16, w, h, undefined, "FAST");
      }
    } catch {}

    doc.setTextColor(...C.emerald500);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Sistema de Control de Combustible", padX, 38);

    doc.setTextColor(...C.slate400);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Vehículos Registrados • Exportado: ${new Date().toLocaleString()}`, padX, 56);

    doc.setDrawColor(...C.slate800);
    doc.setLineWidth(1.2);
    doc.line(padX, headerH - 10, pageW - padX, headerH - 10);

    // ---------- KPIs (Resumen) ----------
    const norm = (s: any) =>
      String(s ?? "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const total = filteredVehicles.length;
    const disp = filteredVehicles.filter(v => norm(v.disponible) === "disponible").length;
    const mant = filteredVehicles.filter(v => norm(v.disponible) === "en mantenimiento").length;
    const nodis = filteredVehicles.filter(v => norm(v.disponible) === "no disponible").length;

    const toNum = (x: any) => {
      const n = Number(x);
      return Number.isFinite(n) ? n : 0;
    };
    const promConsumo =
      total ? (filteredVehicles.reduce((a, v) => a + toNum(v.consumoCombustibleKm), 0) / total) : 0;
    const totalCap =
      filteredVehicles.reduce((a, v) => a + toNum(v.capacidadCombustible), 0);

    autoTable(doc, {
      startY: headerH + 10,
      theme: "plain",
      styles: { font: "helvetica", fontSize: 10, cellPadding: 5, textColor: C.slate200 },
      headStyles: { textColor: C.slate300, fontStyle: "bold" },
      margin: { left: padX, right: padX },
      tableWidth: "auto",
      head: [[
        "Disponibles", "En mantenimiento", "No disponibles", "Prom. consumo (L/Km)", "Capacidad total (L)"
      ]],
      body: [[
        String(disp), String(mant), String(nodis),
        promConsumo.toFixed(2), totalCap.toString()
      ]],
      didParseCell: (d: any) => {
        if (d.section === "body") {
          // Colores por KPI
          if (d.column.index === 0) { d.cell.styles.fillColor = C.emerald500; d.cell.styles.textColor = [0,0,0]; }
          if (d.column.index === 1) { d.cell.styles.fillColor = C.yellow500;  d.cell.styles.textColor = [0,0,0]; }
          if (d.column.index === 2) { d.cell.styles.fillColor = C.red500;     d.cell.styles.textColor = [255,255,255]; }
          if (d.column.index >= 3)  { d.cell.styles.fillColor = C.slate850;   d.cell.styles.textColor = C.slate200; }
        } else if (d.section === "head") {
          d.cell.styles.fillColor = C.slate800;
        }
      }
    });

    // ---------- Tabla principal ----------
    const head = [[
      "Nombre","Placa","Marca","Modelo","Tipo","Estado","Consumo (L/Km)","Capacidad (L)"
    ]];

    const body = filteredVehicles.map(v => [
      v.nombre ?? "",
      v.placa ?? "",
      v.marca ?? "",
      v.modelo ?? "",
      tiposMap.get(v.tipoMaquinariaId) ?? "",
      v.disponible ?? "",
      v.consumoCombustibleKm ?? "",
      v.capacidadCombustible ?? "",
    ]);

    const statusStyle = (raw: any) => {
      const n = norm(raw);
      if (n === "disponible")        return { bg: C.emerald500, text: [0, 0, 0] as [number,number,number] };
      if (n === "en mantenimiento")  return { bg: C.yellow500,  text: [0, 0, 0] as [number,number,number] };
      if (n === "no disponible")     return { bg: C.red500,     text: [255,255,255] as [number,number,number] };
      return { bg: C.red500, text: [255,255,255] as [number,number,number] };
    };

    autoTable(doc, {
      head,
      body,
      startY: (doc as any).lastAutoTable.finalY + 14,  // debajo de KPIs
      theme: "grid",
      margin: { left: padX, right: padX, bottom: 64 },
      tableWidth: "auto",            // ocupa todo el ancho disponible
      styles: {
        font: "helvetica",
        fontSize: 9,
        cellPadding: 6,
        overflow: "linebreak",
        textColor: C.slate200,
        fillColor: C.slate900,
        lineColor: C.slate700,
        lineWidth: 0.6,
        valign: "middle",
        minCellHeight: 18,
      },
      headStyles: { fillColor: C.slate800, textColor: C.slate300, fontStyle: "bold" },
      alternateRowStyles: { fillColor: C.slate950 },
      columnStyles: {
        6: { halign: "right" }, // Consumo
        7: { halign: "right" }, // Capacidad
      },

      didParseCell: (d: any) => {
        if (d.section === "body" && d.column.index === 5) {
          d.cell.styles.halign = "center";
        }
      },

      didDrawCell: (d: any) => {
        // “chip” en columna Estado
        if (d.section === "body" && d.column.index === 5) {
          const raw = d.cell.raw;
          const { bg, text } = statusStyle(raw);
          const { x, y, width, height } = d.cell;
          const padXc = 8, padYc = 3;

          // tamaño chip
          const textW = doc.getTextWidth(String(raw));
          const chipW = Math.min(width - 6, textW + padXc * 2);
          const chipH = Math.min(height - 6, 16);
          const cx = x + (width - chipW) / 2;
          const cy = y + (height - chipH) / 2;

          doc.setFillColor(...bg);
          doc.setDrawColor(...bg);
          // redondeado si existe; si no, rect
          // @ts-ignore
          if (typeof (doc as any).roundedRect === "function") {
            // @ts-ignore
            doc.roundedRect(cx, cy, chipW, chipH, 8, 8, "F");
          } else {
            doc.rect(cx, cy, chipW, chipH, "F");
          }

          doc.setTextColor(...text);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8.5);
          doc.text(String(raw), x + width / 2, y + height / 2 + 2, { align: "center", baseline: "middle" });

          d.cell.text = [""]; // evita texto duplicado
        }
      },

      didDrawPage: () => {
        const page = doc.getNumberOfPages();
        doc.setFontSize(9);
        doc.setTextColor(...C.slate400);
        doc.text(`Página ${page}`, pageW - padX - 48, pageH - 20);
      },
    });

    doc.save(`vehiculos_${new Date().toISOString().split("T")[0]}.pdf`);
    setOkMsg("✅ PDF exportado correctamente.");
  } catch {
    setServerError("❌ Error al exportar PDF.");
  } finally {
    setExportPdfLoading(false);
  }
};

  // carga tipos
  useEffect(() => {
    (async () => {
      try {
        setLoadingTipos(true);
        const data = await vehiclesService.getTipos();
        setTipos(Array.isArray(data) ? data : []);
      } catch (e: any) {
        setServerError(e.message ?? "No se pudieron cargar los tipos de maquinaria");
      } finally {
        setLoadingTipos(false);
      }
    })();
  }, []);

  // carga vehicles
  const refreshVehicles = async () => {
    try {
      setLoadingVehicles(true);
      const data = await vehiclesService.getVehicles();
      setVehicles(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setServerError(e.message ?? "No se pudieron cargar los vehículos");
    } finally {
      setLoadingVehicles(false);
    }
  };

  useEffect(() => {
    if (!canViewVehicles) return;
    refreshVehicles();
  }, [canViewVehicles]);

  useEffect(() => {
    if (!okMsg) return;
    const t = setTimeout(() => setOkMsg(null), 3500);
    return () => clearTimeout(t);
  }, [okMsg]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedTipo, selectedEstado]);

  // sin permisos
  if (!canViewVehicles) {
    return (
      <div className="mx-auto max-w-6xl px-8 py-12">
        <div className="text-center py-12">
          <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/30 mx-auto w-fit mb-4">
            <Fuel className="text-red-400 w-8 h-8" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-red-400 mb-4">
            Acceso Denegado
          </h1>
          <p className="text-slate-400">No tienes permisos para acceder a la gestión de vehículos.</p>
          <p className="text-slate-500 mt-2">Contacta al administrador si crees que esto es un error.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-8 py-12">
      {/* Encabezado */}
      <div className="flex items-center justify-between gap-3 mb-10">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/30">
            <Fuel className="text-emerald-400 w-8 h-8" />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-emerald-400">
              Gestión de Vehículos
            </h1>
            <p className="text-slate-400">
              {canCreateVehicles
                ? "Registra un nuevo vehículo en el sistema de control de combustible."
                : "Visualiza los vehículos registrados en el sistema."}
            </p>
          </div>
        </div>

        {/* Toolbar: Exportar + Nuevo vehículo */}
        <div className="flex items-center gap-3">
          {canCreateVehicles && (
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-500 text-white font-semibold shadow-lg shadow-emerald-500/20 hover:brightness-110"
            >
              <Fuel className="w-4 h-4" />
              Nuevo vehículo
            </button>
          )}

          {canExportVehicles && (
            <div className="inline-flex items-stretch rounded-xl overflow-hidden border border-white/10 bg-slate-900/60 shadow-lg shadow-blue-500/10">
              <button
                onClick={handleExportCSV}
                disabled={exportCsvLoading}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50 transition-colors"
                title="Exportar a CSV"
                aria-label="Exportar a CSV"
              >
                {exportCsvLoading ? (
                  <>
                    <span className="sr-only">Exportando CSV…</span>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    <span>CSV</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>CSV</span>
                  </>
                )}
              </button>

              <div className="w-px bg-white/10" />

              <button
                onClick={handleExportPDF}
                disabled={exportPdfLoading}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50 transition-colors"
                title="Exportar a PDF"
                aria-label="Exportar a PDF"
              >
                {exportPdfLoading ? (
                  <>
                    <span className="sr-only">Exportando PDF…</span>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    <span>PDF</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>PDF</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Feedback */}
      {serverError && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {serverError}
        </div>
      )}
      {okMsg && (
        <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
          {okMsg}
        </div>
      )}

      {/* Filtros */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex-1 min-w-64">
          <TextField
            placeholder="Buscar por nombre, placa, marca o modelo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-slate-900/60 border border-slate-700 focus:border-blue-500"
          />
        </div>
        <select
          value={selectedTipo}
          onChange={(e) => setSelectedTipo(e.target.value === "" ? "" : Number(e.target.value))}
          className="rounded-lg px-4 py-3 bg-slate-900/60 border border-slate-700 focus:border-blue-500 text-slate-200 appearance-none"
          disabled={loadingTipos}
        >
          <option value="">{loadingTipos ? "Cargando tipos..." : "Todos los tipos"}</option>
          {tipos.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nombre}
            </option>
          ))}
        </select>
        <select
          value={selectedEstado}
          onChange={(e) => setSelectedEstado(e.target.value)}
          className="rounded-lg px-4 py-3 bg-slate-900/60 border border-slate-700 focus:border-blue-500 text-slate-200 appearance-none"
        >
          <option value="">Todos los estados</option>
          <option value="Disponible">Disponible</option>
          <option value="En Mantenimiento">En Mantenimiento</option>
          <option value="No Disponible">No Disponible</option>
        </select>
      </div>

      {/* Tabla */}
      <div className="mt-4">

        {loadingVehicles ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-12">
            <Truck className="mx-auto h-16 w-16 text-slate-600 mb-4" />
            <p className="text-slate-400 text-lg">No hay vehículos registrados aún.</p>
            <p className="text-slate-500">Registra tu primer vehículo con el botón “Nuevo vehículo”.</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-transparent overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Nombre</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Placa</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Marca</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Modelo</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Tipo</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Estado</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Consumo (L/Km)</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Capacidad (L)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {paginatedVehicles.map((v: any, i: number) => {
                    const estado = String(v.disponible ?? "");
                    const estadoClasses =
                      estado === "Disponible"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : estado === "En mantenimiento"
                          ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                          : "bg-red-500/20 text-red-300 border border-red-500/30";

                    return (
                      <tr key={v.id ?? i} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 text-sm text-slate-200 font-medium">{v.nombre ?? "N/A"}</td>
                        <td className="px-6 py-4 text-sm text-slate-200">{v.placa ?? "N/A"}</td>
                        <td className="px-6 py-4 text-sm text-slate-200">{v.marca ?? "N/A"}</td>
                        <td className="px-6 py-4 text-sm text-slate-200">{v.modelo ?? "N/A"}</td>
                        <td className="px-6 py-4 text-sm text-slate-200">{tiposMap.get(v.tipoMaquinariaId) ?? "N/A"}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${estadoClasses}`}>
                            {estado || "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-200">{v.consumoCombustibleKm ?? "N/A"}</td>
                        <td className="px-6 py-4 text-sm text-slate-200">{v.capacidadCombustible ?? "N/A"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between px-6 pb-6">
                <p className="text-sm text-slate-400">
                  Mostrando {Math.min((currentPage - 1) * itemsPerPage + 1, filteredVehicles.length)} a{" "}
                  {Math.min(currentPage * itemsPerPage, filteredVehicles.length)} de {filteredVehicles.length} vehículos
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-slate-200">
                    Página {currentPage} de {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-10 text-center text-xs text-slate-500">
        Sistema de Control de Combustible • © 2025
      </div>

      {/* Modal de creación */}
      {canCreateVehicles && (
        <Modal
          open={isModalOpen}
          onClose={() => setModalOpen(false)}
          vehicles={vehicles}
          tipos={tipos}
          onCreated={async () => {
            await refreshVehicles();
            setModalOpen(false);
            setOkMsg("✅ Vehículo creado correctamente.");
          }}
        />
      )}
    </div>
  );
}

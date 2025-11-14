import React, { useId } from "react";
import { FileText, FileSpreadsheet } from "lucide-react";
import Button from "./Button";
import { exportChartToPDF } from "../utils/exportChartPDF";
import { exportToExcel, formatChartDataForExport } from "../utils/exportUtils";
import toast from "react-hot-toast";

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  chartData?: any[];
  loading?: boolean;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  children,
  chartData = [],
  loading = false,
}) => {

  // ID único del contenedor del gráfico
  const chartId = useId().replace(/:/g, "_");

  // 📌 Export PDF con gráfica incluida
  const handleExportPDF = async () => {
    try {
      await exportChartToPDF(title, chartId, chartData);
      toast.success("PDF generado con éxito");
    } catch (error) {
      console.error(error);
      toast.error("Error al generar PDF");
    }
  };

  // 📌 Export Excel
  const handleExportExcel = () => {
    try {
      const formatted = formatChartDataForExport(chartData, title);
      exportToExcel(formatted, title);
      toast.success("Excel generado con éxito");
    } catch (error) {
      console.error(error);
      toast.error("Error al generar Excel");
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-transparent p-6 shadow-2xl shadow-emerald-500/5">

      {/* ---------- HEADER ---------- */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-slate-200">{title}</h3>

        <div className="flex gap-2">
          <Button
            onClick={handleExportPDF}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30"
          >
            <FileText className="w-4 h-4" />
            PDF
          </Button>

          <Button
            onClick={handleExportExcel}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Excel
          </Button>
        </div>
      </div>

      {/* ---------- CONTENEDOR DEL CHART ---------- */}
      <div id={chartId} className="min-h-[300px]">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            <span className="ml-2 text-slate-400">Cargando datos...</span>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};

import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export const exportChartToPDFPro = async (
  chartId: string,
  title: string,
  extraInfo?: string
) => {
  try {
    const chartElement = document.getElementById(chartId);
    if (!chartElement) throw new Error("No se encontró el gráfico para exportar");

    // --- Solución definitiva: Clonar el nodo y forzar estilos inline compatibles ---
    // Clona el nodo del gráfico
    const clone = chartElement.cloneNode(true) as HTMLElement;
    clone.style.position = "fixed";
    clone.style.left = "-9999px";
    clone.style.top = "0";
    clone.style.background = "#fff";
    clone.style.color = "#222";
    clone.style.borderColor = "#bbb";
    clone.style.display = "block";
    clone.style.width = chartElement.offsetWidth ? chartElement.offsetWidth + "px" : "600px";
    clone.style.height = chartElement.offsetHeight ? chartElement.offsetHeight + "px" : "350px";
    // Recorre todos los hijos y fuerza colores compatibles
    const walk = (el: HTMLElement) => {
      el.style.backgroundColor = "#fff";
      el.style.color = "#222";
      el.style.borderColor = "#bbb";
      el.style.display = "block";
      Array.from(el.children).forEach((c) => walk(c as HTMLElement));
    };
    walk(clone);
    document.body.appendChild(clone);
    await new Promise((res) => setTimeout(res, 50));
    const canvas = await html2canvas(clone, { backgroundColor: "#fff", scale: 2, useCORS: true });
    document.body.removeChild(clone);
    // Validar que el canvas no esté vacío
    if (!canvas || canvas.width === 0 || canvas.height === 0) {
      throw new Error("No se pudo capturar la gráfica para el PDF. Verifica que el gráfico esté visible y renderizado.");
    }
    const imgData = canvas.toDataURL("image/png");
    if (!imgData.startsWith("data:image/png")) {
      throw new Error("Error al generar la imagen PNG para el PDF");
    }

    const pdf = new jsPDF("p", "mm", "a4");

    // Título profesional
    pdf.setFontSize(22);
    pdf.setTextColor(34, 197, 94);
    pdf.text(title, 20, 25);

    if (extraInfo) {
      pdf.setFontSize(12);
      pdf.setTextColor(100, 116, 139);
      pdf.text(extraInfo, 20, 35);
    }

    // --- TABLA DE DATOS ---
    let y = 45;
    const lastChartData = (window as any).__lastChartData;
    if (Array.isArray(lastChartData) && lastChartData.length > 0) {
      const data = lastChartData;
      const headers = Object.keys(data[0]);
      pdf.setFontSize(10);
      pdf.setTextColor(30, 41, 59);
      headers.forEach((header, i) => {
        pdf.text(header, 15 + i * 35, y);
      });
      y += 7;
      data.forEach((row: any) => {
        headers.forEach((header, i) => {
          pdf.text(String(row[header] ?? ""), 15 + i * 35, y);
        });
        y += 7;
        if (y > 120) {
          pdf.addPage();
          y = 20;
        }
      });
      y += 5;
    }

    // --- GRAFICO ---
    pdf.setFontSize(12);
    pdf.setTextColor(30, 41, 59);
    pdf.text("Gráfico:", 15, y + 10);
    pdf.addImage(imgData, "PNG", 10, y + 15, 190, 90);
    y = y + 110;

    // Pie de página profesional
    pdf.setFontSize(10);
    pdf.setTextColor(148, 163, 184);
    pdf.text(
      `Reporte generado por Sistema de Control de Combustible • ${new Date().toLocaleDateString()}`,
      10,
      200
    );

    pdf.save(`${title.replace(/\s+/g, "_")}_${Date.now()}.pdf`);
  } catch (error) {
    console.error("❌ Error al exportar PDF profesional", error);
    throw error;
  }
};

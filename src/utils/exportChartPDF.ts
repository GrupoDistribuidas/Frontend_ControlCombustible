import jsPDF from "jspdf";

export const exportChartToPDF = async (
  title: string,
  chartContainerId: string,
  data?: any[]
) => {
  try {
    const pdf = new jsPDF("p", "mm", "a4");
    pdf.setFontSize(20);
    pdf.text(title, 20, 20);

    let y = 40;
    pdf.setFontSize(12);
    pdf.text("Datos del Reporte:", 20, y);
    y += 10;

    if (data && data.length > 0) {
      const headers = Object.keys(data[0]);
      pdf.setFontSize(10);

      headers.forEach((header, i) => {
        pdf.text(header, 20 + i * 40, y);
      });
      y += 7;

      data.forEach((row) => {
        headers.forEach((header, i) => {
          pdf.text(String(row[header] ?? ""), 20 + i * 40, y);
        });
        y += 7;

        if (y > 270) {
          pdf.addPage();
          y = 20;
        }
      });
    } else {
      pdf.text("No hay datos disponibles", 20, y);
    }

    pdf.save(`${title.replace(/\s+/g, "_")}_${Date.now()}.pdf`);

  } catch (error) {
    console.error("❌ Error al exportar PDF", error);
    throw error;
  }
};

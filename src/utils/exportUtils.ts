import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

export const exportToPDF = (title: string, data?: any[]) => {
  const pdf = new jsPDF();

  // Título
  pdf.setFontSize(20);
  pdf.text(title, 20, 30);

  // Fecha
  pdf.setFontSize(10);
  pdf.text(`Generado el: ${new Date().toLocaleDateString()}`, 20, 45);

  let yPosition = 60;

  if (data && data.length > 0) {
    // Agregar tabla de datos
    pdf.setFontSize(12);
    pdf.text('Datos del Reporte:', 20, yPosition);
    yPosition += 10;

    // Encabezados
    const headers = Object.keys(data[0]);
    pdf.setFontSize(10);
    headers.forEach((header, index) => {
      pdf.text(header, 20 + (index * 40), yPosition);
    });
    yPosition += 10;

    // Filas de datos
    data.forEach((row) => {
      headers.forEach((header, index) => {
        const value = row[header]?.toString() || '';
        pdf.text(value, 20 + (index * 40), yPosition);
      });
      yPosition += 10;
      if (yPosition > 270) { // Nueva página si es necesario
        pdf.addPage();
        yPosition = 20;
      }
    });
  } else {
    pdf.setFontSize(12);
    pdf.text('No hay datos disponibles para este reporte.', 20, yPosition);
  }

  pdf.save(`${title.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.pdf`);
};

export const exportToExcel = (data: any[], filename: string, sheetName: string = 'Datos') => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${filename}_${Date.now()}.xlsx`);
};

export const formatChartDataForExport = (chartData: any[], title: string) => {
  if (!chartData || chartData.length === 0) {
    return [{
      Reporte: title,
      Mensaje: 'No hay datos disponibles',
      Fecha_Exportacion: new Date().toISOString()
    }];
  }

  return chartData.map(item => ({
    ...item,
    Reporte: title,
    Fecha_Exportacion: new Date().toISOString()
  }));
};

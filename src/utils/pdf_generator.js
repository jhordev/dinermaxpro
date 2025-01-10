import { jsPDF } from "jspdf";
import "jspdf-autotable";
import logotipo from "@/assets/DinnerMax.png";
import { logInfo, logError } from '@/utils/logger';

export const generarPdf = ({
                               nombreCompleto = "Sin nombre",
                               pais = "Sin país",
                               telefono = "Sin teléfono",
                               email = "Sin email",
                               columnas = ["Fecha", "Transacción", "Operación", "Monto", "Estado"],
                               filas = []
                           } = {}) => {
    try {
        logInfo('Iniciando generación de PDF');

        // Crear documento
        const doc = new jsPDF({
            unit: "px",
            format: "a4",
            orientation: "portrait",
        });

        // Márgenes
        const margenIzquierdo = 20;
        const margenSuperior = 40;

        // Función auxiliar para escribir texto
        const escribirTexto = (etiqueta, valor, posY, offsetX = 90) => {
            doc.setFontSize(12);
            doc.setFont("times", "normal");
            doc.setTextColor(32, 31, 33);
            doc.text(etiqueta, margenIzquierdo, posY);
            doc.text(valor, margenIzquierdo + offsetX, posY);
        };

        // Encabezado
        const agregarEncabezado = () => {
            const contenedorY = 0;
            const contenedorAlto = 60;

            doc.setFillColor(32, 31, 33);
            doc.rect(0, contenedorY, doc.internal.pageSize.width, contenedorAlto, "F");

            doc.addImage(logotipo, "PNG", 20, 12, 110, 36);
        };

        // Pie de página
        const agregarPieDePagina = (numeroPagina) => {
            const pieY = doc.internal.pageSize.height - 20;
            doc.line(margenIzquierdo, pieY-20, doc.internal.pageSize.width - 20, pieY-20);
            doc.setFontSize(12);
            doc.setTextColor(128, 128, 128);
            doc.text(`Página ${numeroPagina}`, doc.internal.pageSize.width - 20, pieY, { align: "right" });
            doc.text("dinnermax.com", margenIzquierdo, pieY, { align: "left" });
        };

        // Redibujar encabezado y pie de página en todas las hojas
        const agregarEncabezadoYPieEnTodasLasPaginas = () => {
            const totalPaginas = doc.internal.getNumberOfPages();
            for (let i = 1; i <= totalPaginas; i++) {
                doc.setPage(i);
                agregarEncabezado();
                agregarPieDePagina(i);
            }
        };

        // Fecha actual
        const fechaActual = new Date();
        const nombreMes = fechaActual.toLocaleString("es-ES", { month: "long" });
        const mesCapitalizado = nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1);
        const dia = String(fechaActual.getDate()).padStart(2, '0');
        const anio = fechaActual.getFullYear();
        const fechaReporte = `${mesCapitalizado} ${dia}, ${anio}`;

        // Contenido principal
        doc.setFontSize(14);
        doc.setFont("times", "bold");
        doc.text("Reporte de Operaciones", margenIzquierdo, margenSuperior + 60);

        // Fecha del reporte
        doc.setFontSize(10);
        doc.setFont("times", "normal");
        doc.text("Fecha de reporte", doc.internal.pageSize.width - 20, margenSuperior + 45, { align: "right" });

        doc.setFontSize(14);
        doc.setFont("times", "bold");
        doc.text(fechaReporte, doc.internal.pageSize.width - 20, margenSuperior + 60, { align: "right" });

        // Línea separadora
        doc.line(margenIzquierdo, margenSuperior + 75, doc.internal.pageSize.width - 20, margenSuperior + 75);

        // Datos personales
        escribirTexto("Nombre completo:", nombreCompleto, margenSuperior + 100);
        escribirTexto("País:", pais, margenSuperior + 120);
        escribirTexto("Teléfono:", telefono, margenSuperior + 140);
        escribirTexto("Email:", email, margenSuperior + 160);

        // Tabla
        doc.autoTable({
            head: [columnas],
            body: filas,
            startY: margenSuperior + 180,
            margin: { left: 20, right: 20, top: 80 },
            styles: {
                font: "times",
                fontSize: 12,
                cellPadding: 8
            },
            headStyles: {
                fillColor: [32, 31, 33],
                textColor: [255, 255, 255],
                halign: "left",
                font: "times"
            },
            bodyStyles: {
                fillColor: [240, 240, 240],
                textColor: [32, 31, 33],
                font: "times"
            },
            alternateRowStyles: {
                fillColor: [255, 255, 255]
            },
            didDrawPage: function(data) {
                // Se llama cada vez que se dibuja una nueva página
                agregarEncabezado();
                agregarPieDePagina(doc.internal.getNumberOfPages());
            }
        });

        // Agregar encabezado y pie de página en todas las páginas
        agregarEncabezadoYPieEnTodasLasPaginas();

        logInfo('PDF generado exitosamente');
        return doc;
    } catch (error) {
        logError('Error al generar PDF:', error);
        throw error;
    }
};
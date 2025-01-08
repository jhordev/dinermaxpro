import { jsPDF } from "jspdf";
import "jspdf-autotable";
import logotipo from "@/assets/DinnerMax.png";

/**
 * Genera un PDF con información de reporte.
 * @param {Object} opciones
 * @param {string} opciones.nombreCompleto - Nombre completo.
 * @param {string} opciones.pais - País.
 * @param {string} opciones.telefono - Teléfono.
 * @param {string} opciones.email - Email.
 * @param {Array}  opciones.columnas - Encabezados de la tabla.
 * @param {Array}  opciones.filas - Datos de la tabla (arrays de arrays).
 */
export const generarPdf = ({
                               nombreCompleto = "Sin nombre",
                               pais = "Sin país",
                               telefono = "Sin teléfono",
                               email = "Sin email",
                               columnas = ["Fecha", "Transacción", "Operación", "Monto", "Estado"],
                               filas = []
                           } = {}) => {
    // Crea el documento
    const doc = new jsPDF({
        unit: "px",
        format: "a4",
        orientation: "portrait",
    });

    // Márgenes
    const margenIzquierdo = 20;
    const margenSuperior = 40;

    // Función auxiliar: escribir "etiqueta + valor"
    const escribirTexto = (etiqueta, valor, posY, offsetX = 90) => {
        doc.setFontSize(12);
        doc.setFont("helvetica", "regular");
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

        const imgX = 20;
        const imgY = 12;
        const imgAncho = 110;
        const imgAlto = 36;
        doc.addImage(logotipo, "PNG", imgX, imgY, imgAncho, imgAlto);
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

    // Fecha y hora actual en español
    const fechaActual = new Date();
    const nombreMes = fechaActual.toLocaleString("es-ES", { month: "long" });
    const mesCapitalizado = nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1);
    const dia = String(fechaActual.getDate()).padStart(2, '0');
    const anio = fechaActual.getFullYear();
    const fechaReporte = `${mesCapitalizado} ${dia}, ${anio}`;


    // Suponiendo que generaremos sólo 1 página; ajusta según tu necesidad
    const totalPaginas = 1;
    for (let i = 1; i <= totalPaginas; i++) {
        if (i > 1) doc.addPage(); // Crear nueva página si no es la primera

        // Contenido de la primera página
        if (i === 1) {
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(32, 31, 33);
            doc.text("Reporte de Operaciones", margenIzquierdo, margenSuperior + 60);

            // Etiqueta: "Fecha de reporte"
            doc.setFontSize(10);
            doc.setFont("helvetica", "regular");
            doc.setTextColor(32, 31, 33);
            doc.text("Fecha de reporte", doc.internal.pageSize.width - 20, margenSuperior + 45, { align: "right" });

            // Fecha/hora del sistema
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(32, 31, 33);
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
                tableWidth: "auto",
                styles: {
                    fontSize: 12,
                    cellPadding: 8,
                    fontFamily: "helvetica",
                },
                headStyles: {
                    fillColor: [32, 31, 33],
                    textColor: [255, 255, 255],
                    halign: "left",
                },
                bodyStyles: {
                    fillColor: [240, 240, 240],
                    textColor: [32, 31, 33],
                },
                alternateRowStyles: {
                    fillColor: [255, 255, 255],
                },
            });
        }
    }

    // Dibujamos encabezado y pie de página en todas las páginas
    agregarEncabezadoYPieEnTodasLasPaginas();

    return doc;
};

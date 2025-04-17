import pdfMake from "pdfmake/build/pdfmake";
import { vfs } from "pdfmake/build/vfs_fonts";
import cabeceraImg from "@/assets/logo_diner.png";
import marcoImg from "@/assets/cabecera_2.png";
import pieImg      from "@/assets/piepagina_2.png";
import firmaImg    from "@/assets/firma.png";
import marcaaguaImg    from "@/assets/marcadeagua.png";
import firmaDigitalImg    from "@/assets/firmadigital.png";
import adornoImg    from "@/assets/adorno.png";
import { logInfo, logError } from "@/utils/logger";

pdfMake.vfs = vfs;

const toBase64 = src =>
    new Promise(resolve => {
        const i = new Image();
        i.crossOrigin = "anonymous";
        i.src = src;
        i.onload = () => {
            const c = document.createElement("canvas");
            c.width = i.width;
            c.height = i.height;
            c.getContext("2d").drawImage(i, 0, 0);
            resolve(c.toDataURL("image/png"));
        };
    });

export const generarPdf = async ({
                                     ciudad            = "Ciudad de Panamá",
                                     fecha             = "jueves 23 de marzo de 2025",
                                     numeroContrato    = "301",
                                     empresa           = "DinnerMax",
                                     ruc               = "15576386022025",
                                     cliente           = "Martha Sanchez Fernandes",
                                     cedula            = "0987832636",
                                     cedulaAdmin       = "8-408-751",
                                     monto             = "15,000",
                                     paquete           = "profesional",
                                     porcentajeMensual = "6%",
                                     duracion          = "12 meses",
                                     fechaInicio       = "15 de marzo de 2025",
                                     fechaFin          = "15 de marzo de 2026",
                                     pais              = "Panamá",
                                     email             = "marta@gmail.com",
                                     telefono          = "987832636",
                                     incrementales            = "prueba"
                                 } = {}) => {
    try {
        logInfo("Iniciando generación de PDF");

        const [cabecera, piepag, firma, marca, firmadigital, adorno, marcocabe] = await Promise.all([
            toBase64(cabeceraImg),
            toBase64(pieImg),
            toBase64(firmaImg),
            toBase64(marcaaguaImg),
            toBase64(firmaDigitalImg),
            toBase64(adornoImg),
            toBase64(marcoImg),
        ]);

        const docDefinition = {
            pageMargins: [40, 120, 40, 100],
            header: (currentPage, pageSize) => [
                {image: cabecera, width: 150, margin: [32, 15, 0, 0],},

            ],
            footer: () => ({ image: piepag, width: 600, margin: [0, -140, 0, 0] }),
            background:()=>[
                {
                    image: marca,
                    width: 600,
                    opacity: 0.9,
                    absolutePosition: { x: -50, y: 145 }
                },
                {
                    image: marcocabe,                // tu imagen de marco
                    width: 650,           // cubre todo el ancho de la página
                    absolutePosition: { x: 0, y: -15 } // pegada al borde superior
                },
            ],

            content: [
                { text: ciudad, style: "city" },
                { text: fecha, style: "date" },
                { text: "Contrato", style: "title" },
                { text: `Servicio de inversión digital plan ${paquete} N° ${numeroContrato}`, style: "subtitle" },
                {
                    text: `Yo ${cliente} con N° de Identificación ${cedula} hago una inversión con la empresa ${empresa} con el número de RUC ${ruc} por la suma de (${monto}) por el paquete de inversión ${paquete} de ${duracion} meses de vigencia, recibiendo una ganancia del ${porcentajeMensual} mensual.`,
                    style: "text",
                    margin: [0, 8, 0, 12]
                },
                {
                    columns: [
                        [
                            { text: "País:", style: "label" },
                            { text: "Email:", style: "label" },
                            { text: "Teléfono:", style: "label" }
                        ],
                        [
                            { text: pais, style: "text" },
                            { text: email, style: "text" },
                            { text: telefono, style: "text" }
                        ],
                        [
                            { text: "Fecha inicio del plan:", style: "label" },
                            { text: "Fecha fin del plan:", style: "label" }
                        ],
                        [
                            { text: fechaInicio, style: "text" },
                            { text: fechaFin, style: "text" }
                        ]
                    ],
                    columnGap: 2,
                    margin: [0, 0, 0, 16]
                },
                { text: "Cláusulas - Términos y Condiciones", style: "subtitle", margin: [0, 0, 0, 6] },
                {
                    ol: [
                        "El objetivo de este contrato es de ofrecer al cliente el servicio de asesoramiento financiero y consejería para ayudarlo a tomar decisiones informadas con respecto a su finanzas personales (Utilizando el método ganancia de su inversión). ",
                        "El cliente se compromete a no hacer ningún tipo de publicidad o distribución del dicho contrato con Dinnermax todo debe ser debidamente confidencial entre el cliente y nuestra empresa.",
                        "Responsabilidad de DinnerMax  nos comprometemos a proporcionar al cliente información financiera de su inversión y consejos profesionales para ayudarlo a tomar decisiones con temas relacionados con el capital invertido. ",
                        "DinnerMax se Compromete a Mantener la Confidencialidad de la Información de nuestros Clientes. ",
                        "Cualquier consulta o duda que el cliente tenga debe hacérselo saber a Dinnermax para que los respectivos asesores lo atiendan y lo asesoren debidamente, nadie fuera de Dinnermax tiene autorización para aclarar o asesorar a el cliente.",
                        "Si el cliente hace cualquier daño ala imagen de Dinnermax se tomarán acciones legales, debido a que el cliente está bajo contrato y ah acordado todos los parámetros pertinentes si hace algo fuera del contrato que afecte a ala empresa (Dinnermax) tomaremos acciones legales por incumplimiento de contrato.",
                        "El cliente se compromete a cumplir con los términos de dicho contrato en cuanto inicio y finalización de la inversión dependiendo el paquete que allá adquirido.",
                        `El cliente puede realizar su  retiro de sus ganancias incrementadas de su plan de inversion Basico cumpliendo el porcentaje del ${incrementales} de aceleracion de sus ganancias.`,
                        "El cliente realiza su inversion mediante metodo de pago en criptomoneda USDT con la red red trc20 a nuestra direccion de billetera de DinnerMax.",
                        `DinnerMax se Compromete al Reembolso del Plan de inversion Contratado de ${duracion} meses del mismo metodo que inicio su inversion sin tener costo de comision. `,
                        "DinnerMax se Compromete al Reembolso del Plan de inversion en un Lapso de 48 horas Maximo en dias laborables.",
                        "El cliente debera por obligacion enviar este contrato una ves adquirido el plan de inversion enviar por correo electronico a  support@dinnersmax.com "
                    ],
                    style: "text",
                    margin: [0, 0, 0, 32]
                },
                {
                    columns: [
                        {
                            width: "*",
                            stack: [
                                { canvas: [ { type: "line", x1:0, y1:0, x2:150, y2:0, lineWidth:1 } ] },
                                { text: cliente.toUpperCase(), style: "sign" },
                                { text: `N° Cédula: ${cedula}`, style: "sign" },
                                { text: "CLIENTE", style: "sign" }
                            ],
                            margin: [0, 40, 0, 0]
                        },
                        {
                            width: "*",
                            stack: [
                                { canvas: [ { type: "line", x1:0, y1:0, x2:150, y2:0, lineWidth:1 } ] },
                                { text: "R. GAITAN CASTILLO", style: "sign" },
                                { text: `N° Cédula: ${cedulaAdmin}`, style: "sign" },
                                { text: "PRESIDENTE", style: "sign" }
                            ],
                            margin: [0, 40, 0, 0]
                        },
                    ],
                    alignment: "center",

                    margin: [0, -15, 0, 0]
                },
                { image: firma, width: 110, absolutePosition: { x: 375, y: 590 } },
                { image: firmadigital, width: 110, absolutePosition: { x: 360, y: 650 } },
                { image: adorno, width: 250, absolutePosition: { x: 520, y: 580 } }
            ],
            styles: {
                city:     { fontSize: 12, bold: true,alignment: "right" , margin: [0, -50, 0, 15] },
                date:     { fontSize: 10,alignment: "right" , margin: [0, 0, 0, 10] },
                title:    { fontSize: 42, bold: true, margin: [0, -50, 0, 0] },
                subtitle: { fontSize: 14, bold: true, margin: [0, 0, 0, 8] },
                text:     { fontSize: 9, lineHeight: 1.2 },
                label:    { fontSize: 9,lineHeight: 1.2, bold: true },
                sign:     { fontSize: 10, alignment: "center", margin: [0, 2, 0, 2] }
            }
        };

        const pdf = pdfMake.createPdf(docDefinition);
        logInfo("PDF generado exitosamente");
        return pdf; // pdf.download("contrato.pdf") para descargar
    } catch (e) {
        logError("Error al generar PDF:", e);
        throw e;
    }
};

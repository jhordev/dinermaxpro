import { logInfo, logError } from '@/utils/logger.js';

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const BREVO_API_KEY = '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';

export const emailService = {
    async sendEmail(to, subject, code) {
        // Contenido HTML del correo electrónico
        const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #f9f9f9;">
                <h2 style="color: #333;">Tu código de verificación</h2>
                <p style="font-size: 16px; color: #555;">Gracias por registrarte en DinerMax | Inversión. Para completar tu registro, por favor utiliza el siguiente código de verificación:</p>
                <h1 style="font-size: 36px; letter-spacing: 5px; color: #4F46E5; margin: 20px 0;">${code}</h1>
                <p style="font-size: 14px; color: #777;">Este código expirará en 5 minutos.</p>
                <p style="font-size: 14px; color: #777;">Si no solicitaste este código, ignora este mensaje.</p>
                <footer style="margin-top: 20px; font-size: 12px; color: #aaa;">
                    <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
                    <p>Gracias,</p>
                    <p>El equipo de DinerMax | Inversión</p>
                </footer>
            </div>
        `;

        // Cuerpo de la solicitud para enviar el correo
        const requestBody = {
            sender: {
                name: "DinerMax | Inversión",
                email: "jhordymondragon4@gmail.com"
            },
            to: [{ email: to }],
            subject,
            htmlContent
        };

        try {
            // Realiza la solicitud para enviar el correo
            const response = await fetch(BREVO_API_URL, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Api-Key': BREVO_API_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            // Manejo de la respuesta
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al enviar el email');
            }

            logInfo(`Email enviado exitosamente a ${to}`);
            return { success: true };
        } catch (error) {
            logError(`Error enviando email: ${error.message}`);
            return { success: false, error: error.message };
        }
    }
};
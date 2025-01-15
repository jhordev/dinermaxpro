import { auth } from '@/services/firebase_config';
import { emailService } from '@/services/email_service';
import { logInfo, logError } from '@/utils/logger';

export const verificationService = {
    // Constantes de configuración
    EXPIRATION_TIME: 5 * 60 * 1000, // 5 minutos
    MAX_ATTEMPTS: 3,
    LOCKOUT_TIME: 15 * 60 * 1000, // 15 minutos
    STORAGE_KEY: 'withdrawalVerification',
    LOCKOUT_KEY: 'withdrawalLockout',

    async generateVerificationCode() {
        try {
            // Verificar bloqueo
            const lockoutData = sessionStorage.getItem(this.LOCKOUT_KEY);
            if (lockoutData) {
                const { timestamp } = JSON.parse(lockoutData);
                if (Date.now() - timestamp < this.LOCKOUT_TIME) {
                    throw new Error('Tu cuenta está temporalmente bloqueada. Intenta más tarde.');
                }
                sessionStorage.removeItem(this.LOCKOUT_KEY);
            }

            // Generar código aleatorio criptográficamente seguro
            const array = new Uint32Array(3);
            crypto.getRandomValues(array);
            const code = String(array[0] % 1000000).padStart(6, '0');

            // Generar salt aleatorio para PBKDF2
            const salt = crypto.getRandomValues(new Uint8Array(16));

            // Crear material de clave usando PBKDF2
            const keyMaterial = await crypto.subtle.importKey(
                'raw',
                new TextEncoder().encode(code + Date.now()),
                { name: 'PBKDF2' },
                false,
                ['deriveBits', 'deriveKey']
            );

            // Derivar clave usando PBKDF2
            const key = await crypto.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    salt,
                    iterations: 100000,
                    hash: 'SHA-256'
                },
                keyMaterial,
                { name: 'AES-GCM', length: 256 },
                true,
                ['encrypt']
            );

            // Vector de inicialización para AES-GCM
            const iv = crypto.getRandomValues(new Uint8Array(12));

            // Cifrar el código
            const encodedCode = new TextEncoder().encode(code);
            const encryptedCode = await crypto.subtle.encrypt(
                { name: 'AES-GCM', iv },
                key,
                encodedCode
            );

            // Preparar datos para almacenamiento
            const encryptedBuffer = new Uint8Array(encryptedCode);
            const verificationData = {
                code: await this._hashCode(code),
                timestamp: Date.now(),
                attempts: 0,
                salt: Array.from(salt),
                iv: Array.from(iv),
                encrypted: Array.from(encryptedBuffer)
            };

            // Almacenar datos cifrados
            sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(verificationData));

            // Verificar autenticación
            const userEmail = auth.currentUser?.email;
            if (!userEmail) {
                throw new Error('Usuario no autenticado');
            }

            // Enviar código por email
            const result = await emailService.sendEmail(
                userEmail,
                'Código de verificación para retiro',
                code,
                'withdrawal'
            );

            if (!result.success) {
                throw new Error('Error al enviar el código de verificación');
            }

            logInfo('Código de verificación de retiro enviado exitosamente');
            return true;

        } catch (error) {
            logError('Error en generateVerificationCode:', error);
            throw error;
        }
    },

    async verifyCode(inputCode) {
        try {
            const verificationData = JSON.parse(sessionStorage.getItem(this.STORAGE_KEY));

            if (!verificationData) {
                throw new Error('No hay código de verificación pendiente');
            }

            // Verificar expiración
            if (Date.now() - verificationData.timestamp > this.EXPIRATION_TIME) {
                sessionStorage.removeItem(this.STORAGE_KEY);
                throw new Error('El código ha expirado');
            }

            // Verificar intentos máximos
            if (verificationData.attempts >= this.MAX_ATTEMPTS) {
                sessionStorage.setItem(this.LOCKOUT_KEY, JSON.stringify({
                    timestamp: Date.now()
                }));
                sessionStorage.removeItem(this.STORAGE_KEY);
                throw new Error('Demasiados intentos fallidos. Cuenta bloqueada temporalmente.');
            }

            // Verificar código usando hash
            const inputHash = await this._hashCode(inputCode);
            if (inputHash !== verificationData.code) {
                verificationData.attempts++;
                sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(verificationData));
                const remainingAttempts = this.MAX_ATTEMPTS - verificationData.attempts;
                throw new Error(`Código incorrecto. Intentos restantes: ${remainingAttempts}`);
            }

            // Verificación exitosa, limpiar datos
            sessionStorage.removeItem(this.STORAGE_KEY);
            logInfo('Código de retiro verificado exitosamente');
            return true;

        } catch (error) {
            logError('Error en verifyCode:', error);
            throw error;
        }
    },

    async _hashCode(code) {
        try {
            const encoder = new TextEncoder();
            const data = encoder.encode(code);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        } catch (error) {
            logError('Error en _hashCode:', error);
            throw error;
        }
    }
};
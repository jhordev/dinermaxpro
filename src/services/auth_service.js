import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc, deleteDoc, getDocs, collection, query, where } from 'firebase/firestore';
import { auth, db } from './firebase_config';
import { logInfo, logError, logDebug } from '@/utils/logger.js';
import { emailService } from './email_service';
import { referralService } from './referral_service';
import SecureLS from 'secure-ls';

const ls = new SecureLS({ encodingType: 'aes' });
const SESSION_KEY = 'auth_validated';
const TEMP_USER_KEY = 'temp_user_data';
const USER_ROLE = 'user_role';

export const authService = {

    async initializeRegistration(email, password, nombre, referralCode, socioId) {
        try {
            // Verificar si el correo ya está registrado
            const userDocs = await getDocs(
                query(collection(db, 'users'), where('email', '==', email))
            );

            if (!userDocs.empty) {
                return {
                    success: false,
                    error: 'El correo electrónico ya está registrado'
                };
            }

            // Guardar datos temporalmente incluyendo referralCode y socioId
            ls.set(TEMP_USER_KEY, {
                email,
                password,
                nombre,
                referralCode,
                socioId
            });

            // Enviar código de verificación
            const verificationResult = await this.sendVerificationCode(email);
            if (!verificationResult.success) {
                throw new Error(verificationResult.error);
            }

            logInfo(`Inicio de registro para: ${email}`);
            return {
                success: true,
                message: 'Código de verificación enviado'
            };
        } catch (error) {
            logError(`Error en inicio de registro: ${error.message}`);
            return {
                success: false,
                error: 'Error al iniciar el registro'
            };
        }
    },

    async completeRegistration() {
        try {
            const userData = ls.get(TEMP_USER_KEY);
            if (!userData) {
                throw new Error('No hay datos de registro temporales');
            }

            const { email, password, nombre, referralCode, socioId } = userData;

            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            await updateProfile(userCredential.user, {
                displayName: nombre
            });

            // Crear objeto base de datos de usuario
            const userDataToSave = {
                nombre,
                email,
                createdAt: new Date(),
                role: 'user'
            };

            // Agregar socioId si existe
            if (socioId) {
                userDataToSave.socioId = socioId;
            }

            // Guardar datos del usuario
            await setDoc(doc(db, 'users', userCredential.user.uid), userDataToSave);

            // Procesar el referido si existe
            if (referralCode) {
                await referralService.processReferral(referralCode, userCredential.user.uid);
            }

            ls.remove(TEMP_USER_KEY);
            logInfo(`Usuario registrado exitosamente: ${email}`);

            return {
                success: true,
                user: userCredential.user
            };
        } catch (error) {
            let errorMessage = '';
            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'El correo electrónico ya está registrado';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'El correo electrónico no es válido';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'La contraseña debe tener al menos 6 caracteres';
                    break;
                default:
                    errorMessage = 'Error al registrar el usuario';
            }

            logError(`Error en registro: ${error.message}`);
            return {
                success: false,
                error: errorMessage
            };
        }
    },

    async loginUser(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            ls.remove(SESSION_KEY);

            // Obtener el rol del usuario
            const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
            const userRole = userDoc.data().role;

            logInfo(`Inicio de sesión exitoso para: ${email}`);
            return {
                success: true,
                user: userCredential.user,
                role: userRole
            };
        } catch (error) {
            let errorMessage = '';
            switch (error.code) {
                case 'auth/user-not-found':
                    errorMessage = 'Usuario no encontrado';
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'Contraseña incorrecta';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Correo electrónico inválido';
                    break;
                default:
                    errorMessage = 'Error al iniciar sesión';
            }

            logError(`Error en inicio de sesión: ${error.message}`);
            return {
                success: false,
                error: errorMessage
            };
        }
    },

    async sendVerificationCode(email) {
        try {
            const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

            await setDoc(doc(db, 'verification_codes', email), {
                code: verificationCode,
                createdAt: new Date(),
                expiresAt: new Date(Date.now() + 5 * 60000)
            });

            const emailResult = await emailService.sendEmail(
                email,
                'Código de Verificación',
                verificationCode
            );

            if (!emailResult.success) {
                throw new Error(emailResult.error);
            }

            logDebug(`Código de verificación enviado a ${email}: ${verificationCode}`);
            return {
                success: true,
                message: 'Código de verificación enviado'
            };
        } catch (error) {
            logError(`Error al enviar código de verificación: ${error.message}`);
            return {
                success: false,
                error: 'Error al enviar el código de verificación'
            };
        }
    },

    async verifyCode(email, code) {
        try {
            const docRef = doc(db, 'verification_codes', email);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                throw new Error('No se encontró el código de verificación');
            }

            const data = docSnap.data();
            const now = new Date();

            if (now > data.expiresAt.toDate()) {
                await deleteDoc(docRef);
                throw new Error('El código ha expirado');
            }

            const storedCode = String(data.code);
            const submittedCode = String(code);

            if (submittedCode !== storedCode) {
                throw new Error('Código inválido');
            }

            // Establecer la sesión como validada
            ls.set(SESSION_KEY, 'true');

            let userRole = 'user';
            let user = null;

            // Verificar si hay datos temporales de registro
            const tempUserData = ls.get(TEMP_USER_KEY);

            if (tempUserData) {
                // Es un nuevo registro, no necesitamos verificar el usuario actual
                userRole = 'user';
            } else {
                // Es un usuario existente
                user = auth.currentUser;
                if (!user) {
                    throw new Error('Usuario no autenticado');
                }
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (!userDoc.exists()) {
                    throw new Error('Datos de usuario no encontrados');
                }
                userRole = userDoc.data()?.role || 'user';
            }

            // Eliminar el código de verificación
            await deleteDoc(docRef);

            logInfo(`Código verificado exitosamente para: ${email}`);
            return {
                success: true,
                message: 'Código verificado correctamente',
                role: userRole,
                isNewRegistration: !!tempUserData
            };
        } catch (error) {
            logError(`Error en verificación de código: ${error.message}`);
            return {
                success: false,
                error: error.message
            };
        }
    },

    isSessionValidated() {
        return ls.get(SESSION_KEY) === 'true';
    },

    async logout() {
        try {
            ls.remove(SESSION_KEY);
            ls.remove(TEMP_USER_KEY);
            ls.remove(USER_ROLE);
            await signOut(auth);
            logInfo('Sesión cerrada exitosamente');
            return {
                success: true,
                message: 'Sesión cerrada correctamente'
            };
        } catch (error) {
            logError(`Error al cerrar sesión: ${error.message}`);
            return {
                success: false,
                error: 'Error al cerrar sesión'
            };
        }
    }
};
const { onCall } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");

admin.initializeApp();

exports.createSocioUser = onCall(async (request) => {
    try {
        if (!request.auth) {
            throw new Error('Usuario no autenticado');
        }

        const data = request.data;
        const callerUid = request.auth.uid;
        const callerDoc = await admin.firestore().collection('users').doc(callerUid).get();

        if (!callerDoc.exists || !['admin', 'superadmin'].includes(callerDoc.data().role)) {
            throw new Error('No tienes permisos para crear usuarios socios');
        }

        // Validación básica del correo electrónico
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            throw new Error('Formato de correo electrónico inválido');
        }

        // Verificar si el correo ya existe
        try {
            const userExists = await admin.auth().getUserByEmail(data.email);
            if (userExists) {
                throw new Error('El correo electrónico ya está registrado');
            }
        } catch (error) {
            if (error.code !== 'auth/user-not-found') {
                throw error;
            }
        }

        // Crear usuario con configuración personalizada
        const userRecord = await admin.auth().createUser({
            email: data.email,
            password: data.password,
            displayName: data.nombre,
            emailVerified: true // Marcamos el email como verificado por defecto
        });

        // Establecer claims personalizados
        await admin.auth().setCustomUserClaims(userRecord.uid, {
            role: 'socio'
        });

        const userData = {
            email: data.email,
            nombre: data.nombre,
            pais: data.pais,
            registro: data.registro || new Date().toISOString(),
            estado: data.estado || 'activo',
            role: 'socio',
            password: data.password,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            emailVerified: true
        };

        await admin.firestore().collection('users').doc(userRecord.uid).set(userData);

        return {
            success: true,
            userData: {
                ...userData,
                docId: userRecord.uid
            }
        };
    } catch (error) {
        console.error('Error en createSocioUser:', error);
        throw new Error(error.message || 'Error al crear el usuario');
    }
});

exports.updateSocioUser = onCall(async (request) => {
    try {
        if (!request.auth) {
            throw new Error('Usuario no autenticado');
        }

        const data = request.data;
        const callerUid = request.auth.uid;
        const callerDoc = await admin.firestore().collection('users').doc(callerUid).get();

        if (!callerDoc.exists || !['admin', 'superadmin'].includes(callerDoc.data().role)) {
            throw new Error('No tienes permisos para actualizar usuarios socios');
        }

        const currentDoc = await admin.firestore().collection('users').doc(data.docId).get();
        if (!currentDoc.exists) {
            throw new Error('Usuario no encontrado');
        }

        // Validación del nuevo correo electrónico
        if (data.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.email)) {
                throw new Error('Formato de correo electrónico inválido');
            }
        }

        const updates = {
            email: data.email,
            nombre: data.nombre,
            pais: data.pais,
            password: data.password,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            emailVerified: true
        };

        const authUpdates = {
            email: data.email,
            displayName: data.nombre,
            emailVerified: true
        };

        if (data.password) {
            authUpdates.password = data.password;
        }

        await admin.auth().updateUser(data.docId, authUpdates);
        await admin.firestore().collection('users').doc(data.docId).update(updates);
        const updatedDoc = await admin.firestore().collection('users').doc(data.docId).get();

        return {
            success: true,
            userData: {
                ...updatedDoc.data(),
                docId: data.docId
            }
        };
    } catch (error) {
        console.error('Error en updateSocioUser:', error);
        throw new Error(error.message || 'Error al actualizar el usuario');
    }
});

exports.processInvestmentEarnings = onSchedule("0 5 * * *", async (event) => {
    try {
        const now = new Date();
        const currentDay = now.getDay();

        // No procesar pagos los domingos (0) y lunes (1)
        if (currentDay === 0 || currentDay === 1) {
            return null;
        }

        const investmentsRef = admin.firestore().collection('investments');
        const activeInvestments = await investmentsRef
            .where('status', '==', 'approved')
            .get();

        const batch = admin.firestore().batch();
        let updatesCount = 0;

        for (const doc of activeInvestments.docs) {
            const investment = doc.data();

            const activationDate = investment.activationDate.toDate();
            const expirationDate = investment.expirationDate.toDate();

            if (now > expirationDate) {
                continue;
            }

            // Calcular el día de pago según el día de activación
            const startDate = new Date(activationDate);
            const activationDay = startDate.getDay();

            // Ajustar la fecha de inicio de pago según el día de activación
            switch (activationDay) {
                case 1: // Lunes
                    startDate.setDate(startDate.getDate() + 2); // Comienza el miércoles
                    break;
                case 2: // Martes
                    startDate.setDate(startDate.getDate() + 2); // Comienza el jueves
                    break;
                case 3: // Miércoles
                    startDate.setDate(startDate.getDate() + 2); // Comienza el viernes
                    break;
                case 4: // Jueves
                    startDate.setDate(startDate.getDate() + 2); // Comienza el sábado
                    break;
                case 5: // Viernes
                    startDate.setDate(startDate.getDate() + 4); // Comienza el martes
                    break;
                case 6: // Sábado
                    startDate.setDate(startDate.getDate() + 3); // Comienza el martes
                    break;
                case 0: // Domingo
                    startDate.setDate(startDate.getDate() + 3); // Comienza el miércoles
                    break;
            }

            // Asegurarse de que la hora sea 00:00:00
            startDate.setHours(0, 0, 0, 0);

            if (now >= startDate) {
                const dailyEarning = investment.investment * (investment.interestRate / 100);
                const newEarnings = investment.earnings + dailyEarning;

                batch.update(doc.ref, {
                    earnings: newEarnings,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });

                updatesCount++;
            }
        }

        if (updatesCount > 0) {
            await batch.commit();
        }

        return null;
    } catch (error) {
        throw error;
    }
});
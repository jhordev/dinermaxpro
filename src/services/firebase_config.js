// services/firebase_config.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
import { logInfo, logError } from '@/utils/logger.js';

const firebaseConfig = {
    apiKey: "AIzaSyDJwHVUUWp-xFivQfTwQRf4zwPkvr1LtdI",
    authDomain: "dinnermaxpro.firebaseapp.com",
    projectId: "dinnermaxpro",
    storageBucket: "dinnermaxpro.firebasestorage.app",
    messagingSenderId: "129241023916",
    appId: "1:129241023916:web:e6aac79177ffcdb583a609",
    measurementId: "G-3172JTTNM3"
};

let app, auth, db, storage, analytics;

try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    analytics = getAnalytics(app);
    logInfo('Firebase inicializado correctamente');
} catch (error) {
    logError('Error al inicializar Firebase:', error);
}

export { auth, db, storage, analytics };
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, addDoc, collection, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

export type FeedbackType = 'positive' | 'neutral' | 'negative';

export const submitRoundFeedback = async (
    roundId: string,
    feedback: FeedbackType,
    focusIssue: string
): Promise<boolean> => {
    try {
        await addDoc(collection(db, 'round_feedback'), {
            roundId,
            feedback,
            focusIssue,
            submittedAt: serverTimestamp(),
        });
        return true;
    } catch {
        return false;
    }
};

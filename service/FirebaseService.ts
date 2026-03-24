import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, addDoc, collection, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

export type FeedbackType = 'positive' | 'neutral' | 'negative';

export const logEvent = async (
    event: string,
    properties?: Record<string, unknown>
): Promise<boolean> => {
    try {
        await addDoc(collection(db, 'app_events'), {
            event,
            loggedAt: serverTimestamp(),
            ...properties,
        });
        return true;
    } catch {
        return false;
    }
};

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

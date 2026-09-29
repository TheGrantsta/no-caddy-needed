import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from './FirebaseService';

export const logError = async (context: string, error: unknown): Promise<void> => {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : null;

    console.error(`[${context}]`, error);

    try {
        await addDoc(collection(db, 'app_errors'), {
            context,
            message,
            stack,
            loggedAt: serverTimestamp(),
        });
    } catch {
        // Swallow: a failed error-log write must never throw into the caller.
    }
};

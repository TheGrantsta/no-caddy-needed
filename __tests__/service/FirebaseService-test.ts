import { submitRoundFeedback, logEvent } from '../../service/FirebaseService';
import { addDoc, collection } from 'firebase/firestore';

jest.mock('firebase/app', () => ({
    initializeApp: jest.fn(() => 'MOCK_APP'),
    getApps: jest.fn(() => []),
    getApp: jest.fn(() => 'MOCK_APP'),
}));

jest.mock('firebase/firestore', () => ({
    getFirestore: jest.fn(() => 'MOCK_DB'),
    addDoc: jest.fn(),
    collection: jest.fn(() => 'MOCK_COLLECTION_REF'),
    serverTimestamp: jest.fn(() => 'MOCK_TIMESTAMP'),
}));

const mockAddDoc = addDoc as jest.Mock;
const mockCollection = collection as jest.Mock;

describe('FirebaseService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockCollection.mockReturnValue('MOCK_COLLECTION_REF');
    });

    describe('submitRoundFeedback', () => {
        it('calls addDoc with correct collection and fields on success', async () => {
            mockAddDoc.mockResolvedValue({ id: 'doc123' });

            await submitRoundFeedback('5', 'positive', 'three_putts');

            expect(mockCollection).toHaveBeenCalledWith('MOCK_DB', 'round_feedback');
            expect(mockAddDoc).toHaveBeenCalledWith('MOCK_COLLECTION_REF', {
                roundId: '5',
                feedback: 'positive',
                focusIssue: 'three_putts',
                submittedAt: 'MOCK_TIMESTAMP',
            });
        });

        it('returns true when addDoc succeeds', async () => {
            mockAddDoc.mockResolvedValue({ id: 'doc123' });

            const result = await submitRoundFeedback('5', 'positive', 'three_putts');

            expect(result).toBe(true);
        });

        it('returns false when addDoc throws', async () => {
            mockAddDoc.mockRejectedValue(new Error('Firestore error'));

            const result = await submitRoundFeedback('5', 'negative', 'three_putts');

            expect(result).toBe(false);
        });

        it('calls addDoc with neutral feedback and correct fields', async () => {
            mockAddDoc.mockResolvedValue({ id: 'doc456' });

            const result = await submitRoundFeedback('10', 'neutral', 'double_bogeys');

            expect(result).toBe(true);
            expect(mockAddDoc).toHaveBeenCalledWith('MOCK_COLLECTION_REF', expect.objectContaining({
                roundId: '10',
                feedback: 'neutral',
                focusIssue: 'double_bogeys',
            }));
        });
    });

    describe('logEvent', () => {
        it('writes to the app_events collection with event name and timestamp', async () => {
            mockAddDoc.mockResolvedValue({ id: 'evt1' });

            await logEvent('start_round');

            expect(mockCollection).toHaveBeenCalledWith('MOCK_DB', 'app_events');
            expect(mockAddDoc).toHaveBeenCalledWith('MOCK_COLLECTION_REF', {
                event: 'start_round',
                loggedAt: 'MOCK_TIMESTAMP',
            });
        });

        it('returns true when addDoc succeeds', async () => {
            mockAddDoc.mockResolvedValue({ id: 'evt2' });

            const result = await logEvent('next_hole');

            expect(result).toBe(true);
        });

        it('returns false when addDoc throws', async () => {
            mockAddDoc.mockRejectedValue(new Error('network'));

            const result = await logEvent('end_round');

            expect(result).toBe(false);
        });

        it('includes optional properties when provided', async () => {
            mockAddDoc.mockResolvedValue({ id: 'evt3' });

            await logEvent('next_hole', { hole: 5 });

            expect(mockAddDoc).toHaveBeenCalledWith('MOCK_COLLECTION_REF', {
                event: 'next_hole',
                loggedAt: 'MOCK_TIMESTAMP',
                hole: 5,
            });
        });
    });
});

import { logError } from '../../service/ErrorLoggingService';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

jest.mock('firebase/firestore');

const mockAddDoc = addDoc as jest.Mock;
const mockCollection = collection as jest.Mock;
const mockServerTimestamp = serverTimestamp as jest.Mock;

describe('ErrorLoggingService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
        (console.error as jest.Mock).mockRestore();
    });

    it('writes error to Firestore with context, message, stack, and loggedAt', async () => {
        mockCollection.mockReturnValue('app_errors_collection');
        mockAddDoc.mockResolvedValue({ id: 'doc1' });
        mockServerTimestamp.mockReturnValue('timestamp_value');

        const error = new Error('Test error');
        await logError('db.insertDrill', error);

        expect(mockAddDoc).toHaveBeenCalledWith(
            'app_errors_collection',
            {
                context: 'db.insertDrill',
                message: 'Test error',
                stack: error.stack,
                loggedAt: 'timestamp_value',
            }
        );
    });

    it('extracts message and stack from Error instances', async () => {
        mockCollection.mockReturnValue('collection');
        mockAddDoc.mockResolvedValue({});
        mockServerTimestamp.mockReturnValue('ts');

        const error = new Error('Specific error message');
        error.stack = 'Error stack trace';

        await logError('db.updateRound', error);

        expect(mockAddDoc).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
                message: 'Specific error message',
                stack: 'Error stack trace',
            })
        );
    });

    it('sets stack to null for non-Error values', async () => {
        mockCollection.mockReturnValue('collection');
        mockAddDoc.mockResolvedValue({});
        mockServerTimestamp.mockReturnValue('ts');

        await logError('db.deleteRound', 'string error');

        expect(mockAddDoc).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
                message: 'string error',
                stack: null,
            })
        );
    });

    it('calls console.error with context and raw error', async () => {
        mockCollection.mockReturnValue('collection');
        mockAddDoc.mockResolvedValue({});
        mockServerTimestamp.mockReturnValue('ts');

        const error = new Error('Test');
        await logError('db.test', error);

        expect(console.error).toHaveBeenCalledWith('[db.test]', error);
    });

    it('does not throw when Firestore write fails', async () => {
        mockCollection.mockReturnValue('collection');
        mockAddDoc.mockRejectedValue(new Error('Firestore error'));
        mockServerTimestamp.mockReturnValue('ts');

        const error = new Error('Original error');
        expect(async () => {
            await logError('db.test', error);
        }).not.toThrow();
    });
});

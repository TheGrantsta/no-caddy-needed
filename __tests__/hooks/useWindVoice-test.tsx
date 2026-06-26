import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useWindVoice } from '../../hooks/useWindVoice';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import * as Speech from 'expo-speech';
import { getSettingsService } from '../../service/DbService';

jest.mock('expo-speech-recognition', () => ({
	ExpoSpeechRecognitionModule: {
		requestPermissionsAsync: jest.fn(),
		start: jest.fn(),
		stop: jest.fn(),
	},
	useSpeechRecognitionEvent: jest.fn(),
}));

jest.mock('expo-speech', () => ({
	speak: jest.fn(),
	stop: jest.fn(),
	getAvailableVoicesAsync: jest.fn(),
}));

jest.mock('../../service/DbService', () => ({
	getSettingsService: jest.fn(),
}));

const mockRequestPermissions = ExpoSpeechRecognitionModule.requestPermissionsAsync as jest.Mock;
const mockStart = ExpoSpeechRecognitionModule.start as jest.Mock;
const mockStop = ExpoSpeechRecognitionModule.stop as jest.Mock;
const mockUseSpeechRecognitionEvent = useSpeechRecognitionEvent as jest.Mock;
const mockSpeak = Speech.speak as jest.Mock;
const mockGetAvailableVoices = Speech.getAvailableVoicesAsync as jest.Mock;
const mockGetSettings = getSettingsService as jest.Mock;

describe('useWindVoice', () => {
	const defaultSettings = { voice: 'male', soundsEnabled: true };

	beforeEach(() => {
		jest.clearAllMocks();
		mockGetSettings.mockReturnValue(defaultSettings);
		mockRequestPermissions.mockResolvedValue({ granted: true });
		mockUseSpeechRecognitionEvent.mockImplementation(() => {});
		mockGetAvailableVoices.mockResolvedValue([]);
	});

	describe('when expo-speech-recognition is available', () => {

		it('should return isAvailable as true', () => {
			const { result } = renderHook(() => useWindVoice(0));
			expect(result.current.isAvailable).toBe(true);
		});

		it('should return isListening as false initially', () => {
			const { result } = renderHook(() => useWindVoice(0));
			expect(result.current.isListening).toBe(false);
		});

		it('should return adjustedYards as null initially', () => {
			const { result } = renderHook(() => useWindVoice(0));
			expect(result.current.adjustedYards).toBeNull();
		});

		it('should request permission and start recognition on toggleListening', async () => {
		const { result } = renderHook(() => useWindVoice(0));

		await act(async () => {
			await result.current.toggleListening();
		});

		expect(mockRequestPermissions).toHaveBeenCalled();
		expect(mockStart).toHaveBeenCalledWith({
			lang: 'en-GB',
			continuous: true,
			interimResults: true,
		});
		expect(result.current.isListening).toBe(true);
	});

	it('should stop recognition on toggleListening when already listening', async () => {
		const { result } = renderHook(() => useWindVoice(0));

		await act(async () => {
			await result.current.toggleListening();
		});

		await act(async () => {
			await result.current.toggleListening();
		});

		expect(mockStop).toHaveBeenCalled();
		expect(result.current.isListening).toBe(false);
	});

	it('should compute adjustedYards when a number is recognized in transcript with headwind', async () => {
		let resultHandler: ((event: any) => void) | null = null;

		// Set up the mock BEFORE rendering the hook
		mockUseSpeechRecognitionEvent.mockClear();
		mockUseSpeechRecognitionEvent.mockImplementation((eventName: string, handler: (event: any) => void) => {
			if (eventName === 'result') {
				resultHandler = handler;
			}
		});

		mockSpeak.mockClear();

		const { result } = renderHook(() => useWindVoice(-3)); // 3% shorter

		// The handler should now be set from the mock implementation
		expect(resultHandler).toBeTruthy();

		act(() => {
			resultHandler?.({
				results: [{ transcript: '97 yards' }],
			});
		});

		expect(result.current.adjustedYards).toBe(94); // 97 * (1 - 0.03) = 94.09 → 94

		// Wait for the async getVoiceOptions and Speech.speak to complete
		await waitFor(() => {
			expect(mockSpeak).toHaveBeenCalledWith(expect.stringContaining('94'), expect.any(Object));
		});
	});

	it('should compute adjustedYards when a number is recognized with tailwind', async () => {
		let resultHandler: ((event: any) => void) | null = null;

		// Set up the mock BEFORE rendering the hook
		mockUseSpeechRecognitionEvent.mockClear();
		mockUseSpeechRecognitionEvent.mockImplementation((eventName: string, handler: (event: any) => void) => {
			if (eventName === 'result') {
				resultHandler = handler;
			}
		});

		mockSpeak.mockClear();

		const { result } = renderHook(() => useWindVoice(5)); // 5% longer

		// The handler should now be set from the mock implementation
		expect(resultHandler).toBeTruthy();

		act(() => {
			resultHandler?.({
				results: [{ transcript: '100 yards' }],
			});
		});

		expect(result.current.adjustedYards).toBe(105); // 100 * (1 + 0.05) = 105

		// Wait for the async getVoiceOptions and Speech.speak to complete
		await waitFor(() => {
			expect(mockSpeak).toHaveBeenCalledWith(expect.stringContaining('105'), expect.any(Object));
		});
	});

	it('should extract the first number from a complex transcript', () => {
		let resultHandler: ((event: any) => void) | null = null;

		mockUseSpeechRecognitionEvent.mockImplementation((eventName: string, handler: (event: any) => void) => {
			if (eventName === 'result') {
				resultHandler = handler;
			}
		});

		const { result } = renderHook(() => useWindVoice(0));

		act(() => {
			resultHandler?.({
				results: [{ transcript: 'okay um I think it is 85 yards away' }],
			});
		});

		expect(result.current.adjustedYards).toBe(85);
	});

	it('should not update adjustedYards if no number is found in transcript', () => {
		let resultHandler: ((event: any) => void) | null = null;

		mockUseSpeechRecognitionEvent.mockImplementation((eventName: string, handler: (event: any) => void) => {
			if (eventName === 'result') {
				resultHandler = handler;
			}
		});

		const { result } = renderHook(() => useWindVoice(0));

		act(() => {
			resultHandler?.({
				results: [{ transcript: 'can you repeat that' }],
			});
		});

		expect(result.current.adjustedYards).toBeNull();
		expect(mockSpeak).not.toHaveBeenCalled();
	});

	it('should reset adjustedYards when mic is turned off', async () => {
		let resultHandler: ((event: any) => void) | null = null;

		mockUseSpeechRecognitionEvent.mockImplementation((eventName: string, handler: (event: any) => void) => {
			if (eventName === 'result') {
				resultHandler = handler;
			}
		});

		const { result } = renderHook(() => useWindVoice(0));

		await act(async () => {
			await result.current.toggleListening();
		});

		act(() => {
			resultHandler?.({
				results: [{ transcript: '50 yards' }],
			});
		});

		expect(result.current.adjustedYards).toBe(50);

		await act(async () => {
			await result.current.toggleListening();
		});

		expect(result.current.adjustedYards).toBeNull();
	});

	it('should speak using the user voice preference', async () => {
		let resultHandler: ((event: any) => void) | null = null;

		mockUseSpeechRecognitionEvent.mockImplementation((eventName: string, handler: (event: any) => void) => {
			if (eventName === 'result') {
				resultHandler = handler;
			}
		});

		mockGetAvailableVoices.mockResolvedValue([
			{ identifier: 'tom', name: 'Tom', language: 'en-US' },
		]);

		renderHook(() => useWindVoice(0));

		await act(async () => {
			resultHandler?.({
				results: [{ transcript: '100 yards' }],
			});
		});

		expect(mockSpeak).toHaveBeenCalled();
	});
	});
});

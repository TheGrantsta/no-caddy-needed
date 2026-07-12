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
	const defaultSettings = { voice: 'male', soundsEnabled: true, units: 'yards' as const };

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

		it('should return adjustedDisplayValue as null initially', () => {
			const { result } = renderHook(() => useWindVoice(0));
			expect(result.current.adjustedDisplayValue).toBeNull();
		});

		it('should return distanceUnit as yards initially', () => {
			const { result } = renderHook(() => useWindVoice(0));
			expect(result.current.distanceUnit).toBe('yards');
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

	it('should stop listening when a number is recognised to prevent TTS feedback loop', () => {
		let resultHandler: ((event: any) => void) | null = null;

		mockUseSpeechRecognitionEvent.mockClear();
		mockUseSpeechRecognitionEvent.mockImplementation((eventName: string, handler: (event: any) => void) => {
			if (eventName === 'result') {
				resultHandler = handler;
			}
		});

		mockStop.mockClear();

		const { result } = renderHook(() => useWindVoice(0));

		expect(resultHandler).toBeTruthy();

		act(() => {
			resultHandler?.({
				results: [{ transcript: '97 yards' }],
			});
		});

		// After recognizing a number, mic should stop and isListening should be false
		expect(mockStop).toHaveBeenCalled();
		expect(result.current.isListening).toBe(false);
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

	it('should reset adjustedYards when mic is turned off by user', async () => {
		let resultHandler: ((event: any) => void) | null = null;

		mockUseSpeechRecognitionEvent.mockImplementation((eventName: string, handler: (event: any) => void) => {
			if (eventName === 'result') {
				resultHandler = handler;
			}
		});

		const { result } = renderHook(() => useWindVoice(0));

		// Turn mic on
		await act(async () => {
			await result.current.toggleListening();
		});

		// Don't speak; just turn mic off manually
		expect(result.current.adjustedYards).toBeNull();

		await act(async () => {
			await result.current.toggleListening();
		});

		expect(result.current.isListening).toBe(false);
		expect(result.current.adjustedYards).toBeNull();
	});

	it('should reset adjustedYards after auto-stop when number is recognised', async () => {
		let resultHandler: ((event: any) => void) | null = null;

		mockUseSpeechRecognitionEvent.mockImplementation((eventName: string, handler: (event: any) => void) => {
			if (eventName === 'result') {
				resultHandler = handler;
			}
		});

		const { result } = renderHook(() => useWindVoice(0));

		act(() => {
			resultHandler?.({
				results: [{ transcript: '50 yards' }],
			});
		});

		// After recognizing a number, adjusted yards is set
		expect(result.current.adjustedYards).toBe(50);
		// But listening should be stopped
		expect(result.current.isListening).toBe(false);

		// Tapping the button again should turn listening back on
		await act(async () => {
			await result.current.toggleListening();
		});

		expect(result.current.isListening).toBe(true);
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

	it('does not stop listening when a bare number is heard without a unit word', () => {
		let resultHandler: ((event: any) => void) | null = null;

		mockUseSpeechRecognitionEvent.mockImplementation((eventName: string, handler: (event: any) => void) => {
			if (eventName === 'result') {
				resultHandler = handler;
			}
		});

		mockStop.mockClear();
		const { result } = renderHook(() => useWindVoice(0));

		expect(resultHandler).toBeTruthy();

		act(() => {
			resultHandler?.({
				results: [{ transcript: '97' }],
			});
		});

		expect(mockStop).not.toHaveBeenCalled();
		expect(result.current.adjustedYards).toBeNull();
		expect(mockSpeak).not.toHaveBeenCalled();
	});

	it('converts heard metres to yards for wind math, then to configured metres for display', async () => {
		let resultHandler: ((event: any) => void) | null = null;

		mockUseSpeechRecognitionEvent.mockClear();
		mockUseSpeechRecognitionEvent.mockImplementation((eventName: string, handler: (event: any) => void) => {
			if (eventName === 'result') {
				resultHandler = handler;
			}
		});

		mockGetSettings.mockReturnValue({ voice: 'male', soundsEnabled: true, units: 'metres' });
		mockSpeak.mockClear();

		const { result } = renderHook(() => useWindVoice(0));

		expect(resultHandler).toBeTruthy();

		act(() => {
			resultHandler?.({
				results: [{ transcript: '91 metres' }],
			});
		});

		expect(result.current.adjustedYards).toBe(100);
		expect(result.current.adjustedDisplayValue).toBe(91);
		expect(result.current.distanceUnit).toBe('metres');

		await waitFor(() => {
			expect(mockSpeak).toHaveBeenCalledWith(expect.stringContaining('91'), expect.any(Object));
			expect(mockSpeak).toHaveBeenCalledWith(expect.stringContaining('metres'), expect.any(Object));
		});
	});

	it('accepts either unit word and converts correctly', async () => {
		let resultHandler: ((event: any) => void) | null = null;

		mockUseSpeechRecognitionEvent.mockClear();
		mockUseSpeechRecognitionEvent.mockImplementation((eventName: string, handler: (event: any) => void) => {
			if (eventName === 'result') {
				resultHandler = handler;
			}
		});

		mockGetSettings.mockReturnValue({ voice: 'male', soundsEnabled: true, units: 'yards' });
		mockSpeak.mockClear();

		renderHook(() => useWindVoice(0));

		expect(resultHandler).toBeTruthy();

		act(() => {
			resultHandler?.({
				results: [{ transcript: '91 metres' }],
			});
		});

		await waitFor(() => {
			expect(mockSpeak).toHaveBeenCalledWith(expect.stringContaining('100'), expect.any(Object));
			expect(mockSpeak).toHaveBeenCalledWith(expect.stringContaining('yards'), expect.any(Object));
		});
	});

	it('resets adjustedDisplayValue when mic is turned off by user', async () => {
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

		expect(result.current.adjustedDisplayValue).toBeNull();

		await act(async () => {
			await result.current.toggleListening();
		});

		expect(result.current.adjustedDisplayValue).toBeNull();
	});

	describe('submitManualDistance', () => {
		it('should compute adjustedYards from a manually entered value with headwind percent applied', () => {
			const { result } = renderHook(() => useWindVoice(-3)); // 3% shorter

			act(() => {
				result.current.submitManualDistance(97);
			});

			expect(result.current.adjustedYards).toBe(94); // 97 * (1 - 0.03) = 94.09 → 94
		});

		it('should compute adjustedYards from a manually entered value with tailwind percent applied', async () => {
			mockSpeak.mockClear();

			const { result } = renderHook(() => useWindVoice(5)); // 5% longer

			act(() => {
				result.current.submitManualDistance(100);
			});

			expect(result.current.adjustedYards).toBe(105); // 100 * (1 + 0.05) = 105
		});

		it('should convert a manually entered metres value to yards for wind math, then back to metres for display', () => {
			mockGetSettings.mockReturnValue({ voice: 'male', soundsEnabled: true, units: 'metres' });

			const { result } = renderHook(() => useWindVoice(0));

			act(() => {
				result.current.submitManualDistance(91);
			});

			expect(result.current.adjustedYards).toBe(100);
			expect(result.current.adjustedDisplayValue).toBe(91);
			expect(result.current.distanceUnit).toBe('metres');
		});

		it('should not update adjustedYards when submitManualDistance receives zero', () => {
			const { result } = renderHook(() => useWindVoice(0));

			act(() => {
				result.current.submitManualDistance(0);
			});

			expect(result.current.adjustedYards).toBeNull();
		});

		it('should not update adjustedYards when submitManualDistance receives a negative number', () => {
			const { result } = renderHook(() => useWindVoice(0));

			act(() => {
				result.current.submitManualDistance(-10);
			});

			expect(result.current.adjustedYards).toBeNull();
		});

		it('should not update adjustedYards when submitManualDistance receives NaN', () => {
			const { result } = renderHook(() => useWindVoice(0));

			act(() => {
				result.current.submitManualDistance(NaN);
			});

			expect(result.current.adjustedYards).toBeNull();
		});

		it('should round a decimal manually entered value', () => {
			const { result } = renderHook(() => useWindVoice(0));

			act(() => {
				result.current.submitManualDistance(97.6);
			});

			expect(result.current.adjustedYards).toBe(98); // 97.6 rounds to 98
		});

		it('should stop listening when a manual distance is submitted while the mic is active', async () => {
			mockStop.mockClear();

			const { result } = renderHook(() => useWindVoice(0));

			await act(async () => {
				await result.current.toggleListening();
			});

			expect(result.current.isListening).toBe(true);

			act(() => {
				result.current.submitManualDistance(100);
			});

			expect(mockStop).toHaveBeenCalled();
			expect(result.current.isListening).toBe(false);
		});

		it('should not call ExpoSpeechRecognitionModule.stop when submitting manually while not listening', () => {
			mockStop.mockClear();

			const { result } = renderHook(() => useWindVoice(0));

			act(() => {
				result.current.submitManualDistance(100);
			});

			expect(mockStop).not.toHaveBeenCalled();
		});

		it('should not call Speech.speak for a manually submitted distance', () => {
			mockSpeak.mockClear();

			const { result } = renderHook(() => useWindVoice(0));

			act(() => {
				result.current.submitManualDistance(100);
			});

			expect(mockSpeak).not.toHaveBeenCalled();
		});
	});
	});
});

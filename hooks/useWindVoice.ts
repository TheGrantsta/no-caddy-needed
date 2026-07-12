import { useEffect, useRef, useState } from 'react';
import * as Speech from 'expo-speech';
import { getSettingsService } from '@/service/DbService';
import { extractDistanceAndUnit, yardsToDisplayUnit, displayUnitToYards } from '@/service/UnitsService';

let ExpoSpeechRecognitionModule: any = null;
let useSpeechRecognitionEvent: (eventName: string, handler: (event: any) => void) => void = () => {};
let speechRecognitionAvailable = false;

try {
	// eslint-disable-next-line @typescript-eslint/no-require-imports
	const mod = require('expo-speech-recognition');
	ExpoSpeechRecognitionModule = mod.ExpoSpeechRecognitionModule;
	useSpeechRecognitionEvent = mod.useSpeechRecognitionEvent;
	speechRecognitionAvailable = true;
} catch {
	// expo-speech-recognition not available
}

const FEMALE_VOICE_NAMES = ['samantha', 'ava', 'allison', 'susan', 'noelle', 'karen', 'moira', 'tessa', 'fiona'];
const MALE_VOICE_NAMES = ['tom', 'alex', 'fred', 'daniel', 'lee', 'ralph', 'rishi'];

const getVoiceOptions = async (voice: string): Promise<Record<string, unknown>> => {
	if (voice === 'neutral') return {};

	const names = voice === 'female' ? FEMALE_VOICE_NAMES : MALE_VOICE_NAMES;
	const fallbackPitch = voice === 'female' ? 1.5 : 0.5;

	try {
		const available = await Speech.getAvailableVoicesAsync();
		const match = available.find(v =>
			v.language.startsWith('en') && names.some(n => v.name.toLowerCase().includes(n))
		);
		if (match) return { voice: match.identifier };
	} catch {}

	return { pitch: fallbackPitch };
};

export function useWindVoice(playsLongerPercent: number): {
	isAvailable: boolean;
	isListening: boolean;
	adjustedYards: number | null;
	adjustedDisplayValue: number | null;
	distanceUnit: 'yards' | 'metres';
	toggleListening: () => Promise<void>;
	submitManualDistance: (value: number) => void;
} {
	const [isListening, setIsListening] = useState(false);
	const [adjustedYards, setAdjustedYards] = useState<number | null>(null);
	const [adjustedDisplayValue, setAdjustedDisplayValue] = useState<number | null>(null);
	const [distanceUnit, setDistanceUnit] = useState<'yards' | 'metres'>('yards');
	const isStoppingRef = useRef(false);

	useSpeechRecognitionEvent('result', (event) => {
		if (isStoppingRef.current) return;
		const transcript = (event.results[0]?.transcript ?? '').toLowerCase();
		const match = extractDistanceAndUnit(transcript);

		if (!match) return;

		const heardYards = displayUnitToYards(match.value, match.unit);
		const adjusted = Math.round(heardYards * (1 + playsLongerPercent / 100));

		// Stop listening before speaking to prevent TTS output looping back into recognition
		isStoppingRef.current = true;
		ExpoSpeechRecognitionModule?.stop();
		setIsListening(false);

		setAdjustedYards(adjusted);

		const settings = getSettingsService();
		const displayValue = yardsToDisplayUnit(adjusted, settings.units);
		setAdjustedDisplayValue(displayValue);
		setDistanceUnit(settings.units);

		if (settings.soundsEnabled) {
			Speech.stop();
			getVoiceOptions(settings.voice).then(options => {
				Speech.speak(`Play it as ${displayValue} ${settings.units}`, options);
			});
		}
	});

	useEffect(() => {
		return () => {
			ExpoSpeechRecognitionModule?.stop();
		};
	}, []);

	const toggleListening = async () => {
		if (!isListening) {
			isStoppingRef.current = false;
			const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
			if (granted) {
				ExpoSpeechRecognitionModule.start({ lang: 'en-GB', continuous: true, interimResults: true });
				setIsListening(true);
			}
		} else {
			isStoppingRef.current = true;
			ExpoSpeechRecognitionModule.stop();
			setIsListening(false);
			setAdjustedYards(null);
			setAdjustedDisplayValue(null);
		}
	};

	const submitManualDistance = (value: number) => {
		if (!Number.isFinite(value) || value <= 0) return;

		if (isListening) {
			isStoppingRef.current = true;
			ExpoSpeechRecognitionModule?.stop();
			setIsListening(false);
		}

		const settings = getSettingsService();
		const heardYards = displayUnitToYards(value, settings.units);
		const adjusted = Math.round(heardYards * (1 + playsLongerPercent / 100));

		setAdjustedYards(adjusted);
		const displayValue = yardsToDisplayUnit(adjusted, settings.units);
		setAdjustedDisplayValue(displayValue);
		setDistanceUnit(settings.units);
	};

	return {
		isAvailable: speechRecognitionAvailable,
		isListening,
		adjustedYards,
		adjustedDisplayValue,
		distanceUnit,
		toggleListening,
		submitManualDistance,
	};
}

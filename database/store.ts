import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, buildDay, DAY_DEFINITIONS, generateInitialWords, getInitialAppState, VocabWord } from '../data/seedData';

const STORE_KEY = 'yokdil_app_state';

// Remove old legacy keys to prevent conflicts
const purgeOldKeys = async () => {
    try {
        await AsyncStorage.multiRemove([
            '@yokdil_vocab_cards',
            '@yokdil_vocab_streak',
            '@yokdil_last_studied'
        ]);
    } catch (e) {
        console.warn("Could not purge old keys", e);
    }
};

/**
 * Safe state migration: merges any new days/words from seed data
 * into an existing user state WITHOUT overwriting their progress.
 */
const migrateState = (existingState: AppState): AppState => {
    const seedWords = generateInitialWords();
    let dirty = false;

    // 1. Merge missing days
    const existingDayIds = new Set(existingState.days.map(d => d.id));
    for (const def of DAY_DEFINITIONS) {
        if (!existingDayIds.has(def.id)) {
            existingState.days.push(buildDay(def));
            dirty = true;
        }
    }

    // 2. Merge missing words
    const existingWordIds = new Set(existingState.words.map(w => w.id));
    for (const word of seedWords) {
        if (!existingWordIds.has(word.id)) {
            existingState.words.push(word);
            dirty = true;
        }
    }

    // 3. Ensure existing words have composite score fields (migration from pre-composite era)
    for (const word of existingState.words) {
        if (word.flashcardScore === undefined) { (word as any).flashcardScore = null; dirty = true; }
        if (word.matchSynonymScore === undefined) { (word as any).matchSynonymScore = null; dirty = true; }
        if (word.matchTurkishScore === undefined) { (word as any).matchTurkishScore = null; dirty = true; }
        if (word.testSynonymScore === undefined) { (word as any).testSynonymScore = null; dirty = true; }
        if (word.testTurkishScore === undefined) { (word as any).testTurkishScore = null; dirty = true; }
    }

    return existingState;
};

export const getAppState = async (): Promise<AppState> => {
    try {
        const jsonString = await AsyncStorage.getItem(STORE_KEY);
        if (jsonString) {
            let state: AppState = JSON.parse(jsonString);

            // Run migration to inject any new days/words from seed data
            state = migrateState(state);
            await saveAppState(state);

            return state;
        }
    } catch (error) {
        console.error('Error fetching app state:', error);
    }

    // Initialize with seed data if store does not exist
    const initialState = getInitialAppState();
    await purgeOldKeys(); // Clear old legacy structure
    await saveAppState(initialState);
    return initialState;
};

export const saveAppState = async (state: AppState): Promise<void> => {
    try {
        await AsyncStorage.setItem(STORE_KEY, JSON.stringify(state));
    } catch (error) {
        console.error('Error saving app state:', error);
    }
};

export const resetProgress = async (): Promise<AppState> => {
    try {
        await AsyncStorage.removeItem(STORE_KEY);
    } catch (e) {
        console.error("Failed to reset storage", e);
    }
    return await getAppState();
};

import { updateWordAfterActivity } from '../utils/compositeScoring';

export const reviewFlashcard = async (wordId: string, quality: number): Promise<void> => {
    const state = await getAppState();
    const wordIndex = state.words.findIndex(w => w.id === wordId);

    if (wordIndex > -1) {
        let word = state.words[wordIndex];

        // Map SM2 quality back to a 0.0 - 1.0 raw score for the flashcard component
        // Again=0, Hard=0.33, Good=0.67, Easy=1.0
        const rawScore = quality / 3.0; // 0, 0.333, 0.666, 1
        word.flashcardScore = rawScore;

        // updateWordAfterActivity orchestrates the composite calculation and the SM2 update
        word = updateWordAfterActivity(word);
        state.words[wordIndex] = word;

        await saveAppState(state);
    }
};

export const recordActivityResults = async (dayId: string, activityType: ActivityType, wordResults: Record<string, boolean>, score?: number): Promise<void> => {
    const state = await getAppState();

    // 1. Update the overall day/activity state
    const dayIndex = state.days.findIndex(d => d.id === dayId);
    if (dayIndex > -1) {
        const activity = state.days[dayIndex].activities[activityType];
        activity.completedOnce = true;
        activity.lastPlayedAt = Date.now();
        if (score !== undefined) {
            activity.lastScore = score;
        }
    }

    // 2. Loop through all per-word results and assign scores
    const propertyMap: Record<string, keyof VocabWord> = {
        'matchSynonym': 'matchSynonymScore',
        'matchTurkish': 'matchTurkishScore',
        'testSynonym': 'testSynonymScore',
        'testTurkish': 'testTurkishScore',
    };

    const targetProperty = propertyMap[activityType];

    if (targetProperty) {
        Object.keys(wordResults).forEach(wordId => {
            const wordIndex = state.words.findIndex(w => w.id === wordId);
            if (wordIndex > -1) {
                let word = state.words[wordIndex];

                // Set the raw component score (1.0 for correct, 0.0 for wrong)
                // @ts-ignore - we know this is a valid assignment for the *Score properties
                word[targetProperty] = wordResults[wordId] ? 1.0 : 0.0;

                // Recalculate composite and run SM2
                word = updateWordAfterActivity(word);
                state.words[wordIndex] = word;
            }
        });
    }

    await checkAndIncrementStreak(state);
    await saveAppState(state);
};

// Activity complete mutations
type ActivityType = 'flashcard' | 'matchSynonym' | 'matchTurkish' | 'testSynonym' | 'testTurkish';

export const markActivityComplete = async (dayId: string, activityType: ActivityType, score?: number): Promise<void> => {
    const state = await getAppState();
    const dayIndex = state.days.findIndex(d => d.id === dayId);

    if (dayIndex > -1) {
        const activity = state.days[dayIndex].activities[activityType];
        activity.completedOnce = true;
        activity.lastPlayedAt = Date.now();
        if (score !== undefined) {
            activity.lastScore = score;
        }

        await checkAndIncrementStreak(state);
        await saveAppState(state);
    }
};

const checkAndIncrementStreak = async (state: AppState) => {
    const todayStr = new Date().toISOString().split('T')[0];

    if (state.lastStudiedDate !== todayStr) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (state.lastStudiedDate === yesterdayStr) {
            state.streak += 1;
        } else {
            state.streak = 1;
        }
        state.lastStudiedDate = todayStr;
    }
};

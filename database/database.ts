import AsyncStorage from '@react-native-async-storage/async-storage';
import wordsData from '../data/words.json';
import { calculateSM2 } from '../utils/sm2';

export interface Word {
    id: number;
    english: string;
    partOfSpeech: string;
    turkish: string;
    category: string;
    exampleSentence: string;
    synonyms: string;
    memoryHook?: string;

    // SM-2 Spaced Repetition Fields
    interval: number;
    easeFactor: number;
    dueDate: number;
    repetitions: number;
}

const CARDS_KEY = '@yokdil_vocab_cards';
const STREAK_KEY = '@yokdil_vocab_streak';
const LAST_STUDIED_KEY = '@yokdil_last_studied';

// Initialize or get all cards from AsyncStorage
export async function getAllWords(): Promise<Word[]> {
    try {
        const data = await AsyncStorage.getItem(CARDS_KEY);
        if (data) {
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error fetching cards:', error);
    }

    // Fallback to seed data if nothing is in local storage
    const now = Date.now();
    const seedWords: Word[] = wordsData.map((word, index) => ({
        id: index + 1,
        english: word.word, // words.json uses 'word' for the english text
        partOfSpeech: word.partOfSpeech || "",
        turkish: word.turkish,
        category: "Gün 1", // Let's give them a default category
        exampleSentence: word.exampleSentence || "",
        synonyms: word.synonyms || "",
        memoryHook: "",
        interval: word.interval || 1,
        easeFactor: word.easeFactor || 2.5,
        repetitions: word.repetitions || 0,
        dueDate: now, // All new words are due immediately
    }));

    // Save seed data to async storage for future use
    await AsyncStorage.setItem(CARDS_KEY, JSON.stringify(seedWords));
    return seedWords;
}

// Save the full list of words
export async function saveAllWords(words: Word[]): Promise<void> {
    try {
        await AsyncStorage.setItem(CARDS_KEY, JSON.stringify(words));
    } catch (error) {
        console.error('Error saving cards:', error);
    }
}

// Process a review for a specific card
export async function reviewWord(id: number, quality: number): Promise<void> {
    const words = await getAllWords();
    const index = words.findIndex((w) => w.id === id);
    if (index === -1) return;

    const word = words[index];
    const sm2 = calculateSM2(quality, word.repetitions, word.easeFactor, word.interval);

    words[index] = {
        ...word,
        ...sm2,
    };

    await saveAllWords(words);
    await recordStudiedToday();
}

// Removed markProducedSentence as part of deleting Output Practice

export async function getDueWords(): Promise<Word[]> {
    const words = await getAllWords();
    const now = Date.now();

    // Due if the dueDate is in the past
    return words.filter((w) => w.dueDate <= now).sort((a, b) => a.dueDate - b.dueDate);
}

export async function addCustomWord(
    english: string,
    turkish: string,
    category: string,
    exampleSentence: string = "",
    memoryHook: string = ""
): Promise<void> {
    const words = await getAllWords();
    const newId = words.length > 0 ? Math.max(...words.map(w => w.id)) + 1 : 1;

    const newWord: Word = {
        id: newId,
        english,
        partOfSpeech: "",
        turkish,
        category,
        exampleSentence,
        synonyms: "",
        memoryHook,
        interval: 1,
        easeFactor: 2.5,
        dueDate: Date.now(),
        repetitions: 0,
    };

    words.push(newWord);
    await saveAllWords(words);
}

// Streak Tracking functionality
export async function recordStudiedToday(): Promise<void> {
    try {
        const today = new Date().toDateString();
        const lastStudied = await AsyncStorage.getItem(LAST_STUDIED_KEY);

        if (lastStudied !== today) {
            let streak = await getStreak();

            // Check if they studied yesterday. If not, reset streak to 1
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            if (lastStudied === yesterday.toDateString()) {
                streak += 1;
            } else {
                streak = 1; // Missed a day or first time
            }

            await AsyncStorage.setItem(STREAK_KEY, streak.toString());
            await AsyncStorage.setItem(LAST_STUDIED_KEY, today);
        }
    } catch (error) {
        console.error("Error saving streak:", error);
    }
}

export async function getStreak(): Promise<number> {
    try {
        const streakStr = await AsyncStorage.getItem(STREAK_KEY);
        return streakStr ? parseInt(streakStr, 10) : 0;
    } catch {
        return 0;
    }
}

export async function resetAllProgress(): Promise<void> {
    try {
        await AsyncStorage.removeItem(CARDS_KEY);
        await AsyncStorage.removeItem(STREAK_KEY);
        await AsyncStorage.removeItem(LAST_STUDIED_KEY);
    } catch (error) {
        console.error('Error resetting progress:', error);
    }
}

export async function getStats(): Promise<{
    total: number;
    learned: number;
    dueToday: number;
    streak: number;
}> {
    const words = await getAllWords();
    const now = Date.now();

    const totalCount = words.length;
    // We consider a word "learned" if it has been reviewed successfully at least once
    const learnedCount = words.filter((w) => w.repetitions > 0).length;
    const dueTodayCount = words.filter((w) => w.dueDate <= now).length;
    const streak = await getStreak();

    return {
        total: totalCount,
        learned: learnedCount,
        dueToday: dueTodayCount,
        streak,
    };
}

export async function getCategories(): Promise<string[]> {
    const words = await getAllWords();
    const categories = new Set(words.map((w) => w.category));
    return Array.from(categories).sort();
}

export async function exportData(): Promise<string> {
    const words = await getAllWords();
    return JSON.stringify(words, null, 2);
}

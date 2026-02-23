import { VocabWord } from '../data/seedData';
import { calculateSM2 } from './sm2';

/**
 * Calculates the average composite score from all attempted activities.
 * Returns null if no activities have been attempted yet.
 */
export function calculateCompositeScore(word: VocabWord): number | null {
    const scores = [
        word.flashcardScore,
        word.matchSynonymScore,
        word.matchTurkishScore,
        word.testSynonymScore,
        word.testTurkishScore,
    ];

    // Only include activities that have been attempted (non-null)
    const attempted = scores.filter(s => s !== null) as number[];

    if (attempted.length === 0) return null;

    // Simple average of all attempted activity scores
    const avg = attempted.reduce((sum, s) => sum + s, 0) / attempted.length;
    return avg;
}

/**
 * Maps the 0.0-1.0 composite score to an SM-2 Quality rating (0 to 3).
 */
export function compositeToQuality(composite: number): number {
    if (composite < 0.25) return 0; // Again (0.00 – 0.24)
    if (composite < 0.50) return 1; // Hard (0.25 – 0.49)
    if (composite < 0.80) return 2; // Good (0.50 – 0.79)
    return 3;                       // Easy (0.80 – 1.00)
}

/**
 * Helper to get the human-readable label and UI color 
 * for a given quality rating (or null if unattempted).
 */
export function getQualityLabelAndColor(quality: number | null, themeColors: any) {
    if (quality === null) {
        return { label: 'Yeni', color: themeColors.textMuted };
    }
    switch (quality) {
        case 0: return { label: 'Tekrar', color: themeColors.error };
        case 1: return { label: 'Zor', color: themeColors.warning };
        case 2: return { label: 'İyi', color: themeColors.success };
        case 3: return { label: 'Kolay', color: themeColors.info };
        default: return { label: 'Bilinmeyen', color: themeColors.textMuted };
    }
}

/**
 * Pure function that takes a word with newly updated score fields,
 * recalculates its composite, and applies the SM2 algorithm to update scheduling.
 */
export function updateWordAfterActivity(word: VocabWord): VocabWord {
    const composite = calculateCompositeScore(word);

    // If no activities attempted, no SM2 update needed
    if (composite === null) return word;

    const quality = compositeToQuality(composite);
    const sm2Result = calculateSM2(quality, word.repetitions, word.easeFactor, word.interval);

    return {
        ...word,
        ...sm2Result
    };
}

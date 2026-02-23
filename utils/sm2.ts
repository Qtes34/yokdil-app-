export interface SM2Result {
    interval: number;
    easeFactor: number;
    repetitions: number;
    dueDate: number;
}

/**
 * Calculates the next review interval using SuperMemo-2 (SM-2) algorithm.
 * 
 * @param quality 0 (Again), 1 (Hard), 2 (Good), 3 (Easy)
 * @param repetitions Number of times the item has been successfully reviewed
 * @param easeFactor Multiplier for interval growth (starts at 2.5, min 1.3)
 * @param interval Current interval in days
 * @returns SM2Result Object containing the new state
 */
export function calculateSM2(
    quality: number,
    repetitions: number,
    easeFactor: number,
    interval: number
): SM2Result {
    let newInterval: number;
    let newRepetitions: number;
    let newEaseFactor: number;

    // If response was incorrect or hard (quality 0 or 1)
    if (quality < 2) {
        newRepetitions = 0;
        newInterval = 1;
        // Ease factor is reduced but not drastically for failures
        newEaseFactor = easeFactor;
    } else {
        // If correct (quality 2 or 3)
        newRepetitions = repetitions + 1;

        if (newRepetitions === 1) {
            newInterval = 1;
        } else if (newRepetitions === 2) {
            newInterval = 6;
        } else {
            newInterval = Math.round(interval * easeFactor);

            // If quality is 3 (Easy), give a 30% bonus to the interval
            if (quality === 3) {
                newInterval = Math.round(newInterval * 1.3);
            }
        }

        // Update Ease Factor (EF = EF + (0.1 - (3 - q) * (0.08 + (3 - q) * 0.02)))
        newEaseFactor = easeFactor + (0.1 - (3 - quality) * (0.08 + (3 - quality) * 0.02));
    }

    // Ensure Ease Factor doesn't drop below 1.3
    newEaseFactor = Math.max(1.3, newEaseFactor);

    // Calculate new due date (now + interval in milliseconds)
    const dueDate = Date.now() + newInterval * 86400000;

    return {
        interval: newInterval,
        easeFactor: newEaseFactor,
        repetitions: newRepetitions,
        dueDate,
    };
}

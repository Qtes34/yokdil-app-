import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MultipleChoiceGame, { QuizQuestion } from '../../../components/MultipleChoiceGame';
import { ThemeColors } from '../../../constants/theme';
import { useTheme } from '../../../contexts/ThemeContext';
import { getAppState, recordActivityResults } from '../../../database/store';

// Helper to shuffle arrays
function shuffle<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

export default function TestSynonymActivityScreen() {
    const { dayId } = useLocalSearchParams<{ dayId: string }>();
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const state = await getAppState();
            const dayWords = state.words.filter(w => w.dayId === dayId);

            // Build question set
            const quizQuestions: QuizQuestion[] = dayWords.map(w => {
                const correctSynonym = w.synonyms;

                // Get distractors from OTHER words in the exact same day
                const others = dayWords.filter(other => other.id !== w.id);
                // Extract their full synonyms
                let otherSynonyms = Array.from(new Set(others.map(o => o.synonyms)));

                // Shuffle and pick up to 3 distractors
                otherSynonyms = shuffle(otherSynonyms);
                const distractors = otherSynonyms.slice(0, 3);

                // If we somehow have fewer than 3 distractors (small day), we just use what we have.
                const options = shuffle([correctSynonym, ...distractors]);

                return {
                    id: w.id,
                    questionText: w.word,
                    correctAnswer: correctSynonym,
                    options: options
                };
            });

            // Shuffle questions themselves so order is varied on replay
            setQuestions(shuffle(quizQuestions));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [dayId]);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [loadData])
    );

    const handleComplete = async (percentage: number, wordResults: Record<string, boolean>) => {
        await recordActivityResults(dayId, 'testSynonym', wordResults, percentage);
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </SafeAreaView>
        );
    }

    if (questions.length === 0) {
        return <SafeAreaView style={styles.container} />;
    }

    return (
        <SafeAreaView style={styles.container}>
            <MultipleChoiceGame
                questions={questions}
                onComplete={handleComplete}
                onGoBack={() => router.back()}
                onReplay={loadData}
            />
        </SafeAreaView>
    );
}

const createStyles = (C: ThemeColors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: C.background,
    }
});

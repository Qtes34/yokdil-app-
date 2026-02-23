import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MatchingGame, { MatchingPair } from '../../../components/MatchingGame';
import { ThemeColors } from '../../../constants/theme';
import { useTheme } from '../../../contexts/ThemeContext';
import { getAppState, recordActivityResults } from '../../../database/store';

export default function MatchSynonymActivityScreen() {
    const { dayId } = useLocalSearchParams<{ dayId: string }>();
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const [pairs, setPairs] = useState<MatchingPair[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const state = await getAppState();
            const dayWords = state.words.filter(w => w.dayId === dayId);

            const gamePairs: MatchingPair[] = dayWords.map(w => {
                const fullSynonyms = w.synonyms;
                return {
                    leftId: w.id,
                    leftText: w.word,
                    rightId: `match_${w.id}`,
                    rightText: fullSynonyms || "No synonym"
                };
            }).filter(p => p.rightText !== "No synonym"); // Filter out words with literally no synonym just in case

            setPairs(gamePairs);
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

    const handleComplete = async (score: number, total: number, wordResults: Record<string, boolean>) => {
        // We can optionally compute a percentage score for display later, though matching game usually uses score/total
        const percentage = Math.round((score / total) * 100);
        await recordActivityResults(dayId, 'matchSynonym', wordResults, percentage);
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </SafeAreaView>
        );
    }

    if (pairs.length === 0) {
        return <SafeAreaView style={styles.container} />;
    }

    return (
        <SafeAreaView style={styles.container}>
            <MatchingGame
                pairs={pairs}
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

import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FlashCard from '../../../components/FlashCard';
import { BorderRadius, FontSizes, Shadows, Spacing, ThemeColors } from '../../../constants/theme';
import { useTheme } from '../../../contexts/ThemeContext';
import { VocabWord } from '../../../data/seedData';
import { getAppState, markActivityComplete, reviewFlashcard } from '../../../database/store';

export default function FlashcardActivityScreen() {
    const { dayId, forceAll } = useLocalSearchParams<{ dayId: string, forceAll?: string }>();
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const [words, setWords] = useState<VocabWord[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [loading, setLoading] = useState(true);
    const [sessionTotal, setSessionTotal] = useState(0);
    const [sessionDone, setSessionDone] = useState(false);

    const loadSession = useCallback(async () => {
        setLoading(true);
        try {
            const state = await getAppState();
            const dayWords = state.words.filter(w => w.dayId === dayId);

            let sessionQueue = dayWords;
            if (forceAll !== 'true') {
                const now = Date.now();
                sessionQueue = dayWords.filter(w => w.dueDate <= now);
            }

            // If no due words but we entered normally, fallback to all (helpful for pure sequential runs)
            if (sessionQueue.length === 0 && forceAll !== 'true') {
                sessionQueue = dayWords;
            }

            setWords(sessionQueue);
            setSessionTotal(sessionQueue.length);
            setCurrentIndex(0);
            setIsFlipped(false);
            setSessionDone(false);

        } catch (e) {
            console.error('Failed to load flashcard session', e);
        } finally {
            setLoading(false);
        }
    }, [dayId, forceAll]);

    useFocusEffect(
        useCallback(() => {
            loadSession();
        }, [loadSession])
    );

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    const handleRate = async (quality: number) => {
        if (words.length === 0) return;
        const currentWord = words[currentIndex];

        try {
            // Update in DB
            await reviewFlashcard(currentWord.id, quality);

            // Move to next card safely
            setIsFlipped(false);

            setTimeout(async () => {
                if (currentIndex + 1 >= words.length) {
                    await markActivityComplete(dayId, 'flashcard');
                    setSessionDone(true);
                } else {
                    setCurrentIndex(prev => prev + 1);
                }
            }, 300); // Wait for card flip back animation

        } catch (error) {
            console.error('Error rating word:', error);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </SafeAreaView>
        );
    }

    if (sessionDone || sessionTotal === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <FontAwesome name="chevron-left" size={16} color={colors.text} />
                    </TouchableOpacity>
                </View>

                <View style={styles.doneContainer}>
                    <View style={styles.doneIconBg}>
                        <FontAwesome name="trophy" size={48} color={colors.warning} />
                    </View>
                    <Text style={styles.doneTitle}>🎉 Tebrikler!</Text>
                    <Text style={styles.doneSubtitle}>Flashcard çalışması tamamlandı.</Text>

                    <View style={styles.doneStatsRow}>
                        <Text style={styles.doneStatsText}>{sessionTotal} kart tekrar edildi.</Text>
                    </View>

                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => router.replace(`/activity/flashcard/${dayId}?forceAll=true` as any)}
                        activeOpacity={0.8}
                    >
                        <FontAwesome name="refresh" size={16} color="#fff" />
                        <Text style={styles.actionButtonText}>Tekrar Et</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.secondaryButton]}
                        onPress={() => router.back()}
                        activeOpacity={0.8}
                    >
                        <FontAwesome name="arrow-left" size={16} color={colors.textSecondary} />
                        <Text style={[styles.actionButtonText, { color: colors.textSecondary }]}>Güne Dön</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const currentWord = words[currentIndex];

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <FontAwesome name="chevron-left" size={16} color={colors.text} />
                </TouchableOpacity>

                <View style={styles.progressCounter}>
                    <Text style={styles.progressText}>{currentIndex + 1} / {words.length}</Text>
                </View>
                <View style={{ width: 40 }} />
            </View>

            {/* Flashcard Area */}
            <View style={styles.cardArea}>
                <FlashCard
                    english={currentWord.word}
                    turkish={currentWord.turkish}
                    category={`Gün ${dayId.replace('day', '')}`}
                    partOfSpeech={currentWord.partOfSpeech}
                    exampleSentenceEN={currentWord.exampleSentenceEN}
                    exampleSentenceTR={currentWord.exampleSentenceTR}
                    synonyms={currentWord.synonyms}
                    isFlipped={isFlipped}
                    onFlip={handleFlip}
                />
            </View>

            {/* Actions Area */}
            <View style={styles.actionsContainer}>
                {isFlipped && (
                    <View style={styles.ratingsGrid}>
                        <RatingButton title="Tekrar" intervalText="Yarın" color={colors.error} onPress={() => handleRate(0)} styles={styles} />
                        <RatingButton title="Zor" intervalText="6 gün" color={colors.warning} onPress={() => handleRate(1)} styles={styles} />
                        <RatingButton title="İyi" intervalText="12 gün" color={colors.success} onPress={() => handleRate(2)} styles={styles} />
                        <RatingButton title="Kolay" intervalText="20 gün" color={colors.info} onPress={() => handleRate(3)} styles={styles} />
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

// Sub-component for rating buttons
function RatingButton({ title, intervalText, color, onPress, styles }: { title: string, intervalText: string, color: string, onPress: () => void, styles: any }) {
    return (
        <TouchableOpacity
            style={[styles.ratingButton, { borderColor: color }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <Text style={[styles.ratingTitle, { color }]}>{title}</Text>
            <Text style={styles.ratingInterval}>{intervalText}</Text>
        </TouchableOpacity>
    );
}

const createStyles = (C: ThemeColors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: C.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        paddingTop: 60,
        paddingBottom: Spacing.md,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: BorderRadius.full,
        backgroundColor: C.surface,
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadows.small,
    },
    progressCounter: {
        backgroundColor: C.surface,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.full,
        ...Shadows.small,
    },
    progressText: {
        fontSize: FontSizes.sm,
        fontWeight: '700',
        color: C.text,
    },
    cardArea: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionsContainer: {
        height: 120, // fixed height placeholder
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.xl,
        justifyContent: 'center',
    },
    ratingsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: Spacing.sm,
    },
    ratingButton: {
        flex: 1,
        backgroundColor: C.surface,
        borderWidth: 1,
        borderRadius: BorderRadius.lg,
        paddingVertical: Spacing.md,
        alignItems: 'center',
        ...Shadows.small,
    },
    ratingTitle: {
        fontSize: FontSizes.sm,
        fontWeight: '700',
        marginBottom: 2,
    },
    ratingInterval: {
        fontSize: FontSizes.xs,
        color: C.textMuted,
    },
    doneContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Spacing.xl,
    },
    doneIconBg: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: C.warning + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    doneTitle: {
        fontSize: FontSizes.xxl,
        fontWeight: '800',
        color: C.text,
        marginBottom: Spacing.xs,
    },
    doneSubtitle: {
        fontSize: FontSizes.md,
        color: C.textSecondary,
        textAlign: 'center',
        marginBottom: Spacing.xl,
    },
    doneStatsRow: {
        backgroundColor: C.surface,
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.xl,
        borderWidth: 1,
        borderColor: C.border,
    },
    doneStatsText: {
        fontSize: FontSizes.md,
        fontWeight: '600',
        color: C.primary,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: C.primary,
        width: '100%',
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.md,
        gap: Spacing.sm,
    },
    actionButtonText: {
        color: '#fff',
        fontSize: FontSizes.md,
        fontWeight: '700',
    },
    secondaryButton: {
        backgroundColor: C.surface,
        borderWidth: 1,
        borderColor: C.border,
    },
});

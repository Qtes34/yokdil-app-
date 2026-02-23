import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FlashCard from '../../components/FlashCard';
import { BorderRadius, FontSizes, Shadows, Spacing, ThemeColors } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { getDueWords, reviewWord, Word } from '../../database/database';
import { calculateSM2 } from '../../utils/sm2';

const { width } = Dimensions.get('window');

// Helper component for rating buttons
const RatingButton = ({
    title, icon, color, intervalText, onPress, styles
}: {
    title: string; icon: any; color: string; intervalText: string; onPress: () => void; styles: any;
}) => (
    <TouchableOpacity style={[styles.ratingButton, { borderColor: color }]} onPress={onPress}>
        <FontAwesome name={icon} size={16} color={color} />
        <Text style={[styles.ratingTitle, { color }]}>{title}</Text>
        <Text style={styles.intervalText}>{intervalText}</Text>
    </TouchableOpacity>
);

export default function FlashcardsScreen() {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const [words, setWords] = useState<Word[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [loading, setLoading] = useState(true);
    const [sessionTotal, setSessionTotal] = useState(0);

    const loadWords = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getDueWords();
            setWords(data);
            setCurrentIndex(0);
            setIsFlipped(false);
            setSessionTotal(data.length);
        } catch (error) {
            console.error('Error loading words:', error);
        }
        setLoading(false);
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadWords();
        }, [loadWords])
    );

    const handleFlip = () => {
        setIsFlipped(true);
    };

    const handleRate = async (quality: number) => {
        if (words.length === 0) return;
        const currentWord = words[currentIndex];

        try {
            await reviewWord(currentWord.id, quality);

            // Move to next card safely
            setIsFlipped(false);

            setTimeout(() => {
                const remainingWords = words.filter((_, i) => i !== currentIndex);
                setWords(remainingWords);

                if (currentIndex >= remainingWords.length && remainingWords.length > 0) {
                    setCurrentIndex(remainingWords.length - 1);
                }
            }, 300);
        } catch (error) {
            console.error('Error rating word:', error);
        }
    };

    const currentWord = words[currentIndex];

    // Pre-calculate SM-2 intervals for button previews
    const intervals = useMemo(() => {
        if (!currentWord) return { again: '1 g', hard: '1 g', good: '1 g', easy: '1 g' };

        const q0 = calculateSM2(0, currentWord.repetitions, currentWord.easeFactor, currentWord.interval);
        const q1 = calculateSM2(1, currentWord.repetitions, currentWord.easeFactor, currentWord.interval);
        const q2 = calculateSM2(2, currentWord.repetitions, currentWord.easeFactor, currentWord.interval);
        const q3 = calculateSM2(3, currentWord.repetitions, currentWord.easeFactor, currentWord.interval);

        return {
            again: `${q0.interval} g`,
            hard: `${q1.interval} g`,
            good: `${q2.interval} g`,
            easy: `${q3.interval} g`,
        };
    }, [currentWord]);

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Kartlar hazırlanıyor...</Text>
            </View>
        );
    }

    if (words.length === 0) {
        return (
            <View style={styles.centerContainer}>
                <FontAwesome name="check-circle" size={64} color={colors.success} />
                <Text style={styles.emptyTitle}>Harika İş! 🎉</Text>
                <Text style={styles.emptyText}>Bugün tekrar edilecek kelime kalmadı.</Text>

                {sessionTotal > 0 && (
                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryText}>Bu oturumda {sessionTotal} kart tamamladın!</Text>
                    </View>
                )}

                <TouchableOpacity style={styles.refreshButton} onPress={() => router.push('/(tabs)')}>
                    <FontAwesome name="home" size={16} color={colors.text} />
                    <Text style={styles.refreshButtonText}>Ana Sayfaya Dön</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Günlük Tekrar</Text>
                <View style={styles.counter}>
                    <Text style={styles.counterText}>
                        Kalan: {words.length}
                    </Text>
                </View>
            </View>

            {/* Card Area */}
            <View style={styles.cardArea}>
                <FlashCard
                    english={currentWord.english}
                    turkish={currentWord.turkish}
                    category={currentWord.category}
                    partOfSpeech={currentWord.partOfSpeech}
                    exampleSentenceEN={currentWord.exampleSentence}
                    synonyms={currentWord.synonyms}
                    memoryHook={currentWord.memoryHook}
                    isFlipped={isFlipped}
                    onFlip={handleFlip}
                />
            </View>

            {/* Actions Area */}
            <View style={styles.actionsContainer}>
                {!isFlipped ? (
                    <TouchableOpacity style={styles.revealButton} onPress={handleFlip} activeOpacity={0.8}>
                        <Text style={styles.revealButtonText}>Cevabı Göster</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.ratingsGrid}>
                        <RatingButton
                            title="Tekrar"
                            icon="times-circle"
                            color={colors.error}
                            intervalText={intervals.again}
                            onPress={() => handleRate(0)}
                            styles={styles}
                        />
                        <RatingButton
                            title="Zor"
                            icon="exclamation-circle"
                            color={colors.warning}
                            intervalText={intervals.hard}
                            onPress={() => handleRate(1)}
                            styles={styles}
                        />
                        <RatingButton
                            title="İyi"
                            icon="check-circle"
                            color={colors.success}
                            intervalText={intervals.good}
                            onPress={() => handleRate(2)}
                            styles={styles}
                        />
                        <RatingButton
                            title="Kolay"
                            icon="star"
                            color={colors.info}
                            intervalText={intervals.easy}
                            onPress={() => handleRate(3)}
                            styles={styles}
                        />
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

const createStyles = (C: ThemeColors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: C.background,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: C.background,
        padding: Spacing.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingTop: 60,
        paddingBottom: Spacing.md,
    },
    headerTitle: {
        fontSize: FontSizes.xl,
        fontWeight: '800',
        color: C.text,
    },
    counter: {
        backgroundColor: C.surface,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.full,
        borderWidth: 1,
        borderColor: C.primary + '40',
    },
    counterText: {
        color: C.primary,
        fontSize: FontSizes.sm,
        fontWeight: '700',
    },
    cardArea: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
    },
    actionsContainer: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.xl + 20,
        minHeight: 120,
        justifyContent: 'center',
    },
    revealButton: {
        backgroundColor: C.primary,
        paddingVertical: Spacing.lg,
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
        ...Shadows.medium,
    },
    revealButtonText: {
        color: '#fff',
        fontSize: FontSizes.md,
        fontWeight: '700',
        letterSpacing: 1,
    },
    ratingsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: Spacing.xs,
    },
    ratingButton: {
        flex: 1,
        backgroundColor: C.surface,
        borderWidth: 1.5,
        borderRadius: BorderRadius.md,
        paddingVertical: Spacing.md,
        paddingHorizontal: 2,
        alignItems: 'center',
        justifyContent: 'center',
        ...Shadows.small,
    },
    ratingTitle: {
        fontSize: FontSizes.xs,
        fontWeight: '700',
        marginTop: Spacing.xs,
        marginBottom: 2,
    },
    intervalText: {
        fontSize: FontSizes.xs - 2,
        color: C.textMuted,
        fontWeight: '500',
    },
    loadingText: {
        color: C.textSecondary,
        marginTop: Spacing.md,
        fontSize: FontSizes.md,
    },
    emptyTitle: {
        fontSize: FontSizes.xxl,
        fontWeight: '800',
        color: C.text,
        marginTop: Spacing.lg,
    },
    emptyText: {
        fontSize: FontSizes.md,
        color: C.textSecondary,
        marginTop: Spacing.sm,
        textAlign: 'center',
    },
    summaryCard: {
        backgroundColor: C.surface,
        marginTop: Spacing.xl,
        padding: Spacing.lg,
        borderRadius: BorderRadius.md,
        borderLeftWidth: 3,
        borderLeftColor: C.primary,
    },
    summaryText: {
        color: C.text,
        fontSize: FontSizes.sm,
        fontWeight: '600',
    },
    refreshButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: C.surface,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.full,
        marginTop: Spacing.xl,
        gap: Spacing.sm,
        borderWidth: 1,
        borderColor: C.border,
    },
    refreshButtonText: {
        color: C.text,
        fontSize: FontSizes.md,
        fontWeight: '600',
    },
});

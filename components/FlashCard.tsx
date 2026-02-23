import React, { useMemo, useRef } from 'react';
import {
    Animated,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { BorderRadius, FontSizes, Shadows, Spacing, ThemeColors } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import { toTitleCase } from '../utils/textUtils';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width - 48;
const CARD_HEIGHT = height > 750 ? 420 : 340;

interface FlashCardProps {
    english: string;
    turkish: string;
    category: string;
    partOfSpeech?: string;
    exampleSentenceEN?: string;
    exampleSentenceTR?: string;
    synonyms?: string;
    memoryHook?: string;
    isFlipped: boolean;
    onFlip: () => void;
    // Composite scoring visual fields
    compositeLabel?: string;
    compositeColor?: string;
    compositeScore?: number | null;
}

export default function FlashCard({
    english,
    turkish,
    category,
    partOfSpeech,
    exampleSentenceEN,
    exampleSentenceTR,
    synonyms,
    memoryHook,
    isFlipped,
    onFlip,
    compositeLabel,
    compositeColor,
    compositeScore
}: FlashCardProps) {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const animatedValue = useRef(new Animated.Value(isFlipped ? 180 : 0)).current;

    React.useEffect(() => {
        Animated.spring(animatedValue, {
            toValue: isFlipped ? 180 : 0,
            friction: 8,
            tension: 10,
            useNativeDriver: true,
        }).start();
    }, [isFlipped]);

    const frontInterpolate = animatedValue.interpolate({
        inputRange: [0, 180],
        outputRange: ['0deg', '180deg'],
    });

    const backInterpolate = animatedValue.interpolate({
        inputRange: [0, 180],
        outputRange: ['180deg', '360deg'],
    });

    const frontAnimatedStyle = {
        transform: [{ rotateY: frontInterpolate }],
    };

    const backAnimatedStyle = {
        transform: [{ rotateY: backInterpolate }],
    };

    return (
        <View style={styles.container}>
            {/* Front Side - English */}
            <TouchableWithoutFeedback onPress={onFlip}>
                <Animated.View style={[styles.card, styles.cardFront, frontAnimatedStyle]}>
                    <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>{category}</Text>
                    </View>
                    <Text style={styles.label}>🇬🇧 English</Text>
                    <Text style={styles.word}>{toTitleCase(english)}</Text>
                    <Text style={styles.hint}>Cevabı Görmek İçin Dokun</Text>
                </Animated.View>
            </TouchableWithoutFeedback>

            {/* Back Side - Turkish */}
            <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle]} pointerEvents={isFlipped ? "auto" : "none"}>
                <View style={[styles.categoryBadge, styles.categoryBadgeBack]}>
                    <Text style={styles.categoryText}>{category}</Text>
                </View>

                <ScrollView contentContainerStyle={styles.backScrollContent} showsVerticalScrollIndicator={false}>
                    <TouchableOpacity onPress={onFlip} style={styles.headerRow} activeOpacity={0.7}>
                        <Text style={styles.label}>🇬🇧 {toTitleCase(english)}</Text>
                        {!!partOfSpeech && (
                            <Text style={styles.posText}>({partOfSpeech})</Text>
                        )}
                    </TouchableOpacity>

                    <Text style={styles.word}>{turkish}</Text>

                    {!!exampleSentenceEN && (
                        <View style={styles.contextBox}>
                            <Text style={styles.contextTitle}>📝 Örnek Cümle</Text>
                            <Text style={[styles.contextText, { fontStyle: 'italic' }]}>{exampleSentenceEN}</Text>
                            {!!exampleSentenceTR && (
                                <Text style={[styles.contextText, { fontStyle: 'italic', color: colors.textMuted, marginTop: 4 }]}>
                                    {exampleSentenceTR}
                                </Text>
                            )}
                        </View>
                    )}

                    {!!memoryHook && (
                        <View style={[styles.contextBox, { borderLeftColor: colors.accent }]}>
                            <Text style={[styles.contextTitle, { color: colors.accent }]}>💡 İpucu</Text>
                            <Text style={styles.contextText}>{memoryHook}</Text>
                        </View>
                    )}

                    {!!synonyms && (
                        <View style={[styles.contextBox, { borderLeftColor: colors.primaryLight }]}>
                            <Text style={[styles.contextTitle, { color: colors.primaryLight }]}>🔄 Eş Anlamlılar</Text>
                            <Text style={[styles.contextText, { fontSize: FontSizes.xs }]}>{synonyms}</Text>
                        </View>
                    )}

                    {(compositeLabel !== undefined || compositeColor !== undefined) && (
                        <View style={[styles.contextBox, { borderLeftColor: compositeColor || colors.textMuted, marginTop: Spacing.xl }]}>
                            <Text style={[styles.contextTitle, { color: compositeColor || colors.textMuted }]}>📊 Güncel Durum</Text>
                            {compositeLabel ? (
                                <Text style={styles.contextText}>
                                    {compositeLabel} {' '}
                                    {compositeScore !== null && compositeScore !== undefined && (
                                        <Text style={{ fontSize: FontSizes.xs, color: colors.textMuted }}>
                                            (Bileşik Puan: %{Math.round(compositeScore * 100)})
                                        </Text>
                                    )}
                                </Text>
                            ) : (
                                <Text style={[styles.contextText, { color: colors.textMuted, fontStyle: 'italic' }]}>
                                    Henüz test edilmedi
                                </Text>
                            )}
                        </View>
                    )}
                </ScrollView>
            </Animated.View>
        </View>
    );
}

const createStyles = (C: ThemeColors) => StyleSheet.create({
    container: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        alignSelf: 'center',
    },
    card: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: BorderRadius.xl,
        justifyContent: 'center',
        alignItems: 'center',
        backfaceVisibility: 'hidden',
        position: 'absolute',
        padding: Spacing.lg,
        ...Shadows.large,
    },
    cardFront: {
        backgroundColor: C.surface,
        borderWidth: 1,
        borderColor: C.primary + '40',
    },
    cardBack: {
        backgroundColor: C.cardLight,
        borderWidth: 1,
        borderColor: C.secondary + '40',
    },
    categoryBadge: {
        position: 'absolute',
        top: Spacing.md,
        right: Spacing.md,
        backgroundColor: C.primary + '30',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.full,
    },
    categoryBadgeBack: {
        backgroundColor: C.secondary + '30',
    },
    categoryText: {
        color: C.primaryLight,
        fontSize: FontSizes.xs,
        fontWeight: '600',
    },
    label: {
        fontSize: FontSizes.sm,
        color: C.textSecondary,
        marginBottom: Spacing.sm,
        fontWeight: '500',
    },
    word: {
        fontSize: FontSizes.hero,
        fontWeight: '700',
        color: C.text,
        textAlign: 'center',
        marginBottom: Spacing.sm,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.sm,
        gap: Spacing.xs,
    },
    posText: {
        fontSize: FontSizes.xs,
        color: C.primaryLight,
        fontWeight: '600',
        fontStyle: 'italic',
        marginTop: 2,
    },
    hint: {
        position: 'absolute',
        bottom: Spacing.md,
        fontSize: FontSizes.xs,
        color: C.textMuted,
        fontStyle: 'italic',
    },
    backScrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: Spacing.xl,
        paddingHorizontal: Spacing.sm,
    },
    contextBox: {
        width: '100%',
        backgroundColor: C.background,
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        marginTop: Spacing.md,
        borderLeftWidth: 3,
        borderLeftColor: C.secondary,
    },
    contextTitle: {
        fontSize: FontSizes.xs,
        fontWeight: '700',
        color: C.secondary,
        marginBottom: Spacing.xs,
    },
    contextText: {
        fontSize: FontSizes.sm,
        color: C.textSecondary,
        lineHeight: 20,
    },
});

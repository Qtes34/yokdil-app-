import FontAwesome from '@expo/vector-icons/FontAwesome';
import React, { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { BorderRadius, FontSizes, Shadows, Spacing, ThemeColors } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import { toTitleCase } from '../utils/textUtils';

export interface MatchingPair {
    leftId: string;
    leftText: string;
    rightId: string;
    rightText: string; // clue
}

interface MatchingGameProps {
    pairs: MatchingPair[];      // The full pool of word pairs
    onComplete: (score: number, total: number, wordResults: Record<string, boolean>) => void;
    onGoBack: () => void;
    onReplay: () => void;
}

const ROUND_SIZE = 5;

// Helper to shuffle arrays
function shuffle<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

export default function MatchingGame({ pairs, onComplete, onGoBack, onReplay }: MatchingGameProps) {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const [rounds, setRounds] = useState<MatchingPair[][]>([]);
    const [currentRoundIndex, setCurrentRoundIndex] = useState(0);

    // Round State
    const [leftItems, setLeftItems] = useState<{ id: string, text: string }[]>([]);
    const [rightItems, setRightItems] = useState<{ id: string, text: string }[]>([]);

    const [selectedLeftId, setSelectedLeftId] = useState<string | null>(null);
    const [matches, setMatches] = useState<Record<string, string>>({}); // leftId -> rightId mapping

    const [showResults, setShowResults] = useState(false);

    // Overall Session State
    const [sessionScore, setSessionScore] = useState(0);
    const [sessionWordResults, setSessionWordResults] = useState<Record<string, boolean>>({});
    const [isSessionComplete, setIsSessionComplete] = useState(false);

    // Initialize game
    useEffect(() => {
        const shuffledPairs = shuffle(pairs);
        const newRounds: MatchingPair[][] = [];

        for (let i = 0; i < shuffledPairs.length; i += ROUND_SIZE) {
            newRounds.push(shuffledPairs.slice(i, i + ROUND_SIZE));
        }

        setRounds(newRounds);
        setCurrentRoundIndex(0);
        setSessionScore(0);
        setIsSessionComplete(false);
        if (newRounds.length > 0) {
            setupRound(newRounds[0]);
        }
    }, [pairs]);

    const setupRound = (roundPairs: MatchingPair[]) => {
        const lefts = roundPairs.map(p => ({ id: p.leftId, text: p.leftText }));
        const rights = roundPairs.map(p => ({ id: p.rightId, text: p.rightText }));

        setLeftItems(shuffle(lefts));
        setRightItems(shuffle(rights));
        setMatches({});
        setSelectedLeftId(null);
        setShowResults(false);
    };

    const handleLeftTap = (leftId: string) => {
        if (showResults) return;

        // If already paired, unpair
        if (matches[leftId]) {
            const newMatches = { ...matches };
            delete newMatches[leftId];
            setMatches(newMatches);
            setSelectedLeftId(null);
            return;
        }

        // Keep selection toggle
        setSelectedLeftId(prev => prev === leftId ? null : leftId);
    };

    const handleRightTap = (rightId: string) => {
        if (showResults || !selectedLeftId) return;

        // If something is already mapped to this right item, do we care? 
        // The spec says "wrong matches are allowed". We allow many-to-one or we swap it?
        // Standard UX: If another leftId is mapped to this rightId, we unmap the old one.
        const newMatches = { ...matches };
        for (const [lId, rId] of Object.entries(newMatches)) {
            if (rId === rightId) {
                delete newMatches[lId];
            }
        }

        newMatches[selectedLeftId] = rightId;
        setMatches(newMatches);
        setSelectedLeftId(null);
    };

    const handleCheck = () => {
        setShowResults(true);
        const currentRoundPairs = rounds[currentRoundIndex];
        let correctCount = 0;
        const currentRoundWordResults: Record<string, boolean> = {};

        currentRoundPairs.forEach(p => {
            const isCorrect = matches[p.leftId] === p.rightId;
            currentRoundWordResults[p.leftId] = isCorrect;
            if (isCorrect) {
                correctCount++;
            }
        });

        setSessionWordResults(prev => ({ ...prev, ...currentRoundWordResults }));
        setSessionScore(prev => prev + correctCount);
    };

    const handleNextPhase = () => {
        if (currentRoundIndex < rounds.length - 1) {
            // Next Round
            setCurrentRoundIndex(prev => prev + 1);
            setupRound(rounds[currentRoundIndex + 1]);
        } else {
            // Session Complete
            setIsSessionComplete(true);
            onComplete(sessionScore, pairs.length, sessionWordResults);
        }
    };

    const isAllPaired = leftItems.length > 0 && Object.keys(matches).length === leftItems.length;

    if (isSessionComplete) {
        return (
            <View style={styles.doneContainer}>
                <View style={styles.doneIconBg}>
                    <FontAwesome name="check" size={48} color={colors.success} />
                </View>
                <Text style={styles.doneTitle}>Oturum Tamamlandı</Text>

                <View style={styles.doneStatsRow}>
                    <Text style={styles.doneStatsText}>{sessionScore} / {pairs.length} Doğru</Text>
                </View>

                <TouchableOpacity style={styles.actionButton} onPress={onReplay} activeOpacity={0.8}>
                    <FontAwesome name="refresh" size={16} color="#fff" />
                    <Text style={styles.actionButtonText}>Tekrar Et</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]} onPress={onGoBack} activeOpacity={0.8}>
                    <FontAwesome name="arrow-left" size={16} color={colors.textSecondary} />
                    <Text style={[styles.actionButtonText, { color: colors.textSecondary }]}>Güne Dön</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const handleExit = () => {
        const msg = "Çalışmadan çıkmak istediğinize emin misiniz? İlerlemeniz kaydedilmeyecek.";
        if (Platform.OS === 'web') {
            const confirmed = window.confirm(msg);
            if (confirmed) onGoBack();
        } else {
            Alert.alert("Çıkış", msg, [
                { text: "İptal", style: "cancel" },
                { text: "Çık", style: "destructive", onPress: onGoBack }
            ]);
        }
    };

    // Identify which right item is linked to the currently selected left item (if any)
    const renderColumns = () => {
        return (
            <View style={styles.columnsContainer}>
                {/* Left Column - English */}
                <View style={styles.columnView}>
                    {leftItems.map(item => {
                        const isSelected = item.id === selectedLeftId;
                        const isPaired = !!matches[item.id];
                        let statusColor = colors.border;
                        let iconName = "";

                        if (showResults) {
                            // Find the correct rightId
                            const correctRightId = rounds[currentRoundIndex].find(p => p.leftId === item.id)?.rightId;
                            const isCorrect = matches[item.id] === correctRightId;
                            statusColor = isCorrect ? colors.success : colors.error;
                            iconName = isCorrect ? "check" : "times";
                        } else if (isSelected) {
                            statusColor = colors.primary;
                        } else if (isPaired) {
                            statusColor = colors.primaryLight;
                        }

                        return (
                            <TouchableOpacity
                                key={`l-${item.id}`}
                                style={[styles.matchItemBase, styles.leftItem, { borderColor: statusColor, borderWidth: isSelected || showResults ? 2 : 1 }]}
                                onPress={() => handleLeftTap(item.id)}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.itemText, isSelected && { color: colors.primary, fontWeight: '700' }]}>
                                    {toTitleCase(item.text)}
                                </Text>
                                {showResults && (
                                    <View style={[styles.resultIconIndicator, { backgroundColor: statusColor }]}>
                                        <FontAwesome name={iconName as any} size={10} color="#fff" />
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Vertical Divider */}
                <View style={styles.divider} />

                {/* Right Column - Clue */}
                <View style={styles.columnView}>
                    {rightItems.map(item => {
                        // Check if this right item is paired with any left item
                        const pairedLeftId = Object.keys(matches).find(k => matches[k] === item.id);
                        const isPaired = !!pairedLeftId;

                        let statusColor = colors.border;
                        if (showResults && isPaired) {
                            const correctRightId = rounds[currentRoundIndex].find(p => p.leftId === pairedLeftId)?.rightId;
                            // Just highlight if it was paired. Correctness is shown on the left side.
                            statusColor = correctRightId === item.id ? colors.success : colors.error;
                        } else if (isPaired) {
                            statusColor = colors.primaryLight;
                            if (pairedLeftId === selectedLeftId) {
                                statusColor = colors.primary; // selected pair
                            }
                        }

                        return (
                            <TouchableOpacity
                                key={`r-${item.id}`}
                                style={[styles.matchItemBase, styles.rightItem, { borderColor: statusColor, borderWidth: isPaired ? 2 : 1 }]}
                                onPress={() => handleRightTap(item.id)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.rightItemText}>
                                    {item.text}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
        );
    };

    const renderResults = () => {
        const currentRoundPairs = rounds[currentRoundIndex];
        let roundCorrect = 0;
        currentRoundPairs.forEach(p => {
            if (matches[p.leftId] === p.rightId) roundCorrect++;
        });

        return (
            <View style={styles.resultsContainer}>
                <View style={styles.resultsHeader}>
                    <Text style={styles.resultsTitle}>Sonuçlar: {roundCorrect} / {currentRoundPairs.length} Doğru</Text>
                </View>

                {currentRoundPairs.map(p => {
                    const userMatchedRightId = matches[p.leftId];
                    const isCorrect = userMatchedRightId === p.rightId;

                    // Match up the text for user's selected choice
                    const selectedRightClue = rightItems.find(r => r.id === userMatchedRightId)?.text || "Eşleştirilmedi";
                    const correctRightClue = p.rightText;

                    return (
                        <View key={`res-${p.leftId}`} style={[styles.reviewItem, { borderLeftColor: isCorrect ? colors.success : colors.error }]}>
                            <View style={styles.reviewHeader}>
                                <Text style={styles.reviewQuestion}>{toTitleCase(p.leftText)}</Text>
                                <FontAwesome name={isCorrect ? "check-circle" : "times"} size={18} color={isCorrect ? colors.success : colors.error} />
                            </View>

                            <View style={styles.answerBox}>
                                <Text style={styles.answerLabel}>Eşleştirdin:</Text>
                                <Text style={[styles.answerText, { color: isCorrect ? colors.success : colors.error, textDecorationLine: isCorrect ? 'none' : 'line-through' }]}>
                                    {selectedRightClue}
                                </Text>
                            </View>

                            {!isCorrect && (
                                <View style={[styles.answerBox, { marginTop: Spacing.xs }]}>
                                    <Text style={[styles.answerLabel, { color: colors.success }]}>✓ Doğru cevap:</Text>
                                    <Text style={[styles.answerText, { color: colors.text, fontWeight: '500' }]}>{correctRightClue}</Text>
                                </View>
                            )}
                        </View>
                    );
                })}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.roundHeader}>
                <View style={styles.headerTopRow}>
                    <TouchableOpacity onPress={handleExit} style={styles.exitButton}>
                        <FontAwesome name="chevron-left" size={14} color={colors.textMuted} />
                        <Text style={styles.exitText}>Geri</Text>
                    </TouchableOpacity>
                    <Text style={styles.roundText}>Tur {currentRoundIndex + 1} / {rounds.length}</Text>
                    <View style={{ width: 50 }} />
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {showResults ? renderResults() : renderColumns()}
            </ScrollView>

            <View style={styles.footer}>
                {!showResults ? (
                    <TouchableOpacity
                        style={[styles.primaryButton, !isAllPaired && styles.disabledButton]}
                        onPress={handleCheck}
                        disabled={!isAllPaired}
                    >
                        <Text style={styles.primaryButtonText}>Kontrol Et</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={handleNextPhase}
                    >
                        <Text style={styles.primaryButtonText}>
                            {currentRoundIndex < rounds.length - 1 ? "Sıradaki Tur" : "Sonuçları Gör"}
                        </Text>
                        <FontAwesome name="arrow-right" size={14} color="#fff" style={{ marginLeft: 8 }} />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const createStyles = (C: ThemeColors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: C.background,
    },
    roundHeader: {
        paddingHorizontal: Spacing.lg,
        paddingTop: Platform.OS === 'ios' ? 50 : Spacing.lg,
        paddingBottom: Spacing.md,
        backgroundColor: C.surface,
        borderBottomWidth: 1,
        borderBottomColor: C.border,
    },
    headerTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    exitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        padding: Spacing.xs,
    },
    exitText: {
        fontSize: FontSizes.sm,
        color: C.textMuted,
        fontWeight: '600',
    },
    roundText: {
        fontSize: FontSizes.md,
        fontWeight: '700',
        color: C.textSecondary,
    },
    scrollContent: {
        flexGrow: 1,
        padding: Spacing.md,
    },
    columnsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flex: 1,
    },
    columnView: {
        flex: 1,
        gap: Spacing.md,
    },
    divider: {
        width: 1,
        backgroundColor: C.border,
        marginHorizontal: Spacing.md,
    },
    matchItemBase: {
        backgroundColor: C.surface,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        justifyContent: 'center',
        minHeight: 60,
        ...Shadows.small,
        borderWidth: 1,
    },
    leftItem: {
        alignItems: 'center',
    },
    rightItem: {
        alignItems: 'center',
        backgroundColor: C.cardLight,
    },
    itemText: {
        fontSize: FontSizes.md,
        fontWeight: '600',
        color: C.text,
        textAlign: 'center',
    },
    rightItemText: {
        fontSize: FontSizes.sm,
        color: C.textSecondary,
        textAlign: 'center',
    },
    resultIconIndicator: {
        position: 'absolute',
        top: -6,
        right: -6,
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footer: {
        padding: Spacing.lg,
        backgroundColor: C.surface,
        borderTopWidth: 1,
        borderTopColor: C.border,
    },
    primaryButton: {
        backgroundColor: C.primary,
        flexDirection: 'row',
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    disabledButton: {
        backgroundColor: C.textMuted,
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: FontSizes.md,
        fontWeight: '700',
    },
    // Done screen
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
        backgroundColor: C.success + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    doneTitle: {
        fontSize: FontSizes.xxl,
        fontWeight: '800',
        color: C.text,
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
    resultsContainer: {
        flex: 1,
        width: '100%',
    },
    resultsHeader: {
        marginBottom: Spacing.lg,
        alignItems: 'center',
    },
    resultsTitle: {
        fontSize: FontSizes.lg,
        fontWeight: '700',
        color: C.text,
    },
    reviewItem: {
        backgroundColor: C.surface,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        marginBottom: Spacing.md,
        borderLeftWidth: 4,
        ...Shadows.small,
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    reviewQuestion: {
        fontSize: FontSizes.md,
        fontWeight: '700',
        color: C.text,
    },
    answerBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
    },
    answerLabel: {
        fontSize: FontSizes.sm,
        color: C.textSecondary,
        fontWeight: '600',
        marginRight: Spacing.xs,
    },
    answerText: {
        fontSize: FontSizes.sm,
        flex: 1,
    }
});

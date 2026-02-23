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

export interface QuizQuestion {
    id: string;             // usually the word ID
    questionText: string;   // the english word to ask
    correctAnswer: string;  // the correct clue
    options: string[];      // shuffled 4 options
}

interface MultipleChoiceGameProps {
    questions: QuizQuestion[];
    onComplete: (percentage: number, wordResults: Record<string, boolean>) => void;
    onGoBack: () => void;
    onReplay: () => void;
}

export default function MultipleChoiceGame({ questions, onComplete, onGoBack, onReplay }: MultipleChoiceGameProps) {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({}); // questionId -> selectedOption
    const [isComplete, setIsComplete] = useState(false);

    // For auto-advance visual feedback
    const [lastSelectedOption, setLastSelectedOption] = useState<string | null>(null);

    useEffect(() => {
        setCurrentIndex(0);
        setAnswers({});
        setIsComplete(false);
        setLastSelectedOption(null);
    }, [questions]);

    const handleOptionSelect = (option: string) => {
        if (lastSelectedOption || isComplete) return; // prevent multiple taps

        const currentQ = questions[currentIndex];
        const newAnswers = { ...answers, [currentQ.id]: option };

        setAnswers(newAnswers);
        setLastSelectedOption(option);

        // Auto advance after 400ms
        setTimeout(() => {
            setLastSelectedOption(null);
            if (currentIndex < questions.length - 1) {
                setCurrentIndex(prev => prev + 1);
            } else {
                finishGame(newAnswers);
            }
        }, 400);
    };

    const finishGame = (finalAnswers: Record<string, string>) => {
        setIsComplete(true);
        let correctCount = 0;
        const wordResults: Record<string, boolean> = {};

        questions.forEach(q => {
            const isCorrect = finalAnswers[q.id] === q.correctAnswer;
            wordResults[q.id] = isCorrect;
            if (isCorrect) correctCount++;
        });

        const percentage = Math.round((correctCount / questions.length) * 100);
        onComplete(percentage, wordResults); // Notify parent to save score and specific word results
    };

    // --- Render Results View ---
    if (isComplete) {
        let correctCount = 0;
        questions.forEach(q => {
            if (answers[q.id] === q.correctAnswer) correctCount++;
        });
        const percentage = Math.round((correctCount / questions.length) * 100);

        return (
            <View style={styles.container}>
                <View style={styles.doneHeader}>
                    <Text style={styles.doneTitle}>Test Sonucu</Text>
                    <Text style={[styles.doneScore, { color: percentage >= 70 ? colors.success : colors.warning }]}>
                        {correctCount} / {questions.length} Doğru (%{percentage})
                    </Text>
                </View>

                <ScrollView style={styles.reviewList} contentContainerStyle={{ padding: Spacing.lg }}>
                    {questions.map((q, i) => {
                        const userAnswer = answers[q.id];
                        const isCorrect = userAnswer === q.correctAnswer;

                        return (
                            <View key={q.id} style={[styles.reviewItem, { borderLeftColor: isCorrect ? colors.success : colors.error }]}>
                                <View style={styles.reviewHeader}>
                                    <Text style={styles.reviewQuestion}>{i + 1}. {q.questionText}</Text>
                                    <FontAwesome name={isCorrect ? "check-circle" : "times-circle"} size={18} color={isCorrect ? colors.success : colors.error} />
                                </View>

                                {!isCorrect && (
                                    <View style={styles.wrongAnswerBox}>
                                        <Text style={styles.wrongAnswerLabel}>Senin cevabın:</Text>
                                        <Text style={styles.wrongAnswerText}>{userAnswer || "Boş bırakıldı"}</Text>
                                    </View>
                                )}

                                <View style={styles.correctAnswerBox}>
                                    <Text style={styles.correctAnswerLabel}>Doğru cevap:</Text>
                                    <Text style={styles.correctAnswerText}>{q.correctAnswer}</Text>
                                </View>
                            </View>
                        );
                    })}
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity style={styles.actionButton} onPress={onReplay} activeOpacity={0.8}>
                        <FontAwesome name="refresh" size={16} color="#fff" />
                        <Text style={styles.actionButtonText}>Tekrar Et</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]} onPress={onGoBack} activeOpacity={0.8}>
                        <FontAwesome name="arrow-left" size={16} color={colors.textSecondary} />
                        <Text style={[styles.actionButtonText, { color: colors.textSecondary }]}>Güne Dön</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // --- Render Quiz View ---
    if (questions.length === 0) return null;

    const currentQ = questions[currentIndex];

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

    return (
        <View style={styles.container}>
            <View style={styles.progressHeader}>
                <View style={styles.headerTopRow}>
                    <TouchableOpacity onPress={handleExit} style={styles.exitButton}>
                        <FontAwesome name="chevron-left" size={14} color={colors.textMuted} />
                        <Text style={styles.exitText}>Geri</Text>
                    </TouchableOpacity>
                    <Text style={styles.progressText}>Soru {currentIndex + 1} / {questions.length}</Text>
                    {/* Spacer to balance flex space-between */}
                    <View style={{ width: 50 }} />
                </View>
                <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${((currentIndex + 1) / questions.length) * 100}%` }]} />
                </View>
            </View>

            <View style={styles.questionContainer}>
                <Text style={styles.questionWord}>{toTitleCase(currentQ.questionText)}</Text>
                <Text style={styles.questionInstruction}>Doğru karşılığı seçin</Text>
            </View>

            <ScrollView contentContainerStyle={styles.optionsContainer}>
                {currentQ.options.map((option, idx) => {
                    const isSelected = lastSelectedOption === option;

                    return (
                        <TouchableOpacity
                            key={idx}
                            style={[
                                styles.optionButton,
                                isSelected && styles.optionButtonSelected
                            ]}
                            onPress={() => handleOptionSelect(option)}
                            activeOpacity={0.7}
                            disabled={lastSelectedOption !== null}
                        >
                            <Text style={[
                                styles.optionText,
                                isSelected && styles.optionTextSelected
                            ]}>
                                {option}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
}

const createStyles = (C: ThemeColors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: C.background,
    },
    progressHeader: {
        padding: Spacing.lg,
        backgroundColor: C.surface,
        borderBottomWidth: 1,
        borderBottomColor: C.border,
        paddingTop: Platform.OS === 'ios' ? 50 : Spacing.lg,
    },
    headerTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: Spacing.md,
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
    progressText: {
        fontSize: FontSizes.sm,
        fontWeight: '700',
        color: C.textSecondary,
    },
    progressBarBg: {
        height: 6,
        backgroundColor: C.border,
        borderRadius: BorderRadius.full,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: C.primary,
        borderRadius: BorderRadius.full,
    },
    questionContainer: {
        paddingVertical: Spacing.xxl,
        paddingHorizontal: Spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    questionWord: {
        fontSize: FontSizes.hero,
        fontWeight: '800',
        color: C.text,
        textAlign: 'center',
        marginBottom: Spacing.sm,
    },
    questionInstruction: {
        fontSize: FontSizes.md,
        color: C.textMuted,
        fontStyle: 'italic',
    },
    optionsContainer: {
        padding: Spacing.lg,
        gap: Spacing.md,
    },
    optionButton: {
        backgroundColor: C.surface,
        borderWidth: 1,
        borderColor: C.border,
        minHeight: 64,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        borderRadius: BorderRadius.lg,
        ...Shadows.small,
    },
    optionButtonSelected: {
        backgroundColor: C.primary + '10', // Light primary tint
        borderColor: C.primary,
    },
    optionText: {
        fontSize: FontSizes.md,
        color: C.text,
        fontWeight: '600',
        textAlign: 'center',
    },
    optionTextSelected: {
        color: C.primary,
    },

    // Done View Styles
    doneHeader: {
        alignItems: 'center',
        paddingTop: Spacing.xl,
        paddingBottom: Spacing.lg,
        backgroundColor: C.surface,
        borderBottomWidth: 1,
        borderBottomColor: C.border,
    },
    doneTitle: {
        fontSize: FontSizes.lg,
        color: C.textSecondary,
        fontWeight: '600',
        marginBottom: Spacing.xs,
    },
    doneScore: {
        fontSize: FontSizes.xxl,
        fontWeight: '800',
    },
    reviewList: {
        flex: 1,
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
    wrongAnswerBox: {
        backgroundColor: C.error + '10',
        padding: Spacing.sm,
        borderRadius: BorderRadius.sm,
        marginBottom: Spacing.sm,
    },
    wrongAnswerLabel: {
        fontSize: FontSizes.xs,
        color: C.error,
        fontWeight: '600',
        marginBottom: 2,
    },
    wrongAnswerText: {
        fontSize: FontSizes.sm,
        color: C.text,
        textDecorationLine: 'line-through',
    },
    correctAnswerBox: {
        backgroundColor: C.success + '10',
        padding: Spacing.sm,
        borderRadius: BorderRadius.sm,
    },
    correctAnswerLabel: {
        fontSize: FontSizes.xs,
        color: C.success,
        fontWeight: '600',
        marginBottom: 2,
    },
    correctAnswerText: {
        fontSize: FontSizes.sm,
        color: C.text,
        fontWeight: '500',
    },
    footer: {
        padding: Spacing.lg,
        backgroundColor: C.surface,
        borderTopWidth: 1,
        borderTopColor: C.border,
        gap: Spacing.sm,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: C.primary,
        width: '100%',
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.lg,
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

import FontAwesome from '@expo/vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProgressBar from '../../components/ProgressBar';
import { BorderRadius, FontSizes, Shadows, Spacing, ThemeColors } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import {
    getAllWords,
    getCategories,
    getStats,
    resetAllProgress,
} from '../../database/database';

const QUIZ_STATS_KEY = '@yokdil_quiz_stats';

interface QuizStats {
    totalQuestions: number;
    correctAnswers: number;
    wrongAnswers: number;
}

interface CategoryStat {
    name: string;
    total: number;
    learned: number;
}

export default function StatsScreen() {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const [stats, setStats] = useState({
        total: 0,
        learned: 0,
        dueToday: 0,
        streak: 0,
    });
    const [quizStats, setQuizStats] = useState<QuizStats>({
        totalQuestions: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
    });
    const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
    const [loading, setLoading] = useState(true);

    const loadAllStats = useCallback(async () => {
        setLoading(true);
        try {
            // Word stats
            const wordStats = await getStats();
            setStats(wordStats);

            // Quiz stats from AsyncStorage
            const storedQuiz = await AsyncStorage.getItem(QUIZ_STATS_KEY);
            if (storedQuiz) {
                setQuizStats(JSON.parse(storedQuiz));
            }

            // Category stats
            const categories = await getCategories();
            const allWords = await getAllWords();
            const catStats: CategoryStat[] = [];
            for (const cat of categories) {
                const words = allWords.filter(w => w.category === cat);
                const learned = words.filter((w) => w.repetitions > 0).length;
                catStats.push({ name: cat, total: words.length, learned });
            }
            setCategoryStats(catStats);
        } catch (error) {
            console.error('Error loading stats:', error);
        }
        setLoading(false);
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadAllStats();
        }, [loadAllStats])
    );

    const handleResetProgress = () => {
        Alert.alert(
            'İlerlemeyi Sıfırla',
            'Tüm ilerlemeniz silinecektir. Bu işlem geri alınamaz. Emin misiniz?',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Sıfırla',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await resetAllProgress();
                            await AsyncStorage.removeItem(QUIZ_STATS_KEY);
                            await loadAllStats();
                        } catch (error) {
                            console.error('Error resetting progress:', error);
                        }
                    },
                },
            ]
        );
    };

    const quizPercentage =
        quizStats.totalQuestions > 0
            ? Math.round((quizStats.correctAnswers / quizStats.totalQuestions) * 100)
            : 0;

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>İstatistikler</Text>

                {/* Word Progress */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <FontAwesome name="book" size={20} color={colors.primary} />
                        <Text style={styles.cardTitle}>Kelime İlerlemesi</Text>
                    </View>
                    <ProgressBar progress={stats.total > 0 ? (stats.learned / stats.total) * 100 : 0} label="Öğrenme Oranı (%)" />
                    <View style={styles.statsGrid}>
                        <View style={styles.statBox}>
                            <Text style={styles.statNumber}>{stats.streak}</Text>
                            <Text style={styles.statLabel}>Günlük Seri</Text>
                        </View>
                        <View style={styles.statBox}>
                            <Text style={[styles.statNumber, { color: colors.success }]}>
                                {stats.learned}
                            </Text>
                            <Text style={styles.statLabel}>Öğrenildi</Text>
                        </View>
                        <View style={styles.statBox}>
                            <Text style={[styles.statNumber, { color: colors.error }]}>
                                {stats.dueToday}
                            </Text>
                            <Text style={styles.statLabel}>Bugün Tekrar</Text>
                        </View>
                    </View>
                </View>

                {/* Quiz Stats */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <FontAwesome name="question-circle" size={20} color={colors.secondary} />
                        <Text style={styles.cardTitle}>Test İstatistikleri</Text>
                    </View>
                    {quizStats.totalQuestions > 0 ? (
                        <>
                            <ProgressBar
                                progress={quizPercentage}
                                label="Başarı Oranı"
                                color={colors.secondary}
                            />
                            <View style={styles.statsGrid}>
                                <View style={styles.statBox}>
                                    <Text style={styles.statNumber}>{quizStats.totalQuestions}</Text>
                                    <Text style={styles.statLabel}>Toplam Soru</Text>
                                </View>
                                <View style={styles.statBox}>
                                    <Text style={[styles.statNumber, { color: colors.success }]}>
                                        {quizStats.correctAnswers}
                                    </Text>
                                    <Text style={styles.statLabel}>Doğru</Text>
                                </View>
                                <View style={styles.statBox}>
                                    <Text style={[styles.statNumber, { color: colors.error }]}>
                                        {quizStats.wrongAnswers}
                                    </Text>
                                    <Text style={styles.statLabel}>Yanlış</Text>
                                </View>
                            </View>
                        </>
                    ) : (
                        <View style={styles.emptyStatsContainer}>
                            <FontAwesome name="info-circle" size={24} color={colors.textMuted} />
                            <Text style={styles.emptyStatsText}>Henüz test çözmediniz</Text>
                        </View>
                    )}
                </View>

                {/* Category Stats */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <FontAwesome name="tags" size={20} color={colors.accent} />
                        <Text style={styles.cardTitle}>Kategori Bazlı</Text>
                    </View>
                    {categoryStats.map((cat) => {
                        const catPercentage =
                            cat.total > 0 ? Math.round((cat.learned / cat.total) * 100) : 0;
                        return (
                            <View key={cat.name} style={styles.categoryItem}>
                                <View style={styles.categoryHeader}>
                                    <Text style={styles.categoryName}>{cat.name}</Text>
                                    <Text style={styles.categoryCount}>
                                        {cat.learned}/{cat.total}
                                    </Text>
                                </View>
                                <ProgressBar
                                    progress={catPercentage}
                                    showPercentage={false}
                                    height={8}
                                    color={colors.accent}
                                />
                            </View>
                        );
                    })}
                </View>

                {/* Reset Button */}
                <TouchableOpacity style={styles.resetButton} onPress={handleResetProgress}>
                    <FontAwesome name="trash" size={16} color={colors.error} />
                    <Text style={styles.resetButtonText}>Tüm İlerlemeyi Sıfırla</Text>
                </TouchableOpacity>
            </ScrollView>
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
    },
    content: {
        padding: Spacing.lg,
        paddingTop: 60,
        paddingBottom: 100,
    },
    title: {
        fontSize: FontSizes.xxl,
        fontWeight: '800',
        color: C.text,
        marginBottom: Spacing.xl,
    },
    card: {
        backgroundColor: C.surface,
        borderRadius: BorderRadius.xl,
        padding: Spacing.lg,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: C.border,
        ...Shadows.small,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    cardTitle: {
        fontSize: FontSizes.lg,
        fontWeight: '700',
        color: C.text,
        marginLeft: Spacing.sm,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: Spacing.lg,
    },
    statBox: {
        alignItems: 'center',
        flex: 1,
    },
    statNumber: {
        fontSize: FontSizes.xxl,
        fontWeight: '800',
        color: C.text,
    },
    statLabel: {
        fontSize: FontSizes.xs,
        color: C.textMuted,
        marginTop: Spacing.xs,
        fontWeight: '500',
    },
    emptyStatsContainer: {
        alignItems: 'center',
        paddingVertical: Spacing.xl,
        gap: Spacing.sm,
    },
    emptyStatsText: {
        color: C.textMuted,
        fontSize: FontSizes.sm,
    },
    categoryItem: {
        marginBottom: Spacing.md,
    },
    categoryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xs,
    },
    categoryName: {
        fontSize: FontSizes.sm,
        color: C.text,
        fontWeight: '600',
    },
    categoryCount: {
        fontSize: FontSizes.xs,
        color: C.textMuted,
        fontWeight: '500',
    },
    resetButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: C.surface,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.lg,
        marginTop: Spacing.md,
        gap: Spacing.sm,
        borderWidth: 1,
        borderColor: C.error + '40',
    },
    resetButtonText: {
        color: C.error,
        fontSize: FontSizes.md,
        fontWeight: '600',
    },
});

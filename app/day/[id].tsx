import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, FontSizes, Shadows, Spacing, ThemeColors } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { StudyDay, VocabWord } from '../../data/seedData';
import { getAppState } from '../../database/store';
import { calculateCompositeScore, compositeToQuality, getQualityLabelAndColor } from '../../utils/compositeScoring';

export default function DayDashboardScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const [day, setDay] = useState<StudyDay | null>(null);
    const [dayWords, setDayWords] = useState<VocabWord[]>([]);
    const [loading, setLoading] = useState(true);

    const loadDayData = useCallback(async () => {
        try {
            const state = await getAppState();
            const currentDay = state.days.find(d => d.id === id);
            if (currentDay) {
                setDay(currentDay);
                setDayWords(state.words.filter(w => w.dayId === id));
            }
        } catch (error) {
            console.error('Error loading day data:', error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useFocusEffect(
        useCallback(() => {
            loadDayData();
        }, [loadDayData])
    );

    if (loading || !day) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    const activities = [
        {
            type: 'flashcard',
            number: 1,
            title: '🃏 Flashcard Çalışması',
            route: `/activity/flashcard/${day.id}`,
            state: day.activities.flashcard
        },
        {
            type: 'matchSynonym',
            number: 2,
            title: '🔗 Eşleştirme — Eş Anlamlılar',
            route: `/activity/match-synonym/${day.id}`,
            state: day.activities.matchSynonym
        },
        {
            type: 'matchTurkish',
            number: 3,
            title: '🔗 Eşleştirme — Türkçe Anlamlar',
            route: `/activity/match-turkish/${day.id}`,
            state: day.activities.matchTurkish
        },
        {
            type: 'testSynonym',
            number: 4,
            title: '📝 Test — Eş Anlamlılar',
            route: `/activity/test-synonym/${day.id}`,
            state: day.activities.testSynonym
        },
        {
            type: 'testTurkish',
            number: 5,
            title: '📝 Test — Türkçe Anlamlar',
            route: `/activity/test-turkish/${day.id}`,
            state: day.activities.testTurkish
        }
    ];

    const completedCount = activities.filter(a => a.state.completedOnce).length;

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <FontAwesome name="chevron-left" size={16} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{day.label} — {day.wordIds.length} Kelime</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.progressContainer}>
                    <Text style={styles.progressText}>{completedCount} / 5 tamamlandı</Text>
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${(completedCount / 5) * 100}%` }]} />
                    </View>
                </View>

                {/* Classification Summary */}
                {dayWords.length > 0 && (() => {
                    const buckets: Record<string, number> = {};
                    dayWords.forEach(w => {
                        const cs = calculateCompositeScore(w);
                        const q = cs !== null ? compositeToQuality(cs) : null;
                        const { label } = getQualityLabelAndColor(q, colors);
                        const key = label || 'Yeni';
                        buckets[key] = (buckets[key] || 0) + 1;
                    });
                    const orderedLabels = ['Yeni', 'Tekrar', 'Zor', 'İyi', 'Kolay'];
                    return (
                        <View style={styles.classificationContainer}>
                            <Text style={styles.sectionTitle}>Kelime Durumları</Text>
                            <View style={styles.classificationRow}>
                                {orderedLabels.map(lbl => {
                                    const count = buckets[lbl] || 0;
                                    if (count === 0) return null;
                                    const { color: c } = getQualityLabelAndColor(
                                        lbl === 'Yeni' ? null : lbl === 'Tekrar' ? 0 : lbl === 'Zor' ? 1 : lbl === 'İyi' ? 2 : 3,
                                        colors
                                    );
                                    return (
                                        <View key={lbl} style={[styles.classificationChip, { backgroundColor: c + '20' }]}>
                                            <Text style={[styles.classificationChipText, { color: c }]}>
                                                {lbl}: {count}
                                            </Text>
                                        </View>
                                    );
                                })}
                            </View>
                        </View>
                    );
                })()}

                <Text style={styles.sectionTitle}>Aktiviteler</Text>

                {activities.map((activity) => (
                    <View key={activity.type} style={styles.activityCard}>
                        <View style={styles.activityHeader}>
                            <View style={styles.activityNumberBadge}>
                                <Text style={styles.activityNumber}>{activity.number}</Text>
                            </View>
                            <Text style={styles.activityTitle}>{activity.title}</Text>
                        </View>

                        <View style={styles.activityFooter}>
                            <View style={styles.statusContainer}>
                                {activity.state.completedOnce ? (
                                    <FontAwesome name="check-circle" size={16} color={colors.success} />
                                ) : (
                                    <FontAwesome name="circle-o" size={16} color={colors.textMuted} />
                                )}
                                {activity.state.lastScore !== undefined && (
                                    <Text style={styles.scoreText}>Son Skor: %{activity.state.lastScore}</Text>
                                )}
                            </View>

                            <TouchableOpacity
                                style={[styles.actionButton, activity.state.completedOnce && styles.actionButtonReplay]}
                                onPress={() => router.push(activity.route as any)}
                                activeOpacity={0.8}
                            >
                                <Text style={[styles.actionButtonText, activity.state.completedOnce && styles.actionButtonTextReplay]}>
                                    {activity.state.completedOnce ? 'Tekrar Et' : 'Başla'}
                                </Text>
                                <FontAwesome
                                    name={activity.state.completedOnce ? "refresh" : "play"}
                                    size={12}
                                    color={activity.state.completedOnce ? colors.textSecondary : "#fff"}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}

            </ScrollView>
        </SafeAreaView>
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
        borderBottomWidth: 1,
        borderBottomColor: C.border,
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
    headerTitle: {
        fontSize: FontSizes.lg,
        fontWeight: '800',
        color: C.text,
    },
    content: {
        padding: Spacing.lg,
        paddingBottom: 40,
    },
    progressContainer: {
        backgroundColor: C.surface,
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.xl,
        borderWidth: 1,
        borderColor: C.primary + '30',
    },
    progressText: {
        fontSize: FontSizes.md,
        fontWeight: '700',
        color: C.text,
        textAlign: 'center',
        marginBottom: Spacing.md,
    },
    progressBarBg: {
        height: 10,
        backgroundColor: C.border,
        borderRadius: BorderRadius.full,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: C.primary,
        borderRadius: BorderRadius.full,
    },
    sectionTitle: {
        fontSize: FontSizes.xl,
        fontWeight: '800',
        color: C.text,
        marginBottom: Spacing.md,
    },
    activityCard: {
        backgroundColor: C.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: C.border,
        ...Shadows.small,
    },
    activityHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    activityNumberBadge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: C.primary + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.sm,
    },
    activityNumber: {
        color: C.primary,
        fontSize: FontSizes.sm,
        fontWeight: '800',
    },
    activityTitle: {
        fontSize: FontSizes.md,
        fontWeight: '700',
        color: C.text,
        flex: 1,
    },
    activityFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: Spacing.xs,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    scoreText: {
        fontSize: FontSizes.sm,
        color: C.textSecondary,
        fontWeight: '600',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: C.primary,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm + 2,
        borderRadius: BorderRadius.full,
        gap: Spacing.xs,
    },
    actionButtonReplay: {
        backgroundColor: C.border,
    },
    actionButtonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: FontSizes.sm,
    },
    actionButtonTextReplay: {
        color: C.textSecondary,
    },
    classificationContainer: {
        marginBottom: Spacing.md,
    },
    classificationRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
    },
    classificationChip: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.full,
    },
    classificationChipText: {
        fontSize: FontSizes.sm,
        fontWeight: '700',
    },
});

import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    LayoutAnimation,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, FontSizes, Shadows, Spacing, ThemeColors } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { AppState, VocabWord } from '../../data/seedData';
import { getAppState } from '../../database/store';
import { calculateCompositeScore, compositeToQuality, getQualityLabelAndColor } from '../../utils/compositeScoring';
import { toTitleCase } from '../../utils/textUtils';

// LayoutAnimation enabled via New Architecture by default

export default function LibraryScreen() {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const [appState, setAppState] = useState<AppState | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedWord, setSelectedWord] = useState<VocabWord | null>(null);

    // Set of expanded Day IDs.
    const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const state = await getAppState();
            setAppState(state);

            // Auto expand first day if non-empty
            if (state.days.length > 0) {
                setExpandedDays(new Set([state.days[0].id]));
            }
        } catch (error) {
            console.error('Error loading library:', error);
        }
        setLoading(false);
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [loadData])
    );

    const toggleDay = (dayId: string) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedDays(prev => {
            const next = new Set(prev);
            if (next.has(dayId)) {
                next.delete(dayId);
            } else {
                next.add(dayId);
            }
            return next;
        });
    };

    if (loading || !appState) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    const filteredWords = appState.words.filter(
        (w) =>
            w.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
            w.turkish.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Group filtered words by Day
    const wordsByDay: Record<string, VocabWord[]> = {};
    appState.days.forEach(d => wordsByDay[d.id] = []);

    filteredWords.forEach(w => {
        if (wordsByDay[w.dayId]) {
            wordsByDay[w.dayId].push(w);
        }
    });

    const renderWordItem = (item: VocabWord) => {
        const compositeScore = calculateCompositeScore(item);
        const quality = compositeScore !== null ? compositeToQuality(compositeScore) : null;
        const { label, color } = getQualityLabelAndColor(quality, colors);

        return (
            <TouchableOpacity key={item.id} style={styles.wordRow} onPress={() => setSelectedWord(item)} activeOpacity={0.7}>
                <View style={styles.wordRowTop}>
                    <Text style={styles.englishWord}>{toTitleCase(item.word)}</Text>
                    {!!item.partOfSpeech && (
                        <Text style={styles.posBadge}>{item.partOfSpeech}</Text>
                    )}
                    <View style={{ flex: 1 }} />
                    <View style={[styles.statusBadge, { backgroundColor: color + '20' }]}>
                        <Text style={[styles.statusBadgeText, { color }]}>
                            {label || 'Yeni'}
                        </Text>
                    </View>
                </View>
                <Text style={styles.turkishWord}>{item.turkish}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Kütüphane</Text>
            </View>

            <View style={styles.searchContainer}>
                <FontAwesome name="search" size={16} color={colors.textMuted} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Kelime veya anlam ara..."
                    placeholderTextColor={colors.textMuted}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                        <FontAwesome name="times-circle" size={16} color={colors.textMuted} />
                    </TouchableOpacity>
                )}
            </View>

            {filteredWords.length === 0 ? (
                <View style={styles.centerContainer}>
                    <FontAwesome name="search-minus" size={48} color={colors.textMuted} />
                    <Text style={styles.emptyText}>Kelime bulunamadı</Text>
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
                    {appState.days.map(day => {
                        const dayWords = wordsByDay[day.id];
                        if (!dayWords || dayWords.length === 0) return null; // hide empty day sections while searching

                        const isExpanded = expandedDays.has(day.id);

                        return (
                            <View key={day.id} style={styles.daySection}>
                                <TouchableOpacity
                                    style={styles.dayHeader}
                                    onPress={() => toggleDay(day.id)}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.dayHeaderLeft}>
                                        <Text style={styles.dayTitle}>{day.label}</Text>
                                        <Text style={styles.dayCountText}>({dayWords.length} kelime)</Text>
                                    </View>
                                    <FontAwesome
                                        name={isExpanded ? "chevron-up" : "chevron-down"}
                                        size={14}
                                        color={colors.textMuted}
                                    />
                                </TouchableOpacity>

                                {isExpanded && (
                                    <View style={styles.dayContent}>
                                        {dayWords.map(renderWordItem)}
                                    </View>
                                )}
                            </View>
                        );
                    })}
                </ScrollView>
            )}

            {/* Word Detail Modal */}
            <Modal
                visible={selectedWord !== null}
                transparent
                animationType="fade"
                onRequestClose={() => setSelectedWord(null)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setSelectedWord(null)}
                >
                    <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
                        {selectedWord && (() => {
                            const cs = calculateCompositeScore(selectedWord);
                            const q = cs !== null ? compositeToQuality(cs) : null;
                            const { label: cLabel, color: cColor } = getQualityLabelAndColor(q, colors);

                            const scoreRow = (emoji: string, name: string, score: number | null) => (
                                <View style={styles.scoreRow} key={name}>
                                    <Text style={styles.scoreRowLabel}>{emoji} {name}</Text>
                                    <Text style={[styles.scoreRowValue, { color: score !== null ? (score >= 0.5 ? colors.success : colors.error) : colors.textMuted }]}>
                                        {score !== null ? `%${Math.round(score * 100)}` : '—'}
                                    </Text>
                                </View>
                            );

                            return (
                                <>
                                    <View style={styles.modalHeader}>
                                        <Text style={styles.modalTitle}>{toTitleCase(selectedWord.word)}</Text>
                                        <TouchableOpacity onPress={() => setSelectedWord(null)}>
                                            <FontAwesome name="times" size={20} color={colors.textMuted} />
                                        </TouchableOpacity>
                                    </View>
                                    <Text style={styles.modalTurkish}>{selectedWord.turkish}</Text>

                                    <View style={[styles.compositeRow, { backgroundColor: (cColor || colors.textMuted) + '15' }]}>
                                        <Text style={styles.compositeLabel}>Bileşik Durum</Text>
                                        <Text style={[styles.compositeValue, { color: cColor || colors.textMuted }]}>
                                            {cLabel || 'Yeni'} {cs !== null ? `(%${Math.round(cs * 100)})` : ''}
                                        </Text>
                                    </View>

                                    <Text style={styles.breakdownTitle}>Aktivite Puanları</Text>
                                    {scoreRow('🃏', 'Flashcard', selectedWord.flashcardScore)}
                                    {scoreRow('🔗', 'Eş Anlam Eşleştirme', selectedWord.matchSynonymScore)}
                                    {scoreRow('🇹🇷', 'Türkçe Eşleştirme', selectedWord.matchTurkishScore)}
                                    {scoreRow('📝', 'Eş Anlam Testi', selectedWord.testSynonymScore)}
                                    {scoreRow('📖', 'Türkçe Testi', selectedWord.testTurkishScore)}
                                </>
                            );
                        })()}
                    </View>
                </TouchableOpacity>
            </Modal>
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
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: C.surfaceLight,
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.lg,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: C.border,
        height: 48,
    },
    searchIcon: {
        marginRight: Spacing.sm,
    },
    searchInput: {
        flex: 1,
        color: C.text,
        fontSize: FontSizes.md,
        height: '100%',
    },
    clearButton: {
        padding: Spacing.sm,
    },
    listContent: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: 100,
    },
    daySection: {
        marginBottom: Spacing.md,
        backgroundColor: C.surface,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: C.border,
        overflow: 'hidden',
        ...Shadows.small,
    },
    dayHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.md,
        backgroundColor: C.surface,
    },
    dayHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    dayTitle: {
        fontSize: FontSizes.md,
        fontWeight: '700',
        color: C.text,
    },
    dayCountText: {
        fontSize: FontSizes.sm,
        color: C.textSecondary,
    },
    dayContent: {
        paddingHorizontal: Spacing.md,
        paddingBottom: Spacing.sm,
        borderTopWidth: 1,
        borderTopColor: C.borderSubtle,
    },
    wordRow: {
        paddingVertical: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: C.borderSubtle,
    },
    wordRowTop: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
        gap: Spacing.sm,
    },
    englishWord: {
        fontSize: FontSizes.md,
        fontWeight: '700',
        color: C.wordColor,
    },
    posBadge: {
        fontSize: FontSizes.xs,
        color: C.textSecondary,
        fontStyle: 'italic',
    },
    statusBadge: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: 2,
        borderRadius: BorderRadius.sm,
    },
    statusBadgeText: {
        fontSize: FontSizes.xs,
        fontWeight: '700',
    },
    turkishWord: {
        fontSize: FontSizes.sm,
        color: C.wordMeaning,
        fontWeight: '600',
    },
    emptyText: {
        color: C.textSecondary,
        fontSize: FontSizes.md,
        marginTop: Spacing.md,
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.lg,
    },
    modalContent: {
        backgroundColor: C.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        width: '100%',
        maxWidth: 400,
        ...Shadows.medium,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xs,
    },
    modalTitle: {
        fontSize: FontSizes.lg,
        fontWeight: '800',
        color: C.text,
    },
    modalTurkish: {
        fontSize: FontSizes.md,
        color: C.wordMeaning,
        fontWeight: '600',
        marginBottom: Spacing.md,
    },
    compositeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.md,
    },
    compositeLabel: {
        fontSize: FontSizes.sm,
        fontWeight: '700',
        color: C.textSecondary,
    },
    compositeValue: {
        fontSize: FontSizes.md,
        fontWeight: '800',
    },
    breakdownTitle: {
        fontSize: FontSizes.sm,
        fontWeight: '700',
        color: C.textMuted,
        marginBottom: Spacing.sm,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    scoreRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: C.borderSubtle,
    },
    scoreRowLabel: {
        fontSize: FontSizes.sm,
        color: C.text,
    },
    scoreRowValue: {
        fontSize: FontSizes.md,
        fontWeight: '700',
    },
});

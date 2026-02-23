import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions
} from 'react-native';
import { BorderRadius, FontSizes, Shadows, Spacing, ThemeColors } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { AppState, StudyDay } from '../../data/seedData';
import { getAppState, resetProgress } from '../../database/store';

const CARD_GAP = Spacing.sm;

const getActivityStatusArray = (day: StudyDay) => [
  day.activities.flashcard.completedOnce,
  day.activities.matchSynonym.completedOnce,
  day.activities.matchTurkish.completedOnce,
  day.activities.testSynonym.completedOnce,
  day.activities.testTurkish.completedOnce,
];

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const NUM_COLUMNS = width >= 1024 ? 4 : width >= 768 ? 3 : 2;
  const CARD_WIDTH = (width - Spacing.lg * 2 - CARD_GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors, CARD_WIDTH), [colors, CARD_WIDTH]);
  const [appState, setAppState] = useState<AppState | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadState = useCallback(async () => {
    try {
      const state = await getAppState();
      setAppState(state);
    } catch (error) {
      console.error('Error loading app state:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadState();
    }, [loadState])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadState();
    setRefreshing(false);
  }, [loadState]);

  const handleReset = () => {
    Alert.alert(
      "İlerlemeyi Sıfırla",
      "Tüm ilerlemeniz silinecek. Emin misiniz?",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sıfırla",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            const newState = await resetProgress();
            setAppState(newState);
            setLoading(false);
          }
        }
      ]
    );
  };

  if (loading || !appState) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Overall stats
  const totalDays = appState.days.length;
  const totalWords = appState.words.length;
  const completedDays = appState.days.filter(d => {
    const statuses = getActivityStatusArray(d);
    return statuses.every(Boolean);
  }).length;

  // Render a compact day card
  const renderDayCard = ({ item: day }: { item: StudyDay }) => {
    const statuses = getActivityStatusArray(day);
    const completedCount = statuses.filter(Boolean).length;
    const totalCount = statuses.length;
    const progressPercent = (completedCount / totalCount) * 100;
    const isComplete = completedCount === totalCount;
    const dayNumber = day.label.replace('Gün ', '');

    return (
      <TouchableOpacity
        style={[styles.dayCard, isComplete && styles.dayCardComplete]}
        onPress={() => router.push(`/day/${day.id}` as any)}
        activeOpacity={0.7}
      >
        {/* Day number circle */}
        <View style={[styles.dayCircle, isComplete && styles.dayCircleComplete]}>
          {isComplete ? (
            <FontAwesome name="check" size={16} color="#fff" />
          ) : (
            <Text style={[styles.dayCircleText, isComplete && styles.dayCircleTextComplete]}>{dayNumber}</Text>
          )}
        </View>

        <Text style={styles.dayCardTitle}>{day.label}</Text>
        <Text style={styles.dayCardSubtitle}>{day.wordIds.length} kelime</Text>

        {/* Mini progress bar */}
        <View style={styles.miniProgressBg}>
          <View style={[styles.miniProgressFill, { width: `${progressPercent}%` }, isComplete && styles.miniProgressFillComplete]} />
        </View>

        {/* Activity dots */}
        <View style={styles.miniDotsRow}>
          {statuses.map((isDone, idx) => (
            <View key={idx} style={[styles.miniDot, isDone ? styles.miniDotDone : styles.miniDotPending]} />
          ))}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>YÖKDİL Fen</Text>
          <Text style={styles.subtitle}>Gün Bazlı Çalışma Sistemi</Text>
        </View>
        <View style={styles.streakBadge}>
          <FontAwesome name="fire" size={16} color={colors.warning} />
          <Text style={styles.streakText}>{appState.streak}</Text>
        </View>
      </View>

      {/* Summary Stats */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNumber}>{totalDays}</Text>
          <Text style={styles.summaryLabel}>Gün</Text>
        </View>
        <View style={[styles.summaryDivider]} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNumber}>{totalWords}</Text>
          <Text style={styles.summaryLabel}>Kelime</Text>
        </View>
        <View style={[styles.summaryDivider]} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryNumber, { color: colors.success }]}>{completedDays}</Text>
          <Text style={styles.summaryLabel}>Tamamlanan</Text>
        </View>
      </View>

      {/* Days Grid */}
      <Text style={styles.sectionTitle}>Çalışma Programı</Text>

      <View style={styles.gridContainer}>
        {appState.days.map((day, index) => {
          const isLastInRow = (index + 1) % NUM_COLUMNS === 0;
          return (
            <View
              key={day.id}
              style={[
                styles.gridItem,
                !isLastInRow && { marginRight: CARD_GAP }
              ]}
            >
              {renderDayCard({ item: day })}
            </View>
          );
        })}
      </View>

      {/* Reset + Quote */}
      <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
        <FontAwesome name="trash" size={14} color={colors.error} />
        <Text style={styles.resetButtonText}>İlerlemeyi Sıfırla</Text>
      </TouchableOpacity>

      <View style={styles.quoteCard}>
        <FontAwesome name="quote-left" size={14} color={colors.primary + '60'} />
        <Text style={styles.quoteText}>
          "Her gün bir adım, seni hedefine binlerce kilometre yaklaştırır."
        </Text>
      </View>
    </ScrollView>
  );
}

const createStyles = (C: ThemeColors, cardWidth: number) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  content: { padding: Spacing.lg, paddingTop: 60, paddingBottom: 100 },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  greeting: { fontSize: FontSizes.hero, fontWeight: '800', color: C.text, letterSpacing: 1 },
  subtitle: { fontSize: FontSizes.md, color: C.textSecondary, marginTop: Spacing.xs },
  streakBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, borderWidth: 1, borderColor: C.warning + '40', gap: Spacing.xs },
  streakText: { fontSize: FontSizes.lg, fontWeight: '800', color: C.text },

  // Summary row
  summaryRow: {
    flexDirection: 'row',
    backgroundColor: C.surface,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryNumber: { fontSize: FontSizes.xl, fontWeight: '800', color: C.text },
  summaryLabel: { fontSize: FontSizes.xs, color: C.textMuted, marginTop: 2, fontWeight: '500' },
  summaryDivider: { width: 1, height: 28, backgroundColor: C.border },

  // Section title
  sectionTitle: { fontSize: FontSizes.lg, fontWeight: '700', color: C.text, marginBottom: Spacing.sm },

  // Grid
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem: {
    width: cardWidth,
    marginBottom: CARD_GAP,
  },

  // Compact day card
  dayCard: {
    backgroundColor: C.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    ...Shadows.small,
  },
  dayCardComplete: {
    borderColor: C.success + '50',
  },

  dayCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
    borderWidth: 2,
    borderColor: C.primary + '40',
  },
  dayCircleComplete: {
    backgroundColor: C.success,
    borderColor: C.success,
  },
  dayCircleText: {
    fontSize: FontSizes.lg,
    fontWeight: '800',
    color: C.primary,
  },
  dayCircleTextComplete: {
    color: '#fff',
  },

  dayCardTitle: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: C.text,
    marginBottom: 2,
  },
  dayCardSubtitle: {
    fontSize: FontSizes.xs,
    color: C.textMuted,
    fontWeight: '500',
    marginBottom: Spacing.sm,
  },

  miniProgressBg: {
    width: '100%',
    height: 4,
    backgroundColor: C.border,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: Spacing.xs,
  },
  miniProgressFill: {
    height: '100%',
    backgroundColor: C.primary,
    borderRadius: 2,
  },
  miniProgressFillComplete: {
    backgroundColor: C.success,
  },

  miniDotsRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 2,
  },
  miniDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  miniDotPending: {
    backgroundColor: C.border,
  },
  miniDotDone: {
    backgroundColor: C.success,
  },

  // Bottom actions
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.surface,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: C.error + '30',
  },
  resetButtonText: { color: C.error, fontSize: FontSizes.sm, fontWeight: '600' },

  quoteCard: {
    backgroundColor: C.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginTop: Spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: C.primary,
  },
  quoteText: { fontSize: FontSizes.xs, color: C.textSecondary, fontStyle: 'italic', marginTop: Spacing.xs, lineHeight: 20 },
});

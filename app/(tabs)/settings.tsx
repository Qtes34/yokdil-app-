import FontAwesome from '@expo/vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useMemo } from 'react';
import {
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, FontSizes, Shadows, Spacing, ThemeColors } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { getAppState, resetProgress } from '../../database/store';

export default function SettingsScreen() {
    const { colors, isDark, toggleTheme } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    const handleResetProgress = () => {
        if (Platform.OS === 'web') {
            const confirmed = window.confirm("Tüm etkinlik ve SM-2 ilerlemelerinizi sıfırlamak (kelimeleri koruyarak) istediğinize emin misiniz?");
            if (confirmed) resetProgressOnly();
        } else {
            Alert.alert(
                "İlerlemeyi Sıfırla",
                "Tüm etkinlik ve SM-2 ilerlemelerinizi sıfırlamak istiyor musunuz? (Kelimeleriniz silinmez)",
                [
                    { text: "İptal", style: "cancel" },
                    { text: "Sıfırla", style: "destructive", onPress: resetProgressOnly }
                ]
            );
        }
    };

    const handleResetAll = () => {
        if (Platform.OS === 'web') {
            const confirmed = window.confirm("TÜM VERİLERİ (özel eklediğiniz kelimeler dahil) ilk güne sıfırlamak istediğinize emin misiniz?");
            if (confirmed) resetAllData();
        } else {
            Alert.alert(
                "Tüm Verileri Sıfırla",
                "DİKKAT! Eklediğiniz kelimeler dahil her şey silinecek ve başlangıç durumuna dönülecektir. Emin misiniz?",
                [
                    { text: "İptal", style: "cancel" },
                    { text: "Sıfırla", style: "destructive", onPress: resetAllData }
                ]
            );
        }
    };

    const resetProgressOnly = async () => {
        try {
            const state = await getAppState();
            state.streak = 0;
            state.lastStudiedDate = "";
            state.days.forEach(day => {
                const acts = Object.keys(day.activities) as Array<keyof typeof day.activities>;
                acts.forEach(key => {
                    day.activities[key] = { completedOnce: false };
                });
            });
            const now = Date.now();
            state.words.forEach(w => {
                w.interval = 1;
                w.easeFactor = 2.5;
                w.repetitions = 0;
                w.dueDate = now;
            });
            await AsyncStorage.setItem('yokdil_app_state', JSON.stringify(state));
            if (Platform.OS === 'web') window.alert("İlerlemeniz sıfırlandı!");
            else Alert.alert("Başarılı", "İlerlemeniz sıfırlandı!");
        } catch (e) {
            console.error("Failed to reset progress", e);
        }
    };

    const resetAllData = async () => {
        try {
            await resetProgress();
            if (Platform.OS === 'web') window.alert("Tüm sistem fabrika ayarlarına döndürüldü.");
            else Alert.alert("Başarılı", "Fabrika ayarlarına döndürüldü.");
        } catch (e) {
            console.error("Failed to full reset", e);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Ayarlar</Text>
            </View>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
                <Text style={styles.sectionTitle}>Görünüm</Text>
                <View style={styles.settingCard}>
                    <View style={styles.settingRow}>
                        <View style={styles.settingLabelGroup}>
                            <View style={[styles.iconBox, { backgroundColor: colors.primaryLight }]}>
                                <FontAwesome name={isDark ? "moon-o" : "sun-o"} size={16} color={colors.primary} />
                            </View>
                            <Text style={styles.settingText}>Koyu Tema (Dark Mode)</Text>
                        </View>
                        <Switch
                            value={isDark}
                            onValueChange={() => toggleTheme()}
                            trackColor={{ false: colors.border, true: colors.successBg }}
                            thumbColor={isDark ? colors.success : '#f4f3f4'}
                        />
                    </View>
                </View>

                <Text style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>Veri Yönetimi</Text>

                <TouchableOpacity style={styles.actionCard} onPress={handleResetProgress} activeOpacity={0.8}>
                    <View style={styles.settingLabelGroup}>
                        <View style={[styles.iconBox, { backgroundColor: colors.warning + '20' }]}>
                            <FontAwesome name="history" size={16} color={colors.warning} />
                        </View>
                        <View>
                            <Text style={styles.settingText}>İlerlemeyi Sıfırla</Text>
                            <Text style={styles.settingSubtext}>Oyun ve kart ilerlemelerini sıfırlar (Kelimeler korunur)</Text>
                        </View>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.actionCard, { marginTop: Spacing.sm }]} onPress={handleResetAll} activeOpacity={0.8}>
                    <View style={styles.settingLabelGroup}>
                        <View style={[styles.iconBox, { backgroundColor: colors.errorBg }]}>
                            <FontAwesome name="trash" size={16} color={colors.error} />
                        </View>
                        <View>
                            <Text style={[styles.settingText, { color: colors.error }]}>Tüm Verileri Sıfırla</Text>
                            <Text style={styles.settingSubtext}>Fabrika ayarlarına döndürür (Tüm veriler silinir)</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        paddingHorizontal: Spacing.lg,
        paddingTop: 60,
        paddingBottom: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    headerTitle: {
        fontSize: FontSizes.xl,
        fontWeight: '800',
        color: colors.text,
    },
    content: {
        padding: Spacing.lg,
    },
    sectionTitle: {
        fontSize: FontSizes.sm,
        color: colors.textSecondary,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: Spacing.sm,
        marginLeft: Spacing.xs,
    },
    settingCard: {
        backgroundColor: colors.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
        ...Shadows.small,
    },
    actionCard: {
        backgroundColor: colors.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
        ...Shadows.small,
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    settingLabelGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        paddingRight: Spacing.md,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    settingText: {
        fontSize: FontSizes.md,
        fontWeight: '600',
        color: colors.text,
    },
    settingSubtext: {
        fontSize: FontSizes.xs,
        color: colors.textMuted,
        marginTop: 2,
    },
});

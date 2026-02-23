import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Colors, FontSizes, Shadows, Spacing } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import { addCustomWord } from '../database/database';

export default function AddWordScreen() {
    const { colors } = useTheme();
    const [english, setEnglish] = useState('');
    const [turkish, setTurkish] = useState('');
    const [category, setCategory] = useState('');
    const [example, setExample] = useState('');
    const [hook, setHook] = useState('');

    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSave = async () => {
        if (!english.trim() || !turkish.trim() || !category.trim()) {
            setError('İngilizce, Türkçe ve Kategori alanları zorunludur.');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            await addCustomWord(
                english.trim(),
                turkish.trim(),
                category.trim(),
                example.trim(),
                hook.trim()
            );

            // Go back to the previous screen (library)
            if (router.canGoBack()) {
                router.back();
            } else {
                router.replace('/(tabs)/library' as any);
            }
        } catch (err) {
            console.error('Failed to add custom word', err);
            setError('Kelime eklenirken bir hata oluştu.');
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
                        <FontAwesome name="times" size={24} color={Colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Yeni Kelime Ekle</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

                    {!!error && (
                        <View style={styles.errorBox}>
                            <FontAwesome name="exclamation-circle" size={16} color={Colors.error} />
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    )}

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>İngilizce (Zorunlu) *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Örn: ubiquitous"
                            placeholderTextColor={Colors.textMuted}
                            value={english}
                            onChangeText={setEnglish}
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Türkçe Karşılığı (Zorunlu) *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Örn: her yerde olan"
                            placeholderTextColor={Colors.textMuted}
                            value={turkish}
                            onChangeText={setTurkish}
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Kategori (Zorunlu) *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Örn: Science, General"
                            placeholderTextColor={Colors.textMuted}
                            value={category}
                            onChangeText={setCategory}
                        />
                    </View>

                    <View style={styles.divider} />
                    <Text style={styles.sectionTitle}>Ekstra Öğrenme Araçları (İsteğe Bağlı)</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Örnek Cümle</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Kelimeyi bağlam içinde kullanın..."
                            placeholderTextColor={Colors.textMuted}
                            value={example}
                            onChangeText={setExample}
                            multiline
                            textAlignVertical="top"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Akılda Tutma İpucu (Memory Hook)</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Benzeşim kurarak aklınızda tutmanızı sağlayacak bir not..."
                            placeholderTextColor={Colors.textMuted}
                            value={hook}
                            onChangeText={setHook}
                            multiline
                            textAlignVertical="top"
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.saveButton, isSubmitting && styles.saveButtonDisabled]}
                        onPress={handleSave}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <Text style={styles.saveButtonText}>Kaydediliyor...</Text>
                        ) : (
                            <>
                                <FontAwesome name="check" size={18} color="#fff" />
                                <Text style={styles.saveButtonText}>Kelimeyi Kaydet</Text>
                            </>
                        )}
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        paddingTop: Platform.OS === 'android' ? Spacing.xl : Spacing.md,
        paddingBottom: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        backgroundColor: Colors.surface,
    },
    headerTitle: {
        fontSize: FontSizes.lg,
        fontWeight: '700',
        color: Colors.text,
    },
    closeButton: {
        padding: Spacing.xs,
        width: 40,
    },
    content: {
        padding: Spacing.lg,
        paddingBottom: 100,
    },
    errorBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.error + '15',
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.lg,
        gap: Spacing.sm,
        borderWidth: 1,
        borderColor: Colors.error + '40',
    },
    errorText: {
        color: Colors.error,
        flex: 1,
        fontSize: FontSizes.sm,
    },
    inputGroup: {
        marginBottom: Spacing.lg,
    },
    label: {
        fontSize: FontSizes.sm,
        fontWeight: '600',
        color: Colors.textSecondary,
        marginBottom: Spacing.xs,
    },
    input: {
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        color: Colors.text,
        fontSize: FontSizes.md,
    },
    textArea: {
        minHeight: 100,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.border,
        marginVertical: Spacing.md,
    },
    sectionTitle: {
        fontSize: FontSizes.md,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: Spacing.lg,
    },
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primary,
        paddingVertical: Spacing.lg,
        borderRadius: BorderRadius.lg,
        marginTop: Spacing.md,
        gap: Spacing.sm,
        ...Shadows.medium,
    },
    saveButtonDisabled: {
        opacity: 0.6,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: FontSizes.md,
        fontWeight: '700',
    },
});

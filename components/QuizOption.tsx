import React, { useEffect, useRef } from 'react';
import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
} from 'react-native';
import { BorderRadius, Colors, FontSizes, Shadows, Spacing } from '../constants/theme';

interface QuizOptionProps {
    label: string;
    text: string;
    onPress: () => void;
    disabled: boolean;
    isCorrect?: boolean;
    isSelected?: boolean;
    showResult: boolean;
}

export default function QuizOption({
    label,
    text,
    onPress,
    disabled,
    isCorrect,
    isSelected,
    showResult,
}: QuizOptionProps) {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const bgAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (showResult && isSelected) {
            Animated.sequence([
                Animated.timing(scaleAnim, {
                    toValue: 0.95,
                    duration: 100,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 3,
                    tension: 40,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [showResult, isSelected]);

    const getBackgroundColor = () => {
        if (!showResult) return Colors.surface;
        if (isCorrect) return Colors.success + '25';
        if (isSelected && !isCorrect) return Colors.error + '25';
        return Colors.surface;
    };

    const getBorderColor = () => {
        if (!showResult) return Colors.border;
        if (isCorrect) return Colors.success;
        if (isSelected && !isCorrect) return Colors.error;
        return Colors.border;
    };

    const getTextColor = () => {
        if (!showResult) return Colors.text;
        if (isCorrect) return Colors.success;
        if (isSelected && !isCorrect) return Colors.error;
        return Colors.textMuted;
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled}
            activeOpacity={0.7}
        >
            <Animated.View
                style={[
                    styles.container,
                    {
                        backgroundColor: getBackgroundColor(),
                        borderColor: getBorderColor(),
                        transform: [{ scale: scaleAnim }],
                    },
                ]}
            >
                <Animated.View
                    style={[
                        styles.labelContainer,
                        {
                            backgroundColor: showResult
                                ? isCorrect
                                    ? Colors.success + '30'
                                    : isSelected
                                        ? Colors.error + '30'
                                        : Colors.primary + '20'
                                : Colors.primary + '20',
                        },
                    ]}
                >
                    <Text
                        style={[
                            styles.label,
                            {
                                color: showResult
                                    ? isCorrect
                                        ? Colors.success
                                        : isSelected
                                            ? Colors.error
                                            : Colors.primaryLight
                                    : Colors.primaryLight,
                            },
                        ]}
                    >
                        {label}
                    </Text>
                </Animated.View>
                <Text style={[styles.text, { color: getTextColor() }]}>{text}</Text>
                {showResult && isCorrect && (
                    <Text style={styles.emoji}>✓</Text>
                )}
                {showResult && isSelected && !isCorrect && (
                    <Text style={[styles.emoji, { color: Colors.error }]}>✗</Text>
                )}
            </Animated.View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        marginBottom: Spacing.sm,
        borderRadius: BorderRadius.lg,
        borderWidth: 1.5,
        ...Shadows.small,
    },
    labelContainer: {
        width: 36,
        height: 36,
        borderRadius: BorderRadius.sm,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    label: {
        fontSize: FontSizes.md,
        fontWeight: '700',
    },
    text: {
        fontSize: FontSizes.lg,
        fontWeight: '500',
        flex: 1,
    },
    emoji: {
        fontSize: FontSizes.xl,
        color: Colors.success,
        fontWeight: '700',
    },
});

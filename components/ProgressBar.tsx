import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { BorderRadius, FontSizes, Spacing, ThemeColors } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';

interface ProgressBarProps {
    progress: number; // 0 to 100
    label?: string;
    showPercentage?: boolean;
    height?: number;
    color?: string;
}

export default function ProgressBar({
    progress,
    label,
    showPercentage = true,
    height = 12,
    color,
}: ProgressBarProps) {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const widthAnim = useRef(new Animated.Value(0)).current;
    const barColor = color || colors.primary;

    useEffect(() => {
        Animated.spring(widthAnim, {
            toValue: progress,
            friction: 10,
            tension: 20,
            useNativeDriver: false,
        }).start();
    }, [progress]);

    const widthInterpolate = widthAnim.interpolate({
        inputRange: [0, 100],
        outputRange: ['0%', '100%'],
        extrapolate: 'clamp',
    });

    return (
        <View style={styles.container}>
            {(label || showPercentage) && (
                <View style={styles.headerRow}>
                    {label && <Text style={styles.label}>{label}</Text>}
                    {showPercentage && (
                        <Text style={styles.percentage}>%{Math.round(progress)}</Text>
                    )}
                </View>
            )}
            <View style={[styles.track, { height }]}>
                <Animated.View
                    style={[
                        styles.fill,
                        {
                            width: widthInterpolate,
                            height,
                            backgroundColor: barColor,
                        },
                    ]}
                />
            </View>
        </View>
    );
}

const createStyles = (C: ThemeColors) => StyleSheet.create({
    container: { width: '100%' },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xs },
    label: { fontSize: FontSizes.sm, color: C.textSecondary, fontWeight: '500' },
    percentage: { fontSize: FontSizes.sm, color: C.primary, fontWeight: '700' },
    track: { width: '100%', backgroundColor: C.surfaceLight, borderRadius: BorderRadius.full, overflow: 'hidden' },
    fill: { borderRadius: BorderRadius.full },
});

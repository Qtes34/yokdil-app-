const { withAppBuildGradle, withGradleProperties } = require('expo/config-plugins');

/**
 * Expo Config Plugin: Enables BuildConfig generation for the app module.
 * 
 * Uses TWO approaches for maximum reliability:
 * 1. gradle.properties: android.defaults.buildfeatures.buildconfig=true (backup)
 * 2. app/build.gradle: android { buildFeatures { buildConfig = true } } (primary)
 * 
 * The gradle.properties approach alone is deprecated in AGP 8.x and does NOT
 * properly add BuildConfig.java to the Kotlin source set. The build.gradle
 * approach is the officially recommended fix.
 */
module.exports = function withBuildConfig(config) {
    // Approach 1: gradle.properties (backup, deprecated but harmless)
    config = withGradleProperties(config, (config) => {
        const key = 'android.defaults.buildfeatures.buildconfig';
        config.modResults = config.modResults.filter(
            (item) => !(item.type === 'property' && item.key === key)
        );
        config.modResults.push({ type: 'property', key, value: 'true' });
        return config;
    });

    // Approach 2: Directly modify app/build.gradle (primary fix)
    config = withAppBuildGradle(config, (config) => {
        let contents = config.modResults.contents;

        // Only skip if buildFeatures block EXPLICITLY has buildConfig = true
        if (/buildFeatures\s*\{[^}]*buildConfig\s*(=\s*)?true/s.test(contents)) {
            console.log('[withBuildConfig] buildConfig already enabled in buildFeatures, skipping.');
            return config;
        }

        // Strategy A: If buildFeatures block exists, add buildConfig inside it
        if (/buildFeatures\s*\{/.test(contents)) {
            console.log('[withBuildConfig] Found existing buildFeatures block, adding buildConfig = true');
            contents = contents.replace(
                /buildFeatures\s*\{/,
                'buildFeatures {\n        buildConfig = true'
            );
        }
        // Strategy B: Insert new buildFeatures block after "android {"
        else {
            const androidMatch = contents.match(/android\s*\{/);
            if (androidMatch) {
                console.log('[withBuildConfig] No buildFeatures block found, inserting after android {');
                const idx = androidMatch.index + androidMatch[0].length;
                contents =
                    contents.substring(0, idx) +
                    '\n    buildFeatures {\n        buildConfig = true\n    }' +
                    contents.substring(idx);
            } else {
                console.warn('[withBuildConfig] WARNING: Could not find android block in build.gradle!');
            }
        }

        config.modResults.contents = contents;
        return config;
    });

    return config;
};

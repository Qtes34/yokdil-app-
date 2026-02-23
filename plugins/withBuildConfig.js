const {
    withAppBuildGradle,
    withGradleProperties,
    withMainActivity,
    withMainApplication,
} = require('expo/config-plugins');

/**
 * Expo Config Plugin: Fixes "Unresolved reference 'BuildConfig'" in AGP 8.x + Kotlin 2.x
 * 
 * Root cause: In AGP 8.x with Kotlin 2.x, the generated BuildConfig.java file
 * is not visible to the Kotlin compiler even when buildFeatures.buildConfig = true.
 * 
 * Solution: Replace all BuildConfig references in MainActivity.kt and MainApplication.kt
 * with hardcoded values appropriate for Expo SDK 54 / React Native 0.81.
 */
module.exports = function withBuildConfig(config) {
    // Step 1: Still enable BuildConfig in gradle (doesn't hurt)
    config = withGradleProperties(config, (config) => {
        const key = 'android.defaults.buildfeatures.buildconfig';
        config.modResults = config.modResults.filter(
            (item) => !(item.type === 'property' && item.key === key)
        );
        config.modResults.push({ type: 'property', key, value: 'true' });
        return config;
    });

    config = withAppBuildGradle(config, (config) => {
        let contents = config.modResults.contents;
        if (!/buildFeatures\s*\{[^}]*buildConfig\s*(=\s*)?true/s.test(contents)) {
            const m = contents.match(/android\s*\{/);
            if (m) {
                const idx = m.index + m[0].length;
                contents = contents.substring(0, idx) +
                    '\n    buildFeatures {\n        buildConfig = true\n    }' +
                    contents.substring(idx);
                config.modResults.contents = contents;
            }
        }
        return config;
    });

    // Step 2: Replace BuildConfig references in MainActivity.kt
    config = withMainActivity(config, (config) => {
        let contents = config.modResults.contents;
        // Replace BuildConfig.DEBUG with false (release build)
        contents = contents.replace(/BuildConfig\.DEBUG/g, 'false');
        // Replace any other BuildConfig references
        contents = contents.replace(/BuildConfig\.APPLICATION_ID/g,
            `"${config.android?.package || 'com.qtes34.yokdilapp'}"`);
        config.modResults.contents = contents;
        console.log('[withBuildConfig] Replaced BuildConfig refs in MainActivity.kt');
        return config;
    });

    // Step 3: Replace BuildConfig references in MainApplication.kt
    config = withMainApplication(config, (config) => {
        let contents = config.modResults.contents;
        // Replace BuildConfig.DEBUG
        contents = contents.replace(/BuildConfig\.DEBUG/g, 'false');
        // Replace BuildConfig.IS_HERMES_ENABLED (always true in RN 0.81+)
        contents = contents.replace(/BuildConfig\.IS_HERMES_ENABLED/g, 'true');
        // Replace BuildConfig.IS_NEW_ARCHITECTURE_ENABLED (true in Expo SDK 54)
        contents = contents.replace(/BuildConfig\.IS_NEW_ARCHITECTURE_ENABLED/g, 'true');
        // Replace BuildConfig.APPLICATION_ID
        contents = contents.replace(/BuildConfig\.APPLICATION_ID/g,
            `"${config.android?.package || 'com.qtes34.yokdilapp'}"`);
        // Replace any remaining BuildConfig.XXXX with sensible defaults
        contents = contents.replace(/BuildConfig\.EX_UPDATES_NATIVE_DEBUG/g, 'false');
        config.modResults.contents = contents;
        console.log('[withBuildConfig] Replaced BuildConfig refs in MainApplication.kt');
        return config;
    });

    return config;
};

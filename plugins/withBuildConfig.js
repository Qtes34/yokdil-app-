const {
    withMainActivity,
    withMainApplication,
} = require('expo/config-plugins');

/**
 * Fixes "Unresolved reference 'BuildConfig'" OR "Redeclaration: BuildConfig" 
 * in AGP 8.x + Kotlin 2.x
 * 
 * Strategy:
 * Instead of fighting Gradle to generate or NOT generate BuildConfig.java,
 * we just REPLACE all references to BuildConfig inside MainActivity.kt and MainApplication.kt
 * with their hardcoded values.
 * 
 * This completely removes the dependency on BuildConfig from our Kotlin code!
 */
module.exports = function withBuildConfig(config) {
    const packageName = config.android?.package || 'com.qtes34.yokdilapp';

    const replaceBuildConfigArgs = (content) => {
        return content
            .replace(/BuildConfig\.IS_NEW_ARCHITECTURE_ENABLED/g, 'true')
            .replace(/BuildConfig\.IS_HERMES_ENABLED/g, 'true')
            .replace(/BuildConfig\.DEBUG/g, 'false')
            .replace(/BuildConfig\.APPLICATION_ID/g, `"${packageName}"`)
            .replace(/BuildConfig\.[A-zA-Z_]+/g, 'false'); // catch all fallback for anything else
    };

    // Step 1: Remove BuildConfig references from MainActivity.kt
    config = withMainActivity(config, (config) => {
        config.modResults.contents = replaceBuildConfigArgs(config.modResults.contents);
        console.log('[withBuildConfig] Stripped BuildConfig references from MainActivity.kt');
        return config;
    });

    // Step 2: Remove BuildConfig references from MainApplication.kt
    config = withMainApplication(config, (config) => {
        config.modResults.contents = replaceBuildConfigArgs(config.modResults.contents);
        console.log('[withBuildConfig] Stripped BuildConfig references from MainApplication.kt');
        return config;
    });

    return config;
};

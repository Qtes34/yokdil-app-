const {
    withAppBuildGradle,
    withGradleProperties,
    withDangerousMod,
} = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Instead of replacing BuildConfig references (which broke the class files),
 * we now CREATE a real BuildConfig.kt file that provides all needed constants.
 * This way the original MainActivity.kt and MainApplication.kt remain untouched.
 */
module.exports = function withBuildConfig(config) {
    const packageName = config.android?.package || 'com.qtes34.yokdilapp';

    // Step 1: gradle.properties
    config = withGradleProperties(config, (config) => {
        const key = 'android.defaults.buildfeatures.buildconfig';
        config.modResults = config.modResults.filter(
            (item) => !(item.type === 'property' && item.key === key)
        );
        config.modResults.push({ type: 'property', key, value: 'true' });
        return config;
    });

    // Step 2: build.gradle buildFeatures
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

    // Step 3: Create a manual BuildConfig.kt file as a fallback
    // This runs AFTER prebuild creates the android directory
    config = withDangerousMod(config, [
        'android',
        async (config) => {
            const packagePath = packageName.replace(/\./g, '/');
            const buildConfigDir = path.join(
                config.modRequest.platformProjectRoot,
                'app', 'src', 'main', 'java', packagePath
            );
            const buildConfigFile = path.join(buildConfigDir, 'BuildConfig.kt');

            // Only create if BuildConfig.java doesn't exist (generated one)
            const generatedBuildConfig = path.join(
                config.modRequest.platformProjectRoot,
                'app', 'build', 'generated', 'source', 'buildConfig'
            );

            // Always create our manual BuildConfig.kt as safety net
            const buildConfigContent = `package ${packageName}

/**
 * Manual BuildConfig - created by withBuildConfig plugin
 * This exists because AGP 8.x + Kotlin 2.x has a known issue where
 * the auto-generated BuildConfig.java is not visible to Kotlin compiler.
 */
object BuildConfig {
    const val DEBUG = false
    const val APPLICATION_ID = "${packageName}"
    const val BUILD_TYPE = "release"
    const val VERSION_NAME = "${config.version || '1.0.0'}"
    const val VERSION_CODE = ${config.android?.versionCode || 1}
    const val IS_HERMES_ENABLED = true
    const val IS_NEW_ARCHITECTURE_ENABLED = true
}
`;

            // Ensure directory exists
            fs.mkdirSync(buildConfigDir, { recursive: true });
            fs.writeFileSync(buildConfigFile, buildConfigContent, 'utf8');
            console.log(`[withBuildConfig] Created manual BuildConfig.kt at ${buildConfigFile}`);

            return config;
        },
    ]);

    return config;
};

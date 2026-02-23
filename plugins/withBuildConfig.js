const {
    withAppBuildGradle,
    withDangerousMod,
} = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Fixes "Unresolved reference 'BuildConfig'" in AGP 8.x + Kotlin 2.x
 * 
 * Strategy:
 * 1. DISABLE auto-generated BuildConfig.java (buildFeatures.buildConfig = false)
 * 2. CREATE a manual BuildConfig.kt with all needed constants
 * 
 * This prevents the Redeclaration conflict between generated .java and manual .kt
 */
module.exports = function withBuildConfig(config) {
    const packageName = config.android?.package || 'com.qtes34.yokdilapp';

    // Step 1: Explicitly DISABLE auto-generated BuildConfig in build.gradle
    config = withAppBuildGradle(config, (config) => {
        let contents = config.modResults.contents;

        // Check if buildFeatures block exists
        const buildFeaturesMatch = contents.match(/buildFeatures\s*\{([^}]*)\}/s);
        if (buildFeaturesMatch) {
            // Replace or add buildConfig = false inside existing block
            let inner = buildFeaturesMatch[1];
            if (/buildConfig\s*[=:]\s*true/.test(inner)) {
                inner = inner.replace(/buildConfig\s*[=:]\s*true/, 'buildConfig = false');
            } else if (!/buildConfig\s*[=:]\s*false/.test(inner)) {
                inner += '\n        buildConfig = false';
            }
            contents = contents.replace(buildFeaturesMatch[0], `buildFeatures {${inner}}`);
        } else {
            // Insert buildFeatures block after android {
            const androidMatch = contents.match(/android\s*\{/);
            if (androidMatch) {
                const idx = androidMatch.index + androidMatch[0].length;
                contents = contents.substring(0, idx) +
                    '\n    buildFeatures {\n        buildConfig = false\n    }' +
                    contents.substring(idx);
            }
        }

        config.modResults.contents = contents;
        console.log('[withBuildConfig] Set buildFeatures.buildConfig = false in build.gradle');
        return config;
    });

    // Step 2: Create a manual BuildConfig.kt file
    config = withDangerousMod(config, [
        'android',
        async (config) => {
            const packagePath = packageName.replace(/\./g, '/');
            const buildConfigDir = path.join(
                config.modRequest.platformProjectRoot,
                'app', 'src', 'main', 'java', packagePath
            );
            const buildConfigFile = path.join(buildConfigDir, 'BuildConfig.kt');

            const buildConfigContent = `package ${packageName}

/**
 * Manual BuildConfig - created by withBuildConfig plugin.
 * Auto-generated BuildConfig.java is disabled to prevent Redeclaration conflicts.
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

            fs.mkdirSync(buildConfigDir, { recursive: true });
            fs.writeFileSync(buildConfigFile, buildConfigContent, 'utf8');
            console.log('[withBuildConfig] Created manual BuildConfig.kt');

            return config;
        },
    ]);

    return config;
};

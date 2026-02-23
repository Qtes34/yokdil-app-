const { withDangerousMod } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Fixes "Unresolved reference 'BuildConfig'" in AGP 8.x + Kotlin 2.x
 * 
 * Root cause: AGP 8.x disables BuildConfig generation by default, and even when
 * enabled, the generated BuildConfig.java is not visible to the Kotlin 2.x compiler.
 * 
 * Solution: Create a manual BuildConfig.kt file with all needed constants.
 * Do NOT enable buildFeatures.buildConfig to avoid Redeclaration conflicts.
 */
module.exports = function withBuildConfig(config) {
    const packageName = config.android?.package || 'com.qtes34.yokdilapp';

    // Create a manual BuildConfig.kt file after prebuild generates the android directory
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
 * AGP 8.x + Kotlin 2.x cannot see the auto-generated BuildConfig.java,
 * so we provide this manual replacement.
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

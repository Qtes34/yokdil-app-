const { withAppBuildGradle } = require('@expo/config-plugins');

module.exports = function withDesugaring(config) {
    return withAppBuildGradle(config, (config) => {
        if (config.modResults.language === 'groovy') {
            let content = config.modResults.contents;

            // 1. Add coreLibraryDesugaringEnabled true inside compileOptions
            if (!content.includes('coreLibraryDesugaringEnabled true')) {
                content = content.replace(
                    /compileOptions \s*{/,
                    'compileOptions {\n        coreLibraryDesugaringEnabled true'
                );
            }

            if (!content.includes('coreLibraryDesugaring "com.android.tools:desugar_jdk_libs')) {
                content = content.replace(
                    /dependencies\s*\{/,
                    'dependencies {\n    coreLibraryDesugaring "com.android.tools:desugar_jdk_libs:2.0.4"'
                );
            }

            config.modResults.contents = content;
        }
        return config;
    });
};

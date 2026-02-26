const { withAppBuildGradle, withMainApplication } = require('@expo/config-plugins');

module.exports = function withAndroidFix(config) {
    // 1. build.gradle'a multidex bağımlılığını ekle
    config = withAppBuildGradle(config, (config) => {
        let contents = config.modResults.contents;

        if (!contents.includes('androidx.multidex:multidex')) {
            contents = contents.replace(
                /dependencies\s*\{/,
                'dependencies {\n    implementation("androidx.multidex:multidex:2.0.1")'
            );
        }

        config.modResults.contents = contents;
        return config;
    });

    // 2. MainApplication.kt dosyasını düzelt
    config = withMainApplication(config, (config) => {
        let contents = config.modResults.contents;

        // MultiDexApplication import ekle (dosyanın en başına)
        if (!contents.includes('import androidx.multidex.MultiDexApplication')) {
            contents = contents.replace(
                /^(package .+\n)/m,
                '$1\nimport androidx.multidex.MultiDexApplication\n'
            );
        }

        // Application -> MultiDexApplication
        if (!contents.includes('MultiDexApplication()')) {
            contents = contents.replace(
                /class MainApplication : Application\(\)/,
                'class MainApplication : MultiDexApplication()'
            );
        }

        config.modResults.contents = contents;
        return config;
    });

    return config;
};

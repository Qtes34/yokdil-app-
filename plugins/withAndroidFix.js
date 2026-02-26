const { withAppBuildGradle, withMainApplication, withDangerousMod } = require('@expo/config-plugins');
const path = require('path');
const fs = require('fs');

module.exports = function withAndroidFix(config) {
    // 1. multidex-keep.txt oluştur
    config = withDangerousMod(config, [
        'android',
        async (config) => {
            const filePath = path.join(
                config.modRequest.platformProjectRoot,
                'app',
                'multidex-keep.txt'
            );
            fs.writeFileSync(filePath, 'com/qtes34/yokdilapp/MainApplication.class\n');
            return config;
        },
    ]);

    // 2. build.gradle'ı düzelt
    config = withAppBuildGradle(config, (config) => {
        let contents = config.modResults.contents;

        // multidex bağımlılığı
        if (!contents.includes('androidx.multidex:multidex')) {
            contents = contents.replace(
                /dependencies\s*\{/,
                'dependencies {\n    implementation("androidx.multidex:multidex:2.0.1")'
            );
        }

        // multiDexKeepFile — multiDexEnabled satırını bul, hemen altına ekle
        if (!contents.includes('multiDexKeepFile')) {
            contents = contents.replace(
                /(multiDexEnabled\s*=?\s*true)/,
                '$1\n        multiDexKeepFile file("multidex-keep.txt")'
            );
        }

        config.modResults.contents = contents;
        return config;
    });

    // 3. MainApplication.kt'yi düzelt
    config = withMainApplication(config, (config) => {
        let contents = config.modResults.contents;

        if (!contents.includes('import androidx.multidex.MultiDexApplication')) {
            contents = contents.replace(
                /^(package .+\n)/m,
                '$1\nimport androidx.multidex.MultiDexApplication\n'
            );
        }

        if (!contents.includes('MultiDexApplication()')) {
            contents = contents.replace(
                /class MainApplication : Application\(\),/,
                'class MainApplication : MultiDexApplication(),'
            );
        }

        config.modResults.contents = contents;
        return config;
    });

    return config;
};

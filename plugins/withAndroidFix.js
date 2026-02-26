const { withAppBuildGradle, withMainApplication, withDangerousMod } = require('@expo/config-plugins');
const path = require('path');
const fs = require('fs');

module.exports = function withAndroidFix(config) {
    const packageName = config.android?.package || 'com.qtes34.yokdilapp';

    config = withDangerousMod(config, [
        'android',
        async (config) => {
            const appDir = path.join(config.modRequest.platformProjectRoot, 'app');
            const multidexKeepFile = path.join(appDir, 'multidex-keep.txt');
            const classesToKeep = [
                `com/qtes34/yokdilapp/MainApplication.class`,
                'androidx/multidex/MultiDexApplication.class',
                'android/app/Application.class',
            ].join('\n');
            fs.writeFileSync(multidexKeepFile, classesToKeep + '\n');
            return config;
        },
    ]);

    config = withAppBuildGradle(config, (config) => {
        let contents = config.modResults.contents;
        if (!contents.includes('androidx.multidex:multidex')) {
            contents = contents.replace(/dependencies\s*\{/, 'dependencies {\n    implementation "androidx.multidex:multidex:2.0.1"');
        }
        if (!contents.includes('multiDexEnabled')) {
            contents = contents.replace(/(targetSdkVersion\s*=?\s*\d+)/, '$1\n        multiDexEnabled true');
        }
        if (!contents.includes('multiDexKeepFile')) {
            contents = contents.replace(/(multiDexEnabled\s*=?\s*true)/g, '$1\n            multiDexKeepFile file("multidex-keep.txt")');
        }
        config.modResults.contents = contents;
        return config;
    });

    config = withMainApplication(config, (config) => {
        let contents = config.modResults.contents;
        if (!contents.includes('import androidx.multidex.MultiDexApplication')) {
            contents = contents.replace(/^(package .+\n)/m, '$1\nimport androidx.multidex.MultiDexApplication\n');
        }
        contents = contents.replace(/: Application\(\)/g, ': MultiDexApplication()');
        config.modResults.contents = contents;
        return config;
    });

    return config;
};

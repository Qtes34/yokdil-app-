const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

module.exports = function withProguardRules(config) {
    const packageName = config.android?.package || 'com.qtes34.yokdilapp';

    return withDangerousMod(config, ['android', async (config) => {
        const proguardPath = path.join(config.modRequest.platformProjectRoot, 'app', 'proguard-rules.pro');
        const proguardRules = `
# Keep MainApplication
-keep class ${packageName}.MainApplication { *; }
-keep class * extends android.app.Application { *; }
-keep class * extends androidx.multidex.MultiDexApplication { *; }
-keep class ${packageName}.MainActivity { *; }
-keep class com.facebook.react.** { *; }
-keep class expo.modules.** { *; }
-dontobfuscate
-dontshrink
-keepattributes SourceFile,LineNumberTable,*Annotation*
`;
        if (fs.existsSync(proguardPath)) {
            let content = fs.readFileSync(proguardPath, 'utf8');
            if (!content.includes('Keep MainApplication')) {
                fs.writeFileSync(proguardPath, content + proguardRules, 'utf8');
            }
        } else {
            fs.writeFileSync(proguardPath, proguardRules, 'utf8');
        }
        return config;
    }]);
};

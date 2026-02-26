const { withAppBuildGradle } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

module.exports = function withProguardRules(config) {
    return withAppBuildGradle(config, (config) => {
        // ProGuard kurallarının sonuna bizim özel kuralımızı ekleyeceğiz.
        const proguardKuralımız = "\n-keep class com.qtes34.yokdilapp.MainApplication { *; }\n";

        // "proguard-rules.pro" dosyasının yolu (Expo prebuild'den sonra)
        const proguardPath = path.join(config.modRequest.platformProjectRoot, 'app', 'proguard-rules.pro');

        // Dosya varsa kuralı ekle, yoksa dosyayı oluştur ve kuralı koy.
        if (fs.existsSync(proguardPath)) {
            let content = fs.readFileSync(proguardPath, 'utf8');
            if (!content.includes('com.qtes34.yokdilapp.MainApplication')) {
                content += proguardKuralımız;
                fs.writeFileSync(proguardPath, content, 'utf8');
            }
        } else {
            fs.writeFileSync(proguardPath, proguardKuralımız, 'utf8');
        }

        // Uygulamanın minifyEnabled kullanımına bağlı olarak build.gradle'a işaret edebiliriz,
        // ancak Expo bunu varsayılan (release) buildType altında genelde açar.
        // Biz şimdilik sadece Proguard dosyasına kuralı ekleyeceğiz.

        return config;
    });
};

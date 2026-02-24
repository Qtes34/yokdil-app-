const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

module.exports = function withAndroidFix(config) {
    return withDangerousMod(config, [
        'android',
        async (config) => {
            const projectRoot = config.modRequest.projectRoot;

            const mainApplicationPath = path.join(
                projectRoot,
                'android/app/src/main/java/com/qtes34/yokdilapp/MainApplication.kt'
            );

            const mainActivityPath = path.join(
                projectRoot,
                'android/app/src/main/java/com/qtes34/yokdilapp/MainActivity.kt'
            );

            const replaceBuildConfigArgs = (content) => {
                return content
                    .replace(/BuildConfig\.IS_NEW_ARCHITECTURE_ENABLED/g, 'true')
                    .replace(/BuildConfig\.DEBUG/g, 'false')
                    .replace(/BuildConfig\.IS_HERMES_ENABLED/g, 'true')
                    .replace(/BuildConfig\.REACT_NATIVE_RELEASE_LEVEL/g, '"stable"')
                    .replace(/BuildConfig\.BUILD_TYPE/g, '"release"');
            };

            if (fs.existsSync(mainApplicationPath)) {
                let content = fs.readFileSync(mainApplicationPath, 'utf8');
                content = replaceBuildConfigArgs(content);
                fs.writeFileSync(mainApplicationPath, content, 'utf8');
            }

            if (fs.existsSync(mainActivityPath)) {
                let content = fs.readFileSync(mainActivityPath, 'utf8');
                content = replaceBuildConfigArgs(content);
                fs.writeFileSync(mainActivityPath, content, 'utf8');
            }

            return config;
        },
    ]);
};

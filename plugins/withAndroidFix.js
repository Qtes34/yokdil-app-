const { withMainApplication } = require('@expo/config-plugins');

module.exports = function withAndroidFix(config) {
    return withMainApplication(config, (config) => {
        let contents = config.modResults.contents;

        // MultiDexApplication import ekle
        if (!contents.includes('androidx.multidex.MultiDexApplication')) {
            contents = contents.replace(
                'import expo.modules.ReactActivityDelegateWrapper',
                'import androidx.multidex.MultiDexApplication\nimport expo.modules.ReactActivityDelegateWrapper'
            );
        }

        // Application -> MultiDexApplication
        if (!contents.includes('MultiDexApplication()')) {
            contents = contents.replace(
                'class MainApplication : Application(), ReactApplication {',
                'class MainApplication : MultiDexApplication(), ReactApplication {'
            );
        }

        config.modResults.contents = contents;
        return config;
    });
};

const IS_DEV = process.env.APP_VARIANT === 'development';
const IS_PREVIEW = process.env.APP_VARIANT === 'preview';

const getUniqueIdentifier = () => {
    if (IS_DEV) {
        return 'com.imersio.immersive_experiences_v3.dev';
    }

    if (IS_PREVIEW) {
        return 'com.imersio.immersive_experiences_v3.preview';
    }

    return 'com.imersio.immersive_experiences_v3';
};

const getAppName = () => {
    if (IS_DEV) {
        return 'immersive_experiences_v3 (Dev)';
    }

    if (IS_PREVIEW) {
        return 'immersive_experiences_v3 (Preview)';
    }

    return 'immersive_experiences_v3';
};


export default ({ config }) => ({
    ...config,
    name: getAppName(),
    ios: {
        ...config.ios,
        bundleIdentifier: getUniqueIdentifier(),
    },
    android: {
        ...config.android,
        package: getUniqueIdentifier(),
    },
});


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

export default {
    name: getAppName(),
    slug: "immersive_experiences_v3",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "immersiveexperiencesv3",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
        supportsTablet: true,
        bundleIdentifier: getUniqueIdentifier(),
    },
    android: {
        adaptiveIcon: {
            foregroundImage: "./assets/images/adaptive-icon.png",
            backgroundColor: "#ffffff"
        },
        permissions: [
            "android.permission.ACCESS_COARSE_LOCATION",
            "android.permission.ACCESS_FINE_LOCATION"
        ],
        edgeToEdgeEnabled: true,
        package: getUniqueIdentifier(),

    },
    web: {
        bundler: "metro",
        output: "static",
        favicon: "./assets/images/favicon.png"
    },
    plugins: [
        "expo-router",
        [
            "expo-splash-screen",
            {
                "image": "./assets/images/splash-icon.png",
                "imageWidth": 200,
                "resizeMode": "contain",
                "backgroundColor": "#ffffff"
            }
        ],
        [
            "expo-maps",
            {
                "requestLocationPermission": true,
                "locationPermission": "Allow Imers.io to use your location"
            }
        ]
    ],
    experiments: {
        typedRoutes: true
    },
    extra: {
        router: {},
        eas: {
            projectId: "bb37e65e-925d-4ad0-92db-0952ff9926c1"
        }
    }
};


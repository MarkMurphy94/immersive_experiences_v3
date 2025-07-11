module.exports = function (api) {
    api.cache(true);
    return {
        presets: ['babel-preset-expo'],
        plugins: [
            [
                'module-resolver',
                {
                    alias: {
                        '@': './', // or whatever your root directory is
                    },
                    extensions: ['.js', '.jsx', '.ts', '.tsx'],
                },
            ],
        ],
    };
};
const pkg = require('./package.json');


module.exports = function (api) {
    api.cache(false);
    return {
        babelrcRoots: [
            '.',
            './node_modules/*',
        ],
        presets: [
            '@babel/preset-env'
        ],
        plugins: [
            '@babel/plugin-proposal-class-properties'
        ]

    };
}



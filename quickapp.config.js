module.exports = {
    // 在toolkit2.0以及更高版本，这实际上是对rspack的配置
    webpack: {
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    exclude: [/node_modules/],
                    loader: 'builtin:swc-loader',
                    options: {
                        jsc: {
                            parser: {
                                syntax: 'typescript',
                            },
                        },
                    },
                    type: 'javascript/auto',
                }
            ]
        },
        resolve: {
            alias: {}
        }
    },
    cli: {
        "enable-custom-component": true,
        "enable-jsc": true,
        "enable-protobuf": true
    }
};
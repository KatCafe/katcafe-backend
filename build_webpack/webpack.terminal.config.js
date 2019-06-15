const webpack = require('webpack')
const base = require('./webpack.base.config')
const merge = require('webpack-merge')
const nodeExternals = require('webpack-node-externals');

const config = merge(base, {
    target: 'node',

    //define entry point
    entry: {
        app: "./src/main.js",
    },
    output: {
        filename: 'terminal-bundle.js',
        libraryTarget: 'commonjs2'
    },
    resolve: {
        alias: { //see vue-Frontend for demo

        }
    },
    externals: nodeExternals({

    }),

    node: {
        __filename: true,
        __dirname: true
    },

    plugins: [
        new webpack.DefinePlugin({
            "process.env": {
                BROWSER: 'false',
                SERVER_PORT: process.env.SERVER_PORT,
            }
        })
    ]

});

module.exports = config;

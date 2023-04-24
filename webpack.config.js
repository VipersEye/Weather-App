const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerWebpackPlugin = require('css-minimizer-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const EslintWebpackPlugin = require('eslint-webpack-plugin');

/** @type {import('webpack').Configuration}*/

const config = {
    context: path.resolve(__dirname, 'src'),
    mode: 'development',
    entry: {
        main: './index.js'
    },
    output: {
        filename: '[name].[contenthash].js',
        path: path.resolve(__dirname, 'dist'),
        clean: true
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
            'modules': path.resolve(__dirname, 'src/modules'),
            'styles': path.resolve(__dirname, 'src/assets/styles')
        }
    },
    devServer: {
        static: path.resolve(__dirname, 'dist'),
        hot: true,
        watchFiles: ['src/*.html']
    },
    plugins: [
        new HTMLWebpackPlugin({
            template: './index.html'
        }),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, 'src/assets/images'),
                    to: path.resolve(__dirname, 'dist/images')
                },
                {
                    from: path.resolve(__dirname, 'src/assets/music'),
                    to: path.resolve(__dirname, 'dist/music')
                }
            ]
        }),
        new MiniCssExtractPlugin({
            filename: '[name].[contenthash].css'
        }),
        new EslintWebpackPlugin()
    ],
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: [MiniCssExtractPlugin.loader, 'css-loader']
            },
            {
                test: /\.(png|jpeg|jpg|svg|gif)$/i,
                type: 'asset/resource'
            }
        ]
    }
};

module.exports = (env, argv) => {
    console.log(argv.mode);
    if (argv.mode === 'development') {
        config.devtool = 'source-map';
        config.optimization = {
            minimize: false
        };
    }
    if (argv.mode === 'production') {
        config.optimization = {
            minimize: true,
            minimizer: [
                new TerserWebpackPlugin(),
                new CssMinimizerWebpackPlugin()
            ]
        };
    }
    return config;
};
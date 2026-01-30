const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Allow bundling WASM used by expo-sqlite on web
config.resolver.assetExts.push("wasm");

module.exports = config;

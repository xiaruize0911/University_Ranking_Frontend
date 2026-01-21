// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Enable package exports support (required for some modern packages like make-plural)
config.resolver.unstable_enablePackageExports = true;

// Explicitly map make-plural to its main entry point if resolution fails
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'make-plural': path.resolve(__dirname, 'node_modules/make-plural/plurals.js'),
};

module.exports = config;

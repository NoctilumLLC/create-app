const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// NativeWind requires Tailwind v3 (installed locally in this package)
module.exports = withNativeWind(config, {
  input: "./global.css",
});

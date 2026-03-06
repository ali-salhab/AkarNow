const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "crypto") {
    // Return an empty module for crypto requests
    return {
      filePath: require.resolve("expo-modules-core"), // Just a placeholder
      type: "empty",
    };
  }
  if (moduleName === "axios") {
    // Force axios to resolve to the browser build
    return {
      filePath: require.resolve("axios/dist/browser/axios.cjs"),
      type: "sourceFile",
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: "./global.css" });

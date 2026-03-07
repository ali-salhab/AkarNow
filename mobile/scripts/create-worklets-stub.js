/**
 * Creates a stub for `react-native-worklets` that redirects to
 * `react-native-worklets-core`. This is needed because newer versions of
 * `react-native-css-interop` reference `react-native-worklets/plugin`
 * but we use `react-native-worklets-core`.
 */
const fs = require("fs");
const path = require("path");

const stubDir = path.join(
  __dirname,
  "..",
  "node_modules",
  "react-native-worklets",
);
const pluginDir = path.join(stubDir, "plugin");

fs.mkdirSync(pluginDir, { recursive: true });

fs.writeFileSync(
  path.join(stubDir, "package.json"),
  JSON.stringify(
    { name: "react-native-worklets", version: "1.0.0", main: "index.js" },
    null,
    2,
  ),
);

fs.writeFileSync(path.join(stubDir, "index.js"), "");

fs.writeFileSync(
  path.join(pluginDir, "index.js"),
  'module.exports = require("react-native-worklets-core/plugin");\n',
);

console.log(
  "✓ Created react-native-worklets stub -> react-native-worklets-core",
);

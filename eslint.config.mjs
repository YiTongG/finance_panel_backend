import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";

export default [
  {
    files: ["**/*.{js,cjs,jsx}"], // Applies rules to your CommonJS project files
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node, // Important: Tells ESLint to recognize Node.js globals like 'require' in your project
      },
    },
  },
  js.configs.recommended,
  pluginReact.configs.flat.recommended,
];
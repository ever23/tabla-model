const js = require("@eslint/js");
const globals = require("globals");

module.exports = [
    js.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 2024,
            sourceType: "module",
            globals: {
                ...globals.node,
                ...globals.browser
            }
        },
        rules: {
            "indent": ["error", 4],
            "linebreak-style": ["error", "windows"],
            "quotes": ["error", "double"],
            "semi": ["error", "never"]
        }
    }
];

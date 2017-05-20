module.exports = {
    env: {
        node: true,
        browser: true
    },
    extends: 'eslint:recommended',
    parserOptions: {
        sourceType: 'module'
    },
    rules: {
        'no-trailing-spaces': ['warn', {
            skipBlankLines: false
        }],

        'no-whitespace-before-property': ['warn'],

        'comma-spacing': ['warn', {
            before: false,
            after: true
        }],

        'space-infix-ops': ['warn'],

        'indent': ['warn', 4, {
            SwitchCase: 1
        }],

        'brace-style': ["warn", "stroustrup", {
            allowSingleLine: true
        }],

        'no-multiple-empty-lines': ['warn'],

        'semi-spacing': ['warn', {
            before: false,
            after: true
        }],

        'no-use-before-define': ['error', {
            functions: false,
            classes: true
        }],

        semi: [ 'error', 'always' ]
    }
};

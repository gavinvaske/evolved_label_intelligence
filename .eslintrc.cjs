const requiredNumberOfSpaces = 4;

module.exports = {
    'ignorePatterns': ['/build', 'application/react/*'],
    'env' : {
        'browser' : true,
        'node' : true,
        'es6' : true
    },
    'parserOptions': {
        'sourceType': 'module',
    },
    'parser': '@babel/eslint-parser',
    'rules': {
        'semi': ['error', 'always'],
        'quotes': ['error', 'single'],
        'complexity': ['error', {'max': 8 }],
        'eqeqeq': ['error', 'always', {'null': 'ignore'}],
        'no-magic-numbers': ['error', {
            'ignore': [-1, 0, 1, 2], 
            'ignoreArrayIndexes': true 
        }],
        'no-multi-spaces': 'error',
        'no-unused-vars': 'error',
        'keyword-spacing': ['error', { 
            'before': true,
            'after': true 
        }],
        'indent': ['error', requiredNumberOfSpaces]
    }
};
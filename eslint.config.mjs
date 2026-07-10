import eslint from '@eslint/js';

// Use dynamic import to gracefully handle typescript-eslint incompatibility
// with newer TypeScript versions until typescript-eslint adds support.
let tseslint = undefined;
try {
    ({ default: tseslint } = await import('typescript-eslint'));
} catch {
    // typescript-eslint is not compatible with the installed TypeScript version.
    // Fall back to basic ESLint rules only.
}

const commonIgnores = { ignores: ['out/**', 'node_modules/**', '**/*.d.ts'] };

const commonRules = {
    curly: 'warn',
    eqeqeq: 'warn',
    'no-throw-literal': 'warn',
    semi: 'warn'
};

export default tseslint
    ? tseslint.config(
        eslint.configs.recommended,
        ...tseslint.configs.recommended,
        commonIgnores,
        {
            rules: {
                '@typescript-eslint/naming-convention': [
                    'warn',
                    {
                        selector: 'import',
                        format: ['camelCase', 'PascalCase']
                    }
                ],
                ...commonRules
            }
        }
    )
    : [eslint.configs.recommended, commonIgnores, { rules: commonRules }];

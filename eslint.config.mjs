import antfu from '@antfu/eslint-config';

export default antfu(
  {
    stylistic: {
      semi: true,
    },
  },
  {
    ignores: ['dika/**', '.output/**', '.nuxt/**', 'dist/**'],
  },
  {
    // New in @antfu/eslint-config 10: would reflow ~930 lines across the codebase; keep the
    // existing style until a dedicated formatting change.
    rules: { 'antfu/reasonable-newline': 'off' },
  },
);

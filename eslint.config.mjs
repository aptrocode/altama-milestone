import antfu from '@antfu/eslint-config';

export default antfu({
  ignores: [
    'standalone/**',
  ],
  stylistic: {
    semi: true,
  },
});

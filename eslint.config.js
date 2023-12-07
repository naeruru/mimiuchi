const antfu = require('@antfu/eslint-config').default

module.exports = antfu({
  rules: {
    'vue/block-order': ['error', {
      order: [['template', 'script'], 'style'],
    }],
    'no-console': 'off',
  },
})

// @ts-check
import antfu from '@antfu/eslint-config'

export default antfu({
  rules: {
    'vue/block-order': ['error', {
      order: [['template', 'script'], 'style'],
    }],
    'no-console': 'off',
    'curly': 0,
    'antfu/if-newline': 0,
  },
})

import { type Config } from 'tailwindcss'
import plugin from 'tailwindcss/plugin'
import postcss from 'postcss'
import postcssJs from 'postcss-js'

import clampGenerator from './src/css-utils/clamp-generator'
import tokensToTailwind from './src/css-utils/tokens-to-tailwind'

// Raw design tokens
import colorTokens from './src/design-tokens/colors.json'
import fontTokens from './src/design-tokens/fonts.json'
import spacingTokens from './src/design-tokens/spacing.json'
import textSizeTokens from './src/design-tokens/text-sizes.json'
import textLeadingTokens from './src/design-tokens/text-leading.json'
import textWeightTokens from './src/design-tokens/text-weights.json'
import viewportTokens from './src/design-tokens/viewports.json'

// Process design tokens
const colors = tokensToTailwind(colorTokens.items)
const fontFamily = tokensToTailwind(fontTokens.items)
const fontWeight = tokensToTailwind(textWeightTokens.items)
const fontSize = tokensToTailwind(clampGenerator(textSizeTokens.items))
const lineHeight = tokensToTailwind(textLeadingTokens.items)
const spacing = tokensToTailwind(clampGenerator(spacingTokens.items))

const tailwindConfig: Config = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  safelist: [],
  theme: {
    screens: {
      sm: `${viewportTokens.sm}px`,
      md: `${viewportTokens.md}px`,
      lg: `${viewportTokens.lg}px`,
      xl: `${viewportTokens.xl}px`,
    },
    colors,
    spacing: () => ({
      '0': '0',
      px: '1px',
      ...spacing,
    }),
    fontSize,
    lineHeight,
    fontFamily,
    fontWeight,
    backgroundColor: ({ theme }) => theme('colors'),
    textColor: ({ theme }) => theme('colors'),
    margin: ({ theme }) => ({
      auto: 'auto',
      ...theme('spacing'),
    }),
    padding: ({ theme }) => ({
      ...theme('spacing'),
    }),
  },
  variantOrder: [
    'first',
    'last',
    'odd',
    'even',
    'visited',
    'checked',
    'empty',
    'read-only',
    'group-hover',
    'group-focus',
    'focus-within',
    'hover',
    'focus',
    'focus-visible',
    'active',
    'disabled',
  ],
  corePlugins: {
    preflight: false,
    textOpacity: false,
    backgroundOpacity: false,
    borderOpacity: false,
  },
  blocklist: ['container'],
  // Remove empty custom properties
  // experimental: {
  //   optimizeUniversalDefaults: true,
  // },
  // Add custom properties from the design-tokens to the root element
  plugins: [
    plugin(function ({ addComponents, config }) {
      let result = ''

      const currentConfig = config()

      const groups = [
        { key: 'colors', prefix: 'color' },
        { key: 'spacing', prefix: 'space' },
        { key: 'fontSize', prefix: 'size' },
        { key: 'lineHeight', prefix: 'leading' },
        { key: 'fontFamily', prefix: 'font' },
        { key: 'fontWeight', prefix: 'font' },
      ]

      groups.forEach(({ key, prefix }) => {
        const group = currentConfig?.theme?.[key]

        if (!group) {
          return
        }

        Object.keys(group).forEach((key) => {
          result += `--${prefix}-${key}: ${group[key]};`
        })
      })

      addComponents({
        ':root': postcssJs.objectify(postcss.parse(result)),
      })
    }),

    plugin(function ({ addUtilities, config }) {
      const currentConfig = config()
      const customUtilities = [
        { key: 'spacing', prefix: 'flow-space', property: '--flow-space' },
        { key: 'spacing', prefix: 'region-space', property: '--region-space' },
        { key: 'spacing', prefix: 'gutter', property: '--gutter' },
      ]

      customUtilities.forEach(({ key, prefix, property }) => {
        const group = currentConfig?.theme?.[key]

        if (!group) {
          return
        }

        Object.keys(group).forEach((key) => {
          addUtilities({
            [`.${prefix}-${key}`]: postcssJs.objectify(postcss.parse(`${property}: ${group[key]}`)),
          })
        })
      })
    }),
  ],
}

export default tailwindConfig

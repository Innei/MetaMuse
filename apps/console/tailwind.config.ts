import { nextui } from '@nextui-org/react'
import { withTV } from 'tailwind-variants/transformer'
import { PluginAPI } from 'tailwindcss/types/config'

import { addDynamicIconSelectors } from '@iconify/tailwind'
import typography from '@tailwindcss/typography'

import { Config } from 'tailwindcss'

const twConfig: Config = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  safelist: [],
  theme: {
    extend: {
      screens: {
        'light-mode': { raw: '(prefers-color-scheme: light)' },
        'dark-mode': { raw: '(prefers-color-scheme: dark)' },

        'w-screen': '100vw',
        'h-screen': '100vh',
      },
      maxWidth: {
        screen: '100vw',
      },
      width: {
        screen: '100vw',
      },
      height: {
        screen: '100vh',
      },
      maxHeight: {
        screen: '100vh',
      },
    },
  },

  daisyui: {
    themes: ['cupcake', 'night', 'valentine'],
    darkTheme: 'night',
  },

  plugins: [
    addDynamicIconSelectors(),
    addShortcutPlugin,

    typography,
    // daisyui,
    nextui(),
    require('tailwind-scrollbar'),
  ],
}

function addShortcutPlugin({ addUtilities }: PluginAPI) {
  const styles = {
    '.content-auto': {
      'content-visibility': 'auto',
    },
    '.shadow-out-sm': {
      'box-shadow':
        '0 0 10px rgb(120 120 120 / 10%), 0 5px 20px rgb(120 120 120 / 20%)',
    },
    '.backface-hidden': {
      '-webkit-backface-visibility': 'hidden',
      '-moz-backface-visibility': 'hidden',
      '-webkit-transform': 'translate3d(0, 0, 0)',
      '-moz-transform': 'translate3d(0, 0, 0)',
    },
    '.center': {
      'align-items': 'center',
      'justify-content': 'center',
    },
    '.fill-content': {
      'min-height': `calc(100vh - 17.5rem)`,
    },
  }
  addUtilities(styles)
}

export default withTV(twConfig)

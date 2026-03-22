import type { AppTheme } from '@/types/models'

export const DEFAULT_THEME: AppTheme = 'Mist'

export const THEME_OPTIONS: Array<{
  name: AppTheme
  description: string
  preview: {
    background: string
    primary: string
    accent: string
    border: string
  }
}> = [
  {
    name: 'Mist',
    description: 'Cool and airy with soft blue-grey depth.',
    preview: {
      background: '214 35% 97%',
      primary: '215 29% 44%',
      accent: '205 48% 92%',
      border: '215 23% 88%',
    },
  },
  {
    name: 'Sage',
    description: 'Muted green with a grounded, restorative feel.',
    preview: {
      background: '106 21% 96%',
      primary: '135 18% 39%',
      accent: '104 28% 88%',
      border: '110 17% 85%',
    },
  },
  {
    name: 'Sky',
    description: 'Soft horizon blues with crisp contrast.',
    preview: {
      background: '207 46% 96%',
      primary: '205 45% 47%',
      accent: '199 54% 88%',
      border: '205 28% 86%',
    },
  },
  {
    name: 'Peach',
    description: 'Warm light with a quiet apricot glow.',
    preview: {
      background: '28 55% 96%',
      primary: '18 48% 52%',
      accent: '20 62% 88%',
      border: '24 36% 86%',
    },
  },
  {
    name: 'Lilac',
    description: 'Powdered violet, elegant and understated.',
    preview: {
      background: '265 32% 96%',
      primary: '267 28% 48%',
      accent: '276 38% 89%',
      border: '267 22% 87%',
    },
  },
  {
    name: 'Rose',
    description: 'Soft blush tones with a premium warmth.',
    preview: {
      background: '342 38% 96%',
      primary: '341 34% 48%',
      accent: '342 45% 89%',
      border: '340 27% 87%',
    },
  },
  {
    name: 'Sand',
    description: 'A tactile neutral palette with calm weight.',
    preview: {
      background: '40 28% 95%',
      primary: '34 28% 42%',
      accent: '40 32% 87%',
      border: '38 22% 84%',
    },
  },
  {
    name: 'Slate',
    description: 'Quiet mineral greys with balanced contrast.',
    preview: {
      background: '220 20% 95%',
      primary: '221 15% 38%',
      accent: '218 19% 86%',
      border: '220 14% 84%',
    },
  },
]

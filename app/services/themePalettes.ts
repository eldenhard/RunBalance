import type { AppColorThemeId } from '~/types/profile'

export type AppThemePalette = {
  id: AppColorThemeId
  name: string
  description: string
  primary: string
  primarySoft: string
  secondary: string
  sport: string
  marker: string
  heroFrom: string
  heroVia: string
  heroTo: string
  darkGlow: string
}

export const appThemePalettes: AppThemePalette[] = [
  {
    id: 'runbalance',
    name: 'RunBalance',
    description: 'лайм, небо, оранжевый',
    primary: '#b9ff38',
    primarySoft: '#f3ffd8',
    secondary: '#64c7ff',
    sport: '#ff7a2b',
    marker: '#ff3b30',
    heroFrom: '#f3ffd8',
    heroVia: '#eaf8ff',
    heroTo: '#fff0e6',
    darkGlow: 'rgba(185,255,56,0.24)'
  },
  {
    id: 'velocity',
    name: 'Velocity',
    description: 'красный, лед, графит',
    primary: '#ff4d3d',
    primarySoft: '#fff0ee',
    secondary: '#7dd3fc',
    sport: '#ff8a3d',
    marker: '#ff2d20',
    heroFrom: '#fff0ee',
    heroVia: '#eef9ff',
    heroTo: '#fff5e8',
    darkGlow: 'rgba(255,77,61,0.25)'
  },
  {
    id: 'aero',
    name: 'Aero',
    description: 'синий, мята, лайм',
    primary: '#45c8ff',
    primarySoft: '#e9f8ff',
    secondary: '#61e6b5',
    sport: '#b9ff38',
    marker: '#008cff',
    heroFrom: '#e9f8ff',
    heroVia: '#eafbf3',
    heroTo: '#f5ffd9',
    darkGlow: 'rgba(69,200,255,0.24)'
  },
  {
    id: 'ember',
    name: 'Ember',
    description: 'оранжевый, янтарь, крем',
    primary: '#ff8a1f',
    primarySoft: '#fff1e3',
    secondary: '#ffd166',
    sport: '#ff4d3d',
    marker: '#ff5a00',
    heroFrom: '#fff1e3',
    heroVia: '#fff8db',
    heroTo: '#ffece8',
    darkGlow: 'rgba(255,138,31,0.24)'
  },
  {
    id: 'volt',
    name: 'Volt',
    description: 'кислотный лайм, бирюза',
    primary: '#d7ff2f',
    primarySoft: '#f7ffd7',
    secondary: '#32e6d1',
    sport: '#ff6a2a',
    marker: '#ef233c',
    heroFrom: '#f7ffd7',
    heroVia: '#e4fffb',
    heroTo: '#fff0e8',
    darkGlow: 'rgba(215,255,47,0.26)'
  },
  {
    id: 'graphite',
    name: 'Graphite',
    description: 'чёрный, салатовый, серый',
    primary: '#111111',
    primarySoft: '#eeeeea',
    secondary: '#b9ff38',
    sport: '#64c7ff',
    marker: '#ff3b30',
    heroFrom: '#f7f7f3',
    heroVia: '#eef8ea',
    heroTo: '#eef7ff',
    darkGlow: 'rgba(185,255,56,0.18)'
  }
]

export const defaultAppThemePalette = appThemePalettes[0]!

export function getAppThemePalette(id?: AppColorThemeId) {
  return appThemePalettes.find((palette) => palette.id === id) ?? defaultAppThemePalette
}

export function getAppThemeCssVars(palette: AppThemePalette) {
  return {
    '--theme-primary': palette.primary,
    '--theme-primary-soft': palette.primarySoft,
    '--theme-secondary': palette.secondary,
    '--theme-sport': palette.sport,
    '--theme-marker': palette.marker,
    '--theme-hero-from': palette.heroFrom,
    '--theme-hero-via': palette.heroVia,
    '--theme-hero-to': palette.heroTo,
    '--theme-dark-glow': palette.darkGlow
  }
}

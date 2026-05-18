import type { HeartRateSourceState } from '~/types/heart-rate'

export const iosSafariPwaHeartRateUnavailable: HeartRateSourceState = {
  kind: 'none',
  status: 'unavailable',
  message: 'Live pulse is unavailable in iOS Safari PWA. Capacitor BLE support is planned for a later phase.'
}


export type HeartRateSourceStatus = 'unavailable' | 'manual' | 'mock' | 'connected' | 'disconnected'

export type HeartRateZone = {
  id: string
  name: string
  minBpm: number
  maxBpm: number
}

export type HeartRateSourceKind = 'none' | 'manual' | 'mock' | 'webBluetooth' | 'capacitorPolarH10'

export type HeartRateReading = {
  bpm: number
  recordedAt: string
  source: HeartRateSourceKind
}

export type HeartRateSourceState = {
  kind: HeartRateSourceKind
  status: 'unavailable' | 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error'
  latestReading?: HeartRateReading
  message: string
}


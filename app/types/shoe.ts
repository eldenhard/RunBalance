export type ShoeStatus = 'active' | 'replace_soon' | 'retired'

export type Shoe = {
  id: string
  name: string
  brand?: string
  model?: string
  startedAt?: string
  mileageKm: number
  resourceKm: number
  status: ShoeStatus
}


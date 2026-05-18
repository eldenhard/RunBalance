import type { Shoe, ShoeStatus } from '~/types/shoe'

type MileageInput = Pick<Shoe, 'mileageKm' | 'resourceKm'>

export function getShoeWearPercent(shoe: MileageInput) {
  if (shoe.resourceKm <= 0) return 100
  return Math.min(100, Math.round((shoe.mileageKm / shoe.resourceKm) * 100))
}

export function getShoeStatus(shoe: MileageInput): ShoeStatus {
  const wearPercent = getShoeWearPercent(shoe)
  if (wearPercent >= 100) return 'retired'
  if (wearPercent >= 85) return 'replace_soon'
  return 'active'
}

export function addWorkoutDistanceToShoe(shoe: Shoe, distanceKm: number): Shoe {
  const nextMileageKm = Number((shoe.mileageKm + distanceKm).toFixed(2))
  return {
    ...shoe,
    mileageKm: nextMileageKm,
    status: getShoeStatus({ mileageKm: nextMileageKm, resourceKm: shoe.resourceKm })
  }
}


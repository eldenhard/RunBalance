import { describe, expect, it } from 'vitest'
import { addWorkoutDistanceToShoe, getShoeStatus, getShoeWearPercent } from '~/services/shoes'

describe('shoe mileage helpers', () => {
  it('calculates wear percent', () => {
    expect(getShoeWearPercent({ mileageKm: 320, resourceKm: 800 })).toBe(40)
  })

  it('marks shoes near replacement', () => {
    expect(getShoeStatus({ mileageKm: 720, resourceKm: 800 })).toBe('replace_soon')
  })

  it('retires shoes over resource', () => {
    expect(getShoeStatus({ mileageKm: 810, resourceKm: 800 })).toBe('retired')
  })

  it('adds workout distance and recalculates status', () => {
    const shoe = {
      id: 'shoe-1',
      name: 'Daily Trainer',
      mileageKm: 700,
      resourceKm: 800,
      status: 'active' as const
    }

    expect(addWorkoutDistanceToShoe(shoe, 25)).toMatchObject({
      mileageKm: 725,
      status: 'replace_soon'
    })
  })
})


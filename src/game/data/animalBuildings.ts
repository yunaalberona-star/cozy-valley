import type { AnimalBuildingDef, AnimalBuildingId, AnimalTypeId } from '../types'

/** Each animal lives in its own building — Family Farm style. Add more later. */
export const ANIMAL_BUILDINGS: Record<AnimalBuildingId, AnimalBuildingDef> = {
  chicken_coop: {
    id: 'chicken_coop',
    name: 'Chicken Coop',
    emoji: '🐔',
    blurb: 'Clucking hens lay fresh eggs.',
    animalTypeId: 'chicken',
  },
  duck_pond: {
    id: 'duck_pond',
    name: 'Duck Pond',
    emoji: '🦆',
    blurb: 'Ducks paddle and lay extra-large eggs.',
    animalTypeId: 'duck',
  },
  cow_barn: {
    id: 'cow_barn',
    name: 'Cow Barn',
    emoji: '🐄',
    blurb: 'Milking cows for dairy goods.',
    animalTypeId: 'cow',
  },
  goat_pen: {
    id: 'goat_pen',
    name: 'Goat Pen',
    emoji: '🐐',
    blurb: 'Playful goats give tangy milk.',
    animalTypeId: 'goat',
  },
  sheep_pasture: {
    id: 'sheep_pasture',
    name: 'Sheep Pasture',
    emoji: '🐑',
    blurb: 'Grazing sheep grow soft wool.',
    animalTypeId: 'sheep',
  },
  bee_apiary: {
    id: 'bee_apiary',
    name: 'Bee Apiary',
    emoji: '🐝',
    blurb: 'Busy hives drip golden honey.',
    animalTypeId: 'bee',
  },
  pig_sty: {
    id: 'pig_sty',
    name: 'Pig Sty',
    emoji: '🐷',
    blurb: 'Happy pigs mean savory bacon.',
    animalTypeId: 'pig',
  },
}

export const ANIMAL_BUILDING_LIST = Object.values(ANIMAL_BUILDINGS)

export function buildingForAnimal(typeId: AnimalTypeId): AnimalBuildingId {
  const found = ANIMAL_BUILDING_LIST.find((b) => b.animalTypeId === typeId)
  if (!found) throw new Error(`No building for animal ${typeId}`)
  return found.id
}

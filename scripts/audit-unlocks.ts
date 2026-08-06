/**
 * Validates unlock level consistency across crops, trees, buildings, gear workshops.
 */
import { ANIMAL_BUILDINGS } from '../src/game/data/animalBuildings'
import { BUILDINGS } from '../src/game/data/buildings'
import { CROPS } from '../src/game/data/crops'
import { GEAR_BUILDINGS } from '../src/game/data/gear'
import {
  ALL_LEVEL_UNLOCKS,
  BUILDING_LEVEL_UNLOCKS,
  FEATURE_LEVEL_UNLOCKS,
  buildingUnlockLevel,
} from '../src/game/data/levelUnlocks'
import { TREES, treeProductLevel } from '../src/game/data/trees'
import { ANIMALS } from '../src/game/data/animals'
import { ADVENTURES, TAVERN_UNLOCK_LEVEL } from '../src/game/data/adventures'
import type { BuildingId, UnlockId } from '../src/game/types'

const issues: string[] = []

function issue(msg: string) {
  issues.push(msg)
}

// Every machine building must appear in BUILDING_LEVEL_UNLOCKS
for (const id of Object.keys(BUILDINGS) as BuildingId[]) {
  const lvl = buildingUnlockLevel(id)
  if (lvl >= 99) issue(`machine '${id}' not in level unlocks`)
}

for (const id of Object.keys(ANIMAL_BUILDINGS)) {
  const lvl = buildingUnlockLevel(id as UnlockId)
  if (lvl >= 99) issue(`animal building '${id}' not in level unlocks`)
}

for (const id of Object.keys(GEAR_BUILDINGS)) {
  const lvl = buildingUnlockLevel(id as UnlockId)
  if (lvl >= 99) issue(`gear workshop '${id}' not in level unlocks`)
}

// No duplicate unlock ids at different levels
const unlockLevels = new Map<string, number>()
for (const entry of ALL_LEVEL_UNLOCKS) {
  for (const id of entry.ids) {
    const prev = unlockLevels.get(id)
    if (prev != null && prev !== entry.level) {
      issue(`'${id}' unlock L${prev} and L${entry.level}`)
    }
    unlockLevels.set(id, entry.level)
  }
}

// Animal building unlock should match or precede animal availability
for (const animal of Object.values(ANIMALS)) {
  const bLvl = buildingUnlockLevel(animal.buildingId)
  if (bLvl >= 99) {
    issue(`animal '${animal.id}' building '${animal.buildingId}' not unlocked by level`)
  }
}

// Tree unlock levels sorted consistently
for (const tree of Object.values(TREES)) {
  const prodLvl = treeProductLevel(tree.product)
  if (prodLvl !== tree.unlockLevel) {
    issue(`tree '${tree.id}' unlock L${tree.unlockLevel} vs product L${prodLvl}`)
  }
}

// Adventures at or after tavern level
for (const adv of ADVENTURES) {
  if (adv.unlockLevel < TAVERN_UNLOCK_LEVEL) {
    issue(
      `adventure '${adv.id}' unlock L${adv.unlockLevel} < tavern L${TAVERN_UNLOCK_LEVEL}`,
    )
  }
}

// BUILDING_LEVEL_UNLOCKS should be sorted (informational — duplicates in ids array ok)
const buildingUnlockIds = new Set<string>()
for (const entry of BUILDING_LEVEL_UNLOCKS) {
  for (const id of entry.ids) {
    if (buildingUnlockIds.has(id)) {
      issue(`duplicate building unlock entry '${id}' in BUILDING_LEVEL_UNLOCKS`)
    }
    buildingUnlockIds.add(id)
  }
}

// Feature unlocks: tavern bundle
const tavernEntry = FEATURE_LEVEL_UNLOCKS.find(
  (e) => e.level === TAVERN_UNLOCK_LEVEL,
)
if (!tavernEntry?.ids.includes('tavern')) {
  issue('tavern not in FEATURE_LEVEL_UNLOCKS at TAVERN_UNLOCK_LEVEL')
}
if (!tavernEntry?.ids.includes('smithy')) {
  issue('smithy not bundled with tavern unlock')
}

// Crop unlock levels monotonic check — warn if same level has many (not an error)
for (const crop of Object.values(CROPS)) {
  if (crop.unlockLevel < 1) issue(`crop '${crop.id}' unlockLevel < 1`)
  if (crop.seedCost <= 0) issue(`crop '${crop.id}' seedCost <= 0`)
  if (crop.harvestQty <= 0) issue(`crop '${crop.id}' harvestQty <= 0`)
}

console.log(`=== audit-unlocks (${issues.length} issues) ===`)
for (const x of issues) console.log(`  ${x}`)
process.exit(issues.length > 0 ? 1 : 0)

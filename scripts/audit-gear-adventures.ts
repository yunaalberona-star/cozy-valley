/**
 * Validates gear blueprints and adventure reward references.
 */
import { ADVENTURES } from '../src/game/data/adventures'
import { ITEM_META } from '../src/game/data/buildings'
import { GEAR_BLUEPRINTS, GEAR_BUILDINGS, MATERIAL_META } from '../src/game/data/gear'
import { buildingUnlockLevel } from '../src/game/data/levelUnlocks'
import { CROPS } from '../src/game/data/crops'

const issues: string[] = []

function issue(msg: string) {
  issues.push(msg)
}

function isValidResource(id: string): boolean {
  return id in ITEM_META || id in MATERIAL_META || id in CROPS
}

const bpIds = new Set<string>()

for (const bp of GEAR_BLUEPRINTS) {
  if (bpIds.has(bp.id)) issue(`duplicate blueprint '${bp.id}'`)
  bpIds.add(bp.id)

  if (!(bp.buildingId in GEAR_BUILDINGS)) {
    issue(`blueprint '${bp.id}' unknown workshop '${bp.buildingId}'`)
  }

  const wLvl = buildingUnlockLevel(bp.buildingId)
  if (wLvl >= 99) issue(`blueprint '${bp.id}' workshop not in level unlocks`)

  if (Object.keys(bp.inputs).length === 0) {
    issue(`blueprint '${bp.id}' has no inputs`)
  }

  for (const [id, qty] of Object.entries(bp.inputs)) {
    if (!isValidResource(id)) {
      issue(`blueprint '${bp.id}' unknown input '${id}'`)
    }
    if ((qty ?? 0) <= 0) issue(`blueprint '${bp.id}' input '${id}' qty <= 0`)
  }

  if (bp.craftMs <= 0) issue(`blueprint '${bp.id}' craftMs <= 0`)
  if (bp.stats.attack < 0 || bp.stats.defense < 0 || bp.stats.hp < 0) {
    issue(`blueprint '${bp.id}' negative stats`)
  }
}

for (const adv of ADVENTURES) {
  if (adv.durationMs <= 0) issue(`adventure '${adv.id}' duration <= 0`)
  if (adv.minPower < 0) issue(`adventure '${adv.id}' minPower < 0`)

  if (adv.rewardItems) {
    for (const id of Object.keys(adv.rewardItems)) {
      if (!(id in ITEM_META)) {
        issue(`adventure '${adv.id}' reward item '${id}' invalid`)
      }
    }
  }
  if (adv.rewardMaterials) {
    for (const id of Object.keys(adv.rewardMaterials)) {
      if (!(id in MATERIAL_META)) {
        issue(`adventure '${adv.id}' reward material '${id}' invalid`)
      }
    }
  }
}

console.log(`=== audit-gear-adventures (${issues.length} issues) ===`)
for (const x of issues) console.log(`  ${x}`)
process.exit(issues.length > 0 ? 1 : 0)

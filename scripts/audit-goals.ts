/**
 * Validates daily/weekly goal templates reference real items and materials.
 */
import { ITEM_META, RECIPES } from '../src/game/data/buildings'
import { CROPS } from '../src/game/data/crops'
import { GEAR_BLUEPRINTS, MATERIAL_META } from '../src/game/data/gear'
import { treeForProduct } from '../src/game/data/trees'
import { ANIMALS } from '../src/game/data/animals'
import { ADVENTURES } from '../src/game/data/adventures'
import { DAILY_POOL, WEEKLY_POOL } from '../src/game/data/scheduledGoals'
import type { ItemId, MissionGoalKind } from '../src/game/types'

const issues: string[] = []

function issue(msg: string) {
  issues.push(msg)
}

function validateTarget(
  kind: MissionGoalKind,
  target: string | undefined,
  id: string,
) {
  if (
    kind === 'fulfill_order' ||
    kind === 'own_coins' ||
    kind === 'recruit' ||
    kind === 'complete_adventure' ||
    kind === 'craft_gear' ||
    kind === 'buy_animal'
  ) {
    if (kind === 'complete_adventure' && target) {
      if (!ADVENTURES.find((a) => a.id === target)) {
        issue(`goal '${id}' unknown adventure '${target}'`)
      }
    }
    if (kind === 'buy_animal' && target && !(target in ANIMALS)) {
      issue(`goal '${id}' unknown animal '${target}'`)
    }
    if (
      kind === 'craft_gear' &&
      target &&
      !GEAR_BLUEPRINTS.find((b) => b.id === target)
    ) {
      issue(`goal '${id}' unknown blueprint '${target}'`)
    }
    return
  }

  if (!target) {
    issue(`goal '${id}' kind '${kind}' missing target`)
    return
  }

  switch (kind) {
    case 'harvest': {
      const tree = treeForProduct(target as ItemId)
      const inCrops = target in CROPS
      if (!tree && !inCrops && !(target in ITEM_META)) {
        issue(`goal '${id}' harvest target '${target}' invalid`)
      }
      break
    }
    case 'craft':
      if (!(target in ITEM_META) && !RECIPES.find((r) => r.output === target)) {
        issue(`goal '${id}' craft target '${target}' invalid`)
      }
      break
    case 'collect_animal':
      if (!Object.values(ANIMALS).some((a) => a.product === target)) {
        issue(`goal '${id}' collect_animal target '${target}' invalid`)
      }
      break
    case 'gather_material':
    case 'own_material':
      if (!(target in MATERIAL_META)) {
        issue(`goal '${id}' material '${target}' not in MATERIAL_META`)
      }
      break
    default:
      break
  }
}

for (const t of [...DAILY_POOL, ...WEEKLY_POOL]) {
  validateTarget(t.kind, t.target, t.id)
  if (t.minLevel < 1) issue(`goal '${t.id}' minLevel < 1`)
  if (t.amount < 1) issue(`goal '${t.id}' amount < 1`)
}

console.log(`=== audit-goals (${issues.length} issues) ===`)
for (const x of issues) console.log(`  ${x}`)
process.exit(issues.length > 0 ? 1 : 0)

import { MISSIONS, MISSION_BY_ID } from '../src/game/data/missions'
import {
  missionRequiredLevel,
  pickNextMission,
  findNextMissionInChain,
} from '../src/game/data/missionChain'
import { CROPS } from '../src/game/data/crops'
import { TREE_LIST, treeForProduct, TREES, isTreeProduct } from '../src/game/data/trees'
import { RECIPES, ITEM_META } from '../src/game/data/buildings'
import { ANIMALS } from '../src/game/data/animals'
import { GEAR_BLUEPRINTS } from '../src/game/data/gear'
import { ADVENTURES } from '../src/game/data/adventures'
import { MATERIAL_META } from '../src/game/data/gear'
import { recipeUnlockLevel } from '../src/game/data/unlockOrder'
import { buildingUnlockLevel } from '../src/game/data/levelUnlocks'
import type { ItemId, MissionGoal } from '../src/game/types'

function validateGoal(goal: MissionGoal, missionMinLevel: number): string[] {
  const issues: string[] = []
  const target = goal.target
  switch (goal.kind) {
    case 'harvest': {
      if (!target) {
        issues.push('harvest missing target')
        break
      }
      const treeId = treeForProduct(target as ItemId)
      const inCrops = target in CROPS
      if (!treeId && !inCrops && !(target in ITEM_META)) {
        issues.push(`harvest target '${target}' not found`)
      }
      if (treeId && inCrops && isTreeProduct(target as ItemId)) {
        const cropLvl = CROPS[target as keyof typeof CROPS].unlockLevel
        const treeLvl = TREES[treeId].unlockLevel
        if (cropLvl !== treeLvl) {
          issues.push(
            `duplicate '${target}': crop L${cropLvl} vs tree L${treeLvl}`,
          )
        }
      }
      break
    }
    case 'craft': {
      if (!target) {
        issues.push('craft missing target')
        break
      }
      if (!(target in ITEM_META)) {
        issues.push(`craft '${target}' not in ITEM_META`)
      }
      const recipe = RECIPES.find((r) => r.output === target)
      if (!recipe) {
        issues.push(`craft '${target}' has no recipe`)
      } else {
        const rLvl = Math.max(
          recipeUnlockLevel(recipe.id),
          buildingUnlockLevel(recipe.buildingId),
        )
        if (rLvl > missionMinLevel) {
          issues.push(
            `craft '${target}' needs L${rLvl} but mission minLevel ${missionMinLevel}`,
          )
        }
      }
      break
    }
    case 'buy_animal': {
      if (!target || !ANIMALS[target as keyof typeof ANIMALS]) {
        issues.push(`buy_animal invalid '${target}'`)
      }
      break
    }
    case 'gather_material':
    case 'own_material': {
      if (!target || !(target in MATERIAL_META)) {
        issues.push(`material '${target}' not in MATERIAL_META`)
      }
      break
    }
    case 'craft_gear': {
      if (target && !GEAR_BLUEPRINTS.find((b) => b.id === target)) {
        issues.push(`gear blueprint '${target}' not found`)
      }
      break
    }
    case 'complete_adventure': {
      const adv = ADVENTURES.find((a) => a.id === target)
      if (!adv) {
        issues.push(`adventure '${target}' not found`)
      } else if (adv.unlockLevel > missionMinLevel) {
        issues.push(
          `adventure '${target}' unlocks L${adv.unlockLevel} but minLevel ${missionMinLevel}`,
        )
      }
      break
    }
    default:
      break
  }
  return issues
}

const allIssues: { id: string; goal?: string; issue: string }[] = []

for (let i = 0; i < MISSIONS.length; i++) {
  const m = MISSIONS[i]!
  const reqLvl = missionRequiredLevel(m.goals)
  const effective = m.minLevel ?? 1
  const seqNote = m.parallel ? ' [parallel]' : ''
  console.log(
    `${String(i + 1).padStart(3)}. ${m.id} | ${m.name} | minL=${effective} reqGoals=${reqLvl}${seqNote}`,
  )
  if (effective < reqLvl) {
    allIssues.push({
      id: m.id,
      issue: `minLevel ${effective} < missionRequiredLevel ${reqLvl}`,
    })
  }
  for (const g of m.goals) {
    for (const issue of validateGoal(g, effective)) {
      allIssues.push({ id: m.id, goal: g.id, issue })
    }
  }
  if (m.requires && !MISSION_BY_ID[m.requires]) {
    allIssues.push({
      id: m.id,
      issue: `requires unknown '${m.requires}'`,
    })
  }
}

let prev: string | null = null
for (const m of MISSIONS.filter((x) => !x.parallel)) {
  if (prev && m.requires !== prev) {
    allIssues.push({
      id: m.id,
      issue: `requires '${m.requires}' expected '${prev}'`,
    })
  }
  prev = m.id
}

const completed = [
  'm1_first_sprouts',
  'm2_windmill',
  'm3_coop',
  'm4_dairy_lane',
  'm5_fresh_loaves',
  'm6_pressed',
  'm7_sweet_jar',
]
console.log('\n=== UI L14 after m7 ===')
console.log(
  'findNext:',
  findNextMissionInChain(completed, MISSIONS)?.id,
  findNextMissionInChain(completed, MISSIONS)?.name,
)
console.log('pickNext L14:', pickNextMission(completed, 14, MISSIONS)?.id ?? 'none')
console.log('pickNext L15:', pickNextMission(completed, 15, MISSIONS)?.id ?? 'none')

console.log(`\n=== ISSUES (${allIssues.length}) ===`)
for (const x of allIssues) {
  console.log(`[${x.id}] ${x.goal ? x.goal + ': ' : ''}${x.issue}`)
}

process.exit(allIssues.length > 0 ? 1 : 0)

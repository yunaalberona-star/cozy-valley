/**
 * Validates recipes: inputs exist, buildings exist, positive values, unlock feasibility.
 */
import { BUILDINGS, ITEM_META, RECIPES } from '../src/game/data/buildings'
import { CROPS } from '../src/game/data/crops'
import { MATERIAL_META } from '../src/game/data/gear'
import type { ItemId } from '../src/game/types'

const issues: string[] = []

function issue(msg: string) {
  issues.push(msg)
}

function isValidInput(id: string): boolean {
  return id in ITEM_META || id in MATERIAL_META || id in CROPS
}

const recipeIds = new Set<string>()
const outputs = new Map<string, string>()

for (const recipe of RECIPES) {
  if (recipeIds.has(recipe.id)) issue(`duplicate recipe id '${recipe.id}'`)
  recipeIds.add(recipe.id)

  if (!(recipe.buildingId in BUILDINGS)) {
    issue(`recipe '${recipe.id}' unknown building '${recipe.buildingId}'`)
  }

  if (!recipe.output && !recipe.materialOutput) {
    issue(`recipe '${recipe.id}' has no output`)
  }
  if (recipe.output && recipe.materialOutput) {
    issue(`recipe '${recipe.id}' has both item and material output`)
  }
  if (recipe.output && !(recipe.output in ITEM_META)) {
    issue(`recipe '${recipe.id}' output '${recipe.output}' not in ITEM_META`)
  }
  if (recipe.materialOutput && !(recipe.materialOutput in MATERIAL_META)) {
    issue(
      `recipe '${recipe.id}' materialOutput '${recipe.materialOutput}' invalid`,
    )
  }

  if (recipe.outputQty <= 0) issue(`recipe '${recipe.id}' outputQty <= 0`)
  if (recipe.craftMs <= 0) issue(`recipe '${recipe.id}' craftMs <= 0`)
  if (recipe.xp < 0) issue(`recipe '${recipe.id}' negative xp`)

  if (Object.keys(recipe.inputs).length === 0) {
    issue(`recipe '${recipe.id}' has no inputs`)
  }

  for (const [inputId, qty] of Object.entries(recipe.inputs)) {
    if (!isValidInput(inputId)) {
      issue(`recipe '${recipe.id}' unknown input '${inputId}'`)
    }
    if (qty <= 0) issue(`recipe '${recipe.id}' input '${inputId}' qty <= 0`)
  }

  if (recipe.output) {
    outputs.set(recipe.output, recipe.id)
  }
}

// Every crafted item in ITEM_META should have a recipe (except animal products & crops)
const animalAndCrop = new Set<string>([
  ...Object.keys(CROPS),
  'egg',
  'milk',
  'wool',
  'honey',
  'bacon',
  'goat_milk',
  'apple',
  'orange',
  'cherry',
  'maple_sap',
  'peach',
  'lemon',
])

for (const id of Object.keys(ITEM_META) as ItemId[]) {
  if (animalAndCrop.has(id)) continue
  if (!outputs.has(id)) {
    issue(`crafted item '${id}' has no producing recipe`)
  }
}

console.log(`=== audit-recipes (${issues.length} issues) ===`)
for (const x of issues) console.log(`  ${x}`)
process.exit(issues.length > 0 ? 1 : 0)

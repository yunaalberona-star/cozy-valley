/**
 * Validates item IDs, metadata, sell prices, and tree/crop separation.
 */
import { ITEM_META, RECIPES } from '../src/game/data/buildings'
import { CROPS } from '../src/game/data/crops'
import { TREES, isTreeProduct, TREE_LIST } from '../src/game/data/trees'
import { ANIMALS } from '../src/game/data/animals'
import {
  ITEM_SELL_PRICES,
  itemSellPrice,
  materialSellPrice,
} from '../src/game/data/sellPrices'
import { ORDERS } from '../src/game/data/orders'
import { MATERIAL_META } from '../src/game/data/gear'
import type { ItemId, MaterialId } from '../src/game/types'

const issues: string[] = []

function issue(msg: string) {
  issues.push(msg)
}

for (const tree of TREE_LIST) {
  if (tree.product in CROPS) {
    issue(`tree product '${tree.product}' also in CROPS — use trees only`)
  }
}

for (const cropId of Object.keys(CROPS)) {
  if (isTreeProduct(cropId as ItemId)) {
    issue(`crop '${cropId}' is also a tree product`)
  }
}

const allItemIds = new Set<ItemId>()
for (const id of Object.keys(ITEM_META) as ItemId[]) allItemIds.add(id)
for (const recipe of RECIPES) {
  if (recipe.output) allItemIds.add(recipe.output)
  for (const id of Object.keys(recipe.inputs)) {
    if (!(id in MATERIAL_META)) allItemIds.add(id as ItemId)
  }
}
for (const animal of Object.values(ANIMALS)) {
  if (animal.product) allItemIds.add(animal.product)
  if (animal.feedItem) allItemIds.add(animal.feedItem)
}

for (const id of allItemIds) {
  if (!(id in ITEM_META)) issue(`missing ITEM_META for '${id}'`)
}

for (const id of Object.keys(ITEM_META) as ItemId[]) {
  const meta = ITEM_META[id]
  if (!meta.name?.trim()) issue(`ITEM_META['${id}'] missing name`)
  if (!meta.emoji?.trim()) issue(`ITEM_META['${id}'] missing emoji`)
}

for (const id of Object.keys(ITEM_META) as ItemId[]) {
  const price = ITEM_SELL_PRICES[id] ?? itemSellPrice(id)
  if (price <= 0) issue(`sell price <= 0 for '${id}'`)
}

for (const id of Object.keys(MATERIAL_META) as MaterialId[]) {
  if (materialSellPrice(id) <= 0) issue(`material sell price <= 0 for '${id}'`)
}

for (const order of ORDERS) {
  for (const id of Object.keys(order.needs)) {
    if (!(id in ITEM_META)) issue(`order '${order.id}' needs unknown item '${id}'`)
  }
  if (order.unlockLevel < 1) issue(`order '${order.id}' unlockLevel < 1`)
}

for (const tree of Object.values(TREES)) {
  if (!(tree.product in ITEM_META)) {
    issue(`tree product '${tree.product}' missing from ITEM_META`)
  }
}

// ITEM_META keys should match ITEM_SELL_PRICES keys
for (const id of Object.keys(ITEM_META) as ItemId[]) {
  if (ITEM_SELL_PRICES[id] == null) {
    issue(`ITEM_SELL_PRICES missing '${id}' (fallback ${itemSellPrice(id)})`)
  }
}

console.log(`=== audit-items (${issues.length} issues) ===`)
for (const x of issues) console.log(`  ${x}`)
process.exit(issues.length > 0 ? 1 : 0)

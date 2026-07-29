import { ANIMALS } from './animals'
import { ITEM_META, RECIPES } from './buildings'
import { CROPS } from './crops'
import type { CropId, ItemId, MaterialId } from '../types'

/** Profit margin when selling crafted goods over ingredient sell value. */
const CRAFT_PROFIT_MULT = 1.3
/** Profit margin when selling harvested crops over seed cost per unit. */
const CROP_PROFIT_MULT = 1.4
/** Profit margin when selling animal products over feed sell value. */
const ANIMAL_PROFIT_MULT = 1.35

const MATERIAL_SELL: Record<MaterialId, number> = {
  iron_ore: 18,
  leather_scrap: 15,
  magic_essence: 32,
  sunstone: 40,
}

function buildItemSellPrices(): Record<ItemId, number> {
  const prices = {} as Record<ItemId, number>

  for (const crop of Object.values(CROPS)) {
    const unitCost = crop.seedCost / crop.harvestQty
    prices[crop.id] = Math.max(2, Math.ceil(unitCost * CROP_PROFIT_MULT))
  }

  let changed = true
  while (changed) {
    changed = false
    for (const recipe of RECIPES) {
      const inputValue = Object.entries(recipe.inputs).reduce(
        (sum, [id, qty]) => sum + (prices[id as ItemId] ?? 0) * (qty ?? 0),
        0,
      )
      if (inputValue <= 0) continue
      const unit = Math.max(
        1,
        Math.ceil((inputValue * CRAFT_PROFIT_MULT) / recipe.outputQty),
      )
      if ((prices[recipe.output] ?? 0) < unit) {
        prices[recipe.output] = unit
        changed = true
      }
    }
  }

  for (const animal of Object.values(ANIMALS)) {
    if (!animal.feedItem || !animal.feedQty) continue
    const feedUnit = prices[animal.feedItem] ?? 0
    const feedCost = feedUnit * animal.feedQty
    const minSell = Math.max(3, Math.ceil(feedCost * ANIMAL_PROFIT_MULT))
    if ((prices[animal.product] ?? 0) < minSell) {
      prices[animal.product] = minSell
    }
  }

  for (const id of Object.keys(ITEM_META) as ItemId[]) {
    if (prices[id] == null) prices[id] = 4
  }

  return prices
}

export const ITEM_SELL_PRICES = buildItemSellPrices()

export function itemSellPrice(id: ItemId): number {
  return ITEM_SELL_PRICES[id] ?? 1
}

/** Seeds sell below shop price to avoid buy/sell coin loops — cleanup only. */
export function seedSellPrice(id: CropId): number {
  return Math.max(1, Math.floor(CROPS[id].seedCost * 0.85))
}

export function materialSellPrice(id: MaterialId): number {
  return MATERIAL_SELL[id]
}

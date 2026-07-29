export type CropId =
  | 'wheat'
  | 'corn'
  | 'oat'
  | 'carrot'
  | 'tomato'
  | 'berry'
  | 'strawberry'
  | 'grape'
  | 'sugarcane'
  | 'cotton'
  | 'pumpkin'
  | 'sunflower'

export type AnimalProductId = 'egg' | 'milk' | 'wool' | 'honey' | 'bacon' | 'goat_milk'

export type FeedId =
  | 'chicken_feed'
  | 'duck_feed'
  | 'cow_feed'
  | 'goat_feed'
  | 'sheep_feed'
  | 'pig_slop'
  | 'bee_pollen'

export type CraftedId =
  | 'flour'
  | 'cornmeal'
  | 'oat_flour'
  | 'bread'
  | 'corn_bread'
  | 'oat_bread'
  | 'cheese'
  | 'butter'
  | 'juice'
  | 'grape_juice'
  | 'berry_juice'
  | 'jam'
  | 'grape_jam'
  | 'sugar'
  | 'syrup'
  | 'chicken_feed'
  | 'duck_feed'
  | 'cow_feed'
  | 'goat_feed'
  | 'sheep_feed'
  | 'pig_slop'
  | 'bee_pollen'
  | 'sauce'
  | 'grilled_veg'
  | 'pie'
  | 'salad'
  | 'soup'
  | 'cloth'
  | 'sweater'
  | 'wine'
  | 'candy'
  | 'cake'
  | 'rope'

export type MaterialId =
  | 'iron_ore'
  | 'leather_scrap'
  | 'magic_essence'
  | 'sunstone'

export type ItemId = CropId | AnimalProductId | CraftedId

export type CraftResourceId = ItemId | MaterialId

export type GearBuildingId = 'valley_forge' | 'weavers_hut' | 'tinker_shed'

export type GearSlot = 'weapon' | 'armor' | 'accessory'

export type GearQuality = 'rustic' | 'valley' | 'masterwork'

export type BuildingId =
  | 'mill'
  | 'bakery'
  | 'dairy'
  | 'juice_press'
  | 'jam_maker'
  | 'sugar_mill'
  | 'feed_mill'
  | 'grill'
  | 'kitchen'
  | 'loom'
  | 'sewing'
  | 'winery'
  | 'candy_machine'
  | 'cake_machine'

export type AnimalTypeId =
  | 'chicken'
  | 'cow'
  | 'sheep'
  | 'bee'
  | 'pig'
  | 'goat'
  | 'duck'

export type AnimalBuildingId =
  | 'chicken_coop'
  | 'duck_pond'
  | 'cow_barn'
  | 'goat_pen'
  | 'sheep_pasture'
  | 'bee_apiary'
  | 'pig_sty'

export type UnlockId =
  | BuildingId
  | AnimalBuildingId
  | GearBuildingId
  | 'orders_board'
  | 'tavern'
  | 'adventure_land'

export type TabId =
  | 'farm'
  | 'machines'
  | 'animals'
  | 'missions'
  | 'orders'
  | 'bag'
  | 'shop'
  | 'adventure'

export type AdventurePaneId = 'tavern' | 'workshop' | 'lands'

export type MissionGoalKind =
  | 'harvest'
  | 'craft'
  | 'collect_animal'
  | 'buy_animal'
  | 'fulfill_order'
  | 'own_coins'

export type PopupKind = 'unlock' | 'level_up' | 'mission_claim'

export interface PopupItem {
  emoji: string
  name: string
}

export interface PopupState {
  kind: PopupKind
  title: string
  subtitle?: string
  items: PopupItem[]
  /** Set for mission_claim popups. */
  missionId?: string
}

export interface CropDef {
  id: CropId
  name: string
  emoji: string
  seedCost: number
  growMs: number
  harvestQty: number
  xp: number
  /** Soft hint; hard gates use missions */
  unlockLevel: number
}

export interface RecipeDef {
  id: string
  buildingId: BuildingId
  name: string
  emoji: string
  output: ItemId
  outputQty: number
  inputs: Partial<Record<ItemId, number>>
  craftMs: number
  xp: number
  /** Player level required; computed from ingredient unlock levels. */
  unlockLevel?: number
}

export interface BuildingDef {
  id: BuildingId
  name: string
  emoji: string
  blurb: string
  /** Coin cost to build after mission unlock */
  buyCost: number
}

export interface AnimalBuildingDef {
  id: AnimalBuildingId
  name: string
  emoji: string
  blurb: string
  animalTypeId: AnimalTypeId
}

export interface AnimalDef {
  id: AnimalTypeId
  buildingId: AnimalBuildingId
  name: string
  emoji: string
  product: AnimalProductId
  productQty: number
  produceMs: number
  buyCost: number
  maxOwned: number
  xp: number
  feedItem?: FeedId
  feedQty?: number
}

export interface OrderDef {
  id: string
  name: string
  emoji: string
  needs: Partial<Record<ItemId, number>>
  rewardCoins: number
  rewardXp: number
  unlockLevel: number
}

export interface MissionGoal {
  id: string
  kind: MissionGoalKind
  /** Item or animal type depending on kind */
  target?: ItemId | AnimalTypeId
  amount: number
  label: string
}

export interface MissionDef {
  id: string
  name: string
  emoji: string
  story: string
  goals: MissionGoal[]
  rewardCoins: number
  rewardXp: number
  rewardItems?: Partial<Record<ItemId, number>>
  unlocks: UnlockId[]
  /** Previous mission that must be completed first */
  requires?: string
}

export interface EventDef {
  id: string
  name: string
  emoji: string
  blurb: string
  /** Duration while active once started */
  durationMs: number
  goals: MissionGoal[]
  rewardCoins: number
  rewardXp: number
  rewardItems?: Partial<Record<ItemId, number>>
  unlocks?: UnlockId[]
}

export interface PlotState {
  cropId: CropId | null
  plantedAt: number | null
}

export interface CraftJob {
  recipeId: string
  buildingId: BuildingId
  startedAt: number
  doneAt: number
}

export interface ActiveOrder {
  orderId: string
  slot: number
}

export interface AnimalInstance {
  id: string
  typeId: AnimalTypeId
  /** When production started; null if waiting for feed */
  startedAt: number | null
}

export interface NpcDef {
  id: string
  name: string
  title: string
  emoji: string
  blurb: string
  hireCost: number
  /** Party skill rating for adventure requirements */
  skill: number
}

export interface RecruitedNpc {
  id: string
  npcId: string
}

export interface AdventureDef {
  id: string
  name: string
  emoji: string
  blurb: string
  durationMs: number
  minNpcs: number
  maxNpcs: number
  minSkill: number
  rewardCoins: number
  rewardXp: number
  rewardItems?: Partial<Record<ItemId, number>>
  rewardMaterials?: Partial<Record<MaterialId, number>>
  unlockLevel: number
}

export interface ActiveAdventure {
  id: string
  adventureId: string
  npcInstanceIds: string[]
  startedAt: number
  doneAt: number
}

export interface GearBuildingDef {
  id: GearBuildingId
  name: string
  emoji: string
  blurb: string
  queueSize: number
  slotFocus: GearSlot
}

export interface GearStats {
  attack: number
  defense: number
  hp: number
  skillBonus: number
}

export interface GearBlueprintDef {
  id: string
  buildingId: GearBuildingId
  name: string
  emoji: string
  slot: GearSlot
  quality: GearQuality
  stats: GearStats
  inputs: Partial<Record<CraftResourceId, number>>
  craftMs: number
  xp: number
  unlockLevel: number
}

export interface GearInstance {
  id: string
  blueprintId: string
  equippedBy: string | null
}

export interface GearCraftJob {
  blueprintId: string
  buildingId: GearBuildingId
  startedAt: number
  doneAt: number
}

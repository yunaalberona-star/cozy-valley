import fs from 'fs'

const workshops = {
  smithy: [
    ['bp_wood_pitchfork', 'Wood Pitchfork', '🍴', 'weapon', 'rustic', { timber: 3, rope: 1 }, { attack: 4, defense: 0, hp: 0, skillBonus: 1 }, 12000, 12],
    ['bp_copper_sickle', 'Copper Sickle', '🌾', 'weapon', 'valley', { iron_ore: 2, timber: 1, rope: 1 }, { attack: 10, defense: 0, hp: 0, skillBonus: 2 }, 20000, 22],
    ['bp_iron_cap', 'Iron Cap', '🪖', 'helmet', 'valley', { iron_ore: 3, cow_hide: 1 }, { attack: 0, defense: 7, hp: 6, skillBonus: 1 }, 18000, 20],
    ['bp_valley_blade', 'Valley Blade', '⚔️', 'weapon', 'masterwork', { iron_ore: 4, cloth: 2, magic_essence: 1 }, { attack: 22, defense: 0, hp: 0, skillBonus: 4 }, 35000, 40],
    ['bp_iron_dagger', 'Iron Dagger', '🗡️', 'weapon', 'rustic', { iron_ore: 2, leather_scrap: 1 }, { attack: 8, defense: 0, hp: 0, skillBonus: 2 }, 14000, 14],
    ['bp_bronze_mace', 'Bronze Mace', '🔨', 'weapon', 'valley', { iron_ore: 3, timber: 1, cow_hide: 1 }, { attack: 14, defense: 0, hp: 0, skillBonus: 2 }, 22000, 24],
    ['bp_steel_axe', 'Steel Axe', '🪓', 'weapon', 'valley', { iron_ore: 4, timber: 2, boar_leather: 1 }, { attack: 18, defense: 0, hp: 0, skillBonus: 3 }, 28000, 30],
    ['bp_knight_helm', 'Knight Helm', '⛑️', 'helmet', 'valley', { iron_ore: 5, cloth: 2, cow_hide: 2 }, { attack: 0, defense: 11, hp: 12, skillBonus: 2 }, 30000, 32],
    ['bp_warhammer', 'War Hammer', '🔩', 'weapon', 'masterwork', { iron_ore: 6, timber: 2, magic_essence: 1 }, { attack: 24, defense: 0, hp: 0, skillBonus: 4 }, 36000, 38],
    ['bp_valley_greatsword', 'Valley Greatsword', '🗡️', 'weapon', 'masterwork', { iron_ore: 8, cloth: 3, magic_essence: 2, sunstone: 1 }, { attack: 30, defense: 0, hp: 0, skillBonus: 5 }, 42000, 45],
  ],
  tailor_workshop: [
    ['bp_straw_hat', 'Straw Sun Hat', '👒', 'helmet', 'rustic', { wheat: 3, sunflower: 1 }, { attack: 0, defense: 3, hp: 5, skillBonus: 1 }, 10000, 10],
    ['bp_wool_cloak', 'Wool Cloak', '🧥', 'armor', 'valley', { wool: 3, cloth: 2, rabbit_pelt: 1 }, { attack: 0, defense: 9, hp: 12, skillBonus: 2 }, 22000, 24],
    ['bp_quilted_vest', 'Quilted Vest', '🦺', 'armor', 'masterwork', { cloth: 3, wool: 4, sheep_leather: 2, magic_essence: 1 }, { attack: 0, defense: 18, hp: 28, skillBonus: 3 }, 38000, 42],
    ['bp_linen_gloves', 'Linen Gloves', '🧤', 'accessory', 'rustic', { cloth: 2, wool: 1 }, { attack: 0, defense: 0, hp: 0, skillBonus: 2 }, 12000, 12],
    ['bp_leather_boots', 'Leather Boots', '👢', 'accessory', 'valley', { pig_leather: 2, cloth: 1, rope: 1 }, { attack: 0, defense: 2, hp: 4, skillBonus: 2 }, 16000, 16],
    ['bp_farmer_overalls', 'Farmer Overalls', '👖', 'armor', 'valley', { cloth: 3, wool: 2, cow_hide: 1 }, { attack: 0, defense: 10, hp: 14, skillBonus: 2 }, 24000, 26],
    ['bp_padded_coat', 'Padded Coat', '🧥', 'armor', 'valley', { wool: 4, cloth: 3, rabbit_pelt: 2 }, { attack: 0, defense: 13, hp: 18, skillBonus: 3 }, 28000, 30],
    ['bp_silk_scarf', 'Silk Scarf', '🧣', 'accessory', 'valley', { cloth: 3, wool: 2, sunflower: 1 }, { attack: 0, defense: 0, hp: 0, skillBonus: 4 }, 20000, 22],
    ['bp_reinforced_vest', 'Reinforced Vest', '🦺', 'armor', 'masterwork', { cloth: 4, sheep_leather: 3, magic_essence: 1 }, { attack: 0, defense: 16, hp: 22, skillBonus: 3 }, 34000, 36],
    ['bp_master_tailor_coat', 'Master Tailor Coat', '🧥', 'armor', 'masterwork', { cloth: 5, wool: 5, magic_essence: 2, sunstone: 1 }, { attack: 0, defense: 20, hp: 30, skillBonus: 4 }, 40000, 44],
  ],
  wood_workshop: [
    ['bp_wooden_bucket', 'Wooden Bucket', '🪣', 'offhand', 'rustic', { timber: 2, rope: 1 }, { attack: 0, defense: 2, hp: 4, skillBonus: 1 }, 10000, 10],
    ['bp_iron_buckler', 'Iron Buckler', '🛡️', 'offhand', 'valley', { timber: 2, iron_ore: 2, boar_leather: 1 }, { attack: 0, defense: 8, hp: 10, skillBonus: 2 }, 22000, 22],
    ['bp_valley_bow', 'Valley Bow', '🏹', 'weapon', 'valley', { timber: 3, rope: 2, rabbit_pelt: 1 }, { attack: 12, defense: 0, hp: 0, skillBonus: 2 }, 24000, 26],
    ['bp_wooden_staff', 'Wooden Staff', '🪵', 'weapon', 'rustic', { timber: 3, rope: 1 }, { attack: 6, defense: 0, hp: 0, skillBonus: 2 }, 12000, 12],
    ['bp_hunting_spear', 'Hunting Spear', '🔱', 'weapon', 'valley', { timber: 2, iron_ore: 1, rope: 1 }, { attack: 11, defense: 0, hp: 0, skillBonus: 2 }, 18000, 18],
    ['bp_reinforced_shield', 'Reinforced Shield', '🛡️', 'offhand', 'valley', { timber: 3, iron_ore: 2, cow_hide: 1 }, { attack: 0, defense: 10, hp: 12, skillBonus: 2 }, 26000, 28],
    ['bp_longbow', 'Longbow', '🏹', 'weapon', 'valley', { timber: 4, rope: 2, pig_leather: 1 }, { attack: 15, defense: 0, hp: 0, skillBonus: 3 }, 30000, 32],
    ['bp_oak_greatbow', 'Oak Greatbow', '🏹', 'weapon', 'masterwork', { timber: 5, rope: 3, boar_leather: 1, magic_essence: 1 }, { attack: 19, defense: 0, hp: 0, skillBonus: 3 }, 34000, 36],
    ['bp_wooden_tower_shield', 'Tower Shield', '🛡️', 'offhand', 'masterwork', { timber: 5, iron_ore: 2, sheep_leather: 2 }, { attack: 0, defense: 14, hp: 18, skillBonus: 3 }, 36000, 38],
    ['bp_master_longbow', 'Master Longbow', '🏹', 'weapon', 'masterwork', { timber: 6, rope: 3, magic_essence: 2, sunstone: 1 }, { attack: 24, defense: 0, hp: 0, skillBonus: 4 }, 42000, 45],
  ],
  apothecary: [
    ['bp_lucky_button', 'Lucky Button', '🔘', 'accessory', 'rustic', { cloth: 1, berry: 2, honey: 1 }, { attack: 0, defense: 0, hp: 0, skillBonus: 2 }, 8000, 10],
    ['bp_mint_tonic', 'Mint Tonic Vial', '🧪', 'accessory', 'rustic', { mint: 3, honey: 1 }, { attack: 0, defense: 0, hp: 10, skillBonus: 2 }, 12000, 14],
    ['bp_honey_charm', 'Honey Charm', '🍯', 'accessory', 'valley', { honey: 2, sugar: 1, sunstone: 1 }, { attack: 2, defense: 2, hp: 8, skillBonus: 3 }, 18000, 20],
    ['bp_herb_pouch', 'Herb Pouch', '👝', 'accessory', 'rustic', { mint: 2, berry: 2, cloth: 1 }, { attack: 0, defense: 0, hp: 6, skillBonus: 2 }, 10000, 11],
    ['bp_healing_salve', 'Healing Salve', '💊', 'accessory', 'valley', { mint: 4, honey: 2, sugar: 1 }, { attack: 0, defense: 0, hp: 14, skillBonus: 2 }, 16000, 16],
    ['bp_stamina_draught', 'Stamina Draught', '🍶', 'accessory', 'valley', { honey: 3, mint: 3, egg: 1 }, { attack: 0, defense: 0, hp: 12, skillBonus: 3 }, 20000, 22],
    ['bp_focus_elixir', 'Focus Elixir', '⚗️', 'accessory', 'valley', { mint: 4, sugar: 2, magic_essence: 1 }, { attack: 0, defense: 0, hp: 8, skillBonus: 4 }, 24000, 26],
    ['bp_antidote_kit', 'Antidote Kit', '🧫', 'accessory', 'valley', { berry: 3, mint: 3, honey: 2 }, { attack: 0, defense: 0, hp: 16, skillBonus: 3 }, 26000, 28],
    ['bp_vitality_tonic', 'Vitality Tonic', '🥤', 'accessory', 'masterwork', { honey: 4, mint: 4, magic_essence: 1 }, { attack: 2, defense: 2, hp: 18, skillBonus: 4 }, 32000, 34],
    ['bp_master_elixir', 'Master Elixir', '✨', 'accessory', 'masterwork', { mint: 5, honey: 3, magic_essence: 2, sunstone: 1 }, { attack: 3, defense: 3, hp: 20, skillBonus: 5 }, 40000, 42],
  ],
  jewel_workshop: [
    ['bp_iron_ring', 'Iron Ring', '💍', 'accessory', 'rustic', { iron_ore: 2 }, { attack: 1, defense: 1, hp: 0, skillBonus: 2 }, 10000, 12],
    ['bp_ruby_loop', 'Ruby Loop', '🔴', 'accessory', 'valley', { sunstone: 2, iron_ore: 1, berry: 2 }, { attack: 3, defense: 2, hp: 6, skillBonus: 3 }, 20000, 22],
    ['bp_sun_amulet', 'Sun Amulet', '☀️', 'accessory', 'masterwork', { sunflower: 2, magic_essence: 2, sunstone: 2 }, { attack: 5, defense: 5, hp: 15, skillBonus: 5 }, 32000, 38],
    ['bp_copper_band', 'Copper Band', '💍', 'accessory', 'rustic', { iron_ore: 1, leather_scrap: 1 }, { attack: 1, defense: 1, hp: 0, skillBonus: 2 }, 9000, 10],
    ['bp_gem_earrings', 'Gem Earrings', '💎', 'accessory', 'valley', { sunstone: 1, iron_ore: 2, berry: 2 }, { attack: 2, defense: 1, hp: 4, skillBonus: 3 }, 18000, 18],
    ['bp_moon_pendant', 'Moon Pendant', '🌙', 'accessory', 'valley', { sunstone: 2, cloth: 1, magic_essence: 1 }, { attack: 2, defense: 2, hp: 8, skillBonus: 3 }, 22000, 24],
    ['bp_crystal_brooch', 'Crystal Brooch', '📿', 'accessory', 'valley', { sunstone: 2, iron_ore: 2, sugar: 1 }, { attack: 3, defense: 2, hp: 6, skillBonus: 4 }, 26000, 28],
    ['bp_gold_chain', 'Gold Chain', '⛓️', 'accessory', 'valley', { iron_ore: 3, sunstone: 2, cloth: 1 }, { attack: 3, defense: 3, hp: 8, skillBonus: 4 }, 28000, 30],
    ['bp_sapphire_crown', 'Sapphire Crown', '👑', 'accessory', 'masterwork', { sunstone: 3, magic_essence: 2, iron_ore: 2 }, { attack: 4, defense: 4, hp: 12, skillBonus: 5 }, 36000, 38],
    ['bp_master_diadem', 'Master Diadem', '💠', 'accessory', 'masterwork', { sunstone: 4, magic_essence: 3, iron_ore: 3 }, { attack: 6, defense: 5, hp: 16, skillBonus: 6 }, 42000, 46],
  ],
  wizard_tower: [
    ['bp_spark_wand', 'Spark Wand', '🪄', 'offhand', 'rustic', { timber: 1, magic_essence: 2 }, { attack: 2, defense: 0, hp: 0, skillBonus: 3 }, 14000, 16],
    ['bp_runestone', 'Chipped Runestone', '🪨', 'offhand', 'valley', { sunstone: 2, magic_essence: 2 }, { attack: 0, defense: 4, hp: 0, skillBonus: 4 }, 24000, 28],
    ['bp_arcane_staff', 'Arcane Staff', '📜', 'weapon', 'masterwork', { timber: 2, magic_essence: 3, sunstone: 1 }, { attack: 14, defense: 0, hp: 0, skillBonus: 6 }, 36000, 40],
    ['bp_apprentice_orb', 'Apprentice Orb', '🔮', 'offhand', 'rustic', { magic_essence: 1, sunstone: 1, cloth: 1 }, { attack: 0, defense: 2, hp: 0, skillBonus: 3 }, 12000, 14],
    ['bp_ether_focus', 'Ether Focus', '✨', 'offhand', 'valley', { magic_essence: 2, timber: 1, berry: 2 }, { attack: 1, defense: 0, hp: 0, skillBonus: 4 }, 18000, 20],
    ['bp_spell_tome', 'Spell Tome', '📖', 'offhand', 'valley', { cloth: 2, magic_essence: 2, honey: 1 }, { attack: 0, defense: 2, hp: 0, skillBonus: 5 }, 22000, 24],
    ['bp_crystal_orb', 'Crystal Orb', '🔮', 'offhand', 'valley', { sunstone: 2, magic_essence: 3, cloth: 1 }, { attack: 0, defense: 3, hp: 0, skillBonus: 5 }, 28000, 30],
    ['bp_mystic_rod', 'Mystic Rod', '🪄', 'weapon', 'valley', { timber: 2, magic_essence: 3, sunstone: 1 }, { attack: 10, defense: 0, hp: 0, skillBonus: 5 }, 30000, 32],
    ['bp_archmage_staff', 'Archmage Staff', '🪄', 'weapon', 'masterwork', { timber: 3, magic_essence: 4, sunstone: 2 }, { attack: 16, defense: 0, hp: 0, skillBonus: 6 }, 38000, 40],
    ['bp_master_focus', 'Master Focus', '🌟', 'offhand', 'masterwork', { magic_essence: 5, sunstone: 3, timber: 2 }, { attack: 2, defense: 4, hp: 0, skillBonus: 7 }, 44000, 48],
  ],
  temple: [
    ['bp_wool_hood', 'Blessed Wool Hood', '🧣', 'helmet', 'valley', { wool: 2, cloth: 1 }, { attack: 0, defense: 6, hp: 8, skillBonus: 2 }, 16000, 18],
    ['bp_holy_vestments', 'Holy Vestments', '✨', 'armor', 'valley', { cloth: 3, wool: 2, magic_essence: 1 }, { attack: 0, defense: 12, hp: 16, skillBonus: 3 }, 26000, 30],
    ['bp_master_hood', 'Masterwork Hood', '🪖', 'helmet', 'masterwork', { wool: 3, cloth: 2, magic_essence: 1 }, { attack: 0, defense: 12, hp: 18, skillBonus: 3 }, 34000, 36],
    ['bp_prayer_beads', 'Prayer Beads', '📿', 'accessory', 'rustic', { cloth: 1, wool: 1, berry: 1 }, { attack: 0, defense: 0, hp: 0, skillBonus: 2 }, 8000, 10],
    ['bp_blessed_sash', 'Blessed Sash', '🎗️', 'accessory', 'valley', { cloth: 2, wool: 2, honey: 1 }, { attack: 0, defense: 0, hp: 6, skillBonus: 3 }, 14000, 14],
    ['bp_sanctified_robe', 'Sanctified Robe', '👘', 'armor', 'valley', { cloth: 4, wool: 3, magic_essence: 1 }, { attack: 0, defense: 14, hp: 18, skillBonus: 3 }, 28000, 30],
    ['bp_acolyte_cowl', 'Acolyte Cowl', '🧣', 'helmet', 'valley', { wool: 3, cloth: 2, berry: 1 }, { attack: 0, defense: 8, hp: 10, skillBonus: 3 }, 20000, 22],
    ['bp_divine_mantle', 'Divine Mantle', '🕊️', 'armor', 'masterwork', { cloth: 4, wool: 4, magic_essence: 2 }, { attack: 0, defense: 16, hp: 22, skillBonus: 4 }, 34000, 36],
    ['bp_radiant_halo', 'Radiant Halo', '😇', 'helmet', 'masterwork', { sunstone: 2, magic_essence: 2, cloth: 2 }, { attack: 0, defense: 10, hp: 14, skillBonus: 4 }, 36000, 38],
    ['bp_master_vestments', 'Master Vestments', '✨', 'armor', 'masterwork', { cloth: 5, wool: 5, magic_essence: 3, sunstone: 1 }, { attack: 0, defense: 20, hp: 28, skillBonus: 5 }, 42000, 44],
  ],
  master_lodge: [
    ['bp_valley_aegis', 'Valley Aegis', '🛡️', 'offhand', 'masterwork', { iron_ore: 4, cloth: 2, sunstone: 1 }, { attack: 0, defense: 16, hp: 24, skillBonus: 4 }, 36000, 38],
    ['bp_master_blade', 'Masterwork Blade', '🗡️', 'weapon', 'masterwork', { iron_ore: 5, magic_essence: 2, sunstone: 2 }, { attack: 26, defense: 0, hp: 0, skillBonus: 5 }, 40000, 45],
    ['bp_master_signet', 'Master Signet', '👑', 'accessory', 'masterwork', { iron_ore: 2, magic_essence: 2, sunstone: 2 }, { attack: 4, defense: 4, hp: 12, skillBonus: 6 }, 38000, 42],
    ['bp_veteran_pauldrons', 'Veteran Pauldrons', '🦺', 'armor', 'valley', { iron_ore: 3, boar_leather: 2, cloth: 2 }, { attack: 0, defense: 12, hp: 16, skillBonus: 3 }, 26000, 28],
    ['bp_elite_gauntlets', 'Elite Gauntlets', '🧤', 'accessory', 'valley', { iron_ore: 2, pig_leather: 2, cloth: 1 }, { attack: 2, defense: 2, hp: 4, skillBonus: 3 }, 22000, 24],
    ['bp_commander_cloak', 'Commander Cloak', '🧥', 'armor', 'valley', { cloth: 4, wool: 3, cow_hide: 2 }, { attack: 0, defense: 14, hp: 18, skillBonus: 4 }, 30000, 32],
    ['bp_lords_crown', "Lord's Crown", '👑', 'helmet', 'masterwork', { iron_ore: 3, sunstone: 2, magic_essence: 1 }, { attack: 0, defense: 10, hp: 12, skillBonus: 4 }, 34000, 36],
    ['bp_champion_greaves', 'Champion Greaves', '🦵', 'accessory', 'valley', { iron_ore: 4, boar_leather: 2, rope: 1 }, { attack: 0, defense: 4, hp: 8, skillBonus: 3 }, 28000, 30],
    ['bp_prestige_armor', 'Prestige Armor', '🛡️', 'armor', 'masterwork', { iron_ore: 5, cloth: 4, magic_essence: 2 }, { attack: 0, defense: 18, hp: 24, skillBonus: 4 }, 38000, 40],
    ['bp_valley_regalia', 'Valley Regalia', '👑', 'accessory', 'masterwork', { iron_ore: 3, sunstone: 3, magic_essence: 3, cloth: 2 }, { attack: 5, defense: 5, hp: 14, skillBonus: 6 }, 44000, 48],
  ],
  engineer_bench: [
    ['bp_light_crossbow', 'Light Crossbow', '🎯', 'weapon', 'valley', { timber: 2, iron_ore: 3, rope: 2, pig_leather: 1 }, { attack: 16, defense: 0, hp: 0, skillBonus: 3 }, 28000, 32],
    ['bp_pellet_gun', 'Pellet Gun', '🔫', 'weapon', 'masterwork', { iron_ore: 5, timber: 2, pig_leather: 1 }, { attack: 24, defense: 0, hp: 0, skillBonus: 4 }, 38000, 44],
    ['bp_gear_cog_charm', 'Gear Cog Charm', '⚙️', 'accessory', 'rustic', { iron_ore: 2, timber: 1 }, { attack: 0, defense: 0, hp: 0, skillBonus: 2 }, 12000, 14],
    ['bp_brass_scope', 'Brass Scope', '🔭', 'accessory', 'valley', { iron_ore: 2, sunstone: 1, timber: 1 }, { attack: 0, defense: 0, hp: 0, skillBonus: 3 }, 18000, 20],
    ['bp_spring_trap', 'Spring Trap', '🪤', 'offhand', 'valley', { iron_ore: 2, timber: 2, rope: 1 }, { attack: 4, defense: 0, hp: 0, skillBonus: 3 }, 20000, 22],
    ['bp_clockwork_knuckle', 'Clockwork Knuckle', '🥊', 'weapon', 'valley', { iron_ore: 4, timber: 1, pig_leather: 1 }, { attack: 14, defense: 0, hp: 0, skillBonus: 3 }, 26000, 28],
    ['bp_steam_piston', 'Steam Piston', '🔧', 'offhand', 'valley', { iron_ore: 4, timber: 2, magic_essence: 1 }, { attack: 0, defense: 6, hp: 8, skillBonus: 3 }, 30000, 32],
    ['bp_alloy_rifle', 'Alloy Rifle', '🔫', 'weapon', 'masterwork', { iron_ore: 6, timber: 3, pig_leather: 2 }, { attack: 22, defense: 0, hp: 0, skillBonus: 4 }, 36000, 38],
    ['bp_precision_lens', 'Precision Lens', '🔍', 'accessory', 'valley', { sunstone: 2, iron_ore: 2, timber: 1 }, { attack: 0, defense: 0, hp: 0, skillBonus: 4 }, 28000, 30],
    ['bp_master_prototype', 'Master Prototype', '🛠️', 'weapon', 'masterwork', { iron_ore: 7, timber: 3, magic_essence: 2, sunstone: 2 }, { attack: 28, defense: 0, hp: 0, skillBonus: 5 }, 44000, 50],
  ],
  scholars_study: [
    ['bp_scholar_wand', "Scholar's Wand", '📖', 'offhand', 'valley', { timber: 1, magic_essence: 3, cloth: 1 }, { attack: 0, defense: 2, hp: 0, skillBonus: 5 }, 26000, 30],
    ['bp_ancient_runestone', 'Ancient Runestone', '🔮', 'offhand', 'masterwork', { magic_essence: 4, sunstone: 3 }, { attack: 0, defense: 6, hp: 0, skillBonus: 7 }, 40000, 46],
    ['bp_ink_quill_charm', 'Ink Quill Charm', '🪶', 'accessory', 'rustic', { cloth: 1, berry: 2, timber: 1 }, { attack: 0, defense: 0, hp: 0, skillBonus: 3 }, 10000, 12],
    ['bp_lore_tablet', 'Lore Tablet', '📜', 'offhand', 'valley', { sunstone: 1, magic_essence: 2, timber: 1 }, { attack: 0, defense: 3, hp: 0, skillBonus: 4 }, 20000, 22],
    ['bp_etched_lens', 'Etched Lens', '🔍', 'accessory', 'valley', { sunstone: 2, iron_ore: 1, cloth: 1 }, { attack: 0, defense: 0, hp: 0, skillBonus: 4 }, 22000, 24],
    ['bp_cipher_disk', 'Cipher Disk', '💿', 'accessory', 'valley', { iron_ore: 2, magic_essence: 2, timber: 1 }, { attack: 0, defense: 0, hp: 0, skillBonus: 5 }, 26000, 28],
    ['bp_wisdom_scroll', 'Wisdom Scroll', '📜', 'offhand', 'valley', { cloth: 2, magic_essence: 3, honey: 1 }, { attack: 0, defense: 2, hp: 0, skillBonus: 5 }, 28000, 30],
    ['bp_sage_monocle', 'Sage Monocle', '🧐', 'accessory', 'valley', { sunstone: 2, iron_ore: 1, magic_essence: 2 }, { attack: 0, defense: 0, hp: 0, skillBonus: 5 }, 30000, 32],
    ['bp_etched_codex', 'Etched Codex', '📚', 'offhand', 'masterwork', { cloth: 3, magic_essence: 4, sunstone: 2 }, { attack: 0, defense: 4, hp: 0, skillBonus: 6 }, 36000, 38],
    ['bp_master_grimoire', 'Master Grimoire', '📕', 'offhand', 'masterwork', { cloth: 4, magic_essence: 5, sunstone: 3, timber: 2 }, { attack: 0, defense: 5, hp: 0, skillBonus: 7 }, 44000, 48],
  ],
  summoner_sanctum: [
    ['bp_spirit_cloak', 'Spirit Cloak', '👻', 'armor', 'valley', { cloth: 4, magic_essence: 2, wool: 2 }, { attack: 0, defense: 14, hp: 20, skillBonus: 4 }, 30000, 34],
    ['bp_familiar_charm', 'Familiar Charm', '🐾', 'accessory', 'masterwork', { egg: 2, honey: 2, magic_essence: 2 }, { attack: 3, defense: 3, hp: 10, skillBonus: 6 }, 34000, 40],
    ['bp_binding_circle', 'Binding Circle', '⭕', 'accessory', 'rustic', { cloth: 2, magic_essence: 1, berry: 2 }, { attack: 0, defense: 0, hp: 0, skillBonus: 3 }, 12000, 14],
    ['bp_soul_thread', 'Soul Thread', '🧵', 'accessory', 'valley', { cloth: 2, wool: 2, magic_essence: 2 }, { attack: 0, defense: 0, hp: 6, skillBonus: 4 }, 18000, 20],
    ['bp_pact_token', 'Pact Token', '🪙', 'accessory', 'valley', { iron_ore: 1, magic_essence: 2, honey: 1 }, { attack: 1, defense: 1, hp: 4, skillBonus: 4 }, 22000, 24],
    ['bp_phantom_veil', 'Phantom Veil', '👻', 'armor', 'valley', { cloth: 3, wool: 3, magic_essence: 2 }, { attack: 0, defense: 12, hp: 16, skillBonus: 4 }, 28000, 30],
    ['bp_spirit_bell', 'Spirit Bell', '🔔', 'accessory', 'valley', { iron_ore: 2, magic_essence: 2, timber: 1 }, { attack: 0, defense: 0, hp: 8, skillBonus: 5 }, 26000, 28],
    ['bp_arcane_cage', 'Arcane Cage', '🗝️', 'offhand', 'valley', { iron_ore: 2, timber: 2, magic_essence: 3 }, { attack: 0, defense: 4, hp: 0, skillBonus: 5 }, 30000, 32],
    ['bp_elder_pact_ring', 'Elder Pact Ring', '💍', 'accessory', 'masterwork', { magic_essence: 4, sunstone: 2, iron_ore: 2 }, { attack: 3, defense: 3, hp: 10, skillBonus: 6 }, 38000, 40],
    ['bp_master_binding', 'Master Binding', '🔗', 'accessory', 'masterwork', { magic_essence: 5, cloth: 3, sunstone: 3, egg: 2 }, { attack: 4, defense: 4, hp: 12, skillBonus: 7 }, 44000, 48],
  ],
  bards_stage: [
    ['bp_valley_lute', 'Valley Lute', '🎸', 'accessory', 'valley', { timber: 3, rope: 2, cloth: 1 }, { attack: 0, defense: 0, hp: 0, skillBonus: 5 }, 22000, 26],
    ['bp_aurasong_harp', 'Aurasong Harp', '🎻', 'accessory', 'masterwork', { timber: 3, magic_essence: 2, cloth: 2, sunstone: 1 }, { attack: 2, defense: 2, hp: 8, skillBonus: 7 }, 36000, 42],
    ['bp_drum_charm', 'Drum Charm', '🥁', 'accessory', 'rustic', { timber: 2, leather_scrap: 1, cloth: 1 }, { attack: 0, defense: 0, hp: 0, skillBonus: 3 }, 10000, 12],
    ['bp_reed_pipe', 'Reed Pipe', '🎵', 'accessory', 'valley', { timber: 2, rope: 1, mint: 2 }, { attack: 0, defense: 0, hp: 0, skillBonus: 4 }, 16000, 18],
    ['bp_song_sheet', 'Song Sheet', '🎼', 'accessory', 'valley', { cloth: 2, berry: 2, honey: 1 }, { attack: 0, defense: 0, hp: 0, skillBonus: 4 }, 18000, 20],
    ['bp_melody_box', 'Melody Box', '🎹', 'accessory', 'valley', { timber: 3, iron_ore: 1, cloth: 1 }, { attack: 0, defense: 0, hp: 0, skillBonus: 5 }, 24000, 26],
    ['bp_chorus_bell', 'Chorus Bell', '🔔', 'accessory', 'valley', { iron_ore: 2, timber: 1, magic_essence: 1 }, { attack: 0, defense: 0, hp: 0, skillBonus: 5 }, 26000, 28],
    ['bp_epic_horn', 'Epic Horn', '📯', 'accessory', 'valley', { timber: 2, boar_leather: 1, iron_ore: 1 }, { attack: 0, defense: 0, hp: 0, skillBonus: 5 }, 28000, 30],
    ['bp_harmony_harp', 'Harmony Harp', '🎻', 'accessory', 'masterwork', { timber: 4, cloth: 2, magic_essence: 2 }, { attack: 1, defense: 1, hp: 6, skillBonus: 6 }, 34000, 36],
    ['bp_master_symphony', 'Master Symphony', '🎶', 'accessory', 'masterwork', { timber: 4, magic_essence: 3, cloth: 3, sunstone: 2 }, { attack: 2, defense: 2, hp: 10, skillBonus: 7 }, 42000, 46],
  ],
  veterans_quarter: [
    ['bp_twin_blades', 'Twin Valley Blades', '⚔️', 'weapon', 'masterwork', { iron_ore: 6, boar_leather: 2, magic_essence: 1 }, { attack: 28, defense: 0, hp: 0, skillBonus: 4 }, 42000, 48],
    ['bp_quiver', 'Hunter Quiver', '🏹', 'offhand', 'valley', { pig_leather: 3, rope: 2, wool: 1 }, { attack: 4, defense: 0, hp: 0, skillBonus: 4 }, 24000, 28],
    ['bp_scout_knife', 'Scout Knife', '🔪', 'weapon', 'rustic', { iron_ore: 2, leather_scrap: 1, timber: 1 }, { attack: 8, defense: 0, hp: 0, skillBonus: 2 }, 12000, 14],
    ['bp_field_blade', 'Field Blade', '⚔️', 'weapon', 'valley', { iron_ore: 3, boar_leather: 1, rope: 1 }, { attack: 14, defense: 0, hp: 0, skillBonus: 3 }, 22000, 24],
    ['bp_ranger_cloak', 'Ranger Cloak', '🧥', 'armor', 'valley', { cloth: 3, pig_leather: 2, wool: 2 }, { attack: 0, defense: 10, hp: 14, skillBonus: 3 }, 26000, 28],
    ['bp_siege_hammer', 'Siege Hammer', '🔨', 'weapon', 'valley', { iron_ore: 5, timber: 2, cow_hide: 1 }, { attack: 20, defense: 0, hp: 0, skillBonus: 3 }, 32000, 34],
    ['bp_battle_pauldrons', 'Battle Pauldrons', '🦺', 'armor', 'valley', { iron_ore: 4, boar_leather: 2, cloth: 2 }, { attack: 0, defense: 12, hp: 16, skillBonus: 3 }, 30000, 32],
    ['bp_war_bow', 'War Bow', '🏹', 'weapon', 'masterwork', { timber: 4, iron_ore: 2, rope: 3 }, { attack: 22, defense: 0, hp: 0, skillBonus: 4 }, 36000, 38],
    ['bp_commander_shield', 'Commander Shield', '🛡️', 'offhand', 'masterwork', { iron_ore: 5, timber: 3, cow_hide: 2 }, { attack: 0, defense: 14, hp: 18, skillBonus: 4 }, 38000, 40],
    ['bp_master_arsenal', 'Master Arsenal', '⚔️', 'weapon', 'masterwork', { iron_ore: 8, boar_leather: 3, magic_essence: 2, sunstone: 1 }, { attack: 32, defense: 0, hp: 0, skillBonus: 5 }, 46000, 52],
  ],
  storm_shrine: [
    ['bp_storm_catalyst', 'Storm Catalyst', '🌩️', 'accessory', 'valley', { magic_essence: 3, sunstone: 2 }, { attack: 6, defense: 0, hp: 0, skillBonus: 5 }, 28000, 32],
    ['bp_storm_idol', 'Storm Idol', '⚡', 'accessory', 'masterwork', { magic_essence: 4, sunstone: 4, iron_ore: 2 }, { attack: 8, defense: 4, hp: 12, skillBonus: 8 }, 44000, 50],
    ['bp_lightning_rod', 'Lightning Rod', '⚡', 'offhand', 'rustic', { iron_ore: 2, timber: 1 }, { attack: 2, defense: 0, hp: 0, skillBonus: 3 }, 12000, 14],
    ['bp_thunder_charm', 'Thunder Charm', '🌩️', 'accessory', 'valley', { magic_essence: 2, sunstone: 1, iron_ore: 1 }, { attack: 4, defense: 0, hp: 0, skillBonus: 4 }, 18000, 20],
    ['bp_gale_totem', 'Gale Totem', '🌪️', 'offhand', 'valley', { timber: 2, magic_essence: 2, sunstone: 1 }, { attack: 0, defense: 3, hp: 0, skillBonus: 4 }, 22000, 24],
    ['bp_tempest_orb', 'Tempest Orb', '🔮', 'offhand', 'valley', { sunstone: 2, magic_essence: 3, cloth: 1 }, { attack: 0, defense: 4, hp: 0, skillBonus: 5 }, 28000, 30],
    ['bp_stormcaller_ring', 'Stormcaller Ring', '💍', 'accessory', 'valley', { sunstone: 2, iron_ore: 2, magic_essence: 2 }, { attack: 5, defense: 2, hp: 6, skillBonus: 5 }, 30000, 32],
    ['bp_hurricane_idol', 'Hurricane Idol', '🌀', 'accessory', 'masterwork', { magic_essence: 3, sunstone: 3, timber: 2 }, { attack: 7, defense: 2, hp: 10, skillBonus: 6 }, 36000, 38],
    ['bp_maelstrom_core', 'Maelstrom Core', '🌊', 'offhand', 'masterwork', { magic_essence: 4, sunstone: 3, iron_ore: 3 }, { attack: 4, defense: 4, hp: 0, skillBonus: 6 }, 40000, 42],
    ['bp_master_stormheart', 'Master Stormheart', '❤️‍🔥', 'accessory', 'masterwork', { magic_essence: 5, sunstone: 5, iron_ore: 3 }, { attack: 10, defense: 5, hp: 14, skillBonus: 8 }, 48000, 55],
  ],
}

function fmtInputs(inputs) {
  const entries = Object.entries(inputs).map(([k, v]) => `${k}: ${v}`)
  return `{ ${entries.join(', ')} }`
}

function fmtStats(stats) {
  return `{ attack: ${stats.attack}, defense: ${stats.defense}, hp: ${stats.hp}, skillBonus: ${stats.skillBonus} }`
}

let out = `import type {
  CraftResourceId,
  GearBlueprintDef,
  GearBuildingId,
  GearQuality,
  GearSlot,
  GearStats,
} from '../types'
import { RECIPE_CHAIN_UNLOCK_CRAFTS } from './gearRecipeProgress'

type Draft = Omit<GearBlueprintDef, 'buildingId' | 'unlock'>

function workshopChain(buildingId: GearBuildingId, drafts: Draft[]): GearBlueprintDef[] {
  return drafts.map((d, i) => ({
    ...d,
    buildingId,
    unlock:
      i === 0
        ? { starter: true }
        : {
            requires: [
              {
                blueprintId: drafts[i - 1].id,
                craftsRequired: RECIPE_CHAIN_UNLOCK_CRAFTS[i - 1] ?? 30,
              },
            ],
          },
  }))
}

`

const chains = []
for (const [buildingId, recipes] of Object.entries(workshops)) {
  const varName = `${buildingId.replace(/[^a-z0-9]/gi, '_').toUpperCase()}_CHAIN`
  out += `const ${varName} = workshopChain('${buildingId}', [\n`
  for (let i = 0; i < recipes.length; i++) {
    const [id, name, emoji, slot, quality, inputs, stats, craftMs, xp] = recipes[i]
    out += `  { id: '${id}', tier: ${i}, name: ${JSON.stringify(name)}, emoji: '${emoji}', slot: '${slot}' as GearSlot, quality: '${quality}' as GearQuality, stats: ${fmtStats(stats)} as GearStats, inputs: ${fmtInputs(inputs)} as Partial<Record<CraftResourceId, number>>, craftMs: ${craftMs}, xp: ${xp} },\n`
  }
  out += `])\n\n`
  chains.push(varName)
}

out += `export const GEAR_BLUEPRINTS: GearBlueprintDef[] = [\n  ...${chains.join(',\n  ...')},\n]\n\nexport const GEAR_BLUEPRINT_BY_ID: Record<string, GearBlueprintDef> = Object.fromEntries(\n  GEAR_BLUEPRINTS.map((b) => [b.id, b]),\n)\n`

fs.writeFileSync('src/game/data/gearBlueprints.ts', out)
console.log('Wrote gearBlueprints.ts', GEAR_BLUEPRINTS.length)

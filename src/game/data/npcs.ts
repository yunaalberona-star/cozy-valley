import type { NpcDef } from '../types'

/** Tavern recruits — add more Family Farm style later. */
export const NPCS: Record<string, NpcDef> = {
  finn: {
    id: 'finn',
    name: 'Finn',
    title: 'Farmhand',
    emoji: '🧑‍🌾',
    blurb: 'Knows every trail in the valley.',
    hireCost: 120,
    skill: 2,
  },
  mira: {
    id: 'mira',
    name: 'Mira',
    title: 'Scout',
    emoji: '🏹',
    blurb: 'Quick eyes and steady feet.',
    hireCost: 180,
    skill: 3,
  },
  tom: {
    id: 'tom',
    name: 'Old Tom',
    title: 'Sage',
    emoji: '🧙',
    blurb: 'Maps ruins no one else dares enter.',
    hireCost: 250,
    skill: 4,
  },
  rosa: {
    id: 'rosa',
    name: 'Rosa',
    title: 'Ranger',
    emoji: '🌲',
    blurb: 'Brings back rare herbs from the wilds.',
    hireCost: 200,
    skill: 3,
  },
  pip: {
    id: 'pip',
    name: 'Pip',
    title: 'Lucky Charm',
    emoji: '🍀',
    blurb: 'Finds extra coin where others find dust.',
    hireCost: 300,
    skill: 5,
  },
  elara: {
    id: 'elara',
    name: 'Elara',
    title: 'Knight',
    emoji: '⚔️',
    blurb: 'Guards the party through rough country.',
    hireCost: 350,
    skill: 5,
  },
}

export const NPC_LIST = Object.values(NPCS)

export const MAX_RECRUITED_NPCS = 6

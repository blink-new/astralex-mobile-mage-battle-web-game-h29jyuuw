import { createClient } from '@blinkdotnew/sdk'

export const blink = createClient({
  projectId: 'astralex-mobile-mage-battle-web-game-h29jyuuw',
  authRequired: true
})

export type User = {
  id: string
  email: string
  displayName?: string
}

export type GameCharacter = {
  id: string
  userId: string
  username: string
  element: 'fire' | 'nature' | 'water' | 'light' | 'dark'
  level: number
  experience: number
  gold: number
  mana: number
  turns: number
  createdAt: string
  updatedAt: string
}

export type Building = {
  id: string
  userId: string
  type: 'ethereal_vault' | 'arcane_library' | 'astral_sanctum' | 'crystal_observatory'
  level: number
  upgrading: boolean
  upgradeCompleteAt?: string
  createdAt: string
  updatedAt: string
}

export type Spell = {
  id: string
  name: string
  element?: 'fire' | 'nature' | 'water' | 'light' | 'dark'
  category: 'attack' | 'aura' | 'speed' | 'counter'
  tier: 'basic' | 'advanced' | 'expert' | 'ultimate'
  goldCost: number
  turnCost: number
  manaCost: number
  damage?: number
  description: string
  prerequisites: string[]
}

export type UserSpell = {
  id: string
  userId: string
  spellId: string
  researched: boolean
  researchCompleteAt?: string
  equipped: boolean
  slot?: number
  createdAt: string
  updatedAt: string
}
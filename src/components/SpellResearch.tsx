import React, { useState, useEffect, useCallback } from 'react';
import { blink } from '../blink/client';
import { 
  BookOpen, 
  Coins, 
  Clock, 
  Zap, 
  Shield, 
  Wind, 
  Swords,
  Lock,
  CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Character {
  id: string;
  username: string;
  element: string;
  level: number;
  gold: number;
  mana: number;
  turns: number;
  diamonds: number;
}

interface Spell {
  id: string;
  name: string;
  category: 'attack' | 'aura' | 'speed' | 'counter';
  tier: 'basic' | 'advanced' | 'expert' | 'ultimate';
  description: string;
  effect: string;
  goldCost: number;
  turnCost: number;
  manaCost: number;
  elementRestriction?: string;
  prerequisite?: string;
  icon: React.ReactNode;
}

interface SpellResearchProps {
  character: Character;
  onResourceUpdate: (updates: Partial<Character>) => void;
}

const spells: Spell[] = [
  // Attack Spells - Basic
  {
    id: 'fireball',
    name: 'Fireball',
    category: 'attack',
    tier: 'basic',
    description: 'A basic fire projectile',
    effect: '50-80 damage',
    goldCost: 10000,
    turnCost: 5,
    manaCost: 15,
    icon: <Swords className="w-5 h-5" />
  },
  {
    id: 'ice_shard',
    name: 'Ice Shard',
    category: 'attack',
    tier: 'basic',
    description: 'Sharp ice projectile',
    effect: '45-75 damage + slow',
    goldCost: 12000,
    turnCost: 6,
    manaCost: 18,
    icon: <Swords className="w-5 h-5" />
  },
  
  // Attack Spells - Advanced
  {
    id: 'lightning_bolt',
    name: 'Lightning Bolt',
    category: 'attack',
    tier: 'advanced',
    description: 'Powerful electric attack',
    effect: '100-150 damage',
    goldCost: 50000,
    turnCost: 20,
    manaCost: 30,
    prerequisite: 'fireball',
    icon: <Swords className="w-5 h-5" />
  },
  
  // Attack Spells - Ultimate
  {
    id: 'inferno_storm',
    name: 'Inferno Storm',
    category: 'attack',
    tier: 'ultimate',
    description: 'Devastating fire magic',
    effect: '300-500 damage to all enemies',
    goldCost: 500000,
    turnCost: 100,
    manaCost: 80,
    elementRestriction: 'fire',
    prerequisite: 'lightning_bolt',
    icon: <Swords className="w-5 h-5" />
  },
  
  // Aura Spells
  {
    id: 'magic_shield',
    name: 'Magic Shield',
    category: 'aura',
    tier: 'basic',
    description: 'Protective magical barrier',
    effect: '+25% damage reduction',
    goldCost: 15000,
    turnCost: 8,
    manaCost: 20,
    icon: <Shield className="w-5 h-5" />
  },
  {
    id: 'power_aura',
    name: 'Power Aura',
    category: 'aura',
    tier: 'advanced',
    description: 'Increases magical power',
    effect: '+30% spell damage',
    goldCost: 75000,
    turnCost: 30,
    manaCost: 40,
    prerequisite: 'magic_shield',
    icon: <Shield className="w-5 h-5" />
  },
  
  // Speed Spells
  {
    id: 'haste',
    name: 'Haste',
    category: 'speed',
    tier: 'basic',
    description: 'Increases movement speed',
    effect: '+20% turn priority',
    goldCost: 8000,
    turnCost: 4,
    manaCost: 12,
    icon: <Wind className="w-5 h-5" />
  },
  {
    id: 'time_warp',
    name: 'Time Warp',
    category: 'speed',
    tier: 'expert',
    description: 'Manipulates time flow',
    effect: 'Extra turn chance',
    goldCost: 200000,
    turnCost: 60,
    manaCost: 60,
    prerequisite: 'haste',
    icon: <Wind className="w-5 h-5" />
  }
];

const categoryColors = {
  attack: 'text-red-400',
  aura: 'text-blue-400',
  speed: 'text-green-400',
  counter: 'text-purple-400'
};

const tierColors = {
  basic: 'border-gray-500',
  advanced: 'border-blue-500',
  expert: 'border-purple-500',
  ultimate: 'border-orange-500'
};

export default function SpellResearch({ character, onResourceUpdate }: SpellResearchProps) {
  const [userSpells, setUserSpells] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [researching, setResearching] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'attack' | 'aura' | 'speed' | 'counter'>('all');

  const loadUserSpells = useCallback(async () => {
    try {
      // Get the current user first
      const user = await blink.auth.me();
      const spells = await blink.db.character_spells.list({
        where: { userId: user.id },
        orderBy: { createdAt: 'asc' }
      });
      setUserSpells(spells);
    } catch (error) {
      console.error('Error loading spells:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserSpells();
  }, [loadUserSpells]);

  const hasSpell = (spellId: string) => {
    return userSpells.some(s => s.spellId === spellId);
  };

  const canResearch = (spell: Spell) => {
    // Check if already researched
    if (hasSpell(spell.id)) return false;
    
    // Check resources
    if (character.gold < spell.goldCost || character.turns < spell.turnCost) return false;
    
    // Check element restriction
    if (spell.elementRestriction && spell.elementRestriction !== character.element) return false;
    
    // Check prerequisite
    if (spell.prerequisite && !hasSpell(spell.prerequisite)) return false;
    
    return true;
  };

  const researchSpell = async (spell: Spell) => {
    if (!canResearch(spell)) return;

    setResearching(spell.id);
    
    try {
      // Get the current user first
      const user = await blink.auth.me();
      // Create spell research record
      await blink.db.character_spells.create({
        id: `spell_${Date.now()}`,
        userId: user.id,
        spellId: spell.id,
        createdAt: new Date().toISOString()
      });

      // Update character resources
      onResourceUpdate({
        gold: character.gold - spell.goldCost,
        turns: character.turns - spell.turnCost
      });

      toast.success(`${spell.name} researched successfully!`);
      loadUserSpells();
    } catch (error) {
      console.error('Error researching spell:', error);
      toast.error('Failed to research spell');
    } finally {
      setResearching(null);
    }
  };

  const filteredSpells = selectedCategory === 'all' 
    ? spells 
    : spells.filter(s => s.category === selectedCategory);

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-gray-400">Loading spells...</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div className="text-center">
        <BookOpen className="w-8 h-8 text-purple-400 mx-auto mb-2" />
        <h2 className="text-xl font-bold text-white mb-1">Spell Research</h2>
        <p className="text-gray-400 text-sm">Discover and master new magical abilities</p>
      </div>

      {/* Resource Display */}
      <div className="flex justify-center space-x-4 text-sm">
        <div className="flex items-center">
          <Coins className="w-4 h-4 text-yellow-400 mr-1" />
          <span className="text-yellow-400 font-semibold">{character.gold.toLocaleString()}</span>
        </div>
        <div className="flex items-center">
          <Clock className="w-4 h-4 text-green-400 mr-1" />
          <span className="text-green-400 font-semibold">{character.turns}</span>
        </div>
        <div className="flex items-center">
          <Zap className="w-4 h-4 text-blue-400 mr-1" />
          <span className="text-blue-400 font-semibold">{character.mana}</span>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex space-x-2 overflow-x-auto">
        {['all', 'attack', 'aura', 'speed', 'counter'].map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category as any)}
            className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategory === category
                ? 'bg-orange-500 text-white'
                : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
            }`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Spells List */}
      <div className="space-y-3">
        {filteredSpells.map((spell) => {
          const isResearched = hasSpell(spell.id);
          const canRes = canResearch(spell);
          const isResearchingThis = researching === spell.id;
          const isLocked = spell.prerequisite && !hasSpell(spell.prerequisite);
          const isElementLocked = spell.elementRestriction && spell.elementRestriction !== character.element;

          return (
            <div 
              key={spell.id} 
              className={`bg-gray-800/50 border-2 ${tierColors[spell.tier]} rounded-lg p-4 ${
                isResearched ? 'opacity-75' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <div className={`${categoryColors[spell.category]} mr-3`}>
                    {spell.icon}
                  </div>
                  <div>
                    <div className="flex items-center">
                      <h3 className="text-white font-semibold mr-2">{spell.name}</h3>
                      {isResearched && <CheckCircle className="w-4 h-4 text-green-400" />}
                      {isLocked && <Lock className="w-4 h-4 text-gray-500" />}
                    </div>
                    <p className="text-gray-400 text-sm">{spell.description}</p>
                    <p className="text-purple-400 text-xs mt-1">{spell.effect}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`text-xs px-2 py-1 rounded ${categoryColors[spell.category]} bg-gray-700/30`}>
                        {spell.category}
                      </span>
                      <span className="text-xs px-2 py-1 rounded bg-gray-600/30 text-gray-300">
                        {spell.tier}
                      </span>
                      {spell.elementRestriction && (
                        <span className="text-xs px-2 py-1 rounded bg-orange-500/20 text-orange-400">
                          {spell.elementRestriction} only
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <div className="flex items-center space-x-3">
                    <span className="text-yellow-400 text-xs">
                      <Coins className="w-3 h-3 inline mr-1" />
                      {spell.goldCost.toLocaleString()}
                    </span>
                    <span className="text-green-400 text-xs">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {spell.turnCost}
                    </span>
                    <span className="text-blue-400 text-xs">
                      <Zap className="w-3 h-3 inline mr-1" />
                      {spell.manaCost}
                    </span>
                  </div>
                  {spell.prerequisite && (
                    <p className="text-gray-500 text-xs mt-1">
                      Requires: {spells.find(s => s.id === spell.prerequisite)?.name}
                    </p>
                  )}
                </div>

                {isResearched ? (
                  <div className="px-4 py-2 bg-green-600/20 text-green-400 text-sm font-semibold rounded-lg">
                    Researched
                  </div>
                ) : (
                  <button
                    onClick={() => researchSpell(spell)}
                    disabled={!canRes || isResearchingThis || isElementLocked}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center"
                  >
                    {isResearchingThis ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Researching...
                      </>
                    ) : isElementLocked ? (
                      'Element Locked'
                    ) : isLocked ? (
                      'Locked'
                    ) : (
                      'Research'
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Research Summary */}
      {userSpells.length > 0 && (
        <div className="bg-gray-800/30 border border-gray-600 rounded-lg p-4">
          <h3 className="text-white font-semibold mb-2">Your Spells ({userSpells.length})</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {userSpells.map((userSpell) => {
              const spell = spells.find(s => s.id === userSpell.spellId);
              return (
                <div key={userSpell.id} className="bg-gray-700/30 rounded p-2">
                  <p className="text-white font-medium">{spell?.name}</p>
                  <p className={`text-xs ${categoryColors[spell?.category || 'attack']}`}>
                    {spell?.category} • {spell?.tier}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
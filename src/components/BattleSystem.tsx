import React, { useState, useEffect, useCallback } from 'react';
import { blink } from '../blink/client';
import { 
  Swords, 
  Shield, 
  Zap, 
  Heart, 
  Target,
  Flame,
  Droplets,
  Leaf,
  Sun,
  Moon
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

interface BattleSystemProps {
  character: Character;
  onResourceUpdate: (updates: Partial<Character>) => void;
}

interface Enemy {
  id: string;
  name: string;
  element: string;
  level: number;
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  attack: number;
  defense: number;
}

interface BattleState {
  playerHp: number;
  playerMaxHp: number;
  playerMana: number;
  enemy: Enemy | null;
  turn: 'player' | 'enemy';
  battleLog: string[];
  isActive: boolean;
  result: 'victory' | 'defeat' | null;
}

const elementIcons = {
  fire: <Flame className="w-4 h-4" />,
  water: <Droplets className="w-4 h-4" />,
  nature: <Leaf className="w-4 h-4" />,
  light: <Sun className="w-4 h-4" />,
  dark: <Moon className="w-4 h-4" />
};

const enemies: Enemy[] = [
  {
    id: 'shadow_apprentice',
    name: 'Shadow Apprentice',
    element: 'dark',
    level: 1,
    hp: 80,
    maxHp: 80,
    mana: 40,
    maxMana: 40,
    attack: 25,
    defense: 15
  },
  {
    id: 'fire_elemental',
    name: 'Fire Elemental',
    element: 'fire',
    level: 2,
    hp: 120,
    maxHp: 120,
    mana: 60,
    maxMana: 60,
    attack: 35,
    defense: 20
  },
  {
    id: 'water_guardian',
    name: 'Water Guardian',
    element: 'water',
    level: 3,
    hp: 150,
    maxHp: 150,
    mana: 80,
    maxMana: 80,
    attack: 30,
    defense: 35
  },
  {
    id: 'nature_spirit',
    name: 'Nature Spirit',
    element: 'nature',
    level: 2,
    hp: 100,
    maxHp: 100,
    mana: 70,
    maxMana: 70,
    attack: 28,
    defense: 25
  },
  {
    id: 'light_seraph',
    name: 'Light Seraph',
    element: 'light',
    level: 4,
    hp: 200,
    maxHp: 200,
    mana: 100,
    maxMana: 100,
    attack: 40,
    defense: 30
  }
];

export default function BattleSystem({ character, onResourceUpdate }: BattleSystemProps) {
  const [battleState, setBattleState] = useState<BattleState>({
    playerHp: 100,
    playerMaxHp: 100,
    playerMana: character.mana,
    enemy: null,
    turn: 'player',
    battleLog: [],
    isActive: false,
    result: null
  });
  const [userSpells, setUserSpells] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadUserSpells = useCallback(async () => {
    try {
      const spells = await blink.db.character_spells.list({
        where: { userId: character.id },
        limit: 6 // Max 6 attack spells
      });
      setUserSpells(spells);
    } catch (error) {
      console.error('Error loading spells:', error);
    }
  }, [character.id]);

  useEffect(() => {
    loadUserSpells();
  }, [loadUserSpells]);

  const addToBattleLog = (message: string) => {
    setBattleState(prev => ({
      ...prev,
      battleLog: [...prev.battleLog.slice(-4), message] // Keep last 5 messages
    }));
  };

  const startBattle = (enemy: Enemy) => {
    const enemyCopy = { ...enemy, hp: enemy.maxHp, mana: enemy.maxMana };
    setBattleState({
      playerHp: 100,
      playerMaxHp: 100,
      playerMana: character.mana,
      enemy: enemyCopy,
      turn: 'player',
      battleLog: [`Battle begins against ${enemy.name}!`],
      isActive: true,
      result: null
    });
  };

  const getSpellData = (spellId: string) => {
    const spellMap: { [key: string]: { name: string; damage: number; manaCost: number } } = {
      'fireball': { name: 'Fireball', damage: 65, manaCost: 15 },
      'ice_shard': { name: 'Ice Shard', damage: 60, manaCost: 18 },
      'lightning_bolt': { name: 'Lightning Bolt', damage: 125, manaCost: 30 },
      'inferno_storm': { name: 'Inferno Storm', damage: 400, manaCost: 80 }
    };
    return spellMap[spellId];
  };

  const calculateDamage = (attacker: any, defender: any, baseDamage: number) => {
    const damage = Math.max(1, baseDamage - defender.defense);
    return Math.floor(damage + (Math.random() * damage * 0.3)); // +/- 30% variance
  };

  const enemyTurn = () => {
    if (!battleState.enemy || battleState.result) return;

    const damage = calculateDamage(
      battleState.enemy,
      { defense: 20 }, // Base player defense
      battleState.enemy.attack
    );

    const newPlayerHp = Math.max(0, battleState.playerHp - damage);
    
    setBattleState(prev => ({
      ...prev,
      playerHp: newPlayerHp,
      turn: newPlayerHp > 0 ? 'player' : 'enemy'
    }));

    addToBattleLog(`${battleState.enemy.name} attacks for ${damage} damage!`);

    if (newPlayerHp <= 0) {
      // Defeat
      setTimeout(() => {
        setBattleState(prev => ({ ...prev, result: 'defeat', isActive: false }));
        addToBattleLog('Defeat! You have been vanquished!');
        toast.error('Defeat! Try again when you\'re stronger.');
      }, 1000);
    }
  };

  const playerAttack = (spellId: string) => {
    if (!battleState.enemy || battleState.turn !== 'player') return;

    const spellData = getSpellData(spellId);
    if (!spellData) return;

    if (battleState.playerMana < spellData.manaCost) {
      toast.error('Not enough mana!');
      return;
    }

    const damage = calculateDamage(
      { attack: 30 }, // Base player attack
      battleState.enemy,
      spellData.damage
    );

    const newEnemyHp = Math.max(0, battleState.enemy.hp - damage);
    
    setBattleState(prev => ({
      ...prev,
      playerMana: prev.playerMana - spellData.manaCost,
      enemy: prev.enemy ? { ...prev.enemy, hp: newEnemyHp } : null,
      turn: newEnemyHp > 0 ? 'enemy' : 'player'
    }));

    addToBattleLog(`You cast ${spellData.name} for ${damage} damage!`);

    if (newEnemyHp <= 0) {
      // Victory
      setTimeout(() => {
        setBattleState(prev => ({ ...prev, result: 'victory', isActive: false }));
        addToBattleLog('Victory! You defeated the enemy!');
        
        // Reward gold and experience
        const goldReward = battleState.enemy!.level * 1000;
        onResourceUpdate({
          gold: character.gold + goldReward,
          mana: Math.min(character.mana + 10, 100) // Restore some mana
        });
        
        toast.success(`Victory! +${goldReward} gold!`);
      }, 1000);
    } else {
      // Enemy turn
      setTimeout(enemyTurn, 1500);
    }
  };



  const resetBattle = () => {
    setBattleState({
      playerHp: 100,
      playerMaxHp: 100,
      playerMana: character.mana,
      enemy: null,
      turn: 'player',
      battleLog: [],
      isActive: false,
      result: null
    });
  };

  if (battleState.isActive && battleState.enemy) {
    return (
      <div className="p-4 space-y-6">
        <div className="text-center">
          <Swords className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <h2 className="text-xl font-bold text-white mb-1">Battle Arena</h2>
          <p className="text-gray-400 text-sm">Defeat your enemy with magical spells!</p>
        </div>

        {/* Battle Status */}
        <div className="grid grid-cols-2 gap-4">
          {/* Player */}
          <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-2 flex items-center">
              <Shield className="w-4 h-4 mr-2 text-blue-400" />
              {character.username}
            </h3>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-red-400">HP</span>
                  <span className="text-white">{battleState.playerHp}/{battleState.playerMaxHp}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(battleState.playerHp / battleState.playerMaxHp) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-blue-400">Mana</span>
                  <span className="text-white">{battleState.playerMana}/{character.mana}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(battleState.playerMana / character.mana) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Enemy */}
          <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-2 flex items-center">
              <Target className="w-4 h-4 mr-2 text-red-400" />
              {battleState.enemy.name}
            </h3>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-red-400">HP</span>
                  <span className="text-white">{battleState.enemy.hp}/{battleState.enemy.maxHp}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(battleState.enemy.hp / battleState.enemy.maxHp) * 100}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center text-sm">
                {elementIcons[battleState.enemy.element as keyof typeof elementIcons]}
                <span className="text-gray-400 ml-1 capitalize">{battleState.enemy.element}</span>
                <span className="text-gray-400 ml-2">Level {battleState.enemy.level}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Battle Log */}
        <div className="bg-gray-800/30 border border-gray-600 rounded-lg p-4">
          <h3 className="text-white font-semibold mb-2">Battle Log</h3>
          <div className="space-y-1 text-sm">
            {battleState.battleLog.map((log, index) => (
              <p key={index} className="text-gray-300">{log}</p>
            ))}
          </div>
        </div>

        {/* Spell Actions */}
        {battleState.turn === 'player' && !battleState.result && (
          <div className="space-y-3">
            <h3 className="text-white font-semibold">Your Spells</h3>
            <div className="grid grid-cols-2 gap-2">
              {userSpells.slice(0, 6).map((userSpell) => {
                const spellData = getSpellData(userSpell.spellId);
                if (!spellData) return null;
                
                const canCast = battleState.playerMana >= spellData.manaCost;
                
                return (
                  <button
                    key={userSpell.id}
                    onClick={() => playerAttack(userSpell.spellId)}
                    disabled={!canCast}
                    className="bg-gray-700/50 hover:bg-gray-600/50 disabled:bg-gray-800/50 border border-gray-600 rounded-lg p-3 text-left transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium text-sm">{spellData.name}</p>
                        <p className="text-gray-400 text-xs">{spellData.damage} damage</p>
                      </div>
                      <div className="text-right">
                        <p className="text-blue-400 text-xs">{spellData.manaCost} mana</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            {userSpells.length === 0 && (
              <p className="text-gray-400 text-sm text-center">
                No spells available. Research spells first!
              </p>
            )}
          </div>
        )}

        {/* Battle Result */}
        {battleState.result && (
          <div className="text-center space-y-4">
            <div className={`text-2xl font-bold ${
              battleState.result === 'victory' ? 'text-green-400' : 'text-red-400'
            }`}>
              {battleState.result === 'victory' ? 'Victory!' : 'Defeat!'}
            </div>
            <button
              onClick={resetBattle}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold rounded-lg transition-colors"
            >
              Return to Arena
            </button>
          </div>
        )}

        {/* Turn Indicator */}
        {!battleState.result && (
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              {battleState.turn === 'player' ? 'Your Turn' : 'Enemy Turn'}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div className="text-center">
        <Swords className="w-8 h-8 text-red-400 mx-auto mb-2" />
        <h2 className="text-xl font-bold text-white mb-1">Battle Arena</h2>
        <p className="text-gray-400 text-sm">Choose your opponent and engage in magical combat</p>
      </div>

      {/* Player Stats */}
      <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4">
        <h3 className="text-white font-semibold mb-2">Your Battle Stats</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <Heart className="w-5 h-5 text-red-400 mx-auto mb-1" />
            <p className="text-red-400 font-semibold">100</p>
            <p className="text-gray-400">HP</p>
          </div>
          <div className="text-center">
            <Zap className="w-5 h-5 text-blue-400 mx-auto mb-1" />
            <p className="text-blue-400 font-semibold">{character.mana}</p>
            <p className="text-gray-400">Mana</p>
          </div>
          <div className="text-center">
            <Swords className="w-5 h-5 text-orange-400 mx-auto mb-1" />
            <p className="text-orange-400 font-semibold">{userSpells.length}</p>
            <p className="text-gray-400">Spells</p>
          </div>
        </div>
      </div>

      {/* Available Enemies */}
      <div className="space-y-3">
        <h3 className="text-white font-semibold">Choose Your Opponent</h3>
        {enemies.map((enemy) => (
          <div key={enemy.id} className="bg-gray-800/50 border border-gray-600 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="text-red-400 mr-3">
                  {elementIcons[enemy.element as keyof typeof elementIcons]}
                </div>
                <div>
                  <h4 className="text-white font-semibold">{enemy.name}</h4>
                  <p className="text-gray-400 text-sm capitalize">
                    Level {enemy.level} {enemy.element} • {enemy.hp} HP
                  </p>
                  <p className="text-gray-500 text-xs">
                    Attack: {enemy.attack} • Defense: {enemy.defense}
                  </p>
                </div>
              </div>
              <button
                onClick={() => startBattle(enemy)}
                disabled={loading}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-gray-600 disabled:to-gray-700 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                Challenge
              </button>
            </div>
          </div>
        ))}
      </div>

      {userSpells.length === 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
          <p className="text-yellow-400 text-sm text-center">
            ⚠️ You have no spells! Research spells first to engage in battle.
          </p>
        </div>
      )}
    </div>
  );
}
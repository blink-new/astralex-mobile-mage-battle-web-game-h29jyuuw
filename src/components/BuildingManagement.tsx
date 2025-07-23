import React, { useState, useEffect, useCallback } from 'react';
import { blink } from '../blink/client';
import { 
  Building, 
  Coins, 
  Clock, 
  Plus, 
  ArrowUp,
  Vault,
  BookOpen,
  Zap,
  Eye
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

interface Building {
  id: string;
  type: string;
  level: number;
  name: string;
  description: string;
  icon: React.ReactNode;
  baseGoldCost: number;
  baseTurnCost: number;
  production: string;
}

interface BuildingManagementProps {
  character: Character;
  onResourceUpdate: (updates: Partial<Character>) => void;
}

const buildingTypes: Building[] = [
  {
    id: 'ethereal_vault',
    type: 'ethereal_vault',
    level: 1,
    name: 'Ethereal Vault',
    description: 'Generates gold from magical energy',
    icon: <Vault className="w-6 h-6" />,
    baseGoldCost: 5000,
    baseTurnCost: 5,
    production: '+500 Gold/Turn'
  },
  {
    id: 'arcane_library',
    type: 'arcane_library',
    level: 1,
    name: 'Arcane Library',
    description: 'Accelerates spell research',
    icon: <BookOpen className="w-6 h-6" />,
    baseGoldCost: 8000,
    baseTurnCost: 8,
    production: '+25% Research Speed'
  },
  {
    id: 'astral_sanctum',
    type: 'astral_sanctum',
    level: 1,
    name: 'Astral Sanctum',
    description: 'Increases mana capacity and regeneration',
    icon: <Zap className="w-6 h-6" />,
    baseGoldCost: 10000,
    baseTurnCost: 10,
    production: '+20 Max Mana'
  },
  {
    id: 'crystal_observatory',
    type: 'crystal_observatory',
    level: 1,
    name: 'Crystal Observatory',
    description: 'Provides intelligence on enemies',
    icon: <Eye className="w-6 h-6" />,
    baseGoldCost: 12000,
    baseTurnCost: 12,
    production: '+15% Battle Info'
  }
];

export default function BuildingManagement({ character, onResourceUpdate }: BuildingManagementProps) {
  const [userBuildings, setUserBuildings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);

  const loadUserBuildings = useCallback(async () => {
    try {
      const buildings = await blink.db.buildings.list({
        where: { userId: character.id },
        orderBy: { createdAt: 'asc' }
      });
      setUserBuildings(buildings);
    } catch (error) {
      console.error('Error loading buildings:', error);
    } finally {
      setLoading(false);
    }
  }, [character.id]);

  useEffect(() => {
    loadUserBuildings();
  }, [character.id, loadUserBuildings]);

  const calculateUpgradeCost = (baseGoldCost: number, baseTurnCost: number, currentLevel: number) => {
    const multiplier = Math.pow(1.5, currentLevel - 1);
    return {
      gold: Math.floor(baseGoldCost * multiplier),
      turns: Math.floor(baseTurnCost * multiplier)
    };
  };

  const buildBuilding = async (buildingType: Building) => {
    const cost = calculateUpgradeCost(buildingType.baseGoldCost, buildingType.baseTurnCost, 1);
    
    if (character.gold < cost.gold) {
      toast.error('Not enough gold!');
      return;
    }
    
    if (character.turns < cost.turns) {
      toast.error('Not enough turns!');
      return;
    }

    setUpgrading(buildingType.id);
    
    try {
      // Create building
      await blink.db.buildings.create({
        id: `building_${Date.now()}`,
        userId: character.id,
        type: buildingType.type,
        level: 1,
        createdAt: new Date().toISOString()
      });

      // Update character resources
      onResourceUpdate({
        gold: character.gold - cost.gold,
        turns: character.turns - cost.turns
      });

      toast.success(`${buildingType.name} constructed!`);
      loadUserBuildings();
    } catch (error) {
      console.error('Error building:', error);
      toast.error('Failed to construct building');
    } finally {
      setUpgrading(null);
    }
  };

  const upgradeBuilding = async (building: any, buildingType: Building) => {
    const cost = calculateUpgradeCost(buildingType.baseGoldCost, buildingType.baseTurnCost, building.level + 1);
    
    if (character.gold < cost.gold) {
      toast.error('Not enough gold!');
      return;
    }
    
    if (character.turns < cost.turns) {
      toast.error('Not enough turns!');
      return;
    }

    setUpgrading(building.id);
    
    try {
      // Upgrade building
      await blink.db.buildings.update(building.id, {
        level: building.level + 1
      });

      // Update character resources
      onResourceUpdate({
        gold: character.gold - cost.gold,
        turns: character.turns - cost.turns
      });

      toast.success(`${buildingType.name} upgraded to level ${building.level + 1}!`);
      loadUserBuildings();
    } catch (error) {
      console.error('Error upgrading:', error);
      toast.error('Failed to upgrade building');
    } finally {
      setUpgrading(null);
    }
  };

  const getUserBuilding = (type: string) => {
    return userBuildings.find(b => b.type === type);
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-gray-400">Loading buildings...</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div className="text-center">
        <Building className="w-8 h-8 text-orange-400 mx-auto mb-2" />
        <h2 className="text-xl font-bold text-white mb-1">Building Management</h2>
        <p className="text-gray-400 text-sm">Construct and upgrade your magical infrastructure</p>
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
      </div>

      {/* Buildings */}
      <div className="space-y-4">
        {buildingTypes.map((buildingType) => {
          const userBuilding = getUserBuilding(buildingType.type);
          const currentLevel = userBuilding?.level || 0;
          const cost = calculateUpgradeCost(
            buildingType.baseGoldCost, 
            buildingType.baseTurnCost, 
            currentLevel + 1
          );
          const isUpgrading = upgrading === buildingType.id || upgrading === userBuilding?.id;

          return (
            <div key={buildingType.id} className="bg-gray-800/50 border border-gray-600 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <div className="text-orange-400 mr-3">
                    {buildingType.icon}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{buildingType.name}</h3>
                    <p className="text-gray-400 text-sm">{buildingType.description}</p>
                    {currentLevel > 0 && (
                      <p className="text-orange-400 text-xs mt-1">Level {currentLevel}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <p className="text-purple-400 font-semibold">{buildingType.production}</p>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className="text-yellow-400 text-xs">
                      <Coins className="w-3 h-3 inline mr-1" />
                      {cost.gold.toLocaleString()}
                    </span>
                    <span className="text-green-400 text-xs">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {cost.turns}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => currentLevel === 0 ? buildBuilding(buildingType) : upgradeBuilding(userBuilding, buildingType)}
                  disabled={isUpgrading || character.gold < cost.gold || character.turns < cost.turns}
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:from-gray-600 disabled:to-gray-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center"
                >
                  {isUpgrading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : currentLevel === 0 ? (
                    <Plus className="w-4 h-4 mr-1" />
                  ) : (
                    <ArrowUp className="w-4 h-4 mr-1" />
                  )}
                  {isUpgrading ? 'Working...' : currentLevel === 0 ? 'Build' : 'Upgrade'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Building Summary */}
      {userBuildings.length > 0 && (
        <div className="bg-gray-800/30 border border-gray-600 rounded-lg p-4">
          <h3 className="text-white font-semibold mb-2">Your Buildings</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {userBuildings.map((building) => {
              const buildingType = buildingTypes.find(bt => bt.type === building.type);
              return (
                <div key={building.id} className="bg-gray-700/30 rounded p-2">
                  <p className="text-white font-medium">{buildingType?.name}</p>
                  <p className="text-orange-400 text-xs">Level {building.level}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
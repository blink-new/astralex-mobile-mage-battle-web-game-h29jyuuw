import React, { useState, useEffect } from 'react';
import { blink } from '../blink/client';
import { 
  Home, 
  Building, 
  BookOpen, 
  Swords, 
  Users, 
  User, 
  LogOut,
  Coins,
  Zap,
  Clock,
  Gem
} from 'lucide-react';
import BuildingManagement from './BuildingManagement';
import SpellResearch from './SpellResearch';
import BattleSystem from './BattleSystem';
import GuildSystem from './GuildSystem';
import ChatAssistant from './ChatAssistant';

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

interface MainHubProps {
  character: Character;
  onCharacterUpdate: (character: Character) => void;
  onLogout: () => void;
}

type Tab = 'hub' | 'buildings' | 'spells' | 'battle' | 'guild';

const elementGradients = {
  fire: 'from-orange-500 to-red-600',
  nature: 'from-green-500 to-green-700',
  water: 'from-blue-500 to-blue-700',
  light: 'from-yellow-400 to-yellow-600',
  dark: 'from-purple-500 to-purple-700'
};

export default function MainHub({ character, onCharacterUpdate, onLogout }: MainHubProps) {
  const [activeTab, setActiveTab] = useState<Tab>('hub');
  const [showProfile, setShowProfile] = useState(false);

  const elementGradient = elementGradients[character.element as keyof typeof elementGradients] || 'from-gray-500 to-gray-700';

  const handleLogout = () => {
    onLogout(); // This will call blink.auth.logout() in the parent
  };

  const updateCharacterResource = async (updates: Partial<Character>) => {
    try {
      // Update the character in the database
      await blink.db.characters.update(character.id, updates);
      // Update the local state
      onCharacterUpdate({ ...character, ...updates });
    } catch (error) {
      console.error('Error updating character:', error);
      // Show error to user
      import('react-hot-toast').then(({ default: toast }) => {
        toast.error('Failed to update character resources');
      });
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'buildings':
        return <BuildingManagement character={character} onResourceUpdate={updateCharacterResource} />;
      case 'spells':
        return <SpellResearch character={character} onResourceUpdate={updateCharacterResource} />;
      case 'battle':
        return <BattleSystem character={character} onResourceUpdate={updateCharacterResource} />;
      case 'guild':
        return <GuildSystem character={character} />;
      default:
        return (
          <div className="p-4 space-y-6">
            {/* Character Portrait */}
            <div className="text-center">
              <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${elementGradient} flex items-center justify-center mx-auto mb-4 animate-pulse`}>
                <div className="text-white text-2xl font-bold">
                  {character.username.charAt(0).toUpperCase()}
                </div>
              </div>
              <h2 className="text-xl font-bold text-white mb-1">
                {character.username}
              </h2>
              <p className="text-gray-400 text-sm capitalize">
                Level {character.level} {character.element} Mage
              </p>
            </div>

            {/* Resource Display */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-600">
                <div className="flex items-center justify-between">
                  <Coins className="w-5 h-5 text-yellow-400" />
                  <span className="text-yellow-400 font-semibold">
                    {character.gold.toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-400 text-xs mt-1">Gold</p>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-600">
                <div className="flex items-center justify-between">
                  <Zap className="w-5 h-5 text-blue-400" />
                  <span className="text-blue-400 font-semibold">
                    {character.mana}
                  </span>
                </div>
                <p className="text-gray-400 text-xs mt-1">Mana</p>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-600">
                <div className="flex items-center justify-between">
                  <Clock className="w-5 h-5 text-green-400" />
                  <span className="text-green-400 font-semibold">
                    {character.turns}
                  </span>
                </div>
                <p className="text-gray-400 text-xs mt-1">Turns</p>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-600">
                <div className="flex items-center justify-between">
                  <Gem className="w-5 h-5 text-purple-400" />
                  <span className="text-purple-400 font-semibold">
                    {character.diamonds}
                  </span>
                </div>
                <p className="text-gray-400 text-xs mt-1">Diamonds</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
              
              <button
                onClick={() => setActiveTab('buildings')}
                className="w-full bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600 rounded-lg p-4 text-left transition-colors"
              >
                <div className="flex items-center">
                  <Building className="w-6 h-6 text-orange-400 mr-3" />
                  <div>
                    <p className="text-white font-semibold">Manage Buildings</p>
                    <p className="text-gray-400 text-sm">Upgrade your magical infrastructure</p>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('spells')}
                className="w-full bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600 rounded-lg p-4 text-left transition-colors"
              >
                <div className="flex items-center">
                  <BookOpen className="w-6 h-6 text-purple-400 mr-3" />
                  <div>
                    <p className="text-white font-semibold">Research Spells</p>
                    <p className="text-gray-400 text-sm">Discover new magical abilities</p>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('battle')}
                className="w-full bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600 rounded-lg p-4 text-left transition-colors"
              >
                <div className="flex items-center">
                  <Swords className="w-6 h-6 text-red-400 mr-3" />
                  <div>
                    <p className="text-white font-semibold">Enter Battle</p>
                    <p className="text-gray-400 text-sm">Challenge other mages</p>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('guild')}
                className="w-full bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600 rounded-lg p-4 text-left transition-colors"
              >
                <div className="flex items-center">
                  <Users className="w-6 h-6 text-green-400 mr-3" />
                  <div>
                    <p className="text-white font-semibold">Guild Hall</p>
                    <p className="text-gray-400 text-sm">Join forces with other mages</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Header */}
      <div className="bg-gray-800/50 border-b border-gray-600 p-4">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <h1 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
            AstralEX
          </h1>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 transition-colors"
            >
              <User className="w-5 h-5" />
            </button>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Profile Dropdown */}
      {showProfile && (
        <div className="bg-gray-800/90 border-b border-gray-600 p-4">
          <div className="max-w-md mx-auto text-center">
            <p className="text-white font-semibold">{character.username}</p>
            <p className="text-gray-400 text-sm capitalize">
              Level {character.level} {character.element} Mage
            </p>
            <button
              onClick={handleLogout}
              className="mt-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-sm transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-md mx-auto min-h-screen pb-20">
        {renderContent()}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800/90 backdrop-blur-sm border-t border-gray-600">
        <div className="max-w-md mx-auto flex">
          {[
            { id: 'hub', icon: Home, label: 'Hub' },
            { id: 'buildings', icon: Building, label: 'Buildings' },
            { id: 'spells', icon: BookOpen, label: 'Spells' },
            { id: 'battle', icon: Swords, label: 'Battle' },
            { id: 'guild', icon: Users, label: 'Guild' }
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as Tab)}
              className={`flex-1 py-3 px-2 text-center transition-colors ${
                activeTab === id
                  ? 'text-orange-400 bg-orange-500/10'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5 mx-auto mb-1" />
              <span className="text-xs">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Assistant */}
      <ChatAssistant />
    </div>
  );
}
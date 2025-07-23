import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Flame, Leaf, Droplets, Sun, Moon } from 'lucide-react';

interface Element {
  id: 'fire' | 'nature' | 'water' | 'light' | 'dark';
  name: string;
  icon: React.ReactNode;
  gradient: string;
  description: string;
  bonus: string;
  ultimate: string;
}

const elements: Element[] = [
  {
    id: 'fire',
    name: 'Fire',
    icon: <Flame className="w-8 h-8" />,
    gradient: 'from-orange-500 to-red-600',
    description: 'Masters of destruction and raw power',
    bonus: '+25% Attack Damage',
    ultimate: 'Inferno Storm - Devastating area damage'
  },
  {
    id: 'nature',
    name: 'Nature',
    icon: <Leaf className="w-8 h-8" />,
    gradient: 'from-green-500 to-green-700',
    description: 'Guardians of life and regeneration',
    bonus: '+25% Mana Regeneration',
    ultimate: 'World Tree - Massive healing and buffs'
  },
  {
    id: 'water',
    name: 'Water',
    icon: <Droplets className="w-8 h-8" />,
    gradient: 'from-blue-500 to-blue-700',
    description: 'Wielders of flow and adaptation',
    bonus: '+25% Spell Efficiency',
    ultimate: 'Tsunami Wave - Overwhelming force'
  },
  {
    id: 'light',
    name: 'Light',
    icon: <Sun className="w-8 h-8" />,
    gradient: 'from-yellow-400 to-yellow-600',
    description: 'Champions of purity and protection',
    bonus: '+25% Defense Rating',
    ultimate: 'Divine Judgment - Holy devastation'
  },
  {
    id: 'dark',
    name: 'Dark',
    icon: <Moon className="w-8 h-8" />,
    gradient: 'from-purple-500 to-purple-700',
    description: 'Masters of shadow and forbidden arts',
    bonus: '+25% Critical Chance',
    ultimate: 'Void Collapse - Reality-bending power'
  }
];

interface CharacterCreationProps {
  onCharacterCreated: (character: { username: string; element: string }) => void;
}

export default function CharacterCreation({ onCharacterCreated }: CharacterCreationProps) {
  const [currentElement, setCurrentElement] = useState(0);
  const [username, setUsername] = useState('');
  const [step, setStep] = useState<'element' | 'username'>('element');

  const element = elements[currentElement];

  const nextElement = () => {
    setCurrentElement((prev) => (prev + 1) % elements.length);
  };

  const prevElement = () => {
    setCurrentElement((prev) => (prev - 1 + elements.length) % elements.length);
  };

  const handleElementConfirm = () => {
    setStep('username');
  };

  const handleComplete = () => {
    if (username.trim()) {
      onCharacterCreated({
        username: username.trim(),
        element: element.id
      });
    }
  };

  if (step === 'username') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Animated particles */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 20 }, (_, i) => (
            <div
              key={i}
              className={`absolute w-1 h-1 bg-gradient-to-r ${element.gradient} rounded-full opacity-30 animate-pulse`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
        
        <div className="text-center mb-8 relative z-10">
          <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${element.gradient} flex items-center justify-center mb-4 mx-auto animate-pulse`}>
            <div className="text-white">
              {element.icon}
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            {element.name} Mage
          </h1>
          <p className="text-gray-300 text-sm">
            Choose your magical identity
          </p>
        </div>

        <div className="w-full max-w-sm bg-gray-800/50 backdrop-blur-sm border border-gray-600 rounded-xl p-6 relative z-10">
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-white mb-2">
                Enter Your Name
              </h2>
              <p className="text-gray-400 text-sm mb-4">
                This will be your identity in the magical realm
              </p>
            </div>

            <input
              type="text"
              placeholder="Mage Name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-black/20 border border-gray-600 rounded-lg text-white placeholder-gray-400 text-center text-lg focus:outline-none focus:border-orange-500 transition-colors"
              maxLength={20}
              autoFocus
            />

            <div className="flex gap-2">
              <button
                onClick={() => setStep('element')}
                className="flex-1 py-3 bg-black/20 border border-gray-600 text-gray-300 hover:bg-black/30 rounded-lg transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleComplete}
                disabled={!username.trim()}
                className={`flex-1 py-3 bg-gradient-to-r ${element.gradient} text-white font-semibold hover:opacity-90 disabled:opacity-50 rounded-lg transition-opacity`}
              >
                Begin Journey
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex flex-col relative overflow-hidden">
      {/* Animated particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={i}
            className={`absolute w-1 h-1 bg-gradient-to-r ${element.gradient} rounded-full opacity-30 animate-pulse`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
      
      {/* Header */}
      <div className="text-center pt-8 pb-4 relative z-10">
        <h1 className="text-2xl font-bold text-white mb-2">
          Choose Your Element
        </h1>
        <p className="text-gray-300 text-sm">
          Your magical affinity will shape your destiny
        </p>
      </div>

      {/* Element Display */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 relative z-10">
        <div className="relative w-full max-w-sm">
          {/* Element Card */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-600 rounded-xl p-6 text-center">
            <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${element.gradient} flex items-center justify-center mb-4 mx-auto animate-pulse`}>
              <div className="text-white">
                {element.icon}
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">
              {element.name}
            </h2>
            
            <p className="text-gray-300 text-sm mb-4">
              {element.description}
            </p>
            
            <div className="space-y-2 mb-6">
              <div className="bg-black/20 rounded-lg p-2">
                <p className="text-orange-400 font-semibold text-sm">
                  {element.bonus}
                </p>
              </div>
              <div className="bg-black/20 rounded-lg p-2">
                <p className="text-purple-400 text-xs">
                  <span className="font-semibold">Ultimate:</span> {element.ultimate}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={prevElement}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-12 h-12 rounded-full bg-black/40 border border-gray-600 hover:bg-black/60 transition-colors flex items-center justify-center"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          
          <button
            onClick={nextElement}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-12 h-12 rounded-full bg-black/40 border border-gray-600 hover:bg-black/60 transition-colors flex items-center justify-center"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="p-4 space-y-4 relative z-10">
        {/* Element Indicators */}
        <div className="flex justify-center space-x-2">
          {elements.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentElement ? 'bg-orange-500' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>

        {/* Confirm Button */}
        <button
          onClick={handleElementConfirm}
          className={`w-full py-3 bg-gradient-to-r ${element.gradient} text-white font-semibold hover:opacity-90 rounded-lg transition-opacity`}
        >
          Choose {element.name}
        </button>
      </div>
    </div>
  );
}
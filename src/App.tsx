import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { blink } from './blink/client';
import { MagicalBackground } from './components/MagicalBackground';
import AuthScreen from './components/AuthScreen';
import CharacterCreation from './components/CharacterCreation';

interface User {
  id: string;
  email: string;
}

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

type Screen = 'auth' | 'character-creation' | 'main-hub';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [character, setCharacter] = useState<Character | null>(null);
  const [currentScreen, setCurrentScreen] = useState<Screen>('auth');
  const [loading, setLoading] = useState(true);

  const loadCharacter = async (userId: string) => {
    try {
      const characters = await blink.db.characters.list({
        where: { userId },
        limit: 1
      });
      
      if (characters.length > 0) {
        const char = characters[0];
        setCharacter({
          id: char.id,
          username: char.username,
          element: char.element,
          level: char.level || 1,
          gold: char.gold || 10000,
          mana: char.mana || 100,
          turns: char.turns || 50,
          diamonds: char.diamonds || 100
        });
        setCurrentScreen('main-hub');
      } else {
        setCurrentScreen('character-creation');
      }
    } catch (error) {
      console.error('Error loading character:', error);
      setCurrentScreen('character-creation');
    }
  };

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user);
      setLoading(state.isLoading);
      
      if (state.user && !state.isLoading) {
        loadCharacter(state.user.id);
      }
    });
    
    return unsubscribe;
  }, []);

  const handleCharacterCreated = async (characterData: { username: string; element: string }) => {
    if (!user) return;
    
    try {
      const newCharacter = await blink.db.characters.create({
        id: `char_${Date.now()}`,
        userId: user.id,
        username: characterData.username,
        element: characterData.element,
        level: 1,
        gold: 10000,
        mana: 100,
        turns: 50,
        diamonds: 100,
        createdAt: new Date().toISOString()
      });
      
      setCharacter({
        id: newCharacter.id,
        username: newCharacter.username,
        element: newCharacter.element,
        level: 1,
        gold: 10000,
        mana: 100,
        turns: 50,
        diamonds: 100
      });
      
      setCurrentScreen('main-hub');
    } catch (error) {
      console.error('Error creating character:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white font-semibold">Loading AstralEX...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <MagicalBackground>
          <AuthScreen />
        </MagicalBackground>
        <Toaster position="top-center" />
      </>
    );
  }

  return (
    <>
      {currentScreen === 'character-creation' && (
        <MagicalBackground>
          <CharacterCreation onCharacterCreated={handleCharacterCreated} />
        </MagicalBackground>
      )}
      
      {currentScreen === 'main-hub' && character && (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent mb-4">
              Welcome to AstralEX!
            </h1>
            <div className="bg-gray-800/50 rounded-xl p-6 max-w-md">
              <h2 className="text-xl font-semibold mb-2">Character Created!</h2>
              <p className="text-gray-300 mb-4">
                Welcome, <span className="text-orange-400 font-semibold">{character.username}</span>
              </p>
              <p className="text-gray-400 text-sm mb-4">
                Element: <span className="capitalize text-purple-400">{character.element}</span> Mage
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <p className="text-yellow-400 font-semibold">{character.gold.toLocaleString()}</p>
                  <p className="text-gray-400">Gold</p>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <p className="text-blue-400 font-semibold">{character.mana}</p>
                  <p className="text-gray-400">Mana</p>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <p className="text-green-400 font-semibold">{character.turns}</p>
                  <p className="text-gray-400">Turns</p>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <p className="text-purple-400 font-semibold">{character.diamonds}</p>
                  <p className="text-gray-400">Diamonds</p>
                </div>
              </div>
              <p className="text-gray-500 text-xs mt-4">
                Full game features coming soon! Your character is saved and ready.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <Toaster position="top-center" />
    </>
  );
}
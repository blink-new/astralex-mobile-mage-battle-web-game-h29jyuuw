import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { blink } from './blink/client';
import { MagicalBackground } from './components/MagicalBackground';
import AuthScreen from './components/AuthScreen';
import CharacterCreation from './components/CharacterCreation';
import MainHub from './components/MainHub';

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
      } else if (!state.user && !state.isLoading) {
        // User logged out, reset everything
        setCharacter(null);
        setCurrentScreen('auth');
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

  const handleCharacterUpdate = (updates: Partial<Character>) => {
    if (character) {
      setCharacter({ ...character, ...updates });
    }
  };

  const handleLogout = () => {
    setUser(null);
    setCharacter(null);
    setCurrentScreen('auth');
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
        <MainHub 
          character={character} 
          onCharacterUpdate={handleCharacterUpdate}
          onLogout={handleLogout}
        />
      )}
      
      <Toaster position="top-center" />
    </>
  );
}
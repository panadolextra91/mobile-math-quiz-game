import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PLAYER_NAME_KEY = '@math_maze:player_name';

export function usePlayerName() {
  const [playerName, setPlayerName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load player name from storage on mount
  useEffect(() => {
    loadPlayerName();
  }, []);

  const loadPlayerName = async () => {
    try {
      const storedName = await AsyncStorage.getItem(PLAYER_NAME_KEY);
      if (storedName) {
        setPlayerName(storedName);
      }
    } catch (error) {
      console.error('Error loading player name:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const savePlayerName = async (name: string) => {
    try {
      await AsyncStorage.setItem(PLAYER_NAME_KEY, name);
      setPlayerName(name);
    } catch (error) {
      console.error('Error saving player name:', error);
      throw error;
    }
  };

  const clearPlayerName = async () => {
    try {
      await AsyncStorage.removeItem(PLAYER_NAME_KEY);
      setPlayerName(null);
    } catch (error) {
      console.error('Error clearing player name:', error);
    }
  };

  return {
    playerName,
    isLoading,
    savePlayerName,
    clearPlayerName,
  };
}


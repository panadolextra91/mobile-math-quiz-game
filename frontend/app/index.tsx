import { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { BackgroundImage, TextButton, CatIdle, SettingsIcon, SettingsBoard, NameBoard } from '@/components/index';
import { usePlayerName } from '@/src/hooks/usePlayerName';
import { useGameSessionStore, useGameUIStore, useQuizStore } from '@/src/store';

export default function HomeScreen() {
  const router = useRouter();
  const { playerName: storedPlayerName } = usePlayerName();
  const [showSettings, setShowSettings] = useState(false);
  const [showNameBoard, setShowNameBoard] = useState(false);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [language, setLanguage] = useState<'english' | 'vietnamese'>('english');

  // Auto-start game if player name exists
  useEffect(() => {
    if (storedPlayerName && !showNameBoard) {
      // Player name exists, but don't auto-start - let user click Start
      // This is just for reference if needed
    }
  }, [storedPlayerName, showNameBoard]);

  return (
    <BackgroundImage source={require('@/assets/images/forest.png')}>
      <TouchableOpacity
        style={styles.settingsButton}
        onPress={() => setShowSettings(true)}
      >
        <SettingsIcon size={32} color="#fff" />
      </TouchableOpacity>
      <View style={styles.buttonsContainer}>
        <TextButton title="Start" onPress={() => setShowNameBoard(true)} />
        <TextButton title="Leaderboard" onPress={() => router.push('/Leaderboard')} />
        <TextButton title="My Statistics" onPress={() => router.push('/PersonaStats')} />
        <CatIdle width={200} height={200} style={styles.cat} />
      </View>
      {showSettings && (
        <SettingsBoard
          musicEnabled={musicEnabled}
          soundEnabled={soundEnabled}
          language={language}
          onMusicToggle={() => setMusicEnabled(!musicEnabled)}
          onSoundToggle={() => setSoundEnabled(!soundEnabled)}
          onLanguageChange={setLanguage}
          onClose={() => setShowSettings(false)}
        />
      )}
      {showNameBoard && (
        <NameBoard
          onClose={() => setShowNameBoard(false)}
          onSubmit={(session) => {
            setShowNameBoard(false);
            // Reset all Zustand stores before starting a new game
            useGameSessionStore.getState().resetSession();
            useGameUIStore.getState().resetGameUI();
            useQuizStore.getState().resetQuiz();
            // Navigate to game screen with session data
            router.push({
              pathname: '/Game',
              params: {
                session: encodeURIComponent(JSON.stringify(session)),
              },
            });
          }}
        />
      )}
    </BackgroundImage>
  );
}

const styles = StyleSheet.create({
  buttonsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 0,
  },
  settingsButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  cat: {
    position: 'absolute',
    bottom: 20,
  },
});


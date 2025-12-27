import { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import Animated from 'react-native-reanimated';
import { GameSession } from '@/services/api';
import { CatWalk, CatIdle } from '@/components/animations';
import { SettingsIcon } from '@/components/icons';
import { GameStats, Obstacle, SettingsBoard } from '@/src/components';
import { useBackgroundAnimation } from '@/src/hooks/useBackgroundAnimation';
import { useObstacles } from '@/src/hooks/useObstacles';
import { GAME_CONSTANTS } from '@/src/constants/game';

export default function GameScreen() {
  const params = useLocalSearchParams<{ session: string }>();

  // Parse session from params (passed as JSON string)
  const session: GameSession | null = params.session
    ? JSON.parse(decodeURIComponent(params.session))
    : null;

  const { obstacles, removeObstacle, handleCollision, hasCollision, spawnedCount, maxQuestions } = useObstacles({ session });
  const backgroundAnimatedStyle = useBackgroundAnimation(hasCollision);

  // Settings state
  const [showSettings, setShowSettings] = useState(false);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [language, setLanguage] = useState<'english' | 'vietnamese'>('english');

  return (
    <View style={styles.container}>
      {/* Sliding Background Container */}
      <View style={styles.backgroundWrapper}>
        <Animated.View style={[styles.backgroundContainer, backgroundAnimatedStyle]}>
          {/* First image - starts visible */}
          <Image
            source={require('@/assets/images/forest.png')}
            style={styles.backgroundImage}
            contentFit="cover"
          />
          {/* Second image - appears as first slides out, creates seamless loop */}
          <Image
            source={require('@/assets/images/forest.png')}
            style={styles.backgroundImage}
            contentFit="cover"
          />
        </Animated.View>
      </View>

      {/* Game content */}
      <View style={styles.content}>
        {/* Settings button - top right corner */}
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => setShowSettings(true)}
        >
          <SettingsIcon size={32} color="#fff" />
        </TouchableOpacity>

        {/* Top left corner - player stats */}
        <GameStats session={session} />

        {/* Cat animation - idle if collision, walk otherwise */}
        {hasCollision ? (
          <CatIdle width={220} height={220} fps={8} style={styles.cat} />
        ) : (
          <CatWalk width={220} height={220} fps={8} style={styles.cat} />
        )}

        {/* Obstacles */}
        {obstacles.map((obstacle) => (
          <Obstacle
            key={obstacle.id}
            id={obstacle.id}
            type={obstacle.type}
            onCollision={handleCollision}
            onComplete={removeObstacle}
            isCollided={hasCollision}
          />
        ))}

        {/* Settings Board */}
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  backgroundWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: GAME_CONSTANTS.SCREEN_WIDTH,
    height: GAME_CONSTANTS.SCREEN_HEIGHT,
    overflow: 'hidden',
  },
  backgroundContainer: {
    flexDirection: 'row',
    width: GAME_CONSTANTS.SCREEN_WIDTH * 2, // Two images for seamless loop
    height: GAME_CONSTANTS.SCREEN_HEIGHT,
  },
  backgroundImage: {
    width: GAME_CONSTANTS.SCREEN_WIDTH,
    height: GAME_CONSTANTS.SCREEN_HEIGHT,
  },
  content: {
    flex: 1,
    zIndex: 1,
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
    bottom: 25,
    left: 20,
  },
});

import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { GameSession } from '@/services/api';
import { GAME_CONSTANTS } from '@/src/constants/game';

interface GameStatsProps {
  session: GameSession | null;
}

export function GameStats({ session }: GameStatsProps) {
  return (
    <View style={styles.statsContainer}>
      <Image
        source={require('@/assets/images/player_stats/player_frame.png')}
        style={styles.playerFrame}
        contentFit="contain"
      />
      <View style={styles.statsRight}>
        {/* Health indicator row */}
        <View style={styles.healthRow}>
          {session && (
            <Image
              source={
                session.health === 3
                  ? require('@/assets/images/player_stats/full_health.png')
                  : session.health === 2
                  ? require('@/assets/images/player_stats/medium_health.png')
                  : session.health === 1
                  ? require('@/assets/images/player_stats/low_health.png')
                  : require('@/assets/images/player_stats/no_health.png')
              }
              style={styles.healthImage}
              contentFit="contain"
            />
          )}
        </View>
        {/* Boost frames row */}
        <View style={styles.boostRow}>
          <Image
            source={require('@/assets/images/player_stats/boost_frame.png')}
            style={styles.boostFrame}
            contentFit="contain"
          />
          <Image
            source={require('@/assets/images/player_stats/boost_frame.png')}
            style={styles.boostFrame}
            contentFit="contain"
          />
          <Image
            source={require('@/assets/images/player_stats/boost_frame.png')}
            style={styles.boostFrame}
            contentFit="contain"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statsContainer: {
    position: 'absolute',
    top: 50,
    left: -10,
    flexDirection: 'row',
    zIndex: 10,
  },
  playerFrame: {
    width: 120,
    height: 120,
  },
  statsRight: {
    marginLeft: 0,
    justifyContent: 'space-between',
  },
  healthRow: {
    marginBottom: 10,
    marginTop: 10,
  },
  healthImage: {
    width: 150,
    height: 40,
  },
  boostRow: {
    flexDirection: 'row',
    gap: 25,
    marginBottom: 25,
    marginLeft: 5,
  },
  boostFrame: {
    width: 30,
    height: 30,
  },
});


import { View, StyleSheet, Text } from 'react-native';
import { Image } from 'expo-image';
import { GameSession } from '@/services/api';
import { Fonts } from '@/constants/fonts';

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
        {/* Player name */}
        <View style={styles.playerNameRow}>
          {session && (
            <Text style={styles.playerName}>{session.playerName}</Text>
          )}
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
  playerNameRow: {
    marginBottom: 25,
    marginLeft: 5,
  },
  playerName: {
    fontFamily: Fonts.jersey10,
    fontSize: 50,
    color: '#fff',
    fontWeight: 'bold',
  },
});


import { View, Text, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import { Fonts } from '@/constants/fonts';
import { GameSession } from '@/services/api';
import { CloseIcon } from '@/components/icons';

interface EndGameBoardProps {
  session: GameSession;
  onClose?: () => void;
}

export function EndGameBoard({ session, onClose }: EndGameBoardProps) {
  const incorrectQuestions = session.questionsAnswered - session.questionsCorrect;

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('@/assets/images/board.png')}
        style={styles.board}
        imageStyle={styles.boardImage}
        resizeMode="stretch"
      >
        {/* Close Icon - top right corner */}
        {onClose && (
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <CloseIcon size={40} color="#000000" />
          </TouchableOpacity>
        )}

        <Text style={styles.title}>Game Over</Text>

        {/* Score - centered and biggest */}
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreValue}>{session.score}</Text>
        </View>

        {/* Streak */}
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Streak:</Text>
          <Text style={styles.statValue}>{session.streak}</Text>
        </View>

        {/* Correct Questions */}
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Correct:</Text>
          <Text style={styles.statValue}>{session.questionsCorrect}</Text>
        </View>

        {/* Incorrect Questions */}
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Incorrect:</Text>
          <Text style={styles.statValue}>{incorrectQuestions}</Text>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  board: {
    width: 400,
    minHeight: 400,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  boardImage: {
    resizeMode: 'stretch',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 8,
    zIndex: 10,
  },
  title: {
    fontFamily: Fonts.jersey10,
    fontSize: 48,
    color: '#000000',
    marginBottom: 10,
    textAlign: 'center',
  },
  scoreContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreValue: {
    fontFamily: Fonts.jersey10,
    fontSize: 72,
    color: '#000000',
    fontWeight: 'bold',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  statLabel: {
    fontFamily: Fonts.jersey10,
    fontSize: 32,
    color: '#000000',
  },
  statValue: {
    fontFamily: Fonts.jersey10,
    fontSize: 32,
    color: '#000000',
    fontWeight: 'bold',
  },
});


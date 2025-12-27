import { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated from 'react-native-reanimated';
import { GameSession, Question, generateQuiz, submitAnswer, endGameSession } from '@/services/api';
import { CatWalk, CatIdle, CatHurt, CatDeath } from '@/components/animations';
import { SettingsIcon } from '@/components/icons';
import { GameStats, Obstacle, SettingsBoard, QuestionBox, OptionBox, EndGameBoard } from '@/src/components';
import { useBackgroundAnimation } from '@/src/hooks/useBackgroundAnimation';
import { useObstacles } from '@/src/hooks/useObstacles';
import { GAME_CONSTANTS } from '@/src/constants/game';
import { Fonts } from '@/src/constants/fonts';

export default function GameScreen() {
  const params = useLocalSearchParams<{ session: string }>();
  const router = useRouter();

  // Parse session from params (passed as JSON string)
  const [session, setSession] = useState<GameSession | null>(
    params.session
    ? JSON.parse(decodeURIComponent(params.session))
      : null
  );

  // Game over state (declared early so it can be used in hooks)
  const [isGameOver, setIsGameOver] = useState(false);
  const [showDeathAnimation, setShowDeathAnimation] = useState(false);
  const [showEndGameBoard, setShowEndGameBoard] = useState(false);

  const { obstacles, removeObstacle, handleCollision, hasCollision, collidedObstacleId, spawnedCount, maxQuestions, resetCollision } = useObstacles({ session, isGameOver });
  const backgroundAnimatedStyle = useBackgroundAnimation(hasCollision || isGameOver);

  // Quiz state
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [isAnswering, setIsAnswering] = useState(false);
  const questionGeneratedRef = useRef(false);

  // Attack/Hurt sequence state (for incorrect answers)
  const [isAttacking, setIsAttacking] = useState(false);
  const [isHurt, setIsHurt] = useState(false);

  // Find the collided obstacle and get its frame image
  const collidedObstacle = collidedObstacleId 
    ? obstacles.find(obs => obs.id === collidedObstacleId)
    : null;

  const getObstacleFrameImage = (type: string | undefined) => {
    switch (type) {
      case 'DogWalk':
        return require('@/assets/images/obstacle_frames/dog_frame.png');
      case 'Dog2Walk':
        return require('@/assets/images/obstacle_frames/dog2_frame.png');
      case 'RatWalk':
        return require('@/assets/images/obstacle_frames/rat_frame.png');
      case 'Rat2Walk':
        return require('@/assets/images/obstacle_frames/rat2_frame.png');
      default:
        return null;
    }
  };

  const obstacleFrameImage = collidedObstacle 
    ? getObstacleFrameImage(collidedObstacle.type)
    : null;

  // Settings state
  const [showSettings, setShowSettings] = useState(false);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [language, setLanguage] = useState<'english' | 'vietnamese'>('english');

  // Generate quiz when collision happens (only if game is not over)
  useEffect(() => {
    if (hasCollision && session && !questionGeneratedRef.current && !isGameOver) {
      questionGeneratedRef.current = true;
      generateQuiz({
        type: session.quizType,
        difficulty: session.difficulty,
        count: 1,
      })
        .then((response) => {
          if (response.questions && response.questions.length > 0) {
            setCurrentQuestion(response.questions[0]);
          }
        })
        .catch((error) => {
          console.error('Failed to generate quiz:', error);
        });
    }
  }, [hasCollision, session, isGameOver]);

  // Reset question when collision is cleared
  useEffect(() => {
    if (!hasCollision) {
      setCurrentQuestion(null);
      questionGeneratedRef.current = false;
      setIsAnswering(false);
      setIsAttacking(false);
      setIsHurt(false);
    }
  }, [hasCollision]);

  // Handle answer selection
  const handleAnswerSelect = async (selectedAnswer: number) => {
    if (!currentQuestion || !session || isAnswering || isGameOver) return;

    setIsAnswering(true);
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

    try {
      const response = await submitAnswer({
        sessionId: session.id,
        questionId: currentQuestion.id,
        answer: selectedAnswer,
        isCorrect,
      });

      // Update session with new score and state
      setSession(response.session);

      // Check if health reached 0 (game over)
      if (response.session.health <= 0 && !isGameOver) {
        setIsGameOver(true);
        setShowDeathAnimation(true);
        
        // After death animation plays once, show end game board
        // Assuming death animation is ~1-2 seconds, wait 2 seconds
        setTimeout(() => {
          setShowDeathAnimation(false);
          setShowEndGameBoard(true);
        }, 2000);
      }

      if (isCorrect) {
        // If correct, reset collision and let obstacle pass through
        // Reset immediately so both sprites go back to walking
        resetCollision();
        
        if (collidedObstacleId) {
          // Remove the obstacle after it passes through the screen
          // Give it enough time to slide past the player
          setTimeout(() => {
            removeObstacle(collidedObstacleId);
          }, GAME_CONSTANTS.OBSTACLE_SPEED);
        }
      } else {
        // If incorrect, trigger attack sequence: attack -> wait 1s -> hurt -> then pass through
        setIsAttacking(true);
        
        // After 1 second, show hurt animation
        setTimeout(() => {
          setIsAttacking(false);
          setIsHurt(true);
          
          // After hurt animation, reset collision and let obstacle pass through
          setTimeout(() => {
            setIsHurt(false);
            resetCollision();
            
            if (collidedObstacleId) {
              // Remove the obstacle after it passes through the screen
              setTimeout(() => {
                removeObstacle(collidedObstacleId);
              }, GAME_CONSTANTS.OBSTACLE_SPEED);
            }
          }, 500); // Show hurt for 0.5 seconds
        }, 1000); // Attack for 1 second
        
      }
    } catch (error) {
      console.error('Failed to submit answer:', error);
      setIsAnswering(false);
    }
  };

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

        {/* Player score */}
        <Text style={styles.scoreText}>
          {session?.score ?? 0}
        </Text>

        {/* Question box and obstacle frame - shown when both sprites are idle (collision occurred) */}
        {hasCollision && obstacleFrameImage && currentQuestion && (
          <>
            <QuestionBox style={styles.questionBox} text={currentQuestion.question} />
            {/* 4 Option boxes in 2 columns using flexbox layout */}
            <View style={styles.optionsContainer}>
              {currentQuestion.options.map((option, index) => (
                <OptionBox
                  key={index}
                  text={option.toString()}
                  onPress={() => handleAnswerSelect(option)}
                  disabled={isAnswering}
                />
              ))}
            </View>
            <Image
              source={obstacleFrameImage}
              style={styles.obstacleFrame}
              contentFit="contain"
            />
          </>
        )}

        {/* Cat animation - death if game over (stays in death state), hurt if hurt, idle if collision, walk otherwise */}
        {isGameOver ? (
          <CatDeath width={220} height={220} fps={8} style={styles.cat} />
        ) : isHurt ? (
          <CatHurt width={220} height={220} fps={8} style={styles.cat} />
        ) : hasCollision ? (
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
            isCollided={(hasCollision && obstacle.id === collidedObstacleId) || isGameOver}
            isAttacking={isAttacking && obstacle.id === collidedObstacleId && !isGameOver}
            isGameOver={isGameOver}
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

        {/* End Game Board */}
        {showEndGameBoard && session && (
          <EndGameBoard
            session={session}
            onClose={async () => {
              try {
                // Call API to end the session
                await endGameSession(session.id);
                // Navigate back to home screen
                router.back();
              } catch (error) {
                console.error('Failed to end game session:', error);
                // Navigate back even if API call fails
                router.back();
              }
            }}
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
  scoreText: {
    fontFamily: Fonts.jersey10,
    position: 'absolute',
    top: 160,
    left: 5,
    color: '#fff',
    fontSize: 50,
    zIndex: 10,
  },
  questionBox: {
    position: 'absolute',
    top: 240,
    right: 100,
    zIndex: 9,
  },
  obstacleFrame: {
    position: 'absolute',
    top: 220,
    right: 10,
    width: 120,
    height: 120,
    zIndex: 10,
  },
  optionsContainer: {
    position: 'absolute',
    top: 370,
    right: 15,
    width: 420, // 2 columns * 200px + 10px gap + 10px right margin
    zIndex: 9,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 30,
  },
});

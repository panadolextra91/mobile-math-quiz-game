import { useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated from 'react-native-reanimated';
import { generateQuiz, submitAnswer, endGameSession } from '@/services/api';
import { CatWalk, CatIdle, CatHurt, CatDeath } from '@/components/animations';
import { SettingsIcon } from '@/components/icons';
import { GameStats, Obstacle, SettingsBoard, QuestionBox, OptionBox, EndGameBoard } from '@/src/components';
import { useBackgroundAnimation } from '@/src/hooks/useBackgroundAnimation';
import { useObstacles } from '@/src/hooks/useObstacles';
import { GAME_CONSTANTS } from '@/src/constants/game';
import { Fonts } from '@/src/constants/fonts';
import { useGameSessionStore, useGameUIStore, useQuizStore } from '@/src/store';

export default function GameScreen() {
  const params = useLocalSearchParams<{ session: string }>();
  const router = useRouter();

  // Zustand stores
  const session = useGameSessionStore((state) => state.session);
  const setSession = useGameSessionStore((state) => state.setSession);
  const updateSession = useGameSessionStore((state) => state.updateSession);
  
  const isGameOver = useGameUIStore((state) => state.isGameOver);
  const showDeathAnimation = useGameUIStore((state) => state.showDeathAnimation);
  const showEndGameBoard = useGameUIStore((state) => state.showEndGameBoard);
  const endGameTitle = useGameUIStore((state) => state.endGameTitle);
  const isAttacking = useGameUIStore((state) => state.isAttacking);
  const isHurt = useGameUIStore((state) => state.isHurt);
  const showSettings = useGameUIStore((state) => state.showSettings);
  const musicEnabled = useGameUIStore((state) => state.musicEnabled);
  const soundEnabled = useGameUIStore((state) => state.soundEnabled);
  const language = useGameUIStore((state) => state.language);
  
  const setIsGameOver = useGameUIStore((state) => state.setIsGameOver);
  const setShowDeathAnimation = useGameUIStore((state) => state.setShowDeathAnimation);
  const setShowEndGameBoard = useGameUIStore((state) => state.setShowEndGameBoard);
  const setEndGameTitle = useGameUIStore((state) => state.setEndGameTitle);
  const setIsAttacking = useGameUIStore((state) => state.setIsAttacking);
  const setIsHurt = useGameUIStore((state) => state.setIsHurt);
  const setShowSettings = useGameUIStore((state) => state.setShowSettings);
  const setMusicEnabled = useGameUIStore((state) => state.setMusicEnabled);
  const setSoundEnabled = useGameUIStore((state) => state.setSoundEnabled);
  const setLanguage = useGameUIStore((state) => state.setLanguage);
  
  const currentQuestion = useQuizStore((state) => state.currentQuestion);
  const isAnswering = useQuizStore((state) => state.isAnswering);
  const questionGenerated = useQuizStore((state) => state.questionGenerated);
  const lastQuestionObstacleId = useQuizStore((state) => state.lastQuestionObstacleId);
  
  const setCurrentQuestion = useQuizStore((state) => state.setCurrentQuestion);
  const setIsAnswering = useQuizStore((state) => state.setIsAnswering);
  const setQuestionGenerated = useQuizStore((state) => state.setQuestionGenerated);
  const setLastQuestionObstacleId = useQuizStore((state) => state.setLastQuestionObstacleId);

  // Initialize session from params
  useEffect(() => {
    if (params.session && !session) {
      const parsedSession = JSON.parse(decodeURIComponent(params.session));
      setSession(parsedSession);
    }
  }, [params.session, session, setSession]);

  const { obstacles, removeObstacle, handleCollision, hasCollision, collidedObstacleId, spawnedCount, maxQuestions, resetCollision } = useObstacles({ session, isGameOver });
  const backgroundAnimatedStyle = useBackgroundAnimation(hasCollision || isGameOver);

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

  // Debug logging
  useEffect(() => {
    if (hasCollision) {
      console.log('Collision state:', {
        hasCollision,
        collidedObstacleId,
        collidedObstacle: collidedObstacle ? { id: collidedObstacle.id, type: collidedObstacle.type } : null,
        obstacleFrameImage: obstacleFrameImage ? 'exists' : 'null',
        currentQuestion: currentQuestion ? currentQuestion.question : 'null',
        questionGenerated,
      });
    }
  }, [hasCollision, collidedObstacleId, collidedObstacle, obstacleFrameImage, currentQuestion, questionGenerated]);

  // Generate quiz when collision happens (only if game is not over)
  useEffect(() => {
    // Reset if this is a new collision with a different obstacle
    if (collidedObstacleId && collidedObstacleId !== lastQuestionObstacleId) {
      setQuestionGenerated(false);
      setLastQuestionObstacleId(collidedObstacleId);
    }

    if (hasCollision && session && !questionGenerated && !isGameOver && collidedObstacleId) {
      setQuestionGenerated(true);
      console.log('Generating quiz for collision with:', collidedObstacleId);
      generateQuiz({
        type: session.quizType,
        difficulty: session.difficulty,
        count: 1,
      })
        .then((response) => {
          if (response.questions && response.questions.length > 0) {
            console.log('Quiz generated successfully:', response.questions[0].question);
            setCurrentQuestion(response.questions[0]);
          } else {
            console.error('No questions in response');
            setQuestionGenerated(false); // Reset on error so we can retry
          }
        })
        .catch((error) => {
          console.error('Failed to generate quiz:', error);
          setQuestionGenerated(false); // Reset on error so we can retry
        });
    }
  }, [hasCollision, session, isGameOver, collidedObstacleId, questionGenerated, lastQuestionObstacleId, setQuestionGenerated, setLastQuestionObstacleId, setCurrentQuestion]);

  // Reset question when collision is cleared
  useEffect(() => {
    if (!hasCollision) {
      setCurrentQuestion(null);
      setQuestionGenerated(false);
      setLastQuestionObstacleId(null);
      setIsAnswering(false);
      setIsAttacking(false);
      setIsHurt(false);
    }
  }, [hasCollision, setCurrentQuestion, setQuestionGenerated, setLastQuestionObstacleId, setIsAnswering, setIsAttacking, setIsHurt]);

  // Check win condition: all questions answered and health > 0
  useEffect(() => {
    if (session && session.questionsAnswered >= maxQuestions && session.health > 0 && !isGameOver && !showEndGameBoard) {
      setIsGameOver(true);
      setEndGameTitle('You Won');
      setShowEndGameBoard(true);
    }
  }, [session?.questionsAnswered, session?.health, maxQuestions, isGameOver, showEndGameBoard]);

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
        setEndGameTitle('Game Over');
        
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

        {/* Cat animation - death if game over and health <= 0, idle if game over and health > 0 (win), hurt if hurt, idle if collision, walk otherwise */}
        {isGameOver && session && session.health <= 0 ? (
          <CatDeath width={220} height={220} fps={8} style={styles.cat} />
        ) : isGameOver ? (
          <CatIdle width={220} height={220} fps={8} style={styles.cat} />
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
            onLanguageChange={(lang) => setLanguage(lang)}
            onClose={() => setShowSettings(false)}
          />
        )}

        {/* End Game Board */}
        {showEndGameBoard && session && (
          <EndGameBoard
            session={session}
            title={endGameTitle}
            onClose={async () => {
              try {
                // Call API to end the session
                await endGameSession(session.id);
              } catch (error) {
                console.error('Failed to end game session:', error);
              } finally {
                // Reset all Zustand stores before navigating back
                useGameSessionStore.getState().resetSession();
                useGameUIStore.getState().resetGameUI();
                useQuizStore.getState().resetQuiz();
                // Navigate back to home screen
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
    right: 50,
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

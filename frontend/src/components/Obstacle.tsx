import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
  cancelAnimation,
} from 'react-native-reanimated';
import { Dog2Walk, DogWalk, Rat2Walk, RatWalk, Dog2Idle, DogIdle, Rat2Idle, RatIdle, DogAttack, Dog2Attack } from '@/components/animations';
import { ObstacleType } from '@/src/types/game';
import { GAME_CONSTANTS } from '@/src/constants/game';

interface ObstacleProps {
  id: string;
  type: ObstacleType;
  onCollision: (id: string) => void;
  onComplete: (id: string) => void;
  isCollided?: boolean;
  isAttacking?: boolean;
  isGameOver?: boolean;
}

export function Obstacle({ id, type, onCollision, onComplete, isCollided = false, isAttacking = false, isGameOver = false }: ObstacleProps) {
  const obstacleX = useSharedValue(GAME_CONSTANTS.SCREEN_WIDTH);
  const [hasCollided, setHasCollided] = useState(false);
  const [hasPassedCat, setHasPassedCat] = useState(false);
  const catCollisionX = GAME_CONSTANTS.CAT_POSITION_X + GAME_CONSTANTS.CAT_WIDTH;

  // Resume animation when collision is cleared (correct answer)
  useEffect(() => {
    if (isGameOver) {
      // Stop all animations when game is over
      cancelAnimation(obstacleX);
      return;
    }
    if (!isCollided && hasCollided && !hasPassedCat) {
      // Resume animation from current position first
      const currentX = obstacleX.value;
      const remainingDistance = currentX + GAME_CONSTANTS.OBSTACLE_WIDTH;
      const totalDistance = GAME_CONSTANTS.SCREEN_WIDTH + GAME_CONSTANTS.OBSTACLE_WIDTH;
      const remainingRatio = Math.max(0.1, Math.min(1, remainingDistance / totalDistance));
      
      obstacleX.value = withTiming(
        -GAME_CONSTANTS.OBSTACLE_WIDTH,
        {
          duration: GAME_CONSTANTS.OBSTACLE_SPEED * remainingRatio,
          easing: Easing.linear,
        },
        (finished) => {
          if (finished) {
            runOnJS(onComplete)(id);
          }
        }
      );
      
      // Reset hasCollided state after starting animation so obstacle goes back to walk animation
      setHasCollided(false);
    }
  }, [isCollided, hasCollided, hasPassedCat, obstacleX, id, onComplete, isGameOver]);

  useEffect(() => {
    // Stop all animations when game is over
    if (isGameOver) {
      cancelAnimation(obstacleX);
      return;
    }
    
    // Only handle initial animation start, not resume
    // Resume is handled by the separate effect above
    
    // If collision just cleared (isCollided false but was collided), don't interfere with resume
    if (isCollided) {
      // Stop animation if collision occurred
      cancelAnimation(obstacleX);
      return;
    }
    
    // If hasCollided is true but isCollided is false, we're in the process of resuming
    // Don't interfere with the resume effect
    if (hasCollided) {
      return;
    }

    // Don't start new animation if obstacle is already moving (has passed starting position)
    // This prevents restarting when obstacle is resuming from collision
    const currentX = obstacleX.value;
    if (currentX < GAME_CONSTANTS.SCREEN_WIDTH) {
      // Obstacle is already in motion (either initial or resuming), don't restart
      return;
    }

    // Animate obstacle from right to left
    obstacleX.value = withTiming(
      -GAME_CONSTANTS.OBSTACLE_WIDTH,
      {
        duration: GAME_CONSTANTS.OBSTACLE_SPEED,
        easing: Easing.linear,
      },
      (finished) => {
        if (finished && !hasCollided) {
          runOnJS(onComplete)(id);
        }
      }
    );

    // Monitor for collision
    const collisionCheckInterval = setInterval(() => {
      const currentX = obstacleX.value;
      const obstacleRight = currentX + GAME_CONSTANTS.OBSTACLE_WIDTH;

      // Check if obstacle overlaps with cat
      if (
        obstacleRight >= GAME_CONSTANTS.CAT_POSITION_X &&
        currentX <= catCollisionX
      ) {
        clearInterval(collisionCheckInterval);
        runOnJS(() => {
          setHasCollided(true);
          onCollision(id);
        })();
        cancelAnimation(obstacleX);
      }

      // Stop checking if obstacle has passed the cat
      if (currentX < GAME_CONSTANTS.CAT_POSITION_X - GAME_CONSTANTS.OBSTACLE_WIDTH) {
        clearInterval(collisionCheckInterval);
        runOnJS(setHasPassedCat)(true);
      }
    }, GAME_CONSTANTS.COLLISION_CHECK_INTERVAL);

    // Cleanup interval when obstacle animation completes
    const cleanupTimer = setTimeout(
      () => clearInterval(collisionCheckInterval),
      GAME_CONSTANTS.OBSTACLE_SPEED + 100
    );

    return () => {
      clearInterval(collisionCheckInterval);
      clearTimeout(cleanupTimer);
    };
  }, [id, obstacleX, onCollision, onComplete, isCollided, hasCollided, isGameOver]);

  const obstacleStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: obstacleX.value }, { scaleX: -1 }], // Flip horizontally
    };
  });

  // Use idle animation only if currently collided (not if it was collided but now cleared)
  // hasCollided is used internally for animation control, but isCollided prop determines visual state
  // Use attack animation if isAttacking is true (only Dogs have attack animations)
  const isIdle = isCollided && !isAttacking;
  const ObstacleAnimation = isAttacking
    ? {
        Dog2Walk: Dog2Attack,
        DogWalk: DogAttack,
        Rat2Walk: Rat2Idle, // Rats don't have attack animation, use idle
        RatWalk: RatIdle,
      }[type]
    : isIdle
    ? {
        Dog2Walk: Dog2Idle,
        DogWalk: DogIdle,
        Rat2Walk: Rat2Idle,
        RatWalk: RatIdle,
      }[type]
    : {
        Dog2Walk,
        DogWalk,
        Rat2Walk,
        RatWalk,
      }[type];

  return (
    <Animated.View style={[styles.obstacleContainer, obstacleStyle]}>
      <ObstacleAnimation
        width={GAME_CONSTANTS.OBSTACLE_WIDTH}
        height={GAME_CONSTANTS.OBSTACLE_HEIGHT}
        fps={10}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  obstacleContainer: {
    position: 'absolute',
    bottom: GAME_CONSTANTS.OBSTACLE_Y,
    left: 0,
    width: GAME_CONSTANTS.OBSTACLE_WIDTH,
    height: GAME_CONSTANTS.OBSTACLE_HEIGHT,
  },
});


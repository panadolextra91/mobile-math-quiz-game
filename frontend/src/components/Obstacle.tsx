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
import { Dog2Walk, DogWalk, Rat2Walk, RatWalk, Dog2Idle, DogIdle, Rat2Idle, RatIdle } from '@/components/animations';
import { ObstacleType } from '@/src/types/game';
import { GAME_CONSTANTS } from '@/src/constants/game';

interface ObstacleProps {
  id: string;
  type: ObstacleType;
  onCollision: (id: string) => void;
  onComplete: (id: string) => void;
  isCollided?: boolean;
}

export function Obstacle({ id, type, onCollision, onComplete, isCollided = false }: ObstacleProps) {
  const obstacleX = useSharedValue(GAME_CONSTANTS.SCREEN_WIDTH);
  const [hasCollided, setHasCollided] = useState(false);
  const catCollisionX = GAME_CONSTANTS.CAT_POSITION_X + GAME_CONSTANTS.CAT_WIDTH;

  useEffect(() => {
    if (isCollided || hasCollided) {
      // Stop animation if collision occurred
      cancelAnimation(obstacleX);
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
  }, [id, obstacleX, onCollision, onComplete, isCollided, hasCollided]);

  const obstacleStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: obstacleX.value }, { scaleX: -1 }], // Flip horizontally
    };
  });

  // Use idle animation if collision occurred, otherwise use walk
  const isIdle = isCollided || hasCollided;
  const ObstacleAnimation = isIdle
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


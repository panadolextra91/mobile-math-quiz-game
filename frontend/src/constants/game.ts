import { Dimensions } from 'react-native';
import { ObstacleType } from '@/src/types/game';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Max questions per difficulty level (matching backend)
export const MAX_QUESTIONS_PER_DIFFICULTY = {
  easy: 10,
  medium: 15,
  hard: 20,
} as const;

export const GAME_CONSTANTS = {
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  OBSTACLE_TYPES: ['Dog2Walk', 'DogWalk', 'Rat2Walk', 'RatWalk'] as ObstacleType[],
  OBSTACLE_SPEED: 3000, // Duration in ms to cross screen
  CAT_POSITION_X: 20, // Cat's left position
  CAT_WIDTH: 180, // Cat's width
  OBSTACLE_WIDTH: 180, // Obstacle width
  OBSTACLE_HEIGHT: 180, // Obstacle height
  OBSTACLE_Y: 25, // Same Y as cat (bottom: 25)
  BACKGROUND_ANIMATION_DURATION: 3000, // 3 seconds to slide one screen width
  OBSTACLE_SPAWN_DELAY: 2000, // 2 seconds before first obstacle spawns
  COLLISION_CHECK_INTERVAL: 16, // Check every frame (~60fps)
} as const;

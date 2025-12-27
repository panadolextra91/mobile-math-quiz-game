import { useState, useEffect, useRef, useCallback } from 'react';
import { Obstacle, ObstacleType } from '@/src/types/game';
import { GAME_CONSTANTS, MAX_QUESTIONS_PER_DIFFICULTY } from '@/src/constants/game';
import { GameSession } from '@/services/api';

interface UseObstaclesProps {
  session: GameSession | null;
}

export function useObstacles({ session }: UseObstaclesProps) {
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [hasCollision, setHasCollision] = useState(false);
  const obstacleIdCounter = useRef(0);
  const spawnedCount = useRef(0);

  // Get max questions for current difficulty
  const maxQuestions = session
    ? MAX_QUESTIONS_PER_DIFFICULTY[session.difficulty]
    : MAX_QUESTIONS_PER_DIFFICULTY.easy; // Default to easy if no session

  const spawnObstacle = useCallback(() => {
    if (hasCollision) return; // Don't spawn new obstacles if collision occurred
    if (spawnedCount.current >= maxQuestions) {
      console.log(`Reached max questions (${maxQuestions}) for difficulty: ${session?.difficulty}`);
      return; // Don't spawn more obstacles than max questions
    }

    const randomType =
      GAME_CONSTANTS.OBSTACLE_TYPES[
        Math.floor(Math.random() * GAME_CONSTANTS.OBSTACLE_TYPES.length)
      ];

    const newObstacle: Obstacle = {
      id: `obstacle-${obstacleIdCounter.current++}`,
      type: randomType,
    };

    spawnedCount.current++;
    setObstacles((prev) => [...prev, newObstacle]);
  }, [hasCollision, maxQuestions, session?.difficulty]);

  const removeObstacle = useCallback((id: string) => {
    setObstacles((prev) => prev.filter((obs) => obs.id !== id));
  }, []);

  const handleCollision = useCallback((id: string) => {
    console.log('Collision detected with obstacle:', id);
    setHasCollision(true);
    // TODO: Handle collision (show question, reduce health, etc.)
    // Don't remove obstacle immediately - keep it visible in idle state
  }, []);

  // Continuous obstacle spawning until max is reached
  useEffect(() => {
    if (hasCollision) return; // Don't spawn new obstacles if collision occurred
    if (spawnedCount.current >= maxQuestions) return; // Don't spawn if we've reached max
    if (!session) return; // Don't spawn if no session

    // Spawn first obstacle after initial delay
    const initialTimer = setTimeout(() => {
      spawnObstacle();
    }, GAME_CONSTANTS.OBSTACLE_SPAWN_DELAY);

    // Then spawn obstacles continuously with interval
    const spawnInterval = setInterval(() => {
      if (spawnedCount.current >= maxQuestions || hasCollision) {
        clearInterval(spawnInterval);
        return;
      }
      spawnObstacle();
    }, GAME_CONSTANTS.OBSTACLE_SPAWN_DELAY * 2); // Spawn every 4 seconds after first one

    return () => {
      clearTimeout(initialTimer);
      clearInterval(spawnInterval);
    };
  }, [spawnObstacle, hasCollision, maxQuestions, session]);

  // Reset spawned count when session changes
  useEffect(() => {
    spawnedCount.current = 0;
    setObstacles([]);
    setHasCollision(false);
  }, [session?.id]);

  return {
    obstacles,
    hasCollision,
    spawnedCount: spawnedCount.current,
    maxQuestions,
    spawnObstacle,
    removeObstacle,
    handleCollision,
  };
}


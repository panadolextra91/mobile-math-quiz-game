export type ObstacleType = 'Dog2Walk' | 'DogWalk' | 'Rat2Walk' | 'RatWalk';

export interface Obstacle {
  id: string;
  type: ObstacleType;
}


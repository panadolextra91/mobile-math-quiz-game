/**
 * Utility functions for sprite sheet handling
 */

/**
 * Calculate frame dimensions from sprite sheet
 * @param spriteSheetWidth - Total width of sprite sheet
 * @param spriteSheetHeight - Total height of sprite sheet
 * @param frameCount - Number of frames in the sprite sheet
 * @param direction - 'horizontal' or 'vertical' (default: 'horizontal')
 * @returns Object with frameWidth and frameHeight
 */
export function calculateFrameDimensions(
  spriteSheetWidth: number,
  spriteSheetHeight: number,
  frameCount: number,
  direction: 'horizontal' | 'vertical' = 'horizontal'
): { frameWidth: number; frameHeight: number } {
  if (direction === 'horizontal') {
    return {
      frameWidth: spriteSheetWidth / frameCount,
      frameHeight: spriteSheetHeight,
    };
  } else {
    return {
      frameWidth: spriteSheetWidth,
      frameHeight: spriteSheetHeight / frameCount,
    };
  }
}

/**
 * Common sprite configurations for the game assets
 */
export const SpriteConfigs = {
  dog: {
    idle: { frameCount: 4, fps: 8 },
    walk: { frameCount: 4, fps: 10 },
    attack: { frameCount: 4, fps: 12 },
    hurt: { frameCount: 2, fps: 8 },
    death: { frameCount: 4, fps: 8, loop: false },
  },
  dog2: {
    idle: { frameCount: 4, fps: 8 },
    walk: { frameCount: 4, fps: 10 },
    attack: { frameCount: 4, fps: 12 },
    hurt: { frameCount: 2, fps: 8 },
    death: { frameCount: 4, fps: 8, loop: false },
  },
  cat: {
    idle: { frameCount: 4, fps: 8 },
    walk: { frameCount: 4, fps: 10 },
    attack: { frameCount: 4, fps: 12 },
    hurt: { frameCount: 2, fps: 8 },
    death: { frameCount: 4, fps: 8, loop: false },
  },
  cat2: {
    idle: { frameCount: 4, fps: 8 },
    walk: { frameCount: 4, fps: 10 },
    attack: { frameCount: 4, fps: 12 },
    hurt: { frameCount: 2, fps: 8 },
    death: { frameCount: 4, fps: 8, loop: false },
  },
  rat: {
    idle: { frameCount: 4, fps: 8 },
    walk: { frameCount: 4, fps: 10 },
    hurt: { frameCount: 2, fps: 8 },
    death: { frameCount: 4, fps: 8, loop: false },
  },
  rat2: {
    idle: { frameCount: 4, fps: 8 },
    walk: { frameCount: 4, fps: 10 },
    hurt: { frameCount: 2, fps: 8 },
    death: { frameCount: 4, fps: 8, loop: false },
  },
  bird: {
    idle: { frameCount: 4, fps: 8 },
    walk: { frameCount: 4, fps: 10 },
    hurt: { frameCount: 2, fps: 8 },
    death: { frameCount: 4, fps: 8, loop: false },
  },
  bird2: {
    idle: { frameCount: 4, fps: 8 },
    walk: { frameCount: 4, fps: 10 },
    hurt: { frameCount: 2, fps: 8 },
    death: { frameCount: 4, fps: 8, loop: false },
  },
} as const;


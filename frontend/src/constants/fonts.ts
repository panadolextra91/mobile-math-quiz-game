/**
 * Font constants for the app
 * Use these constants to ensure consistent font usage throughout the app
 */

export const Fonts = {
  jersey10: 'Jersey10-Regular',
  // Add more fonts here as needed
} as const;

export type FontFamily = typeof Fonts[keyof typeof Fonts];


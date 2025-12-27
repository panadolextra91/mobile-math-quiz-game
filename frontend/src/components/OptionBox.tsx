import React from 'react';
import { View, StyleSheet, ViewStyle, Text, TouchableOpacity } from 'react-native';
import { Fonts } from '@/src/constants/fonts';

interface OptionBoxProps {
  style?: ViewStyle;
  text?: string | null;
  onPress?: () => void;
  disabled?: boolean;
}

export function OptionBox({ style, text, onPress, disabled }: OptionBoxProps) {
  // Border width (matching QuestionBox component: 5px)
  const borderWidth = 5;

  const BoxContent = (
    <View
      style={[
        styles.box,
        {
          backgroundColor: '#ffffff',
          borderWidth: borderWidth,
          borderColor: '#000000',
          opacity: disabled ? 0.5 : 1,
        },
      ]}
    >
        {/* Inner outline at bottom with color #c0c3ff */}
        <View
          style={[
            styles.innerBottomOutline,
            {
              backgroundColor: '#c0c3ff',
            },
          ]}
        />
        {/* Text content */}
        {text && (
          <Text style={styles.text}>
            {text}
          </Text>
        )}
      </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={[styles.container, style]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
      >
        {BoxContent}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {BoxContent}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 200,
    height: 70,
    position: 'relative',
  },
  innerBottomOutline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 5,
  },
  text: {
    fontFamily: Fonts.jersey10,
    color: '#000000',
    fontSize: 40,
    textAlign: 'center',
    position: 'absolute',
    top: 8,
    left: 0,
    right: 0,
    bottom: 0,
    textAlignVertical: 'center',
  },
});


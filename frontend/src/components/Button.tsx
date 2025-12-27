import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, View, ViewStyle, TextStyle } from 'react-native';
import { Fonts } from '@/constants/fonts';

interface ButtonProps {
  title: string;
  onPress: () => void;
  size?: 'small' | 'medium' | 'large' | 'custom';
  customWidth?: number;
  customHeight?: number;
  textColor?: string;
  buttonColor?: string;
  outlineColor?: string;
  fontSize?: number;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  size = 'medium',
  customWidth,
  customHeight,
  textColor = '#ffffff',
  buttonColor = '#3c5fa6',
  outlineColor = '#000000',
  fontSize,
  style,
  textStyle,
}: ButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  // Size configurations
  const sizeConfig = {
    small: { paddingVertical: 10, paddingHorizontal: 25, fontSize: 16 },
    medium: { paddingVertical: 15, paddingHorizontal: 40, fontSize: 20 },
    large: { paddingVertical: 20, paddingHorizontal: 55, fontSize: 24 },
    custom: { paddingVertical: 15, paddingHorizontal: 40, fontSize: 20 },
  };

  const config = sizeConfig[size];
  const finalFontSize = fontSize || config.fontSize;

  // Shadow/border width (matching CSS: 5px)
  const borderWidth = 5;

  return (
    <View
      style={[
        styles.container,
        {
          transform: [{ translateY: isPressed ? borderWidth : 0 }],
        },
        style,
      ]}
    >
      {/* Main button */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        style={[
          styles.button,
          {
            backgroundColor: buttonColor,
            paddingVertical: customHeight ? undefined : config.paddingVertical,
            paddingHorizontal: customWidth ? undefined : config.paddingHorizontal,
            width: customWidth,
            height: customHeight,
            borderWidth: borderWidth,
            borderColor: outlineColor,
            shadowColor: outlineColor,
            shadowOffset: {
              width: 0,
              height: isPressed ? borderWidth : borderWidth * 2,
            },
            shadowOpacity: isPressed ? 0.22 : 0.38,
            shadowRadius: 0,
            elevation: isPressed ? 2 : 8,
          },
        ]}
      >
        {/* Inner highlight - simulating inset shadow */}
        {!isPressed && (
          <View
            style={[
              styles.innerHighlight,
              {
                backgroundColor: 'rgba(255, 255, 255, 0.21)', // #ffffff36
              },
            ]}
          />
        )}
        <Text
          style={[
            styles.buttonText,
            {
              color: textColor,
              fontSize: finalFontSize,
            },
            textStyle,
          ]}
        >
          {title}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    fontFamily: Fonts.jersey10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
    position: 'relative',
  },
  innerHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 5,
  },
  buttonText: {
    fontFamily: Fonts.jersey10,
    textAlign: 'center',
    position: 'relative',
    zIndex: 1,
  },
});

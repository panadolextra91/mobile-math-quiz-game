import React from 'react';
import { View, StyleSheet, ViewStyle, Text } from 'react-native';
import { Fonts } from '@/src/constants/fonts';

interface QuestionBoxProps {
  style?: ViewStyle;
  text?: string | null;
}

export function QuestionBox({ style, text }: QuestionBoxProps) {
  // Border width (matching Button component: 5px)
  const borderWidth = 5;

  return (
    <View style={[styles.container, style]}>
      {/* Main box */}
      <View
        style={[
          styles.box,
          {
            backgroundColor: '#ffffff',
            borderWidth: borderWidth,
            borderColor: '#000000',
            //shadowColor: '#000000',
            //shadowOffset: {
            //  width: 0,
            //  height: borderWidth * 2,
            //},
            //shadowOpacity: 0.38,
            //shadowRadius: 0,
            //elevation: 8,
          },
        ]}
      >
        {/* Inner highlight at top */}
        
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
          <View style={styles.textContainer}>
            <Text style={styles.text}>
              {text}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  box: {
    width: 380,
    minHeight: 120,
    maxHeight: 280,
    position: 'relative',
    paddingHorizontal: 15,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
  },
  innerHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 5,
  },
  innerBottomOutline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 5,
  },
  textContainer: {
    width: '85%',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 100,
    //backgroundColor: 'red',
    marginRight: 75,
    //paddingRight: 50,
  },
  text: {
    fontFamily: Fonts.jersey10,
    color: '#000000',
    fontSize: 34,
    textAlign: 'center',
    width: '100%',
  }
});


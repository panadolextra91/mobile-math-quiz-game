import { View, StyleSheet, ViewStyle } from 'react-native';
import { Image, ImageSource } from 'expo-image';

interface BackgroundImageProps {
  source: ImageSource;
  children?: React.ReactNode;
  style?: ViewStyle;
}

export function BackgroundImage({ source, children, style }: BackgroundImageProps) {
  return (
    <View style={[styles.container, style]}>
      <Image source={source} style={styles.backgroundImage} contentFit="cover" />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
});


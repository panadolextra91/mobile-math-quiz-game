import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps } from 'react-native';
import { Fonts } from '@/constants/fonts';

interface TextButtonProps extends TouchableOpacityProps {
  title: string;
  fontSize?: number;
  textColor?: string;
}

export function TextButton({
  title,
  fontSize = 80,
  textColor = '#fff',
  style,
  ...props
}: TextButtonProps) {
  return (
    <TouchableOpacity style={[styles.button, style]} {...props}>
      <Text style={[styles.buttonText, { fontSize, color: textColor }]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'transparent',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  buttonText: {
    fontFamily: Fonts.jersey10,
  },
});


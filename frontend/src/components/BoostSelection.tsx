import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Fonts } from '@/constants/fonts';

interface BoostSelectionProps {
  onSelect: (boostType: 'erase_obstacle' | 'double_points' | 'shield') => void;
  onClose?: () => void;
}

export function BoostSelection({ onSelect, onClose }: BoostSelectionProps) {
  const boosts = [
    {
      type: 'erase_obstacle' as const,
      name: 'Erase Obstacle',
      description: 'Remove one obstacle',
      image: require('@/assets/images/boosts/remove_obstacle.png'),
    },
    {
      type: 'double_points' as const,
      name: 'Double Points',
      description: 'Next correct answer gives double points',
      image: require('@/assets/images/boosts/double_point.png'),
    },
    {
      type: 'shield' as const,
      name: 'Shield',
      description: 'Protect against one wrong answer',
      image: require('@/assets/images/boosts/shield.png'),
    },
  ];

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <Image
          source={require('@/assets/images/board.png')}
          style={styles.backgroundImage}
          contentFit="cover"
        />
        <View style={styles.content}>
          <Text style={styles.title}>Choose Your Boost!</Text>
          <Text style={styles.subtitle}>You earned a boost for your streak!</Text>
          
          <View style={styles.boostsContainer}>
            {boosts.map((boost) => (
              <TouchableOpacity
                key={boost.type}
                style={styles.boostCard}
                onPress={() => onSelect(boost.type)}
                activeOpacity={0.7}
              >
                <Image
                  source={boost.image}
                  style={styles.boostImage}
                  contentFit="contain"
                />
                <Text style={styles.boostName}>{boost.name}</Text>
                <Text style={styles.boostDescription}>{boost.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  container: {
    //borderRadius: 20,
    width: '90%',
    maxWidth: 600,
    overflow: 'hidden',
    position: 'relative',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  content: {
    padding: 30,
    position: 'relative',
    zIndex: 1,
  },
  title: {
    fontFamily: Fonts.jersey10,
    fontSize: 36,
    color: '#000',
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  subtitle: {
    fontFamily: Fonts.jersey10,
    fontSize: 25,
    color: 'rgba(0, 0, 0, 0.7)',
    textAlign: 'center',
    marginBottom: 30,
  },
  boostsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 15,
    flexWrap: 'wrap',
  },
  boostCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    //borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    minWidth: 120,
    flex: 1,
    maxWidth: 180,
  },
  boostImage: {
    width: 50,
    height: 50,
    marginBottom: 12,
  },
  boostName: {
    fontFamily: Fonts.jersey10,
    fontSize: 22,
    color: '#000',
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
  },
  boostDescription: {
    fontFamily: Fonts.jersey10,
    fontSize: 18,
    color: 'rgba(0, 0, 0, 0.5)',
    textAlign: 'center',
  },
});


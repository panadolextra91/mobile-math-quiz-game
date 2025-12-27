import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, TextInput, ActivityIndicator } from 'react-native';
import { Fonts } from '@/constants/fonts';
import { CloseIcon } from '@/components/icons';
import { Button } from './Button';
import { createGameSession, GameSession } from '@/services/api';
import { usePlayerName } from '@/src/hooks/usePlayerName';

interface NameBoardProps {
  onClose?: () => void;
  onSubmit?: (session: GameSession) => void;
}

export function NameBoard({ onClose, onSubmit }: NameBoardProps) {
  const { playerName: storedName, savePlayerName, isLoading: isLoadingName } = usePlayerName();
  const [name, setName] = useState('');
  const [quizType, setQuizType] = useState<'arithmetics' | 'equations'>('arithmetics');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load stored name when component mounts
  useEffect(() => {
    if (storedName) {
      setName(storedName);
    }
  }, [storedName]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Please enter a cat name');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const trimmedName = name.trim();
      
      // Save player name to storage (will update if different)
      await savePlayerName(trimmedName);

      const session = await createGameSession({
        playerName: trimmedName,
        quizType,
        difficulty,
      });

      onSubmit?.(session);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create game session');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('@/assets/images/board.png')}
        style={styles.board}
        imageStyle={styles.boardImage}
        resizeMode="stretch"
      >
        {/* Close Button */}
        {onClose && (
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <CloseIcon size={40} color="#2C3E50" />
          </TouchableOpacity>
        )}

        {/* Name Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder={storedName ? `Current: ${storedName}` : "Enter cat name..."}
            placeholderTextColor="#8B4513"
            maxLength={20}
            autoFocus={!storedName}
            editable={!isLoadingName}
          />
        </View>

        {/* Quiz Type Selection */}
        <View style={styles.selectionRow}>
          <Text style={styles.label}>Quiz Type</Text>
          <View style={styles.buttonGroup}>
            <Button
              title="Math"
              onPress={() => setQuizType('arithmetics')}
              size="custom"
              customWidth={100}
              customHeight={45}
              textColor="#FFEB9C"
              buttonColor={quizType === 'arithmetics' ? '#8B4513' : '#D4A574'}
              outlineColor={quizType === 'arithmetics' ? '#654321' : '#8B4513'}
              fontSize={24}
            />
            <Button
              title="Equations"
              onPress={() => setQuizType('equations')}
              size="custom"
              customWidth={120}
              customHeight={45}
              textColor="#FFEB9C"
              buttonColor={quizType === 'equations' ? '#8B4513' : '#D4A574'}
              outlineColor={quizType === 'equations' ? '#654321' : '#8B4513'}
              fontSize={24}
            />
          </View>
        </View>

        {/* Difficulty Selection */}
        <View style={styles.selectionRow}>
          <Text style={styles.label}>Difficulty</Text>
          <View style={styles.buttonGroup}>
            <Button
              title="Easy"
              onPress={() => setDifficulty('easy')}
              size="custom"
              customWidth={80}
              customHeight={45}
              textColor="#FFEB9C"
              buttonColor={difficulty === 'easy' ? '#8B4513' : '#D4A574'}
              outlineColor={difficulty === 'easy' ? '#654321' : '#8B4513'}
              fontSize={24}
            />
            <Button
              title="Medium"
              onPress={() => setDifficulty('medium')}
              size="custom"
              customWidth={100}
              customHeight={45}
              textColor="#FFEB9C"
              buttonColor={difficulty === 'medium' ? '#8B4513' : '#D4A574'}
              outlineColor={difficulty === 'medium' ? '#654321' : '#8B4513'}
              fontSize={24}
            />
            <Button
              title="Hard"
              onPress={() => setDifficulty('hard')}
              size="custom"
              customWidth={80}
              customHeight={45}
              textColor="#FFEB9C"
              buttonColor={difficulty === 'hard' ? '#8B4513' : '#D4A574'}
              outlineColor={difficulty === 'hard' ? '#654321' : '#8B4513'}
              fontSize={24}
            />
          </View>
        </View>

        {/* Error Message */}
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        {/* Submit Button */}
        <Button
          title={isLoading ? 'Starting...' : 'Start Adventure'}
          onPress={handleSubmit}
          size="custom"
          customWidth={200}
          customHeight={50}
          textColor="#FFEB9C"
          buttonColor="#8B4513"
          outlineColor="#654321"
          fontSize={28}
          style={styles.submitButton}
        />
        {isLoading && (
          <ActivityIndicator size="small" color="#8B4513" style={styles.loader} />
        )}
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  board: {
    width: 450,
    minHeight: 400,
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'relative',
  },
  boardImage: {
    // Image styling handled by ImageBackground
  },
  inputContainer: {
    //paddingTop: 100,
    marginTop: 80,
    width: '80%',
    marginBottom: 10,
    //backgroundColor: 'red',
  },
  input: {
    fontFamily: Fonts.jersey10,
    fontSize: 32,
    color: '#2C3E50',
    backgroundColor: '#f5e8b5',
    borderWidth: 3,
    borderColor: '#8B4513',
    borderRadius: 0,
    paddingVertical: 12,
    paddingHorizontal: 15,
    textAlign: 'center',
  },
  selectionRow: {
    width: '80%',
    marginBottom: 20,
    alignItems: 'center',
  },
  label: {
    fontFamily: Fonts.jersey10,
    fontSize: 32,
    color: '#2C3E50',
    marginBottom: 10,
    textAlign: 'center',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  submitButton: {
    marginTop: 10,
    marginBottom: 50,
  },
  errorText: {
    fontFamily: Fonts.jersey10,
    fontSize: 24,
    color: '#E74C3C',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 5,
  },
  loader: {
    marginTop: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 15,
    padding: 8,
  },
});


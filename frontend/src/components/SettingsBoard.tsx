import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { Fonts } from '@/constants/fonts';
import { CloseIcon, MusicIcon, SoundIcon, LanguageIcon } from '@/components/icons';
import { Button } from './Button';

interface SettingsBoardProps {
  musicEnabled: boolean;
  soundEnabled: boolean;
  language: 'english' | 'vietnamese';
  onMusicToggle: () => void;
  onSoundToggle: () => void;
  onLanguageChange: (lang: 'english' | 'vietnamese') => void;
  onClose?: () => void;
}

export function SettingsBoard({
  musicEnabled,
  soundEnabled,
  language,
  onMusicToggle,
  onSoundToggle,
  onLanguageChange,
  onClose,
}: SettingsBoardProps) {
  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('@/assets/images/board.png')}
        style={styles.board}
        imageStyle={styles.boardImage}
        resizeMode="contain"
      >
        {/* Close Button */}
        {onClose && (
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <CloseIcon size={40} color="#2C3E50" />
          </TouchableOpacity>
        )}

        <Text style={styles.title}>Settings</Text>

        {/* Music Toggle */}
        <View style={styles.settingRow}>
          <View style={styles.settingLabelContainer}>
            <MusicIcon size={32} color="#2C3E50" />
            <Text style={styles.settingLabel}>Music</Text>
          </View>
          <Button
            title={musicEnabled ? 'ON' : 'OFF'}
            onPress={onMusicToggle}
            size="custom"
            customWidth={80}
            customHeight={45}
            textColor="#FFEB9C"
            buttonColor={musicEnabled ? '#8B4513' : '#D4A574'}
            outlineColor={musicEnabled ? '#654321' : '#8B4513'}
            fontSize={28}
          />
        </View>

        {/* Sound Toggle */}
        <View style={styles.settingRow}>
          <View style={styles.settingLabelContainer}>
            <SoundIcon size={32} color="#2C3E50" />
            <Text style={styles.settingLabel}>Sound</Text>
          </View>
          <Button
            title={soundEnabled ? 'ON' : 'OFF'}
            onPress={onSoundToggle}
            size="custom"
            customWidth={80}
            customHeight={45}
            textColor="#FFEB9C"
            buttonColor={soundEnabled ? '#8B4513' : '#D4A574'}
            outlineColor={soundEnabled ? '#654321' : '#8B4513'}
            fontSize={28}
          />
        </View>

        {/* Language Selection */}
        <View style={styles.settingRow}>
          <View style={styles.settingLabelContainer}>
            <LanguageIcon size={32} color="#2C3E50" />
            <Text style={styles.settingLabel}>Language</Text>
          </View>
          <View style={styles.languageButtons}>
            <Button
              title="EN"
              onPress={() => onLanguageChange('english')}
              size="custom"
              customWidth={60}
              customHeight={45}
              textColor="#FFEB9C"
              buttonColor={language === 'english' ? '#8B4513' : '#D4A574'}
              outlineColor={language === 'english' ? '#654321' : '#8B4513'}
              fontSize={28}
            />
            <Button
              title="VN"
              onPress={() => onLanguageChange('vietnamese')}
              size="custom"
              customWidth={60}
              customHeight={45}
              textColor="#FFEB9C"
              buttonColor={language === 'vietnamese' ? '#8B4513' : '#D4A574'}
              outlineColor={language === 'vietnamese' ? '#654321' : '#8B4513'}
              fontSize={28}
            />
          </View>
        </View>
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
    //padding: 30,
    //paddingTop: 40,
    //paddingBottom: 50,
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'relative',
    //backgroundColor: 'red'
  },
  boardImage: {
    // Image styling handled by ImageBackground
  },
  title: {
    fontFamily: Fonts.jersey10,
    fontSize: 55,
    color: '#2C3E50',
    marginBottom: 30,
    textAlign: 'center',
    paddingTop: 50,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 15,
    paddingHorizontal: 25,
  },
  settingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  settingLabel: {
    fontFamily: Fonts.jersey10,
    fontSize: 40,
    color: '#2C3E50', // Dark text on light yellow background
  },
  languageButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 15,
    padding: 8,
  },
});


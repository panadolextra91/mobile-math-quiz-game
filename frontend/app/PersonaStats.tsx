import { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { BackgroundImage, BackIcon, TrophyIcon } from '@/components/index';
import { getPlayerStats, PlayerStats } from '@/services/api';
import { usePlayerName } from '@/src/hooks/usePlayerName';
import { Fonts } from '@/constants/fonts';

export default function PersonaStatsScreen() {
  const router = useRouter();
  const { playerName } = usePlayerName();
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (playerName) {
      loadStats();
    } else {
      setError('No player name found. Please start a game first.');
      setLoading(false);
    }
  }, [playerName]);

  const loadStats = async () => {
    if (!playerName) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await getPlayerStats(playerName);
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load statistics');
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatAccuracy = (accuracy: number) => {
    return `${(accuracy * 100).toFixed(1)}%`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return '#53e658';
      case 'medium':
        return '#FF9800';
      case 'hard':
        return '#F44336';
      default:
        return '#fff';
    }
  };

  const getQuizTypeLabel = (type: string) => {
    return type === 'arithmetics' ? 'Math' : 'Equations';
  };

  return (
    <BackgroundImage source={require('@/assets/images/forest.png')}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <BackIcon size={32} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>My Statistics</Text>
        </View>

        {/* Content */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Loading statistics...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            {playerName && (
              <TouchableOpacity style={styles.retryButton} onPress={loadStats}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : !stats ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No statistics found</Text>
            <Text style={styles.emptySubtext}>Play some games to see your stats!</Text>
          </View>
        ) : (
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            {/* Player Name */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Player</Text>
              <View style={styles.card}>
                <Text style={styles.playerName}>{stats.playerName}</Text>
              </View>
            </View>

            {/* Overall Stats */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Overall Statistics</Text>
              <View style={styles.card}>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Total Games</Text>
                  <Text style={styles.statValue}>{stats.totalGames}</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Questions Answered</Text>
                  <Text style={styles.statValue}>{stats.totalQuestionsAnswered}</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Questions Correct</Text>
                  <Text style={styles.statValue}>{stats.totalQuestionsCorrect}</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Overall Accuracy</Text>
                  <Text style={styles.statValue}>{formatAccuracy(stats.overallAccuracy)}</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Best Score</Text>
                  <Text style={[styles.statValue, styles.bestScore]}>{stats.bestScore.toLocaleString()}</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Longest Streak</Text>
                  <Text style={styles.statValue}>{stats.longestStreak}</Text>
                </View>
              </View>
            </View>

            {/* Quiz Type Stats */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quiz Type Statistics</Text>
              {Object.entries(stats.quizTypeStats).map(([type, typeStats]) => (
                <View key={type} style={styles.card}>
                  <Text style={styles.cardTitle}>{getQuizTypeLabel(type)}</Text>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Games</Text>
                    <Text style={styles.statValue}>{typeStats.games}</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Accuracy</Text>
                    <Text style={styles.statValue}>{formatAccuracy(typeStats.accuracy)}</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Best Score</Text>
                    <Text style={styles.statValue}>{typeStats.bestScore.toLocaleString()}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Difficulty Stats */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Difficulty Statistics</Text>
              {Object.entries(stats.difficultyStats).map(([difficulty, diffStats]) => (
                <View key={difficulty} style={styles.card}>
                  <Text style={[styles.cardTitle, { color: getDifficultyColor(difficulty) }]}>
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </Text>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Games</Text>
                    <Text style={styles.statValue}>{diffStats.games}</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Accuracy</Text>
                    <Text style={styles.statValue}>{formatAccuracy(diffStats.accuracy)}</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Best Score</Text>
                    <Text style={styles.statValue}>{diffStats.bestScore.toLocaleString()}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Achievements */}
            {stats.achievements && stats.achievements.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Achievements</Text>
                <View style={styles.card}>
                  {stats.achievements.map((achievement) => (
                    <View key={achievement.id} style={styles.achievementRow}>
                      <View style={styles.achievementHeader}>
                        <TrophyIcon size={24} />
                        <Text style={styles.achievementName}>{achievement.name}</Text>
                      </View>
                      <Text style={styles.achievementDescription}>{achievement.description}</Text>
                      <Text style={styles.achievementDate}>
                        Unlocked: {formatDate(achievement.unlockedAt)}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </BackgroundImage>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    padding: 8,
  },
  title: {
    fontFamily: Fonts.jersey10,
    fontSize: 48,
    color: '#fff',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
  },
  loadingText: {
    fontFamily: Fonts.jersey10,
    fontSize: 24,
    color: '#fff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    paddingHorizontal: 40,
  },
  errorText: {
    fontFamily: Fonts.jersey10,
    fontSize: 24,
    color: '#ff6b6b',
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#fff',
  },
  retryButtonText: {
    fontFamily: Fonts.jersey10,
    fontSize: 20,
    color: '#fff',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontFamily: Fonts.jersey10,
    fontSize: 28,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptySubtext: {
    fontFamily: Fonts.jersey10,
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: Fonts.jersey10,
    fontSize: 32,
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 10,
    padding: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: 12,
  },
  playerName: {
    fontFamily: Fonts.jersey10,
    fontSize: 32,
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  cardTitle: {
    fontFamily: Fonts.jersey10,
    fontSize: 24,
    color: '#fff',
    marginBottom: 12,
    fontWeight: 'bold',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  statLabel: {
    fontFamily: Fonts.jersey10,
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statValue: {
    fontFamily: Fonts.jersey10,
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  bestScore: {
    color: '#FFD700',
  },
  achievementRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  achievementName: {
    fontFamily: Fonts.jersey10,
    fontSize: 22,
    color: '#FFD700',
    fontWeight: 'bold',
  },
  achievementDescription: {
    fontFamily: Fonts.jersey10,
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  achievementDate: {
    fontFamily: Fonts.jersey10,
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
  },
});


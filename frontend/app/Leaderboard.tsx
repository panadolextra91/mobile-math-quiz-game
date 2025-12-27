import { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { BackgroundImage, BackIcon } from '@/components/index';
import { getLeaderboard, LeaderboardEntry, GetLeaderboardParams } from '@/services/api';
import { Fonts } from '@/constants/fonts';

export default function LeaderboardScreen() {
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<GetLeaderboardParams>({
    limit: 50,
    timeframe: 'all-time',
    unique: true, // Default: show only best score per player
  });

  useEffect(() => {
    loadLeaderboard();
  }, [filters]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getLeaderboard(filters);
      setLeaderboard(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
      console.error('Failed to load leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatAccuracy = (accuracy: number) => {
    return `${(accuracy * 100).toFixed(0)}%`;
  };

  const getRankEmoji = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `${index + 1}.`;
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
          <Text style={styles.title}>Leaderboard</Text>
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Show:</Text>
            <View style={styles.filterButtons}>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  filters.unique && styles.filterButtonActive,
                ]}
                onPress={() => setFilters({ ...filters, unique: true })}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    filters.unique && styles.filterButtonTextActive,
                  ]}
                >
                  Best Scores
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  !filters.unique && styles.filterButtonActive,
                ]}
                onPress={() => setFilters({ ...filters, unique: false })}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    !filters.unique && styles.filterButtonTextActive,
                  ]}
                >
                  All Entries
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Timeframe:</Text>
            <View style={styles.filterButtons}>
              {(['all-time', 'weekly', 'daily'] as const).map((timeframe) => (
                <TouchableOpacity
                  key={timeframe}
                  style={[
                    styles.filterButton,
                    filters.timeframe === timeframe && styles.filterButtonActive,
                  ]}
                  onPress={() => setFilters({ ...filters, timeframe })}
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      filters.timeframe === timeframe && styles.filterButtonTextActive,
                    ]}
                  >
                    {timeframe === 'all-time' ? 'All Time' : timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Quiz Type:</Text>
            <View style={styles.filterButtons}>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  !filters.quizType && styles.filterButtonActive,
                ]}
                onPress={() => setFilters({ ...filters, quizType: undefined })}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    !filters.quizType && styles.filterButtonTextActive,
                  ]}
                >
                  All
                </Text>
              </TouchableOpacity>
              {(['arithmetics', 'equations'] as const).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.filterButton,
                    filters.quizType === type && styles.filterButtonActive,
                  ]}
                  onPress={() => setFilters({ ...filters, quizType: type })}
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      filters.quizType === type && styles.filterButtonTextActive,
                    ]}
                  >
                    {getQuizTypeLabel(type)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Difficulty:</Text>
            <View style={styles.filterButtons}>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  !filters.difficulty && styles.filterButtonActive,
                ]}
                onPress={() => setFilters({ ...filters, difficulty: undefined })}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    !filters.difficulty && styles.filterButtonTextActive,
                  ]}
                >
                  All
                </Text>
              </TouchableOpacity>
              {(['easy', 'medium', 'hard'] as const).map((difficulty) => (
                <TouchableOpacity
                  key={difficulty}
                  style={[
                    styles.filterButton,
                    filters.difficulty === difficulty && styles.filterButtonActive,
                  ]}
                  onPress={() => setFilters({ ...filters, difficulty })}
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      filters.difficulty === difficulty && styles.filterButtonTextActive,
                    ]}
                  >
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Leaderboard Content */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Loading leaderboard...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadLeaderboard}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : leaderboard.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No leaderboard entries found</Text>
            <Text style={styles.emptySubtext}>Be the first to play and set a record!</Text>
          </View>
        ) : (
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.rankColumn]}>Rank</Text>
              <Text style={[styles.tableHeaderText, styles.nameColumn]}>Player</Text>
              <Text style={[styles.tableHeaderText, styles.scoreColumn]}>Score</Text>
              <Text style={[styles.tableHeaderText, styles.accuracyColumn]}>Accuracy</Text>
              <Text style={[styles.tableHeaderText, styles.typeColumn]}>Type</Text>
            </View>

            {/* Leaderboard Entries */}
            {leaderboard.map((entry, index) => (
              <View key={`${entry.playerName}-${entry.completedAt}-${index}`} style={styles.entryRow}>
                <View style={styles.rankCell}>
                  <Text style={styles.rankText}>{getRankEmoji(index)}</Text>
                </View>
                <View style={styles.nameCell}>
                  <Text style={styles.playerName} numberOfLines={1}>
                    {entry.playerName}
                  </Text>
                </View>
                <View style={styles.scoreCell}>
                  <Text style={styles.scoreText}>{entry.score.toLocaleString()}</Text>
                </View>
                <View style={styles.accuracyCell}>
                  <Text style={styles.accuracyText}>{formatAccuracy(entry.accuracy)}</Text>
                </View>
                <View style={styles.typeCell}>
                  <View style={styles.typeBadge}>
                    <Text
                      style={[
                        styles.typeBadgeText,
                        { color: getDifficultyColor(entry.difficulty) },
                      ]}
                    >
                      {getQuizTypeLabel(entry.quizType)}
                    </Text>
                    <Text
                      style={[
                        styles.difficultyBadgeText,
                        { color: getDifficultyColor(entry.difficulty) },
                      ]}
                    >
                      {entry.difficulty.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
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
  filtersContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 10,
  },
  filterRow: {
    marginBottom: 12,
  },
  filterLabel: {
    fontFamily: Fonts.jersey10,
    fontSize: 20,
    color: '#fff',
    marginBottom: 8,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 5,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  filterButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderColor: '#fff',
  },
  filterButtonText: {
    fontFamily: Fonts.jersey10,
    fontSize: 18,
    color: '#fff',
  },
  filterButtonTextActive: {
    fontWeight: 'bold',
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
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderBottomWidth: 3,
    textAlign: 'center',
    alignItems: 'center',
  },
  tableHeaderText: {
    fontFamily: Fonts.jersey10,
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    alignItems: 'center',
  },
  rankColumn: {
    width: 40,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.3)',
    paddingRight: 8,
  },
  nameColumn: {
    flex: 1.2,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.3)',
    paddingLeft: 8,
    paddingRight: 8,
    textAlign: 'center',
  },
  scoreColumn: {
    flex: 1,
    textAlign: 'center',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.3)',
    //paddingRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accuracyColumn: {
    flex: 1.2,
    textAlign: 'center',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.3)',
    //paddingRight: 8,
  },
  typeColumn: {
    flex: 1.5,
    textAlign: 'center',
    paddingLeft: 8,
  },
  entryRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginBottom: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  rankCell: {
    width: 40,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.7)',
    paddingRight: 8,
    textAlign: 'center',
  },
  rankText: {
    fontFamily: Fonts.jersey10,
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
    alignItems: 'center',
  },
  nameCell: {
    flex: 1.2,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.7)',
    paddingLeft: 8,
    paddingRight: 8,
    alignItems: 'center',
    textAlign: 'center',
  },
  playerName: {
    fontFamily: Fonts.jersey10,
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
    alignItems: 'center',
  },
  scoreCell: {
    flex: 1,
    alignItems: 'center',
    textAlign: 'center',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.7)',
    //paddingRight: 8,
  },
  scoreText: {
    fontFamily: Fonts.jersey10,
    fontSize: 20,
    color: '#FFD700',
    fontWeight: 'bold',
    textAlign: 'center',
    alignItems: 'center',
  },
  accuracyCell: {
    flex: 1.2,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.7)',
    //paddingRight: 8,
    textAlign: 'center',
  },
  accuracyText: {
    fontFamily: Fonts.jersey10,
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
    alignItems: 'center',
  },
  typeCell: {
    flex: 1.5,
    alignItems: 'center',
    paddingLeft: 8,
    textAlign: 'center',
  },
  typeBadge: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
    textAlign: 'center',
  },
  typeBadgeText: {
    fontFamily: Fonts.jersey10,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    alignItems: 'center',
  },
  difficultyBadgeText: {
    fontFamily: Fonts.jersey10,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    alignItems: 'center',
  },
});


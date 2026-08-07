import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../theme';
import type { Deal } from '../data/products';

interface Props {
  deal: Deal;
  onPress?: () => void;
}

export default function DealCard({ deal, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <LinearGradient
        colors={deal.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.badgeWrap}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{deal.badge}</Text>
          </View>
        </View>
        <Text style={styles.title} numberOfLines={2}>{deal.title}</Text>
        <Text style={styles.subtitle} numberOfLines={2}>{deal.subtitle}</Text>
        <View style={styles.tapRow}>
          <Text style={styles.tapText}>View deal →</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 210,
    height: 142,
    ...theme.asymmetric,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  gradient: {
    flex: 1,
    padding: theme.spacing.md,
    justifyContent: 'space-between',
  },
  badgeWrap: {
    alignSelf: 'flex-start',
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  badgeText: {
    ...theme.typography.label,
    color: theme.colors.white,
    fontSize: 9,
    letterSpacing: 1.2,
  },
  title: {
    fontFamily: theme.fonts.serifBold,
    fontSize: 19,
    lineHeight: 23,
    color: theme.colors.white,
  },
  subtitle: {
    ...theme.typography.small,
    color: 'rgba(255,255,255,0.9)',
  },
  tapRow: {
    alignSelf: 'flex-end',
  },
  tapText: {
    fontFamily: theme.fonts.semibold,
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
  },
});

import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../theme';
import ProductCard from './ProductCard';
import type { Product } from '../data/products';

interface Props {
  title: string;
  subtitle?: string;
  products: Product[];
  onSeeAll?: () => void;
  onProductPress?: (product: Product) => void;
  accentColor?: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
}

export default function SectionRow({
  title,
  subtitle,
  products,
  onSeeAll,
  onProductPress,
  accentColor = theme.colors.primary,
  icon,
}: Props) {
  if (products.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          {icon && (
            <Ionicons name={icon} size={16} color={accentColor} style={styles.icon} />
          )}
          <View>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
        </View>
        {onSeeAll && (
          <TouchableOpacity onPress={onSeeAll} style={styles.seeAll} activeOpacity={0.7}>
            <Text style={[styles.seeAllText, { color: accentColor }]}>See all</Text>
            <Ionicons name="chevron-forward" size={14} color={accentColor} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            width={160}
            onPress={() => onProductPress?.(product)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  icon: {
    marginRight: 2,
  },
  title: {
    ...theme.typography.heading,
    color: theme.colors.text,
  },
  subtitle: {
    ...theme.typography.small,
    color: theme.colors.textMuted,
    marginTop: 1,
  },
  seeAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAllText: {
    ...theme.typography.caption,
    fontWeight: '600',
  },
  scroll: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: 2,
    paddingBottom: 6,
    gap: theme.spacing.sm,
  },
});

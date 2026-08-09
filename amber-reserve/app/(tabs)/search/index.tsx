import {
  View,
  Text,
  TextInput,
  ScrollView,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { useLocalSearchParams } from 'expo-router';
import theme from '../../../theme';
import { PRODUCTS, CATEGORIES, type Product } from '../../../data/products';
import ProductCard from '../../../components/ProductCard';
import CategoryPill from '../../../components/CategoryPill';
import ProductDetailModal from '../../../components/ProductDetailModal';
import FilterSheet, {
  DEFAULT_SORT_OPTIONS,
  STRAIN_FILTER_GROUP,
} from '../../../components/FilterSheet';
import AIButton from '../../../components/AIButton';

const QUICK_SEARCHES = [
  'Pink Kush', 'Pre-Rolls', 'Edibles', 'Vape', 'High THC', 'CBD', 'Budget',
];

const SORT_CHIPS: { id: string; label: string }[] = [
  { id: 'popular', label: 'Popular' },
  { id: 'price_asc', label: 'Price' },
  { id: 'thc_desc', label: 'THC' },
];

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W = Math.floor((SCREEN_W - theme.spacing.md * 2 - theme.spacing.sm) / 2);

export default function SearchScreen() {
  const params = useLocalSearchParams<{ category?: string }>();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(params.category ?? 'all');
  const [activeSort, setActiveSort] = useState('popular');
  const [activeStrain, setActiveStrain] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const activeFilterCount =
    (activeSort !== 'popular' ? 1 : 0) + (activeStrain !== 'All' ? 1 : 0);

  useEffect(() => {
    if (params.category) {
      setActiveCategory(params.category);
    }
  }, [params.category]);

  const filtered = useMemo(() => {
    let list = [...PRODUCTS];

    if (activeCategory !== 'all') {
      list = list.filter((p) => p.category === activeCategory);
    }
    if (activeStrain !== 'All') {
      list = list.filter((p) => p.strain === activeStrain);
    }
    if (query.trim().length > 0) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    switch (activeSort) {
      case 'price_asc': list.sort((a, b) => a.price - b.price); break;
      case 'price_desc': list.sort((a, b) => b.price - a.price); break;
      case 'thc_desc': list.sort((a, b) => (b.thc ?? 0) - (a.thc ?? 0)); break;
      case 'new': list.sort((a) => (a.isNew ? -1 : 1)); break;
      default: list.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
    }

    return list;
  }, [query, activeCategory, activeSort, activeStrain]);

  const isIdle = query.trim().length === 0 && activeCategory === 'all';

  function clearAll() {
    setQuery('');
    setActiveCategory('all');
    setActiveStrain('All');
    setActiveSort('popular');
  }

  const listHeader = useCallback(() => (
    <View>
      <View style={styles.pageHeader}>
        <View>
          <Text style={styles.pageEyebrow}>CURATED SELECTION</Text>
          <Text style={styles.pageTitle}>The Humidor</Text>
        </View>
        <AIButton />
      </View>

      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={theme.colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products, brands, effects..."
            placeholderTextColor={theme.colors.textMuted}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={18} color={theme.colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.filterBtn, showFilters && styles.filterBtnActive]}
          onPress={() => setShowFilters((v) => !v)}
          activeOpacity={0.8}
        >
          <Ionicons
            name="options"
            size={20}
            color={showFilters ? theme.colors.primary : theme.colors.text}
          />
          {activeFilterCount > 0 && (
            <View style={styles.filterDot}>
              <Text style={styles.filterDotText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.sortBar}>
        {SORT_CHIPS.map((chip) => {
          const active = activeSort === chip.id;
          return (
            <TouchableOpacity
              key={chip.id}
              style={[styles.sortChip, active && styles.sortChipActive]}
              onPress={() => setActiveSort(chip.id)}
              activeOpacity={0.8}
            >
              <Text style={[styles.sortChipText, active && styles.sortChipTextActive]}>
                {chip.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryChips}
        style={styles.categoryRow}
        keyboardShouldPersistTaps="handled"
      >
        {CATEGORIES.map((cat) => (
          <CategoryPill
            key={cat.id}
            category={cat}
            size="sm"
            isSelected={activeCategory === cat.id}
            onPress={() => {
              setActiveCategory(cat.id);
              Keyboard.dismiss();
            }}
          />
        ))}
      </ScrollView>

      {isIdle && (
        <View style={styles.quickWrap}>
          <Text style={styles.quickLabel}>Trending Searches</Text>
          <View style={styles.quickRow}>
            {QUICK_SEARCHES.map((q) => (
              <TouchableOpacity
                key={q}
                style={styles.quickChip}
                onPress={() => setQuery(q)}
                activeOpacity={0.8}
              >
                <Ionicons name="trending-up" size={12} color={theme.colors.accent} />
                <Text style={styles.quickText}>{q}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {filtered.length} {filtered.length === 1 ? 'product' : 'products'}
        </Text>
        {!isIdle && (
          <TouchableOpacity onPress={clearAll} style={styles.clearAllBtn}>
            <Text style={styles.clearAllText}>Clear all</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  ), [
    query,
    showFilters,
    activeFilterCount,
    activeSort,
    activeCategory,
    isIdle,
    filtered.length,
  ]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FilterSheet
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        sortOptions={DEFAULT_SORT_OPTIONS}
        activeSort={activeSort}
        onSortChange={setActiveSort}
        filterGroups={[STRAIN_FILTER_GROUP]}
        activeFilters={{ strain: activeStrain }}
        onFilterChange={(_group, value) => setActiveStrain(value)}
        onClearAll={clearAll}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={listHeader}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            width={CARD_W}
            onPress={() => setSelectedProduct(item)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={48} color={theme.colors.textMuted} />
            <Text style={styles.emptyTitle}>No products found</Text>
            <Text style={styles.emptyText}>Try a different search or clear your filters</Text>
            <TouchableOpacity style={styles.clearBtn} onPress={clearAll} activeOpacity={0.8}>
              <Text style={styles.clearBtnText}>Clear filters</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <ProductDetailModal
        product={selectedProduct}
        visible={selectedProduct !== null}
        onClose={() => setSelectedProduct(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xs,
  },
  pageEyebrow: {
    fontFamily: theme.fonts.semibold,
    fontSize: 11,
    letterSpacing: 2,
    color: theme.colors.accentDark,
  },
  pageTitle: {
    ...theme.typography.title,
    color: theme.colors.primary,
    marginTop: 2,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xs,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm + 2,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchInput: {
    flex: 1,
    fontFamily: theme.fonts.medium,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.2,
    color: theme.colors.text,
    padding: 0,
    outlineStyle: 'none' as any,
  },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterBtnActive: {
    backgroundColor: theme.colors.primaryMuted,
    borderColor: theme.colors.primary,
  },
  filterDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterDotText: {
    fontSize: 8,
    fontWeight: '800',
    color: theme.colors.white,
  },
  sortBar: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
    backgroundColor: theme.colors.background,
  },
  sortChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 8,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  sortChipActive: {
    backgroundColor: theme.colors.primaryMuted,
    borderColor: theme.colors.primary,
  },
  sortChipText: {
    fontFamily: theme.fonts.semibold,
    fontSize: 12,
    color: theme.colors.textSecondary,
    letterSpacing: 0.4,
  },
  sortChipTextActive: {
    color: theme.colors.primary,
  },
  categoryRow: {
    flexGrow: 0,
    flexShrink: 0,
    height: 46,
    marginTop: 4,
    marginBottom: 2,
  },
  categoryChips: {
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.xs,
    alignItems: 'center',
  },
  quickWrap: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  quickLabel: {
    ...theme.typography.label,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.sm,
  },
  quickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  quickChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: theme.spacing.sm + 2,
    paddingVertical: theme.spacing.xs + 1,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.accentMuted,
    borderWidth: 1,
    borderColor: theme.colors.accent + '50',
  },
  quickText: {
    ...theme.typography.caption,
    color: theme.colors.accent,
    fontWeight: '600',
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs + 2,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
  },
  resultsCount: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
  clearAllBtn: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 3,
  },
  clearAllText: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  grid: {
    paddingBottom: 120,
  },
  row: {
    gap: theme.spacing.sm,
    justifyContent: 'flex-start',
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  emptyTitle: {
    ...theme.typography.subheading,
    color: theme.colors.textSecondary,
  },
  emptyText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  clearBtn: {
    marginTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.primaryMuted,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  clearBtnText: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '700',
  },
});

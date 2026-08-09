import {
  View,
  Text,
  TextInput,
  ScrollView,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { useLocalSearchParams } from 'expo-router';
import theme from '../../../theme';
import { PRODUCTS, CATEGORIES, type Product } from '../../../data/products';
import ProductCard from '../../../components/ProductCard';
import ProductDetailModal from '../../../components/ProductDetailModal';
import FilterSheet, {
  DEFAULT_SORT_OPTIONS,
  STRAIN_FILTER_GROUP,
} from '../../../components/FilterSheet';
import AIButton from '../../../components/AIButton';

const QUICK_SEARCHES = [
  'Pink Kush', 'Pre-Rolls', 'Edibles', 'Vape', 'High THC', 'CBD', 'Budget',
];

const STRAIN_CHIPS = ['All', 'Indica', 'Sativa', 'Hybrid', 'CBD'];

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
        <View style={{ flex: 1 }}>
          <Text style={styles.pageEyebrow}>NEBULA CLINIC</Text>
          <Text style={styles.pageTitle}>Shop</Text>
          <Text style={styles.pageSub}>Lab-tested profiles · Clear dosing data</Text>
        </View>
        <AIButton />
      </View>

      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={theme.colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products, brands, effects…"
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
            color={showFilters ? theme.colors.primaryDark : theme.colors.text}
          />
          {activeFilterCount > 0 && (
            <View style={styles.filterDot}>
              <Text style={styles.filterDotText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryChips}
        style={styles.categoryRow}
        keyboardShouldPersistTaps="handled"
      >
        {CATEGORIES.map((cat) => {
          const selected = activeCategory === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[styles.chip, selected && styles.chipActive]}
              onPress={() => {
                setActiveCategory(cat.id);
                Keyboard.dismiss();
              }}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipText, selected && styles.chipTextActive]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.strainChips}
        style={styles.strainRow}
        keyboardShouldPersistTaps="handled"
      >
        {STRAIN_CHIPS.map((s) => {
          const selected = activeStrain === s;
          return (
            <TouchableOpacity
              key={s}
              style={[styles.strainChip, selected && styles.strainChipActive]}
              onPress={() => setActiveStrain(s)}
              activeOpacity={0.8}
            >
              <Text style={[styles.strainChipText, selected && styles.strainChipTextActive]}>
                {s === 'All' ? 'All Spectra' : s}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {isIdle && (
        <View style={styles.quickWrap}>
          <Text style={styles.quickLabel}>Common Searches</Text>
          <View style={styles.quickRow}>
            {QUICK_SEARCHES.map((q) => (
              <TouchableOpacity
                key={q}
                style={styles.quickChip}
                onPress={() => setQuery(q)}
                activeOpacity={0.8}
              >
                <Ionicons name="flask-outline" size={12} color={theme.colors.primary} />
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
  ), [query, showFilters, activeFilterCount, activeCategory, activeStrain, isIdle, filtered.length]);

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
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={listHeader}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
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
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xs,
  },
  pageEyebrow: {
    fontFamily: theme.fonts.semibold,
    fontSize: 11,
    letterSpacing: 1.6,
    color: theme.colors.primary,
  },
  pageTitle: {
    ...theme.typography.title,
    color: theme.colors.primaryDark,
    marginTop: 2,
  },
  pageSub: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
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
    ...theme.typography.body,
    color: theme.colors.text,
    padding: 0,
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
  categoryRow: {
    flexGrow: 0,
    flexShrink: 0,
    height: 42,
    marginTop: 4,
  },
  categoryChips: {
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.xs,
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  chipActive: {
    backgroundColor: theme.colors.primaryDark,
    borderColor: theme.colors.primaryDark,
  },
  chipText: {
    fontFamily: theme.fonts.medium,
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  chipTextActive: {
    color: theme.colors.white,
    fontFamily: theme.fonts.semibold,
  },
  strainRow: {
    flexGrow: 0,
    flexShrink: 0,
    height: 38,
    marginBottom: 2,
  },
  strainChips: {
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.xs,
    alignItems: 'center',
  },
  strainChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.backgroundLight,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  strainChipActive: {
    backgroundColor: theme.colors.secondaryContainer,
    borderColor: theme.colors.primary,
  },
  strainChipText: {
    fontFamily: theme.fonts.medium,
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  strainChipTextActive: {
    color: theme.colors.primaryDark,
    fontFamily: theme.fonts.semibold,
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
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.primaryMuted,
    borderWidth: 1,
    borderColor: theme.colors.primary + '40',
  },
  quickText: {
    ...theme.typography.caption,
    color: theme.colors.primaryDark,
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
  list: {
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.md,
    paddingBottom: 120,
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
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  clearBtnText: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '700',
  },
});

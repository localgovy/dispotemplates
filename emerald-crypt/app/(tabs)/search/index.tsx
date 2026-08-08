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
import { useState, useMemo, useEffect } from 'react';
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

const { width: SCREEN_W } = Dimensions.get('window');
const ACCENT_RAIL_W = 3;
const CARD_W = SCREEN_W - theme.spacing.md * 2 - ACCENT_RAIL_W - theme.spacing.sm;

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

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.pageBody}>
        {/* Left accent rail */}
        <View style={styles.accentRail} />

        <View style={styles.content}>
          <View style={styles.pageHeader}>
            <View style={styles.titleBlock}>
              <View>
                <Text style={styles.pageTitle}>RESERVE STRAINS</Text>
                <Text style={styles.pageSub}>GENETIC ARCHIVE // BATCH 04</Text>
              </View>
            </View>
            <AIButton />
          </View>

          <View style={styles.searchWrap}>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={18} color={theme.colors.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Query batch, cultivar, terpene..."
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
                color={showFilters ? theme.colors.onPrimary : theme.colors.text}
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

          {isIdle && (
            <View style={styles.quickWrap}>
              <Text style={styles.quickLabel}>QUICK FILTERS</Text>
              <View style={styles.quickRow}>
                {QUICK_SEARCHES.map((q) => (
                  <TouchableOpacity
                    key={q}
                    style={styles.quickChip}
                    onPress={() => setQuery(q)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.quickText}>{q.toUpperCase()}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <View style={styles.resultsHeader}>
            <Text style={styles.resultsCount}>
              {filtered.length} {filtered.length === 1 ? 'BATCH' : 'BATCHES'}
            </Text>
            {!isIdle && (
              <TouchableOpacity onPress={clearAll} style={styles.clearAllBtn}>
                <Text style={styles.clearAllText}>CLEAR</Text>
              </TouchableOpacity>
            )}
          </View>

          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            numColumns={1}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
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
                <Text style={styles.emptyTitle}>No batches found</Text>
                <Text style={styles.emptyText}>Try a different query or clear filters</Text>
                <TouchableOpacity style={styles.clearBtn} onPress={clearAll} activeOpacity={0.8}>
                  <Text style={styles.clearBtnText}>Clear filters</Text>
                </TouchableOpacity>
              </View>
            }
          />
        </View>
      </View>

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
  pageBody: {
    flex: 1,
    flexDirection: 'row',
  },
  accentRail: {
    width: ACCENT_RAIL_W,
    backgroundColor: theme.colors.primary,
  },
  content: {
    flex: 1,
  },
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xs,
  },
  titleBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pageTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 20,
    letterSpacing: 1.6,
    color: theme.colors.textPrimary,
  },
  pageSub: {
    fontFamily: theme.fonts.mono,
    fontSize: 11,
    letterSpacing: 1.2,
    color: theme.colors.primaryLight,
    marginTop: 3,
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
    borderRadius: theme.radius.sm,
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
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterBtnActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primaryLight,
  },
  filterDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 14,
    height: 14,
    borderRadius: theme.radius.xs,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterDotText: {
    fontSize: 8,
    fontWeight: '800',
    color: theme.colors.onPrimary,
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
    color: theme.colors.primaryLight,
    marginBottom: theme.spacing.sm,
  },
  quickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  quickChip: {
    paddingHorizontal: theme.spacing.sm + 2,
    paddingVertical: theme.spacing.xs + 2,
    borderRadius: theme.radius.xs,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  quickText: {
    fontFamily: theme.fonts.mono,
    fontSize: 10,
    letterSpacing: 1,
    color: theme.colors.textSecondary,
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
    fontFamily: theme.fonts.mono,
    fontSize: 11,
    letterSpacing: 1,
    color: theme.colors.textMuted,
  },
  clearAllBtn: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 3,
  },
  clearAllText: {
    fontFamily: theme.fonts.bold,
    fontSize: 11,
    letterSpacing: 1,
    color: theme.colors.primaryLight,
  },
  list: {
    padding: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    gap: theme.spacing.md,
    paddingBottom: 120,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
    gap: theme.spacing.sm,
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
    borderRadius: theme.radius.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  clearBtnText: {
    ...theme.typography.caption,
    color: theme.colors.primaryLight,
    fontWeight: '700',
  },
});

import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState, useMemo, useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
import theme from '../../../theme';
import { PRODUCTS, type Product } from '../../../data/products';
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

const STRAIN_SEGMENTS = ['All', 'Indica', 'Sativa', 'Hybrid', 'CBD'] as const;

export default function SearchScreen() {
  const params = useLocalSearchParams<{ category?: string; mood?: string }>();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(params.category ?? 'all');
  const [activeSort, setActiveSort] = useState('popular');
  const [activeStrain, setActiveStrain] = useState('All');
  const [activeMood, setActiveMood] = useState(params.mood ?? '');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const activeFilterCount =
    (activeSort !== 'popular' ? 1 : 0) +
    (activeStrain !== 'All' ? 1 : 0) +
    (activeMood ? 1 : 0);

  useEffect(() => {
    if (params.category) {
      setActiveCategory(params.category);
    }
  }, [params.category]);

  useEffect(() => {
    if (params.mood) {
      setActiveMood(params.mood);
      setActiveCategory('all');
      setQuery(params.mood);
    }
  }, [params.mood]);

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
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)) ||
          (p.effects?.some((e) => e.label.toLowerCase().includes(q)) ?? false)
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

  const isIdle = query.trim().length === 0 && activeCategory === 'all' && !activeMood;

  function clearAll() {
    setQuery('');
    setActiveCategory('all');
    setActiveStrain('All');
    setActiveSort('popular');
    setActiveMood('');
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.pageHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.pageEyebrow}>LUMINOUS BOTANICAL</Text>
          <Text style={styles.pageTitle}>Curated Collection</Text>
        </View>
        <AIButton />
      </View>

      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={theme.colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search botanicals, brands, effects..."
            placeholderTextColor={theme.colors.textMuted}
            value={query}
            onChangeText={(t) => {
              setQuery(t);
              if (activeMood) setActiveMood('');
            }}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(''); setActiveMood(''); }} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
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

      {/* Soft mint segmented strain control — equal segments, not pills */}
      <View style={styles.segmentWrap}>
        <Text style={styles.segmentLabel}>Spectrum</Text>
        <View style={styles.segmentTrack}>
          {STRAIN_SEGMENTS.map((s) => {
            const selected = activeStrain === s;
            return (
              <TouchableOpacity
                key={s}
                style={[styles.segment, selected && styles.segmentActive]}
                onPress={() => {
                  setActiveStrain(s);
                  Keyboard.dismiss();
                }}
                activeOpacity={0.85}
              >
                <Text style={[styles.segmentText, selected && styles.segmentTextActive]}>
                  {s}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

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
          <Text style={styles.quickLabel}>Trending</Text>
          <View style={styles.quickRow}>
            {QUICK_SEARCHES.map((q) => (
              <TouchableOpacity
                key={q}
                style={styles.quickChip}
                onPress={() => setQuery(q)}
                activeOpacity={0.8}
              >
                <Ionicons name="leaf-outline" size={12} color={theme.colors.primary} />
                <Text style={styles.quickText}>{q}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {filtered.length} {filtered.length === 1 ? 'botanical' : 'botanicals'}
          {activeMood ? ` · ${activeMood}` : ''}
        </Text>
        {!isIdle && (
          <TouchableOpacity onPress={clearAll} style={styles.clearAllBtn}>
            <Text style={styles.clearAllText}>Clear all</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => setSelectedProduct(item)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={48} color={theme.colors.textMuted} />
            <Text style={styles.emptyTitle}>No botanicals found</Text>
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
    letterSpacing: 2,
    color: theme.colors.accentDark,
  },
  pageTitle: {
    fontFamily: theme.fonts.serif,
    fontSize: 28,
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
    borderRadius: theme.radius.full,
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
    borderRadius: 22,
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

  segmentWrap: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xs,
    gap: 6,
  },
  segmentLabel: {
    fontFamily: theme.fonts.semibold,
    fontSize: 11,
    letterSpacing: 1,
    color: theme.colors.textMuted,
  },
  segmentTrack: {
    flexDirection: 'row',
    backgroundColor: theme.colors.secondaryContainer,
    borderRadius: theme.radius.md,
    padding: 3,
    borderWidth: 1,
    borderColor: 'rgba(20, 66, 45, 0.1)',
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: theme.radius.sm,
  },
  segmentActive: {
    backgroundColor: theme.colors.white,
    ...theme.shadows.small,
  },
  segmentText: {
    fontFamily: theme.fonts.medium,
    fontSize: 11,
    color: theme.colors.primaryDark,
    opacity: 0.65,
  },
  segmentTextActive: {
    fontFamily: theme.fonts.semibold,
    opacity: 1,
    color: theme.colors.primaryDark,
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
    borderColor: theme.colors.gold + '40',
  },
  quickText: {
    ...theme.typography.caption,
    color: theme.colors.accentDark,
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

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import theme from '../theme';

// ─── Types ─────────────────────────────────────────────────────────────────

export interface SortOption {
  id: string;
  label: string;
  /** Ionicons name */
  icon: React.ComponentProps<typeof Ionicons>['name'];
  description?: string;
}

export interface FilterGroup {
  id: string;
  label: string;
  options: string[];
}

interface Props {
  visible: boolean;
  onClose: () => void;
  sortOptions: SortOption[];
  activeSort: string;
  onSortChange: (id: string) => void;
  filterGroups?: FilterGroup[];
  activeFilters?: Record<string, string>;
  onFilterChange?: (groupId: string, value: string) => void;
  onClearAll?: () => void;
  title?: string;
}

// ─── Default sort options used app-wide ───────────────────────────────────

export const DEFAULT_SORT_OPTIONS: SortOption[] = [
  {
    id: 'popular',
    label: 'Most Popular',
    icon: 'flame',
    description: 'Best sellers first',
  },
  {
    id: 'new',
    label: 'Newest Arrivals',
    icon: 'sparkles',
    description: 'Recently added',
  },
  {
    id: 'price_asc',
    label: 'Price: Low to High',
    icon: 'arrow-up',
    description: 'Budget friendly',
  },
  {
    id: 'price_desc',
    label: 'Price: High to Low',
    icon: 'arrow-down',
    description: 'Premium first',
  },
  {
    id: 'thc_desc',
    label: 'Highest THC',
    icon: 'leaf',
    description: 'Potency focused',
  },
];

// ─── Strain filter group used app-wide ────────────────────────────────────

export const STRAIN_FILTER_GROUP: FilterGroup = {
  id: 'strain',
  label: 'Strain Type',
  options: ['All', 'Indica', 'Sativa', 'Hybrid', 'CBD'],
};

// ─── Component ─────────────────────────────────────────────────────────────

export default function FilterSheet({
  visible,
  onClose,
  sortOptions,
  activeSort,
  onSortChange,
  filterGroups = [],
  activeFilters = {},
  onFilterChange,
  onClearAll,
  title = 'Sort & Filter',
}: Props) {
  const hasActiveFilters =
    activeSort !== sortOptions[0]?.id ||
    Object.values(activeFilters).some((v) => v !== filterGroups[0]?.options[0]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <Pressable style={styles.backdrop} onPress={onClose} />

      {/* Sheet */}
      <View style={styles.sheet}>
        {/* Handle bar */}
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>{title}</Text>
            {hasActiveFilters && (
              <Text style={styles.headerSub}>Filters applied</Text>
            )}
          </View>
          <View style={styles.headerActions}>
            {hasActiveFilters && onClearAll && (
              <TouchableOpacity style={styles.clearBtn} onPress={onClearAll} activeOpacity={0.75}>
                <Text style={styles.clearBtnText}>Clear all</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
              <Ionicons name="close" size={18} color={theme.colors.onPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          bounces={false}
        >
          {/* Sort section */}
          <Text style={styles.sectionLabel}>SORT BY</Text>
          <View style={styles.sortList}>
            {sortOptions.map((opt, i) => {
              const isActive = activeSort === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={[
                    styles.sortRow,
                    i < sortOptions.length - 1 && styles.sortRowBorder,
                    isActive && styles.sortRowActive,
                  ]}
                  onPress={() => { onSortChange(opt.id); }}
                  activeOpacity={0.75}
                >
                  {/* Icon badge */}
                  <View style={[styles.sortIconWrap, isActive && styles.sortIconWrapActive]}>
                    <Ionicons
                      name={opt.icon}
                      size={16}
                      color={isActive ? theme.colors.onSecondaryContainer : theme.colors.accentDark}
                    />
                  </View>

                  {/* Labels */}
                  <View style={styles.sortTextWrap}>
                    <Text style={[styles.sortLabel, isActive && styles.sortLabelActive]}>
                      {opt.label}
                    </Text>
                    {opt.description && (
                      <Text style={styles.sortDesc}>{opt.description}</Text>
                    )}
                  </View>

                  {/* Check */}
                  {isActive && (
                    <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Dynamic filter groups (e.g. Strain) */}
          {filterGroups.map((group) => (
            <View key={group.id} style={styles.filterGroup}>
              <Text style={styles.sectionLabel}>{group.label.toUpperCase()}</Text>
              <View style={styles.pillRow}>
                {group.options.map((opt) => {
                  const isActive = (activeFilters[group.id] ?? group.options[0]) === opt;
                  return (
                    <TouchableOpacity
                      key={opt}
                      style={[styles.pill, isActive && styles.pillActive]}
                      onPress={() => onFilterChange?.(group.id, opt)}
                      activeOpacity={0.75}
                    >
                      <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                        {opt}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Apply button */}
        <View style={styles.applyWrap}>
          <TouchableOpacity style={styles.applyBtn} onPress={onClose} activeOpacity={0.9}>
            <Text style={styles.applyText}>Apply</Text>
            <Ionicons name="arrow-forward" size={16} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(6, 22, 12, 0.55)',
  },
  sheet: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: 0,
    maxHeight: '82%',
    ...theme.shadows.large,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.border,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    marginTop: 4,
    gap: theme.spacing.sm,
  },
  headerTitle: {
    fontFamily: theme.fonts.serifBold,
    fontSize: 20,
    color: theme.colors.white,
  },
  headerSub: {
    fontFamily: theme.fonts.body,
    fontSize: 12,
    color: theme.colors.gold,
    marginTop: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  clearBtn: {
    paddingHorizontal: theme.spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.30)',
  },
  clearBtnText: {
    fontFamily: theme.fonts.semibold,
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Scroll body
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    gap: theme.spacing.md,
  },
  sectionLabel: {
    fontFamily: theme.fonts.semibold,
    fontSize: 10,
    letterSpacing: 2,
    color: theme.colors.accentDark,
    marginBottom: theme.spacing.sm,
  },

  // Sort list
  sortList: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg ?? 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.md,
  },
  sortRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  sortRowActive: {
    backgroundColor: theme.colors.primaryMuted,
  },
  sortIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: theme.colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sortIconWrapActive: {
    backgroundColor: theme.colors.secondaryContainer,
  },
  sortTextWrap: {
    flex: 1,
    gap: 2,
  },
  sortLabel: {
    fontFamily: theme.fonts.semibold,
    fontSize: 14,
    color: theme.colors.text,
  },
  sortLabelActive: {
    color: theme.colors.primary,
  },
  sortDesc: {
    fontFamily: theme.fonts.body,
    fontSize: 12,
    color: theme.colors.textMuted,
  },

  // Filter groups
  filterGroup: {
    gap: theme.spacing.sm,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs + 2,
  },
  pill: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs + 3,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  pillActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  pillText: {
    fontFamily: theme.fonts.semibold,
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  pillTextActive: {
    color: theme.colors.onPrimary,
  },

  // Apply
  applyWrap: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
  },
  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radius.full,
    paddingVertical: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  applyText: {
    fontFamily: theme.fonts.semibold,
    fontSize: 15,
    color: theme.colors.primary,
    letterSpacing: 0.3,
  },
});

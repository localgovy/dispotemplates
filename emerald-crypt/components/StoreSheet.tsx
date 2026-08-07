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
import { STORES, Store } from '../data/stores';
import theme from '../theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  activeStore: Store;
  onSelect: (store: Store) => void;
}

export default function StoreSheet({ visible, onClose, activeStore, onSelect }: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />

      <View style={styles.sheet}>
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Choose Location</Text>
            <Text style={styles.headerSub}>Emerald Crypt</Text>
          </View>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
            <Ionicons name="close" size={18} color={theme.colors.onPrimary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          bounces={false}
        >
          {STORES.map((store, i) => {
            const isActive = store.id === activeStore.id;
            return (
              <TouchableOpacity
                key={store.id}
                style={[styles.storeCard, isActive && styles.storeCardActive]}
                onPress={() => onSelect(store)}
                activeOpacity={0.8}
              >
                {/* Top row: name + check */}
                <View style={styles.storeTop}>
                  <View style={styles.storeNameRow}>
                    <View style={[styles.dotBadge, isActive && styles.dotBadgeActive]} />
                    <Text style={[styles.storeName, isActive && styles.storeNameActive]}>
                      {store.name}
                    </Text>
                  </View>
                  {isActive && (
                    <Ionicons name="checkmark-circle" size={28} color={theme.colors.primary} />
                  )}
                </View>

                {/* Address */}
                <View style={styles.infoRow}>
                  <Ionicons name="location-outline" size={14} color={theme.colors.accentDark} />
                  <Text style={styles.infoText}>
                    {store.address}{'\n'}{store.city}, {store.province}  {store.postalCode}
                  </Text>
                </View>

                {/* Hours */}
                <View style={styles.infoRow}>
                  <Ionicons name="time-outline" size={14} color={theme.colors.accentDark} />
                  <View style={{ flex: 1 }}>
                    {store.hoursLines.map((line, li) => (
                      <Text key={li} style={styles.infoText}>
                        <Text style={styles.hoursDay}>{line.days}: </Text>
                        {line.hours}
                      </Text>
                    ))}
                  </View>
                </View>

                {/* Phone */}
                <View style={styles.infoRow}>
                  <Ionicons name="call-outline" size={14} color={theme.colors.accentDark} />
                  <Text style={[styles.infoText, styles.phoneText]}>{store.phone}</Text>
                </View>

                {/* Select button if not active */}
                {!isActive && (
                  <View style={styles.selectRow}>
                    <Text style={styles.selectText}>Tap to select this location</Text>
                    <Ionicons name="arrow-forward" size={13} color={theme.colors.primary} />
                  </View>
                )}

                {isActive && (
                  <View style={styles.selectedBadge}>
                    <Ionicons name="checkmark" size={12} color={theme.colors.primary} />
                    <Text style={styles.selectedBadgeText}>Your pickup location</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(6, 22, 12, 0.55)',
  },
  sheet: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '88%',
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    marginTop: 4,
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
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    paddingBottom: 40,
  },

  // Store cards
  storeCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg ?? 16,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  storeCardActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryMuted,
  },
  storeTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  storeNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dotBadge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.border,
  },
  dotBadgeActive: {
    backgroundColor: theme.colors.primary,
  },
  storeName: {
    fontFamily: theme.fonts.serifBold,
    fontSize: 18,
    color: theme.colors.text,
  },
  storeNameActive: {
    color: theme.colors.primary,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  infoText: {
    fontFamily: theme.fonts.body,
    fontSize: 13,
    color: theme.colors.textSecondary,
    flex: 1,
    lineHeight: 19,
  },
  hoursDay: {
    fontFamily: theme.fonts.semibold,
    color: theme.colors.text,
  },
  phoneText: {
    fontFamily: theme.fonts.semibold,
    color: theme.colors.primary,
  },
  selectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  selectText: {
    fontFamily: theme.fonts.semibold,
    fontSize: 12,
    color: theme.colors.primary,
  },
  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: theme.colors.primary + '18',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
    marginTop: 2,
  },
  selectedBadgeText: {
    fontFamily: theme.fonts.semibold,
    fontSize: 12,
    color: theme.colors.primary,
  },
});

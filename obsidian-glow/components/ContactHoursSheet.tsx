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
import { Store } from '../data/stores';
import theme from '../theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  store: Store;
}

export default function ContactHoursSheet({ visible, onClose, store }: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close" />
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.eyebrow}>Contact & Hours</Text>
              <Text style={styles.title} numberOfLines={2}>{store.name}</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
              <Ionicons name="close" size={18} color={theme.colors.onPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            bounces={false}
            contentContainerStyle={styles.body}
          >
            <View style={styles.row}>
              <View style={styles.iconWrap}>
                <Ionicons name="location-outline" size={16} color={theme.colors.primary} />
              </View>
              <Text style={styles.rowText}>
                {store.address}{'\n'}{store.city}, {store.province} {store.postalCode}
              </Text>
            </View>

            <View style={styles.row}>
              <View style={styles.iconWrap}>
                <Ionicons name="call-outline" size={16} color={theme.colors.primary} />
              </View>
              <Text style={[styles.rowText, styles.phone]}>{store.phone}</Text>
            </View>

            <Text style={styles.sectionLabel}>Weekly schedule</Text>
            <View style={styles.scheduleCard}>
              {store.hoursLines.map((line, i) => (
                <View
                  key={`${line.days}-${i}`}
                  style={[styles.scheduleRow, i < store.hoursLines.length - 1 && styles.scheduleRowBorder]}
                >
                  <Text style={styles.scheduleDays}>{line.days}</Text>
                  <Text style={styles.scheduleHours}>{line.hours}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.note}>
              Pickup is available during open hours. Bring valid 19+ ID.
            </Text>
          </ScrollView>

          <TouchableOpacity style={styles.doneBtn} onPress={onClose} activeOpacity={0.85}>
            <Text style={styles.doneText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 22,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  card: {
    backgroundColor: theme.colors.background,
    borderRadius: 22,
    overflow: 'hidden',
    maxHeight: '82%',
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.large,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    gap: 12,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  eyebrow: {
    fontFamily: theme.fonts.semibold,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: theme.colors.gold,
    marginBottom: 2,
  },
  title: {
    fontFamily: theme.fonts.serifBold,
    fontSize: 20,
    color: theme.colors.white,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primary + '18',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  rowText: {
    flex: 1,
    fontFamily: theme.fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.textSecondary,
  },
  phone: {
    fontFamily: theme.fonts.semibold,
    color: theme.colors.primary,
  },
  sectionLabel: {
    fontFamily: theme.fonts.semibold,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  scheduleCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg ?? 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  scheduleRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  scheduleDays: {
    flex: 1,
    fontFamily: theme.fonts.semibold,
    fontSize: 13,
    color: theme.colors.text,
  },
  scheduleHours: {
    fontFamily: theme.fonts.body,
    fontSize: 13,
    color: theme.colors.textSecondary,
    textAlign: 'right',
  },
  note: {
    fontFamily: theme.fonts.body,
    fontSize: 12,
    lineHeight: 18,
    color: theme.colors.textMuted,
  },
  doneBtn: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.full ?? 999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  doneText: {
    fontFamily: theme.fonts.semibold,
    fontSize: 15,
    color: theme.colors.onPrimary,
  },
});

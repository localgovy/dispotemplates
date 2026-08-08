import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { supabase, Tables } from '../../../lib/supabase';
import { useAuth } from '../../../context/AuthContext';
import AIButton from '../../../components/AIButton';
import theme from '../../../theme';

type Order = Tables['orders'] & { order_items: Tables['order_items'][] };
type OrderStatus = Tables['orders']['status'];

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; icon: React.ComponentProps<typeof Ionicons>['name'] }
> = {
  ready:      { label: 'Ready for Pickup', color: theme.colors.primary,   icon: 'checkmark-circle' },
  processing: { label: 'Processing',       color: theme.colors.accent,    icon: 'time' },
  picked_up:  { label: 'Picked Up',        color: theme.colors.textMuted, icon: 'bag-check-outline' },
  cancelled:  { label: 'Cancelled',        color: theme.colors.danger,    icon: 'close-circle-outline' },
};

export default function OrdersScreen() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) {
          setOrders(data as Order[]);
          const first = data[0] as Order | undefined;
          if (first?.status === 'ready') setExpanded(first.id);
        }
        setLoading(false);
      });
  }, [user]);

  function formatDate(iso: string) {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return d.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' });
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Visit History</Text>
          <AIButton />
        </View>
        <View style={styles.centred}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (orders.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Visit History</Text>
          <AIButton />
        </View>
        <View style={styles.centred}>
          <Ionicons name="clipboard-outline" size={48} color={theme.colors.textDisabled} />
          <Text style={styles.emptyTitle}>No visits yet</Text>
          <Text style={styles.emptyText}>Your placed orders will appear here.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Visit History</Text>
        <AIButton />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {orders.map((order) => {
          const cfg = STATUS_CONFIG[order.status];
          const isExpanded = expanded === order.id;

          return (
            <TouchableOpacity
              key={order.id}
              style={styles.chartRow}
              onPress={() => setExpanded(isExpanded ? null : order.id)}
              activeOpacity={0.9}
            >
              <View style={styles.dateCol}>
                <Text style={styles.dateText}>{formatDate(order.created_at)}</Text>
                {order.status === 'ready' && (
                  <View style={styles.readyDot} />
                )}
              </View>

              <View style={styles.detailsCol}>
                {order.status === 'ready' && (
                  <View style={styles.readyBanner}>
                    <Ionicons name="checkmark-circle" size={12} color={theme.colors.onPrimary} />
                    <Text style={styles.readyBannerText}>Ready for Pickup</Text>
                  </View>
                )}

                <View style={styles.detailsHeader}>
                  <View style={styles.detailsLeft}>
                    <Text style={styles.orderCode}>{order.confirmation_code}</Text>
                    <View style={[styles.statusBadge, { borderColor: cfg.color }]}>
                      <Ionicons name={cfg.icon} size={11} color={cfg.color} />
                      <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
                    </View>
                  </View>
                  <View style={styles.detailsRight}>
                    <Text style={styles.orderTotal}>${Number(order.total).toFixed(2)}</Text>
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={14}
                      color={theme.colors.textMuted}
                    />
                  </View>
                </View>

                {isExpanded && (
                  <View style={styles.orderBody}>
                    <View style={styles.divider} />
                    {order.order_items.map((item) => (
                      <View key={item.id} style={styles.itemRow}>
                        <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                        <Text style={styles.itemQty}>×{item.qty}</Text>
                        <Text style={styles.itemPrice}>${Number(item.price).toFixed(2)}</Text>
                      </View>
                    ))}
                    {order.status === 'ready' && (
                      <View style={styles.viewCodeBtn}>
                        <Ionicons name="qr-code-outline" size={14} color={theme.colors.primary} />
                        <Text style={styles.viewCodeText}>
                          Pickup Code: {order.confirmation_code}
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {!isExpanded && (
                  <Text style={styles.itemSummary}>
                    {order.order_items.length}{' '}
                    {order.order_items.length === 1 ? 'item' : 'items'}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}

        <View style={styles.footerNote}>
          <Ionicons name="time-outline" size={16} color={theme.colors.textDisabled} />
          <Text style={styles.footerNoteText}>
            {orders.length} {orders.length === 1 ? 'visit' : 'visits'} at Nebula Clinic
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  headerTitle: {
    ...theme.typography.title,
    color: theme.colors.primary,
  },
  centred: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
    paddingBottom: 80,
  },
  emptyTitle: {
    ...theme.typography.heading,
    color: theme.colors.primary,
  },
  emptyText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
  scroll: { flex: 1 },
  scrollContent: {
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    paddingBottom: 100,
  },
  chartRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surface,
    overflow: 'hidden',
  },
  dateCol: {
    width: 72,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    borderRightWidth: 1,
    borderRightColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: theme.spacing.xs,
  },
  dateText: {
    ...theme.typography.small,
    color: theme.colors.accentDark,
    fontFamily: theme.fonts.semibold,
    textAlign: 'center',
  },
  readyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  detailsCol: {
    flex: 1,
    padding: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  readyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  readyBannerText: {
    ...theme.typography.small,
    color: theme.colors.onPrimary,
    fontFamily: theme.fonts.semibold,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  detailsLeft: { gap: 4, flex: 1 },
  detailsRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  orderCode: {
    ...theme.typography.bodyBold,
    color: theme.colors.text,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  statusText: {
    ...theme.typography.small,
    fontFamily: theme.fonts.semibold,
  },
  orderTotal: {
    ...theme.typography.subheading,
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
  },
  orderBody: {
    marginTop: theme.spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.divider,
    marginBottom: theme.spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingVertical: 3,
  },
  itemName: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  itemQty: {
    ...theme.typography.small,
    color: theme.colors.textMuted,
    width: 24,
  },
  itemPrice: {
    ...theme.typography.caption,
    color: theme.colors.text,
    width: 54,
    textAlign: 'right',
    fontFamily: theme.fonts.semibold,
  },
  viewCodeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.primaryMuted,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  viewCodeText: {
    ...theme.typography.small,
    color: theme.colors.primary,
    fontFamily: theme.fonts.semibold,
    flex: 1,
  },
  itemSummary: {
    ...theme.typography.small,
    color: theme.colors.textMuted,
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
  },
  footerNoteText: {
    ...theme.typography.small,
    color: theme.colors.textDisabled,
  },
});

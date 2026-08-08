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
import { useRouter } from 'expo-router';
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
  const router = useRouter();
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
          <Text style={styles.headerTitle}>My Orders</Text>
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
          <Text style={styles.headerTitle}>My Orders</Text>
          <AIButton />
        </View>
        <View style={styles.centred}>
          <Ionicons name="receipt-outline" size={48} color={theme.colors.textDisabled} />
          <Text style={styles.emptyTitle}>No orders yet</Text>
          <Text style={styles.emptyText}>Your placed orders will appear here.</Text>
          <TouchableOpacity
            style={styles.emptyShopBtn}
            onPress={() => router.push('/(tabs)/search')}
            activeOpacity={0.85}
          >
            <Text style={styles.emptyShopBtnText}>Shop now</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
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
              style={styles.orderCard}
              onPress={() => setExpanded(isExpanded ? null : order.id)}
              activeOpacity={0.85}
            >
              <View style={styles.cardRow}>
                <View style={[styles.orb, { backgroundColor: cfg.color }, theme.shadows.small]}>
                  <View style={styles.orbInner} />
                </View>

                <View style={styles.cardContent}>
                  {order.status === 'ready' && (
                    <Text style={styles.readyHint}>Ready for Pickup</Text>
                  )}

                  <View style={styles.orderHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.orderCode}>{order.confirmation_code}</Text>
                      <Text style={styles.orderDate}>{formatDate(order.created_at)}</Text>
                    </View>
                    <Text style={styles.orderTotal}>${Number(order.total).toFixed(2)}</Text>
                  </View>

                  <View style={styles.statusRow}>
                    <Ionicons name={cfg.icon} size={13} color={cfg.color} />
                    <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
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
                          <Ionicons name="qr-code-outline" size={16} color={theme.colors.primary} />
                          <Text style={styles.viewCodeText}>
                            Show Pickup Code: {order.confirmation_code}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}

                  <View style={styles.orderFooter}>
                    <Text style={styles.itemSummary}>
                      {order.order_items.length}{' '}
                      {order.order_items.length === 1 ? 'item' : 'items'}
                    </Text>
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={16}
                      color={theme.colors.textMuted}
                    />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        <View style={styles.emptyPast}>
          <Ionicons name="time-outline" size={20} color={theme.colors.textDisabled} />
          <Text style={styles.emptyPastText}>
            {orders.length} {orders.length === 1 ? 'order' : 'orders'} at Ghost Atelier
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
    borderBottomColor: theme.colors.divider,
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
    paddingBottom: 100,
  },
  emptyTitle: {
    ...theme.typography.heading,
    color: theme.colors.primary,
  },
  emptyText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
  emptyShopBtn: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
    minHeight: 44,
    borderRadius: 8,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyShopBtnText: {
    fontFamily: theme.fonts.semibold,
    fontSize: 14,
    color: theme.colors.onPrimary,
  },
  scroll: { flex: 1 },
  scrollContent: {
    padding: theme.spacing.md,
    gap: theme.spacing.md,
    paddingBottom: 120,
  },

  orderCard: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
    overflow: 'hidden',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  orb: {
    width: 14,
    height: 14,
    borderRadius: theme.radius.full,
    marginTop: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbInner: {
    width: 6,
    height: 6,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.white,
    opacity: 0.6,
  },
  cardContent: {
    flex: 1,
    gap: theme.spacing.sm,
  },
  readyHint: {
    ...theme.typography.label,
    color: theme.colors.primary,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  orderCode: {
    ...theme.typography.subheading,
    color: theme.colors.text,
  },
  orderDate: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  orderTotal: {
    ...theme.typography.subheading,
    color: theme.colors.text,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  statusText: {
    ...theme.typography.caption,
  },
  orderBody: {
    gap: theme.spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.divider,
    marginBottom: theme.spacing.xs,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingVertical: 4,
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
  },
  viewCodeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.primaryMuted,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  viewCodeText: {
    ...theme.typography.caption,
    color: theme.colors.primary,
  },
  orderFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
  },
  itemSummary: {
    ...theme.typography.small,
    color: theme.colors.textMuted,
  },
  emptyPast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
  },
  emptyPastText: {
    ...theme.typography.small,
    color: theme.colors.textDisabled,
    textAlign: 'center',
  },
});

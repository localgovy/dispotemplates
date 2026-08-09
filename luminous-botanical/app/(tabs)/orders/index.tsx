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
    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (!error && data) {
          setOrders(data as Order[]);
          const first = data[0] as Order | undefined;
          if (first?.status === 'ready') setExpanded(first.id);
        } else {
          setOrders([]);
        }
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
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
          <View>
            <Text style={styles.headerTitle}>Orders</Text>
            <Text style={styles.headerSub}>Garden</Text>
          </View>
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
          <View>
            <Text style={styles.headerTitle}>Orders</Text>
            <Text style={styles.headerSub}>Garden</Text>
          </View>
          <AIButton />
        </View>
        <View style={styles.centred}>
          <Ionicons name="leaf-outline" size={48} color={theme.colors.primary} />
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
        <View>
          <Text style={styles.headerTitle}>Orders</Text>
          <Text style={styles.headerSub}>Garden</Text>
        </View>
        <AIButton />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {orders.map((order, index) => {
          const cfg = STATUS_CONFIG[order.status];
          const isExpanded = expanded === order.id;
          const isLast = index === orders.length - 1;

          return (
            <View key={order.id} style={styles.timelineRow}>
              <View style={styles.railCol}>
                <View style={[styles.leafMarker, order.status === 'ready' && styles.leafMarkerReady]}>
                  <Ionicons name="leaf" size={14} color={theme.colors.onPrimary} />
                </View>
                {!isLast && <View style={styles.railLine} />}
              </View>

              <TouchableOpacity
                style={styles.orderCard}
                onPress={() => setExpanded(isExpanded ? null : order.id)}
                activeOpacity={0.9}
              >
                {order.status === 'ready' && (
                  <View style={styles.readyBanner}>
                    <Ionicons name="checkmark-circle" size={14} color={theme.colors.onPrimary} />
                    <Text style={styles.readyBannerText}>Ready for Pickup!</Text>
                  </View>
                )}

                <View style={styles.orderHeader}>
                  <View>
                    <Text style={styles.orderCode}>{order.confirmation_code}</Text>
                    <Text style={styles.orderDate}>{formatDate(order.created_at)}</Text>
                  </View>
                  <View style={styles.orderRight}>
                    <View style={[styles.statusBadge, { backgroundColor: cfg.color + '20' }]}>
                      <Ionicons name={cfg.icon} size={12} color={cfg.color} />
                      <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
                    </View>
                    <Text style={styles.orderTotal}>${Number(order.total).toFixed(2)}</Text>
                  </View>
                </View>

                {isExpanded && (
                  <View style={styles.orderBody}>
                    <View style={styles.divider} />
                    {order.order_items.map((item) => (
                      <View key={item.id} style={styles.itemRow}>
                        <Ionicons name="leaf-outline" size={10} color={theme.colors.primary} />
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
              </TouchableOpacity>
            </View>
          );
        })}

        <View style={styles.emptyPast}>
          <Ionicons name="time-outline" size={20} color={theme.colors.textDisabled} />
          <Text style={styles.emptyPastText}>
            {orders.length} {orders.length === 1 ? 'order' : 'orders'} at Luminous Botanical
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
  },
  headerTitle: {
    ...theme.typography.title,
    color: theme.colors.primary,
  },
  headerSub: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginTop: 2,
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
    paddingBottom: 100,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  railCol: {
    width: 32,
    alignItems: 'center',
  },
  leafMarker: {
    width: 28,
    height: 28,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  leafMarkerReady: {
    backgroundColor: theme.colors.accentDark,
  },
  railLine: {
    flex: 1,
    width: 2,
    backgroundColor: theme.colors.border,
    marginTop: 4,
    minHeight: 40,
  },
  orderCard: {
    flex: 1,
    backgroundColor: theme.colors.overlayLight,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    overflow: 'hidden',
  },
  readyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  readyBannerText: {
    ...theme.typography.label,
    color: theme.colors.onPrimary,
    letterSpacing: 0.5,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  orderCode: {
    ...theme.typography.subheading,
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
  },
  orderDate: {
    ...theme.typography.small,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  orderRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 3,
    borderRadius: theme.radius.full,
  },
  statusText: {
    ...theme.typography.small,
    fontFamily: theme.fonts.bold,
  },
  orderTotal: {
    ...theme.typography.subheading,
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
  },
  orderBody: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
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
    fontFamily: theme.fonts.semibold,
  },
  viewCodeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.primaryMuted,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  viewCodeText: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontFamily: theme.fonts.bold,
  },
  orderFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
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
    marginTop: theme.spacing.sm,
  },
  emptyPastText: {
    ...theme.typography.small,
    color: theme.colors.textDisabled,
    textAlign: 'center',
  },
});

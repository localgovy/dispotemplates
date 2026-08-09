import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
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
  { label: string; color: string }
> = {
  ready:      { label: 'READY',      color: theme.colors.primary },
  processing: { label: 'PROCESSING', color: theme.colors.accent },
  picked_up:  { label: 'PICKED UP',  color: theme.colors.textMuted },
  cancelled:  { label: 'CANCELLED',  color: theme.colors.danger },
};

export default function OrdersScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    // Web/demo previews must never hang on a Supabase round-trip.
    const demoMode =
      Platform.OS === 'web' || process.env.EXPO_PUBLIC_SCREENSHOT_MODE === '1';

    if (demoMode || !user) {
      setOrders([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const failSafe = setTimeout(() => {
      if (!cancelled) {
        setOrders([]);
        setLoading(false);
      }
    }, 3500);

    supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return;
        clearTimeout(failSafe);
        if (!error && data) {
          setOrders(data as Order[]);
          const first = data[0] as Order | undefined;
          if (first?.status === 'ready') setExpanded(first.id);
        } else {
          setOrders([]);
        }
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        clearTimeout(failSafe);
        setOrders([]);
        setLoading(false);
      });

    return () => {
      cancelled = true;
      clearTimeout(failSafe);
    };
  }, [user]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Orders</Text>
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
          <Text style={styles.headerTitle}>Orders</Text>
          <AIButton />
        </View>
        <View style={styles.centred}>
          <Ionicons name="receipt-outline" size={48} color={theme.colors.primary} />
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
        <Text style={styles.headerTitle}>Orders</Text>
        <AIButton />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.colHeader, styles.colCode]}>CODE</Text>
            <Text style={[styles.colHeader, styles.colStatus]}>STATUS</Text>
            <Text style={[styles.colHeader, styles.colTotal]}>TOTAL</Text>
          </View>

          {orders.map((order) => {
            const cfg = STATUS_CONFIG[order.status];
            const isExpanded = expanded === order.id;

            return (
              <View key={order.id}>
                <TouchableOpacity
                  style={styles.tableRow}
                  onPress={() => setExpanded(isExpanded ? null : order.id)}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.cellCode, styles.colCode]} numberOfLines={1}>
                    {order.confirmation_code}
                  </Text>
                  <Text style={[styles.cellStatus, styles.colStatus, { color: cfg.color }]}>
                    {cfg.label}
                  </Text>
                  <Text style={[styles.cellTotal, styles.colTotal]}>
                    ${Number(order.total).toFixed(2)}
                  </Text>
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.expandBlock}>
                    {order.order_items.map((item) => (
                      <View key={item.id} style={styles.itemRow}>
                        <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                        <Text style={styles.itemQty}>×{item.qty}</Text>
                        <Text style={styles.itemPrice}>${Number(item.price).toFixed(2)}</Text>
                      </View>
                    ))}
                    {order.status === 'ready' && (
                      <View style={styles.pickupCode}>
                        <Ionicons name="qr-code-outline" size={14} color={theme.colors.primary} />
                        <Text style={styles.pickupCodeText}>
                          Show Pickup Code: {order.confirmation_code}
                        </Text>
                      </View>
                    )}
                    <View style={styles.expandFooter}>
                      <Text style={styles.itemSummary}>
                        {order.order_items.length}{' '}
                        {order.order_items.length === 1 ? 'item' : 'items'}
                      </Text>
                      <Ionicons name="chevron-up" size={14} color={theme.colors.textMuted} />
                    </View>
                  </View>
                )}

                <View style={styles.rowDivider} />
              </View>
            );
          })}
        </View>

        <View style={styles.emptyPast}>
          <Ionicons name="time-outline" size={20} color={theme.colors.textDisabled} />
          <Text style={styles.emptyPastText}>
            {orders.length} {orders.length === 1 ? 'order' : 'orders'} at Obsidian Lab
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
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
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
    paddingBottom: 120,
  },

  table: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  colHeader: {
    ...theme.typography.label,
    color: theme.colors.textMuted,
  },
  colCode: { flex: 1.2 },
  colStatus: { flex: 1 },
  colTotal: { flex: 0.7, textAlign: 'right' },

  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
  },
  cellCode: {
    fontFamily: theme.fonts.mono,
    fontSize: 12,
    color: theme.colors.text,
    letterSpacing: 0.3,
  },
  cellStatus: {
    fontFamily: theme.fonts.mono,
    fontSize: 10,
    letterSpacing: 0.8,
  },
  cellTotal: {
    fontFamily: theme.fonts.mono,
    fontSize: 12,
    color: theme.colors.text,
    textAlign: 'right',
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.divider,
  },

  expandBlock: {
    paddingHorizontal: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.divider,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingVertical: 4,
  },
  itemName: {
    fontFamily: theme.fonts.mono,
    fontSize: 11,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  itemQty: {
    fontFamily: theme.fonts.mono,
    fontSize: 11,
    color: theme.colors.textMuted,
    width: 24,
  },
  itemPrice: {
    fontFamily: theme.fonts.mono,
    fontSize: 11,
    color: theme.colors.text,
    width: 54,
    textAlign: 'right',
  },
  pickupCode: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.primary,
    justifyContent: 'center',
  },
  pickupCodeText: {
    fontFamily: theme.fonts.mono,
    fontSize: 11,
    color: theme.colors.primary,
  },
  expandFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.xs,
    paddingTop: theme.spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.divider,
  },
  itemSummary: {
    fontFamily: theme.fonts.mono,
    fontSize: 10,
    color: theme.colors.textMuted,
  },

  emptyPast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  emptyPastText: {
    fontFamily: theme.fonts.mono,
    fontSize: 11,
    color: theme.colors.textDisabled,
  },
});

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
  ready:      { label: 'READY',      color: theme.colors.primary,   icon: 'checkmark-circle' },
  processing: { label: 'PROCESSING', color: theme.colors.accent,    icon: 'time' },
  picked_up:  { label: 'WITHDRAWN',  color: theme.colors.textMuted, icon: 'bag-check-outline' },
  cancelled:  { label: 'VOIDED',     color: theme.colors.danger,    icon: 'close-circle-outline' },
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

  function formatTimestamp(iso: string) {
    return new Date(iso).toLocaleString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Vault Log</Text>
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
          <Text style={styles.headerTitle}>Vault Log</Text>
          <AIButton />
        </View>
        <View style={styles.centred}>
          <Ionicons name="receipt-outline" size={48} color={theme.colors.textDisabled} />
          <Text style={styles.emptyTitle}>No orders yet</Text>
          <Text style={styles.emptyText}>Your placed orders will appear here.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Vault Log</Text>
        <AIButton />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logBlock}>
          <View style={styles.logHeader}>
            <Text style={styles.logHeaderText}>ACCESS LOG</Text>
            <Text style={styles.logHeaderText}>STATUS</Text>
            <Text style={[styles.logHeaderText, styles.colRight]}>AMOUNT</Text>
          </View>

          {orders.map((order) => {
            const cfg = STATUS_CONFIG[order.status];
            const isExpanded = expanded === order.id;

            return (
              <View key={order.id}>
                <TouchableOpacity
                  style={styles.logRow}
                  onPress={() => setExpanded(isExpanded ? null : order.id)}
                  activeOpacity={0.85}
                >
                  <View style={styles.colCode}>
                    <Text style={styles.logCode} numberOfLines={1}>
                      {order.confirmation_code}
                    </Text>
                    <Text style={styles.logTimestamp}>
                      {formatTimestamp(order.created_at)}
                    </Text>
                  </View>
                  <View style={styles.colStatus}>
                    <Ionicons name={cfg.icon} size={12} color={cfg.color} />
                    <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
                  </View>
                  <Text style={styles.logTotal}>${Number(order.total).toFixed(2)}</Text>
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.expandBlock}>
                    <Text style={styles.expandTimestamp}>
                      LOGGED · {formatTimestamp(order.created_at)}
                    </Text>
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
            {orders.length} {orders.length === 1 ? 'order' : 'orders'} at Emerald Crypt
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
  scroll: { flex: 1 },
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: 120,
  },

  logBlock: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    overflow: 'hidden',
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    gap: theme.spacing.sm,
  },
  logHeaderText: {
    ...theme.typography.label,
    color: theme.colors.textMuted,
    flex: 1,
  },
  colRight: { textAlign: 'right' },

  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  colCode: { flex: 1.3, gap: 2 },
  colStatus: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  logCode: {
    fontFamily: theme.fonts.mono,
    fontSize: 12,
    color: theme.colors.text,
    letterSpacing: 0.3,
  },
  logTimestamp: {
    fontFamily: theme.fonts.mono,
    fontSize: 10,
    color: theme.colors.textMuted,
  },
  statusText: {
    fontFamily: theme.fonts.mono,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  logTotal: {
    fontFamily: theme.fonts.mono,
    fontSize: 12,
    color: theme.colors.text,
    flex: 0.6,
    textAlign: 'right',
  },
  rowDivider: {
    height: 1,
    backgroundColor: theme.colors.divider,
  },

  expandBlock: {
    paddingHorizontal: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
    gap: theme.spacing.xs,
  },
  expandTimestamp: {
    fontFamily: theme.fonts.mono,
    fontSize: 10,
    color: theme.colors.primary,
    letterSpacing: 0.5,
    paddingTop: theme.spacing.xs,
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
  viewCodeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: theme.radius.xs,
  },
  viewCodeText: {
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
    borderTopWidth: 1,
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
    ...theme.typography.small,
    color: theme.colors.textDisabled,
  },
});

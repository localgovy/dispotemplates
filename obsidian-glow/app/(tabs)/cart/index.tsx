import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../context/AuthContext';
import { useStore } from '../../../context/StoreContext';
import theme from '../../../theme';
import { useCart } from '../../../context/CartContext';
import AIButton from '../../../components/AIButton';

const PTS_PER_DOLLAR = 1;

const VALID_PROMOS: Record<string, number> = {
  OBSIDIAN10: 0.1,
  LAB15: 0.15,
  NEWUSER: 0.2,
};

export default function CartScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { store } = useStore();
  const { items, totalItems, subtotal, removeFromCart, setQty, clearCart } = useCart();
  const [promoInput, setPromoInput] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoApplied, setPromoApplied] = useState('');
  const [promoError, setPromoError] = useState('');
  const [placing, setPlacing] = useState(false);

  const discountAmt = subtotal * promoDiscount;
  const tax = (subtotal - discountAmt) * 0.13;
  const total = subtotal - discountAmt + tax;

  function applyPromo() {
    const code = promoInput.trim().toUpperCase();
    if (VALID_PROMOS[code]) {
      setPromoDiscount(VALID_PROMOS[code]);
      setPromoApplied(code);
      setPromoError('');
      setPromoInput('');
    } else {
      setPromoError('Invalid promo code. Try OBSIDIAN10, LAB15, or NEWUSER.');
      setPromoDiscount(0);
      setPromoApplied('');
    }
  }

  function removePromo() {
    setPromoDiscount(0);
    setPromoApplied('');
    setPromoError('');
    setPromoInput('');
  }

  function handleRemove(productId: string, name: string) {
    Alert.alert('Remove Item', `Remove "${name}" from your basket?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeFromCart(productId) },
    ]);
  }

  async function checkout() {
    if (placing) return;
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to place an order.');
      return;
    }
    setPlacing(true);
    try {
      const code = `OBS-${Math.random().toString(36).toUpperCase().slice(2, 7)}`;

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          confirmation_code: code,
          status: 'processing',
          subtotal: Number(subtotal.toFixed(2)),
          discount_amt: Number(discountAmt.toFixed(2)),
          tax: Number(tax.toFixed(2)),
          total: Number(total.toFixed(2)),
          promo_code: promoApplied || null,
        })
        .select('id')
        .single();

      if (orderError) throw orderError;

      const lineItems = items.map(({ product, qty }) => ({
        order_id: orderData.id,
        product_id: product.id,
        name: product.name,
        brand: product.brand ?? null,
        price: Number(product.price.toFixed(2)),
        qty,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(lineItems);
      if (itemsError) throw itemsError;

      const ptsEarned = Math.floor(subtotal * PTS_PER_DOLLAR);
      const { data: newBalance } = await supabase.rpc('award_loyalty_pts', {
        p_user_id: user.id,
        p_order_id: orderData.id,
        p_pts: ptsEarned,
      });

      clearCart();
      Alert.alert(
        'Order Placed',
        `Confirmation: ${code}\n\n+${ptsEarned} Lab Credits earned${newBalance != null ? ` — balance: ${Number(newBalance).toLocaleString()} pts` : ''}.\n\nReady in ~15 min at ${store.address}, ${store.city}.\nBring valid 19+ ID.`,
        [{ text: 'View Orders', onPress: () => router.push('/(tabs)/orders') }],
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      Alert.alert('Order Error', msg);
    } finally {
      setPlacing(false);
    }
  }

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Cart</Text>
          <AIButton />
        </View>
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Ionicons name="bag-handle-outline" size={48} color={theme.colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>Your basket is empty</Text>
          <Text style={styles.emptyText}>Add lab-verified strains to your Lab ticket.</Text>
          <TouchableOpacity
            style={styles.browseBtn}
            onPress={() => router.push('/(tabs)/search')}
            activeOpacity={0.85}
          >
            <Ionicons name="storefront-outline" size={16} color={theme.colors.onPrimary} />
            <Text style={styles.browseBtnText}>Browse the Lab</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Cart</Text>
          <Text style={styles.itemCount}>
            Lab ticket · {totalItems} {totalItems === 1 ? 'item' : 'items'}
          </Text>
        </View>
        <AIButton />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.ticketBlock}>
          <Text style={styles.ticketLabel}>LINE ITEMS</Text>
          {items.map(({ product, qty }, index) => (
            <View key={product.id}>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptName} numberOfLines={2}>{product.name}</Text>
                <Text style={styles.receiptCalc}>
                  {qty} × ${product.price.toFixed(2)}
                </Text>
              </View>
              <View style={styles.controlRow}>
                <View style={styles.qtyRow}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => setQty(product.id, qty - 1)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="remove" size={14} color={theme.colors.text} />
                  </TouchableOpacity>
                  <Text style={styles.qtyText}>{qty}</Text>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => setQty(product.id, qty + 1)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="add" size={14} color={theme.colors.text} />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  onPress={() => handleRemove(product.id, product.name)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.removeText}>REMOVE</Text>
                </TouchableOpacity>
              </View>
              {index < items.length - 1 && <View style={styles.hairline} />}
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>PICKUP LOCATION</Text>
          <View style={styles.flatRow}>
            <Ionicons name="storefront-outline" size={18} color={theme.colors.primary} />
            <View style={styles.flatRowText}>
              <Text style={styles.pickupTitle}>Obsidian Lab</Text>
              <Text style={styles.pickupAddr}>{store.address}, {store.city}</Text>
              <Text style={styles.readyText}>Ready in: ~15 min</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.promoHeader}>
            <Text style={styles.sectionLabel}>PROMO CODE</Text>
            {promoApplied !== '' && (
              <Text style={styles.promoBadge}>-{Math.round(promoDiscount * 100)}%</Text>
            )}
          </View>

          {promoApplied === '' ? (
            <View style={styles.promoInputRow}>
              <TextInput
                style={styles.promoInput}
                placeholder="Enter code (e.g. OBSIDIAN10)"
                placeholderTextColor={theme.colors.textMuted}
                value={promoInput}
                onChangeText={(t) => { setPromoInput(t); setPromoError(''); }}
                autoCapitalize="characters"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={[styles.promoApplyBtn, promoInput.length < 3 && styles.promoApplyBtnDisabled]}
                onPress={applyPromo}
                disabled={promoInput.length < 3}
                activeOpacity={0.8}
              >
                <Text style={styles.promoApplyText}>APPLY</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.promoActiveRow}>
              <Text style={styles.promoActiveCode}>{promoApplied}</Text>
              <TouchableOpacity onPress={removePromo} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close" size={16} color={theme.colors.textMuted} />
              </TouchableOpacity>
            </View>
          )}

          {promoError !== '' && <Text style={styles.promoError}>{promoError}</Text>}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ORDER SUMMARY</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal ({totalItems} items)</Text>
            <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
          </View>
          {promoDiscount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Promo ({promoApplied})</Text>
              <Text style={[styles.summaryValue, { color: theme.colors.primary }]}>
                -${discountAmt.toFixed(2)}
              </Text>
            </View>
          )}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Est. Tax</Text>
            <Text style={styles.summaryValue}>${tax.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Pickup</Text>
            <Text style={styles.summaryValue}>Included</Text>
          </View>
          <View style={styles.hairline} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOTAL</Text>
            <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
          </View>
          <Text style={styles.summaryNote}>Valid 19+ government ID required at pickup</Text>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.checkoutDock, placing && { opacity: 0.7 }]}
        onPress={checkout}
        activeOpacity={0.9}
        disabled={placing}
      >
        {placing ? (
          <ActivityIndicator size="small" color={theme.colors.onPrimary} />
        ) : (
          <View style={styles.dockInner}>
            <Text style={styles.dockText}>PLACE ORDER</Text>
            <Text style={styles.dockTotal}>${total.toFixed(2)}</Text>
          </View>
        )}
      </TouchableOpacity>
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
  itemCount: {
    fontFamily: theme.fonts.mono,
    fontSize: 11,
    color: theme.colors.textMuted,
    letterSpacing: 0.4,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: 180,
    gap: theme.spacing.md,
  },

  ticketBlock: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
  },
  ticketLabel: {
    ...theme.typography.label,
    color: theme.colors.textMuted,
    paddingHorizontal: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xs,
  },
  receiptRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.md,
  },
  receiptName: {
    fontFamily: theme.fonts.mono,
    fontSize: 13,
    lineHeight: 18,
    color: theme.colors.text,
    flex: 1,
  },
  receiptCalc: {
    fontFamily: theme.fonts.mono,
    fontSize: 13,
    color: theme.colors.text,
    letterSpacing: 0.3,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    fontFamily: theme.fonts.mono,
    fontSize: 12,
    color: theme.colors.text,
    minWidth: 20,
    textAlign: 'center',
  },
  removeText: {
    ...theme.typography.label,
    color: theme.colors.textMuted,
  },
  hairline: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.divider,
  },

  section: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    padding: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  sectionLabel: {
    ...theme.typography.label,
    color: theme.colors.textMuted,
  },
  flatRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
  },
  flatRowText: { flex: 1, gap: 2 },
  pickupTitle: {
    fontFamily: theme.fonts.mono,
    fontSize: 13,
    color: theme.colors.text,
  },
  pickupAddr: {
    fontFamily: theme.fonts.mono,
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  readyText: {
    fontFamily: theme.fonts.mono,
    fontSize: 11,
    color: theme.colors.primary,
  },

  promoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  promoBadge: {
    fontFamily: theme.fonts.mono,
    fontSize: 11,
    color: theme.colors.primary,
  },
  promoInputRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  promoInput: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.text,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    fontFamily: theme.fonts.mono,
    outlineStyle: 'none' as any,
  },
  promoApplyBtn: {
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoApplyBtnDisabled: { opacity: 0.4 },
  promoApplyText: {
    ...theme.typography.label,
    color: theme.colors.primary,
  },
  promoActiveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
  },
  promoActiveCode: {
    fontFamily: theme.fonts.mono,
    fontSize: 13,
    color: theme.colors.primary,
    letterSpacing: 1,
  },
  promoError: {
    fontFamily: theme.fonts.mono,
    fontSize: 11,
    color: theme.colors.danger,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontFamily: theme.fonts.mono,
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  summaryValue: {
    fontFamily: theme.fonts.mono,
    fontSize: 12,
    color: theme.colors.text,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.xs,
  },
  totalLabel: {
    ...theme.typography.label,
    color: theme.colors.text,
  },
  totalValue: {
    fontFamily: theme.fonts.mono,
    fontSize: 22,
    color: theme.colors.primary,
  },
  summaryNote: {
    fontFamily: theme.fonts.mono,
    fontSize: 10,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },

  checkoutDock: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dockInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.lg,
  },
  dockText: {
    ...theme.typography.label,
    color: theme.colors.onPrimary,
    letterSpacing: 2,
  },
  dockTotal: {
    fontFamily: theme.fonts.mono,
    fontSize: 18,
    color: theme.colors.onPrimary,
  },

  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: 100,
  },
  emptyIcon: {
    width: 104,
    height: 104,
    backgroundColor: theme.colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
  },
  emptyTitle: {
    ...theme.typography.heading,
    color: theme.colors.primary,
  },
  emptyText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  browseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    marginTop: theme.spacing.xs,
  },
  browseBtnText: {
    fontFamily: theme.fonts.semibold,
    fontSize: 14,
    color: theme.colors.onPrimary,
  },
});

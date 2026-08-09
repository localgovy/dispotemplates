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
  GHOST10: 0.1,
  ATELIER15: 0.15,
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
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
      setPromoError('Invalid promo code. Try GHOST10, ATELIER15, or NEWUSER.');
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

  function toggleExpand(productId: string) {
    setExpandedId(expandedId === productId ? null : productId);
  }

  async function checkout() {
    if (placing) return;
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to place an order.');
      return;
    }
    setPlacing(true);
    try {
      const code = `GST-${Math.random().toString(36).toUpperCase().slice(2, 7)}`;

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
        `Confirmation: ${code}\n\n+${ptsEarned} Atelier Points earned${newBalance != null ? ` — balance: ${Number(newBalance).toLocaleString()} pts` : ''}.\n\nReady in ~15 min at ${store.address}, ${store.city}.\nBring valid 19+ ID.`,
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
          <Text style={styles.headerTitle}>Your Basket</Text>
          <AIButton />
        </View>
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Ionicons name="bag-handle-outline" size={48} color={theme.colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>Your basket is empty</Text>
          <Text style={styles.emptyText}>Browse the atelier to begin your selection.</Text>
          <TouchableOpacity
            style={styles.browseBtn}
            onPress={() => router.push('/(tabs)/search')}
            activeOpacity={0.85}
          >
            <Ionicons name="storefront-outline" size={16} color={theme.colors.onPrimary} />
            <Text style={styles.browseBtnText}>Browse the Atelier</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Your Basket</Text>
          <Text style={styles.itemCount}>{totalItems} {totalItems === 1 ? 'item' : 'items'}</Text>
        </View>
        <AIButton />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.vaporList}>
          {items.map(({ product, qty }, index) => {
            const isExpanded = expandedId === product.id;
            return (
              <View key={product.id}>
                <TouchableOpacity
                  style={styles.vaporRow}
                  onPress={() => toggleExpand(product.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.vaporName} numberOfLines={isExpanded ? 2 : 1}>
                    {product.name}
                  </Text>
                  <Text style={styles.vaporPrice}>${(product.price * qty).toFixed(2)}</Text>
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.expandPanel}>
                    <View style={styles.qtyRow}>
                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => setQty(product.id, qty - 1)}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="remove" size={16} color={theme.colors.text} />
                      </TouchableOpacity>
                      <Text style={styles.qtyText}>{qty}</Text>
                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => setQty(product.id, qty + 1)}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="add" size={16} color={theme.colors.text} />
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleRemove(product.id, product.name)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Text style={styles.removeText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {index < items.length - 1 && <View style={styles.softDivider} />}
              </View>
            );
          })}
        </View>

        <View style={styles.softSection}>
          <Text style={styles.softLabel}>Pickup Location</Text>
          <Text style={styles.softValue}>Ghost Atelier</Text>
          <Text style={styles.softMuted}>{store.address}, {store.city}</Text>
          <Text style={styles.softAccent}>Ready in: ~15 min</Text>
        </View>

        <View style={styles.softSection}>
          <View style={styles.promoHeader}>
            <Text style={styles.softLabel}>Promo Code</Text>
            {promoApplied !== '' && (
              <Text style={styles.promoBadge}>-{Math.round(promoDiscount * 100)}%</Text>
            )}
          </View>

          {promoApplied === '' ? (
            <View style={styles.promoInputRow}>
              <TextInput
                style={styles.promoInput}
                placeholder="Enter code (e.g. GHOST10)"
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
                <Text style={styles.promoApplyText}>Apply</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.promoActiveRow}>
              <Text style={styles.promoActiveCode}>{promoApplied}</Text>
              <TouchableOpacity onPress={removePromo} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close-circle" size={18} color={theme.colors.textMuted} />
              </TouchableOpacity>
            </View>
          )}

          {promoError !== '' && <Text style={styles.promoError}>{promoError}</Text>}
        </View>

        <View style={styles.softSection}>
          <Text style={styles.softLabel}>Order Summary</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal ({totalItems} items)</Text>
            <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
          </View>
          {promoDiscount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Promo ({promoApplied})</Text>
              <Text style={styles.summaryValue}>-${discountAmt.toFixed(2)}</Text>
            </View>
          )}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>HST (13%)</Text>
            <Text style={styles.summaryValue}>${tax.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Pickup</Text>
            <Text style={styles.summaryValue}>Included</Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
          </View>

          <TouchableOpacity
            style={[styles.placeBtn, placing && { opacity: 0.7 }]}
            onPress={checkout}
            activeOpacity={0.9}
            disabled={placing}
          >
            {placing ? (
              <ActivityIndicator size="small" color={theme.colors.onPrimary} />
            ) : (
              <Text style={styles.placeBtnText}>Place Order</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.summaryNote}>Valid 19+ government ID required at pickup</Text>
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
  itemCount: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
  scroll: { flex: 1 },
  scrollContent: {
    padding: theme.spacing.md,
    gap: theme.spacing.lg,
    paddingBottom: 120,
  },

  vaporList: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    paddingVertical: theme.spacing.xs,
  },
  vaporRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.md,
  },
  vaporName: {
    ...theme.typography.body,
    color: theme.colors.text,
    flex: 1,
  },
  vaporPrice: {
    ...theme.typography.bodyBold,
    color: theme.colors.text,
  },
  expandPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    ...theme.typography.bodyBold,
    color: theme.colors.text,
    minWidth: 20,
    textAlign: 'center',
  },
  removeText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
  softDivider: {
    height: 1,
    backgroundColor: theme.colors.divider,
    marginHorizontal: theme.spacing.md,
  },

  softSection: {
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
  },
  softLabel: {
    ...theme.typography.label,
    color: theme.colors.textMuted,
  },
  softValue: {
    ...theme.typography.subheading,
    color: theme.colors.text,
  },
  softMuted: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
  softAccent: {
    ...theme.typography.caption,
    color: theme.colors.primary,
  },

  promoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  promoBadge: {
    ...theme.typography.caption,
    color: theme.colors.primary,
  },
  promoInputRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  promoInput: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    ...theme.typography.body,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
    fontFamily: theme.fonts.body,
    outlineStyle: 'none' as any,
  },
  promoApplyBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoApplyBtnDisabled: { opacity: 0.4 },
  promoApplyText: {
    ...theme.typography.caption,
    color: theme.colors.onPrimary,
    fontFamily: theme.fonts.semibold,
  },
  promoActiveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  promoActiveCode: {
    ...theme.typography.bodyBold,
    color: theme.colors.text,
    flex: 1,
    letterSpacing: 1,
  },
  promoError: {
    ...theme.typography.small,
    color: theme.colors.danger,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
  },
  summaryValue: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
  },
  totalLabel: {
    ...theme.typography.subheading,
    color: theme.colors.text,
  },
  totalValue: {
    ...theme.typography.title,
    color: theme.colors.primary,
  },
  placeBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.full,
    paddingVertical: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  placeBtnText: {
    ...theme.typography.bodyBold,
    color: theme.colors.onPrimary,
  },
  summaryNote: {
    ...theme.typography.small,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
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
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
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
    borderRadius: theme.radius.full,
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

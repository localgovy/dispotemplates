import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
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
import { CATEGORY_IMAGE_MAP } from '../../../data/products';

const PTS_PER_DOLLAR = 1;
const REDEEM_THRESHOLD = 500;

const VALID_PROMOS: Record<string, number> = {
  NOIR10: 0.1,
  ROSE15: 0.15,
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
  const ptsToEarn = Math.floor(subtotal);
  const ptsTowardReward = Math.max(0, REDEEM_THRESHOLD - ptsToEarn);

  function applyPromo() {
    const code = promoInput.trim().toUpperCase();
    if (VALID_PROMOS[code]) {
      setPromoDiscount(VALID_PROMOS[code]);
      setPromoApplied(code);
      setPromoError('');
      setPromoInput('');
    } else {
      setPromoError('Invalid promo code. Try NOIR10, ROSE15, or NEWUSER.');
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
      const code = `RSE-${Math.random().toString(36).toUpperCase().slice(2, 7)}`;

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
        `Confirmation: ${code}\n\n+${ptsEarned} Noir Points earned${newBalance != null ? ` — balance: ${Number(newBalance).toLocaleString()} pts` : ''}.\n\nReady in ~15 min at ${store.address}, ${store.city}.\nBring valid 19+ ID.`,
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
          <Text style={styles.headerTitle}>Concierge Basket</Text>
          <AIButton />
        </View>
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Ionicons name="bag-handle-outline" size={48} color={theme.colors.accentDark} />
          </View>
          <Text style={styles.emptyTitle}>Your basket is empty</Text>
          <Text style={styles.emptyText}>Curate your collection from the lounge.</Text>
          <TouchableOpacity
            style={styles.browseBtn}
            onPress={() => router.push('/(tabs)/search')}
            activeOpacity={0.85}
          >
            <Ionicons name="storefront-outline" size={16} color={theme.colors.onPrimary} />
            <Text style={styles.browseBtnText}>Browse the Collection</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Concierge Basket</Text>
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
        <View style={styles.itemsSection}>
          {items.map(({ product, qty }) => (
            <View key={product.id} style={styles.cartItem}>
              <Image source={CATEGORY_IMAGE_MAP[product.category]} style={styles.itemImage} />
              <View style={styles.itemDetails}>
                <View style={styles.itemTopRow}>
                  <Text style={styles.itemName} numberOfLines={2}>{product.name}</Text>
                  <TouchableOpacity
                    onPress={() => handleRemove(product.id, product.name)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="trash-outline" size={17} color={theme.colors.textMuted} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.itemMeta}>{product.brand} · {product.weight}</Text>
                <View style={styles.itemBottomRow}>
                  <View style={styles.qtyRow}>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => setQty(product.id, qty - 1)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="remove" size={15} color={theme.colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{qty}</Text>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => setQty(product.id, qty + 1)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="add" size={15} color={theme.colors.text} />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.itemPrice}>${(product.price * qty).toFixed(2)}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.blockHeading}>Pickup Location</Text>
        <View style={styles.pickupCard}>
          <View style={styles.pickupIconWrap}>
            <Ionicons name="storefront-outline" size={22} color={theme.colors.accentDark} />
          </View>
          <View style={styles.pickupInfo}>
            <Text style={styles.pickupTitle}>Rose Noir</Text>
            <Text style={styles.pickupAddr}>{store.address}, {store.city}</Text>
            <Text style={styles.readyText}>Ready in: ~15 min</Text>
          </View>
        </View>

        <View style={styles.promoCard}>
          <View style={styles.promoHeader}>
            <Ionicons name="pricetag-outline" size={15} color={theme.colors.accentDark} />
            <Text style={styles.promoLabel}>Promo Code</Text>
            {promoApplied !== '' && (
              <View style={styles.promoAppliedBadge}>
                <Text style={styles.promoAppliedText}>-{Math.round(promoDiscount * 100)}%</Text>
              </View>
            )}
          </View>

          {promoApplied === '' ? (
            <View style={styles.promoInputRow}>
              <TextInput
                style={styles.promoInput}
                placeholder="Enter code (e.g. NOIR10)"
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
              <TouchableOpacity onPress={removePromo} style={styles.promoRemoveBtn}>
                <Ionicons name="close-circle" size={18} color={theme.colors.textMuted} />
              </TouchableOpacity>
            </View>
          )}

          {promoError !== '' && <Text style={styles.promoError}>{promoError}</Text>}
        </View>

        <View style={styles.checkoutSection}>
          <Text style={styles.summaryTitle}>Order Summary</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal ({totalItems} items)</Text>
            <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
          </View>
          {promoDiscount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: theme.colors.gold }]}>Promo ({promoApplied})</Text>
              <Text style={[styles.summaryValue, { color: theme.colors.gold }]}>-${discountAmt.toFixed(2)}</Text>
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

          <View style={styles.loyaltyNudge}>
            <Ionicons name="sparkles-outline" size={14} color={theme.colors.gold} />
            <Text style={styles.loyaltyText}>
              Earn {ptsToEarn} pts · {ptsTowardReward} pts toward next reward
            </Text>
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
              <>
                <Text style={styles.placeBtnText}>Place Order</Text>
                <Ionicons name="arrow-forward" size={17} color={theme.colors.onPrimary} />
              </>
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
    borderBottomColor: theme.colors.border,
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
    gap: theme.spacing.md,
    paddingBottom: 120,
  },

  itemsSection: { gap: theme.spacing.md },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    gap: theme.spacing.md,
    ...theme.shadows.small,
  },
  itemImage: {
    width: 110,
    height: 110,
    borderRadius: theme.radius.sm,
  },
  itemDetails: {
    flex: 1,
    gap: 4,
  },
  itemTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  itemName: {
    fontFamily: theme.fonts.serif,
    fontSize: 17,
    lineHeight: 22,
    color: theme.colors.text,
    flex: 1,
  },
  itemMeta: {
    ...theme.typography.small,
    color: theme.colors.textMuted,
  },
  itemBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.xs,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.full,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  qtyBtn: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    ...theme.typography.bodyBold,
    color: theme.colors.text,
    minWidth: 20,
    textAlign: 'center',
  },
  itemPrice: {
    fontFamily: theme.fonts.serifBold,
    fontSize: 20,
    color: theme.colors.text,
  },

  blockHeading: {
    ...theme.typography.heading,
    color: theme.colors.primary,
    marginBottom: -4,
  },

  pickupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  pickupIconWrap: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickupInfo: { flex: 1, gap: 2 },
  pickupTitle: {
    fontFamily: theme.fonts.serif,
    fontSize: 15,
    color: theme.colors.text,
  },
  pickupAddr: {
    ...theme.typography.small,
    color: theme.colors.textMuted,
  },
  readyText: {
    ...theme.typography.small,
    color: theme.colors.accentDark,
    fontFamily: theme.fonts.semibold,
  },

  promoCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.sm,
  },
  promoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  promoLabel: {
    ...theme.typography.bodyBold,
    color: theme.colors.text,
    flex: 1,
  },
  promoAppliedBadge: {
    backgroundColor: theme.colors.accentMuted,
    borderRadius: theme.radius.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  promoAppliedText: {
    ...theme.typography.small,
    color: theme.colors.accentDark,
    fontFamily: theme.fonts.bold,
  },
  promoInputRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  promoInput: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    ...theme.typography.body,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  promoApplyBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.sm,
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
    backgroundColor: theme.colors.accentMuted,
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  promoActiveCode: {
    ...theme.typography.bodyBold,
    color: theme.colors.accentDark,
    flex: 1,
    letterSpacing: 1,
  },
  promoRemoveBtn: { padding: 2 },
  promoError: {
    ...theme.typography.small,
    color: theme.colors.danger,
  },

  checkoutSection: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.medium,
  },
  summaryTitle: {
    fontFamily: theme.fonts.serif,
    fontSize: 22,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
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
    fontFamily: theme.fonts.serif,
    fontSize: 18,
    color: theme.colors.text,
  },
  totalValue: {
    fontFamily: theme.fonts.serifBold,
    fontSize: 32,
    color: theme.colors.gold,
  },
  loyaltyNudge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    marginTop: theme.spacing.xs,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
  },
  loyaltyText: {
    fontFamily: theme.fonts.serif,
    fontSize: 14,
    color: theme.colors.gold,
    fontStyle: 'italic',
  },
  placeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.full,
    paddingVertical: theme.spacing.md,
    marginTop: theme.spacing.xs,
  },
  placeBtnText: {
    fontFamily: theme.fonts.serif,
    fontSize: 16,
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
    borderRadius: 52,
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

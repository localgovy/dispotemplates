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

const VALID_PROMOS: Record<string, number> = {
  NEBULA10: 0.1,
  CLINIC15: 0.15,
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
      setPromoError('Invalid promo code. Try NEBULA10, CLINIC15, or NEWUSER.');
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
    Alert.alert('Remove Item', `Remove "${name}" from your cart?`, [
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
      const code = `NBC-${Math.random().toString(36).toUpperCase().slice(2, 7)}`;

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
        `Confirmation: ${code}\n\n+${ptsEarned} Wellness Credits earned${newBalance != null ? ` — balance: ${Number(newBalance).toLocaleString()} pts` : ''}.\n\nReady in ~15 min at ${store.address}, ${store.city}.\nBring valid 19+ ID.`,
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
            <Ionicons name="clipboard-outline" size={48} color={theme.colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptyText}>Add products to build your order.</Text>
          <TouchableOpacity
            style={styles.browseBtn}
            onPress={() => router.push('/(tabs)/search')}
            activeOpacity={0.85}
          >
            <Ionicons name="storefront-outline" size={16} color={theme.colors.onPrimary} />
            <Text style={styles.browseBtnText}>Browse the Shop</Text>
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
            {totalItems} {totalItems === 1 ? 'product' : 'products'}
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
        <Text style={styles.sectionLabel}>CART ITEMS</Text>
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
                    <Ionicons name="close-outline" size={18} color={theme.colors.textMuted} />
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
                  <Text style={styles.itemPrice}>${(product.price * qty).toFixed(2)}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.sectionLabel}>PICKUP SITE</Text>
        <View style={styles.pickupCard}>
          <Ionicons name="medical-outline" size={20} color={theme.colors.primary} />
          <View style={styles.pickupInfo}>
            <Text style={styles.pickupTitle}>Nebula Clinic</Text>
            <Text style={styles.pickupAddr}>{store.address}, {store.city}</Text>
            <Text style={styles.readyText}>Ready in ~15 min · 19+ ID required</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>PROMO CODE</Text>
        <View style={styles.promoCard}>
          {promoApplied === '' ? (
            <View style={styles.promoInputRow}>
              <TextInput
                style={styles.promoInput}
                placeholder="Enter code (e.g. NEBULA10)"
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
              <Text style={styles.promoActiveDiscount}>-{Math.round(promoDiscount * 100)}%</Text>
              <TouchableOpacity onPress={removePromo} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close-circle" size={18} color={theme.colors.textMuted} />
              </TouchableOpacity>
            </View>
          )}
          {promoError !== '' && <Text style={styles.promoError}>{promoError}</Text>}
        </View>

        <Text style={styles.sectionLabel}>ORDER TOTALS</Text>
        <View style={styles.totalsTable}>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Subtotal</Text>
            <Text style={styles.tableValue}>${subtotal.toFixed(2)}</Text>
          </View>
          {promoDiscount > 0 && (
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Promo ({promoApplied})</Text>
              <Text style={[styles.tableValue, { color: theme.colors.success }]}>
                -${discountAmt.toFixed(2)}
              </Text>
            </View>
          )}
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>HST (13%)</Text>
            <Text style={styles.tableValue}>${tax.toFixed(2)}</Text>
          </View>
          <View style={[styles.tableRow, styles.tableRowTotal]}>
            <Text style={styles.tableLabelTotal}>Total</Text>
            <Text style={styles.tableValueTotal}>${total.toFixed(2)}</Text>
          </View>
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
              <Ionicons name="checkmark-circle-outline" size={18} color={theme.colors.onPrimary} />
              <Text style={styles.placeBtnText}>Place order</Text>
            </>
          )}
        </TouchableOpacity>
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
  itemCount: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  scroll: { flex: 1 },
  scrollContent: {
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    paddingBottom: 130,
  },
  sectionLabel: {
    ...theme.typography.label,
    color: theme.colors.accentDark,
    letterSpacing: 1.2,
    marginTop: theme.spacing.xs,
  },
  itemsSection: { gap: theme.spacing.sm },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  itemImage: {
    width: 72,
    height: 72,
    borderRadius: theme.radius.sm,
  },
  itemDetails: {
    flex: 1,
    gap: 3,
  },
  itemTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  itemName: {
    ...theme.typography.bodyBold,
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
    marginTop: 4,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 4,
    paddingVertical: 2,
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
    ...theme.typography.subheading,
    color: theme.colors.text,
    fontFamily: theme.fonts.semibold,
  },
  pickupCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    padding: theme.spacing.md,
  },
  pickupInfo: { flex: 1, gap: 2 },
  pickupTitle: {
    ...theme.typography.bodyBold,
    color: theme.colors.text,
  },
  pickupAddr: {
    ...theme.typography.small,
    color: theme.colors.textMuted,
  },
  readyText: {
    ...theme.typography.small,
    color: theme.colors.primary,
    fontFamily: theme.fonts.semibold,
  },
  promoCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
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
    fontFamily: theme.fonts.body,
    outlineStyle: 'none' as any,
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
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.primaryMuted,
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  promoActiveCode: {
    ...theme.typography.bodyBold,
    color: theme.colors.primary,
    flex: 1,
    letterSpacing: 1,
  },
  promoActiveDiscount: {
    ...theme.typography.caption,
    color: theme.colors.success,
    fontFamily: theme.fonts.semibold,
  },
  promoError: {
    ...theme.typography.small,
    color: theme.colors.danger,
  },
  totalsTable: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surface,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tableRowTotal: {
    borderBottomWidth: 0,
    backgroundColor: theme.colors.surfaceElevated,
  },
  tableLabel: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
  tableValue: {
    ...theme.typography.caption,
    color: theme.colors.text,
    fontFamily: theme.fonts.semibold,
  },
  tableLabelTotal: {
    ...theme.typography.bodyBold,
    color: theme.colors.text,
  },
  tableValueTotal: {
    ...theme.typography.subheading,
    color: theme.colors.primary,
    fontFamily: theme.fonts.bold,
  },
  placeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.sm,
    paddingVertical: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  placeBtnText: {
    ...theme.typography.bodyBold,
    color: theme.colors.onPrimary,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: 80,
  },
  emptyIcon: {
    width: 104,
    height: 104,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
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
    borderRadius: theme.radius.sm,
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

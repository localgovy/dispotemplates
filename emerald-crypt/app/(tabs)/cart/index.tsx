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
  CRYPT10: 0.1,
  VAULT15: 0.15,
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
      setPromoError('Invalid promo code. Try CRYPT10, VAULT15, or NEWUSER.');
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
      const code = `EMR-${Math.random().toString(36).toUpperCase().slice(2, 7)}`;

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
        `Confirmation: ${code}\n\n+${ptsEarned} Crypt Tokens earned${newBalance != null ? ` — balance: ${Number(newBalance).toLocaleString()} pts` : ''}.\n\nReady in ~15 min at ${store.address}, ${store.city}.\nBring valid 19+ ID.`,
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
          <Text style={styles.emptyText}>Add strains from the vault to get started.</Text>
          <TouchableOpacity
            style={styles.browseBtn}
            onPress={() => router.push('/(tabs)/search')}
            activeOpacity={0.85}
          >
            <Ionicons name="storefront-outline" size={16} color={theme.colors.onPrimary} />
            <Text style={styles.browseBtnText}>Browse the Vault</Text>
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
            {totalItems} {totalItems === 1 ? 'item' : 'items'} · Ready for pickup
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
        <View style={styles.manifestBlock}>
          <Text style={styles.manifestLabel}>Items</Text>
          {items.map(({ product, qty }, index) => (
            <View key={product.id} style={styles.manifestRow}>
              <View style={styles.manifestIndex}>
                <Text style={styles.indexText}>
                  #{String(index + 1).padStart(2, '0')}
                </Text>
              </View>
              <View style={styles.manifestDetails}>
                <View style={styles.manifestTop}>
                  <Text style={styles.manifestName} numberOfLines={2}>{product.name}</Text>
                  <Text style={styles.manifestPrice}>${(product.price * qty).toFixed(2)}</Text>
                </View>
                <Text style={styles.batchCode}>{product.brand}</Text>
                <View style={styles.manifestControls}>
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
              </View>
            </View>
          ))}
        </View>

        <View style={styles.vaultSection}>
          <Text style={styles.sectionLabel}>PICKUP NODE</Text>
          <Text style={styles.vaultTitle}>Emerald Crypt</Text>
          <Text style={styles.vaultAddr}>{store.address}, {store.city}</Text>
          <Text style={styles.vaultReady}>Ready in: ~15 min</Text>
        </View>

        <View style={styles.vaultSection}>
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
                placeholder="Enter code (e.g. CRYPT10)"
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

        <View style={styles.vaultSection}>
          <Text style={styles.sectionLabel}>TRANSACTION SUMMARY</Text>

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

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOTAL</Text>
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
              <>
                <Text style={styles.placeBtnText}>AUTHORIZE WITHDRAWAL</Text>
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
    ...theme.typography.label,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  scroll: { flex: 1 },
  scrollContent: {
    padding: theme.spacing.md,
    gap: theme.spacing.md,
    paddingBottom: 120,
  },

  manifestBlock: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    overflow: 'hidden',
  },
  manifestLabel: {
    ...theme.typography.label,
    color: theme.colors.primary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  manifestRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
    padding: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  manifestIndex: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 2,
  },
  indexText: {
    fontFamily: theme.fonts.mono,
    fontSize: 12,
    color: theme.colors.primary,
    letterSpacing: 0.5,
  },
  manifestDetails: {
    flex: 1,
    gap: 4,
  },
  manifestTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  manifestName: {
    ...theme.typography.bodyBold,
    color: theme.colors.text,
    flex: 1,
  },
  manifestPrice: {
    fontFamily: theme.fonts.mono,
    fontSize: 14,
    color: theme.colors.text,
  },
  batchCode: {
    ...theme.typography.small,
    color: theme.colors.textMuted,
  },
  manifestControls: {
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
    borderRadius: theme.radius.xs,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  qtyBtn: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    fontFamily: theme.fonts.mono,
    fontSize: 12,
    color: theme.colors.text,
    minWidth: 18,
    textAlign: 'center',
  },
  removeText: {
    ...theme.typography.label,
    color: theme.colors.danger,
  },

  vaultSection: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
  },
  sectionLabel: {
    ...theme.typography.label,
    color: theme.colors.primary,
  },
  vaultTitle: {
    ...theme.typography.subheading,
    color: theme.colors.text,
  },
  vaultAddr: {
    ...theme.typography.small,
    color: theme.colors.textMuted,
  },
  vaultReady: {
    ...theme.typography.small,
    color: theme.colors.accent,
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
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.xs,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background,
      outlineStyle: 'none' as any,
    fontFamily: theme.fonts.mono,
    outlineStyle: 'none' as any,
  },
  promoApplyBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.xs,
    paddingHorizontal: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoApplyBtnDisabled: { opacity: 0.4 },
  promoApplyText: {
    ...theme.typography.label,
    color: theme.colors.onPrimary,
  },
  promoActiveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: theme.radius.xs,
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
    fontFamily: theme.fonts.mono,
    fontSize: 13,
    color: theme.colors.text,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
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
  placeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.xs,
    paddingVertical: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  placeBtnText: {
    ...theme.typography.label,
    color: theme.colors.onPrimary,
    letterSpacing: 1,
  },
  summaryNote: {
    ...theme.typography.small,
    color: theme.colors.textMuted,
    textAlign: 'center',
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
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
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
    borderRadius: theme.radius.xs,
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

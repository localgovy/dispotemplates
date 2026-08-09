import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Animated,
  Dimensions,
  PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../theme';
import type { Product } from '../data/products';
import { CATEGORY_IMAGE_MAP } from '../data/products';
import { useCart } from '../context/CartContext';
import { useFavourites } from '../context/FavouritesContext';

const { height: SCREEN_H } = Dimensions.get('window');
const SHEET_H = SCREEN_H * 0.82;

const STRAIN_COLORS: Record<string, string> = {
  Indica: theme.colors.indica,
  Sativa: theme.colors.sativa,
  Hybrid: theme.colors.hybrid,
  CBD: theme.colors.cbd,
  Accessory: theme.colors.textMuted,
  Apparel: theme.colors.textMuted,
};

const STRAIN_DESCRIPTIONS: Record<string, string> = {
  Indica: 'Relaxing · Body · Evening',
  Sativa: 'Uplifting · Mind · Daytime',
  Hybrid: 'Balanced · Mind & Body',
  CBD: 'Wellness · Non-intoxicating',
  Accessory: 'Tools · Prep · Session gear',
  Apparel: 'Merch · Everyday wear',
};

interface Props {
  product: Product | null;
  visible: boolean;
  onClose: () => void;
}

export default function ProductDetailModal({ product, visible, onClose }: Props) {
  const { addToCart, getQty, setQty } = useCart();
  const { toggle, isFavourite } = useFavourites();
  const translateY = useRef(new Animated.Value(SHEET_H)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: SHEET_H,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => g.dy > 8,
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) translateY.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 120 || g.vy > 0.5) {
          onClose();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 65,
            friction: 11,
          }).start();
        }
      },
    })
  ).current;

  if (!product) return null;

  const strainColor = STRAIN_COLORS[product.strain] ?? theme.colors.textMuted;
  const isOnSale = product.originalPrice !== undefined;
  const qty = getQty(product.id);
  const fav = isFavourite(product.id);
  const discount = isOnSale
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />
      </Animated.View>

      {/* Sheet */}
      <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
        {/* Drag handle */}
        <View {...panResponder.panHandlers} style={styles.dragArea}>
          <View style={styles.handle} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          bounces={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Product Image */}
          <View style={styles.imageWrap}>
            <Image source={CATEGORY_IMAGE_MAP[product.category]} style={styles.image} resizeMode="cover" />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.6)']}
              style={styles.imageGradient}
            />
            {product.isNew && (
              <View style={[styles.imgBadge, { backgroundColor: theme.colors.newBadge }]}>
                <Text style={styles.imgBadgeText}>NEW</Text>
              </View>
            )}
            {isOnSale && (
              <View style={[styles.imgBadge, styles.saleBadgePos, { backgroundColor: theme.colors.saleBadge }]}>
                <Text style={styles.imgBadgeText}>-{discount}%</Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.favBtn}
              onPress={() => toggle(product.id)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={fav ? 'heart' : 'heart-outline'}
                size={22}
                color={fav ? theme.colors.danger : theme.colors.white}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
              <Ionicons name="close" size={20} color={theme.colors.white} />
            </TouchableOpacity>
          </View>

          {/* Info */}
          <View style={styles.info}>
            <Text style={styles.brand}>{product.brand}</Text>
            <Text style={styles.name}>{product.name}</Text>

            {/* Strain + weight row */}
            <View style={styles.metaRow}>
              <View style={[styles.strainBadge, { backgroundColor: strainColor + '25', borderColor: strainColor + '60' }]}>
                <View style={[styles.strainDot, { backgroundColor: strainColor }]} />
                <Text style={[styles.strainText, { color: strainColor }]}>{product.strain}</Text>
              </View>
              <View style={styles.weightBadge}>
                <Ionicons name="scale-outline" size={12} color={theme.colors.textMuted} />
                <Text style={styles.weightText}>{product.weight}</Text>
              </View>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{product.category}</Text>
              </View>
            </View>

            {/* Strain description */}
            {product.strain !== 'Accessory' && product.strain !== 'Apparel' && (
              <Text style={styles.strainDesc}>{STRAIN_DESCRIPTIONS[product.strain]}</Text>
            )}

            {/* THC / CBD stats */}
            {(product.thc !== null || product.cbd !== null) && (
              <View style={styles.statsRow}>
                {product.thc !== null && (
                  <View style={styles.statCard}>
                    <Text style={styles.statLabel}>THC</Text>
                    <Text style={[styles.statValue, { color: theme.colors.highThc }]}>
                      {product.thc}%
                    </Text>
                  </View>
                )}
                {product.cbd !== null && (
                  <View style={styles.statCard}>
                    <Text style={styles.statLabel}>CBD</Text>
                    <Text style={[styles.statValue, { color: theme.colors.cbd }]}>
                      {product.cbd}%
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Description */}
            <Text style={styles.description}>{product.description}</Text>

            {/* Tags */}
            <View style={styles.tagsRow}>
              {product.tags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Bottom CTA */}
        <View style={styles.cta}>
          <View style={styles.priceBlock}>
            {isOnSale && (
              <Text style={styles.originalPrice}>${product.originalPrice!.toFixed(2)}</Text>
            )}
            <Text style={[styles.price, isOnSale && styles.salePrice]}>
              ${product.price.toFixed(2)}
            </Text>
          </View>

          {qty === 0 ? (
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => addToCart(product)}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[theme.colors.primaryDark, theme.colors.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.addBtnGradient}
              >
                <Ionicons name="cart-outline" size={18} color={theme.colors.white} />
                <Text style={styles.addBtnText}>Add to Cart</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <View style={styles.qtyControl}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQty(product.id, qty - 1)}
                activeOpacity={0.8}
              >
                <Ionicons name="remove" size={20} color={theme.colors.text} />
              </TouchableOpacity>
              <Text style={styles.qtyText}>{qty}</Text>
              <TouchableOpacity
                style={[styles.qtyBtn, styles.qtyBtnAdd]}
                onPress={() => addToCart(product)}
                activeOpacity={0.8}
              >
                <Ionicons name="add" size={20} color={theme.colors.white} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_H,
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    overflow: 'hidden',
    ...theme.shadows.large,
  },
  dragArea: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 4,
    backgroundColor: theme.colors.background,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.surfaceLight,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  imageWrap: {
    height: 260,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: '50%' as unknown as number,
  },
  imgBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
  },
  saleBadgePos: {
    left: 60,
  },
  imgBadgeText: {
    ...theme.typography.label,
    color: theme.colors.white,
    fontSize: 10,
  },
  favBtn: {
    position: 'absolute',
    top: 12,
    right: 52,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  brand: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
  name: {
    ...theme.typography.title,
    color: theme.colors.text,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  strainBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
    borderWidth: 1,
  },
  strainDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  strainText: {
    ...theme.typography.caption,
    fontWeight: '700',
  },
  weightBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  weightText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  categoryBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primaryMuted,
    borderWidth: 1,
    borderColor: theme.colors.primary + '50',
  },
  categoryText: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  strainDesc: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
    marginTop: -4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    ...theme.asymmetricSm,
    padding: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statLabel: {
    ...theme.typography.label,
    color: theme.colors.textMuted,
    marginBottom: 4,
  },
  statValue: {
    fontFamily: theme.fonts.serifBold,
    fontSize: 26,
    lineHeight: 30,
  },
  description: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    lineHeight: 24,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  tag: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 3,
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tagText: {
    ...theme.typography.small,
    color: theme.colors.textMuted,
  },
  cta: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    paddingBottom: 28,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  priceBlock: {
    gap: 1,
  },
  originalPrice: {
    ...theme.typography.small,
    color: theme.colors.textMuted,
    textDecorationLine: 'line-through',
  },
  price: {
    ...theme.typography.heading,
    color: theme.colors.text,
    fontWeight: '800',
  },
  salePrice: {
    color: theme.colors.saleRed,
  },
  addBtn: {
    flex: 1,
    borderRadius: theme.radius.md,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  addBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md - 2,
  },
  addBtnText: {
    ...theme.typography.subheading,
    color: theme.colors.white,
    fontWeight: '700',
  },
  qtyControl: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    padding: 4,
  },
  qtyBtn: {
    width: 42,
    height: 42,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnAdd: {
    backgroundColor: theme.colors.primary,
  },
  qtyText: {
    ...theme.typography.heading,
    color: theme.colors.text,
    fontWeight: '700',
    minWidth: 40,
    textAlign: 'center',
  },
});

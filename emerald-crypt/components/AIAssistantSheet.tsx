import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAIAssistant } from '../context/AIAssistantContext';
import { QUIZ_QUESTIONS, scoreProducts, type QuizAnswers } from '../data/aiQuiz';
import { getRecommendationBlurb } from '../lib/groq';
import AIPickCard from './AIPickCard';
import { useCart } from '../context/CartContext';
import { useFavourites } from '../context/FavouritesContext';
import theme from '../theme';
import type { Product } from '../data/products';
import { CATEGORY_IMAGE_MAP } from '../data/products';

type Step = 'quiz' | 'loading' | 'results' | 'detail';

const TOTAL_QUESTIONS = QUIZ_QUESTIONS.length;

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

export default function AIAssistantSheet() {
  const { visible, close } = useAIAssistant();

  const [quizStep, setQuizStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<QuizAnswers>>({});
  const [uiStep, setUiStep] = useState<Step>('quiz');
  const [candidates, setCandidates] = useState<Product[]>([]);
  const [blurb, setBlurb] = useState<string | null>(null);
  const [detailIndex, setDetailIndex] = useState(0);

  const { addToCart, getQty, setQty } = useCart();
  const { toggle, isFavourite } = useFavourites();

  const currentQ = QUIZ_QUESTIONS[quizStep];
  const detailProduct = candidates[detailIndex] ?? null;

  function reset() {
    setQuizStep(0);
    setAnswers({});
    setUiStep('quiz');
    setCandidates([]);
    setBlurb(null);
    setDetailIndex(0);
  }

  function handleClose() {
    close();
    setTimeout(reset, 400);
  }

  async function handleOption(optionId: string) {
    const newAnswers = { ...answers, [currentQ.id]: optionId } as QuizAnswers;
    setAnswers(newAnswers);

    if (quizStep < TOTAL_QUESTIONS - 1) {
      setQuizStep(quizStep + 1);
      return;
    }

    setUiStep('loading');
    const scored = scoreProducts(newAnswers);
    setCandidates(scored);

    const text = await getRecommendationBlurb(newAnswers, scored);
    setBlurb(text);
    setUiStep('results');
  }

  function openDetail(index: number) {
    setDetailIndex(index);
    setUiStep('detail');
  }

  function headerTitle() {
    if (uiStep === 'results') return 'Your Picks';
    if (uiStep === 'detail') return detailProduct?.name ?? 'Product Detail';
    return 'Find Your Product';
  }

  function headerLeft() {
    if (uiStep === 'detail') {
      return (
        <TouchableOpacity
          style={styles.backIconBtn}
          onPress={() => setUiStep('results')}
          activeOpacity={0.8}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={18} color={theme.colors.onPrimary} />
        </TouchableOpacity>
      );
    }
    return (
      <View style={styles.aiBadge}>
        <Ionicons name="sparkles" size={14} color={theme.colors.gold} />
      </View>
    );
  }

  // ── Detail view ────────────────────────────────────────────────────────────
  function renderDetail() {
    if (!detailProduct) return null;

    const strainColor = STRAIN_COLORS[detailProduct.strain] ?? theme.colors.textMuted;
    const isOnSale = detailProduct.originalPrice !== undefined;
    const discount = isOnSale
      ? Math.round(((detailProduct.originalPrice! - detailProduct.price) / detailProduct.originalPrice!) * 100)
      : 0;
    const qty = getQty(detailProduct.id);
    const fav = isFavourite(detailProduct.id);

    return (
      <>
        <ScrollView
          showsVerticalScrollIndicator={false}
          bounces={false}
          contentContainerStyle={styles.detailScroll}
        >
          {/* Product image */}
          <View style={styles.detailImageWrap}>
            <Image
              source={CATEGORY_IMAGE_MAP[detailProduct.category]}
              style={styles.detailImage}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.55)']}
              style={styles.detailGradient}
            />
            {/* Badges */}
            {detailProduct.isNew && (
              <View style={[styles.imgBadge, { backgroundColor: theme.colors.newBadge }]}>
                <Text style={styles.imgBadgeText}>NEW</Text>
              </View>
            )}
            {isOnSale && (
              <View style={[styles.imgBadge, styles.saleBadgePos, { backgroundColor: theme.colors.saleBadge }]}>
                <Text style={styles.imgBadgeText}>-{discount}%</Text>
              </View>
            )}
            {/* Fav button */}
            <TouchableOpacity
              style={styles.favBtn}
              onPress={() => toggle(detailProduct.id)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={fav ? 'heart' : 'heart-outline'}
                size={20}
                color={fav ? theme.colors.danger : theme.colors.white}
              />
            </TouchableOpacity>

            {/* Prev / Next nav */}
            {candidates.length > 1 && (
              <View style={styles.navArrows}>
                <TouchableOpacity
                  style={[styles.navArrow, detailIndex === 0 && styles.navArrowDisabled]}
                  onPress={() => detailIndex > 0 && setDetailIndex(detailIndex - 1)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="chevron-back" size={18} color={theme.colors.white} />
                </TouchableOpacity>
                <Text style={styles.navLabel}>
                  {detailIndex + 1} / {candidates.length}
                </Text>
                <TouchableOpacity
                  style={[styles.navArrow, detailIndex === candidates.length - 1 && styles.navArrowDisabled]}
                  onPress={() => detailIndex < candidates.length - 1 && setDetailIndex(detailIndex + 1)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="chevron-forward" size={18} color={theme.colors.white} />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Info section */}
          <View style={styles.detailInfo}>
            <Text style={styles.detailBrand}>{detailProduct.brand}</Text>
            <Text style={styles.detailName}>{detailProduct.name}</Text>

            {/* Meta row */}
            <View style={styles.metaRow}>
              <View style={[styles.strainBadge, { backgroundColor: strainColor + '25', borderColor: strainColor + '60' }]}>
                <View style={[styles.strainDot, { backgroundColor: strainColor }]} />
                <Text style={[styles.strainText, { color: strainColor }]}>{detailProduct.strain}</Text>
              </View>
              <View style={styles.weightBadge}>
                <Ionicons name="scale-outline" size={12} color={theme.colors.textMuted} />
                <Text style={styles.weightText}>{detailProduct.weight}</Text>
              </View>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{detailProduct.category}</Text>
              </View>
            </View>

            {/* Strain description */}
            {detailProduct.strain !== 'Accessory' && detailProduct.strain !== 'Apparel' && (
              <Text style={styles.strainDesc}>{STRAIN_DESCRIPTIONS[detailProduct.strain]}</Text>
            )}

            {/* THC / CBD stat cards */}
            {(detailProduct.thc !== null || detailProduct.cbd !== null) && (
              <View style={styles.statsRow}>
                {detailProduct.thc !== null && (
                  <View style={styles.statCard}>
                    <Text style={styles.statLabel}>THC</Text>
                    <Text style={[styles.statValue, { color: theme.colors.highThc }]}>
                      {detailProduct.thc}%
                    </Text>
                  </View>
                )}
                {detailProduct.cbd !== null && (
                  <View style={styles.statCard}>
                    <Text style={styles.statLabel}>CBD</Text>
                    <Text style={[styles.statValue, { color: theme.colors.cbd }]}>
                      {detailProduct.cbd}%
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Description */}
            <Text style={styles.detailDescription}>{detailProduct.description}</Text>

            {/* Tags */}
            <View style={styles.tagsRow}>
              {detailProduct.tags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>

            {/* Back to results link */}
            <TouchableOpacity
              style={styles.backToResults}
              onPress={() => setUiStep('results')}
              activeOpacity={0.8}
            >
              <Ionicons name="grid-outline" size={14} color={theme.colors.primary} />
              <Text style={styles.backToResultsText}>Back to all picks</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Bottom CTA */}
        <View style={styles.detailCta}>
          <View style={styles.priceBlock}>
            {isOnSale && (
              <Text style={styles.originalPrice}>${detailProduct.originalPrice!.toFixed(2)}</Text>
            )}
            <Text style={[styles.price, isOnSale && styles.salePrice]}>
              ${detailProduct.price.toFixed(2)}
            </Text>
          </View>

          {qty === 0 ? (
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => addToCart(detailProduct)}
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
                onPress={() => setQty(detailProduct.id, qty - 1)}
                activeOpacity={0.8}
              >
                <Ionicons name="remove" size={20} color={theme.colors.text} />
              </TouchableOpacity>
              <Text style={styles.qtyText}>{qty}</Text>
              <TouchableOpacity
                style={[styles.qtyBtn, styles.qtyBtnAdd]}
                onPress={() => addToCart(detailProduct)}
                activeOpacity={0.8}
              >
                <Ionicons name="add" size={20} color={theme.colors.white} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <Pressable style={styles.backdrop} onPress={handleClose} />

      <View style={styles.sheet}>
        {/* Handle */}
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {headerLeft()}
            <View>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {headerTitle()}
              </Text>
              <Text style={styles.headerSub}>Powered by Emerald Crypt AI</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.closeBtn} onPress={handleClose} activeOpacity={0.8}>
            <Ionicons name="close" size={18} color={theme.colors.onPrimary} />
          </TouchableOpacity>
        </View>

        {/* ── Quiz ────────────────────────────────────────────────────── */}
        {uiStep === 'quiz' && currentQ && (
          <>
            <View style={styles.progressWrap}>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${((quizStep + 1) / TOTAL_QUESTIONS) * 100}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressLabel}>
                {quizStep + 1} of {TOTAL_QUESTIONS}
              </Text>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.quizBody}
              bounces={false}
            >
              <Text style={styles.question}>{currentQ.question}</Text>
              {currentQ.subtext && (
                <Text style={styles.questionSub}>{currentQ.subtext}</Text>
              )}
              <View style={styles.optionGrid}>
                {currentQ.options.map((opt) => (
                  <TouchableOpacity
                    key={opt.id}
                    style={styles.optionCard}
                    onPress={() => handleOption(opt.id)}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.optionEmoji}>{opt.emoji}</Text>
                    <Text style={styles.optionLabel}>{opt.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {quizStep > 0 && (
              <TouchableOpacity
                style={styles.bottomNavBtn}
                onPress={() => setQuizStep(quizStep - 1)}
                activeOpacity={0.75}
              >
                <Ionicons name="arrow-back" size={14} color={theme.colors.textMuted} />
                <Text style={styles.bottomNavText}>Back</Text>
              </TouchableOpacity>
            )}
          </>
        )}

        {/* ── Loading ──────────────────────────────────────────────────── */}
        {uiStep === 'loading' && (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingTitle}>Finding your best picks…</Text>
            <Text style={styles.loadingText}>Crypt Analyst is matching picks</Text>
          </View>
        )}

        {/* ── Results ──────────────────────────────────────────────────── */}
        {uiStep === 'results' && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.resultsBody}
            bounces={false}
          >
            {blurb ? (
              <View style={styles.blurbCard}>
                <View style={styles.blurbIcon}>
                  <Ionicons name="sparkles" size={16} color={theme.colors.gold} />
                </View>
                <Text style={styles.blurbText}>{blurb}</Text>
              </View>
            ) : (
              <View style={styles.blurbCard}>
                <Text style={styles.blurbText}>
                  Based on your answers, here are our top picks for you. Tap a pick for full details.
                </Text>
              </View>
            )}

            {candidates.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyText}>
                  No products matched those filters. Try adjusting your budget or format.
                </Text>
              </View>
            ) : (
              <View style={styles.productList}>
                {candidates.map((product, index) => (
                  <AIPickCard
                    key={product.id}
                    product={product}
                    rank={index + 1}
                    onPress={() => openDetail(index)}
                  />
                ))}
              </View>
            )}

            <TouchableOpacity
              style={styles.retakeBtn}
              onPress={reset}
              activeOpacity={0.8}
            >
              <Ionicons name="refresh" size={14} color={theme.colors.primary} />
              <Text style={styles.retakeText}>Retake Quiz</Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* ── Detail ───────────────────────────────────────────────────── */}
        {uiStep === 'detail' && renderDetail()}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(6, 22, 12, 0.55)',
  },
  sheet: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '92%',
    ...theme.shadows.large,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.border,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },

  // ── Header ────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    marginTop: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  aiBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  backIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  headerTitle: {
    fontFamily: theme.fonts.serifBold,
    fontSize: 17,
    color: theme.colors.white,
  },
  headerSub: {
    fontFamily: theme.fonts.body,
    fontSize: 11,
    color: theme.colors.gold,
    marginTop: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  // ── Progress ──────────────────────────────────────────────────────
  progressWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.border,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
  },
  progressLabel: {
    fontFamily: theme.fonts.semibold,
    fontSize: 11,
    color: theme.colors.textMuted,
  },

  // ── Quiz body ─────────────────────────────────────────────────────
  quizBody: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xl,
  },
  question: {
    fontFamily: theme.fonts.serifBold,
    fontSize: 22,
    color: theme.colors.text,
    lineHeight: 30,
    marginBottom: 4,
  },
  questionSub: {
    fontFamily: theme.fonts.body,
    fontSize: 13,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.md,
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  optionCard: {
    width: '47%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  optionEmoji: {
    fontSize: 26,
  },
  optionLabel: {
    fontFamily: theme.fonts.semibold,
    fontSize: 13,
    color: theme.colors.text,
    textAlign: 'center',
    lineHeight: 18,
  },
  bottomNavBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
  },
  bottomNavText: {
    fontFamily: theme.fonts.semibold,
    fontSize: 13,
    color: theme.colors.textMuted,
  },

  // ── Loading ───────────────────────────────────────────────────────
  loadingWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl,
    gap: theme.spacing.md,
  },
  loadingTitle: {
    fontFamily: theme.fonts.serifBold,
    fontSize: 20,
    color: theme.colors.text,
  },
  loadingText: {
    fontFamily: theme.fonts.body,
    fontSize: 14,
    color: theme.colors.textMuted,
  },

  // ── Results ───────────────────────────────────────────────────────
  resultsBody: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    paddingBottom: 40,
  },
  blurbCard: {
    backgroundColor: theme.colors.primaryMuted,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    flexDirection: 'row',
    gap: theme.spacing.sm,
    alignItems: 'flex-start',
  },
  blurbIcon: {
    marginTop: 2,
  },
  blurbText: {
    flex: 1,
    fontFamily: theme.fonts.body,
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 21,
  },
  productList: {
    gap: theme.spacing.sm,
  },
  emptyWrap: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: theme.fonts.body,
    fontSize: 14,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  retakeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs + 2,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  retakeText: {
    fontFamily: theme.fonts.semibold,
    fontSize: 14,
    color: theme.colors.primary,
  },

  // ── Detail ────────────────────────────────────────────────────────
  detailScroll: {
    paddingBottom: 120,
  },
  detailImageWrap: {
    height: 220,
    position: 'relative',
  },
  detailImage: {
    width: '100%',
    height: '100%',
  },
  detailGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: '45%' as unknown as number,
  },
  imgBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: theme.radius.xs,
  },
  saleBadgePos: {
    left: 56,
  },
  imgBadgeText: {
    ...theme.typography.label,
    color: theme.colors.white,
    fontSize: 10,
  },
  favBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navArrows: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
  },
  navArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navArrowDisabled: {
    opacity: 0.3,
  },
  navLabel: {
    fontFamily: theme.fonts.semibold,
    fontSize: 12,
    color: theme.colors.white,
    minWidth: 36,
    textAlign: 'center',
  },
  detailInfo: {
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  detailBrand: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  detailName: {
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
  detailDescription: {
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
  backToResults: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.sm,
  },
  backToResultsText: {
    fontFamily: theme.fonts.semibold,
    fontSize: 13,
    color: theme.colors.primary,
    textDecorationLine: 'underline',
  },

  // ── Detail bottom CTA ─────────────────────────────────────────────
  detailCta: {
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

    minWidth: 40,
    textAlign: 'center',
  },
});

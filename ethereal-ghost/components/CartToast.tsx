import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../theme';

export default function CartToast({ name }: { name: string }) {
  return (
    <View style={styles.toast} pointerEvents="none">
      <View style={styles.inner}>
        <Ionicons name="checkmark-circle" size={18} color={theme.colors.primary} />
        <Text style={styles.text} numberOfLines={1}>
          <Text style={styles.bold}>{name}</Text> added to cart
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 999,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.surfaceLight,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    ...theme.shadows.medium,
    maxWidth: 280,
  },
  text: {
    ...theme.typography.caption,
    color: theme.colors.text,
  },
  bold: {
    fontWeight: '700',
  },
});

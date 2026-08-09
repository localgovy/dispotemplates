import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAIAssistant } from '../context/AIAssistantContext';
import theme from '../theme';

export default function AIButton() {
  const { open } = useAIAssistant();

  return (
    <TouchableOpacity
      style={styles.btn}
      onPress={open}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel="Open AI assistant"
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Ionicons name="sparkles" size={14} color={theme.colors.onPrimary} />
      <Text style={styles.label}>AI</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    minWidth: 52,
    height: 34,
    paddingHorizontal: 10,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    ...theme.shadows.small,
  },
  label: {
    fontFamily: theme.fonts.bold,
    fontSize: 12,
    lineHeight: 14,
    letterSpacing: 0.6,
    color: theme.colors.onPrimary,
  },
});

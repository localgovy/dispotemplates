import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAIAssistant } from '../context/AIAssistantContext';
import theme from '../theme';

export default function AIButton() {
  const { open } = useAIAssistant();

  return (
    <TouchableOpacity style={styles.btn} onPress={open} activeOpacity={0.8} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
      <Ionicons name="wine-outline" size={16} color={theme.colors.background} />
      <View style={styles.dot} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.small,
  },
  dot: {
    position: 'absolute',
    top: 6,
    right: 7,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: theme.colors.background,
    opacity: 0.35,
  },
});

import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAIAssistant } from '../context/AIAssistantContext';
import theme from '../theme';

export default function AIButton() {
  const { open } = useAIAssistant();

  return (
    <TouchableOpacity style={styles.btn} onPress={open} activeOpacity={0.8} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
      <Ionicons name="sparkles" size={18} color={theme.colors.gold} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.small,
  },
});

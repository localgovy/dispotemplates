import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import theme from '../theme';

interface Props {
  category: { id: string; name: string; icon: string };
  isSelected?: boolean;
  onPress?: () => void;
  size?: 'sm' | 'md';
}

type MCIName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

export default function CategoryPill({ category, isSelected, onPress, size = 'md' }: Props) {
  if (size === 'sm') {
    return (
      <TouchableOpacity
        style={[styles.pillSm, isSelected && styles.pillSmActive]}
        onPress={onPress}
        activeOpacity={0.75}
      >
        <Text
          style={[styles.labelSm, isSelected && styles.labelSmActive]}
          numberOfLines={1}
        >
          {category.name}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.pill} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.iconCircle, isSelected && styles.iconCircleActive]}>
        <MaterialCommunityIcons
          name={category.icon as MCIName}
          size={24}
          color={isSelected ? theme.colors.primaryDark : theme.colors.primary}
        />
      </View>
      <Text style={styles.label} numberOfLines={1} adjustsFontSizeToFit>
        {category.name}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignItems: 'center',
    width: 76,
    gap: 7,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(125, 211, 252, 0.28)',
  },
  iconCircleActive: {
    backgroundColor: theme.colors.secondaryContainer,
  },
  label: {
    fontFamily: theme.fonts.serif,
    color: theme.colors.text,
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 15,
  },

  pillSm: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(125, 211, 252, 0.22)',
    borderRadius: theme.radius.full,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  pillSmActive: {
    backgroundColor: theme.colors.primary,
  },
  labelSm: {
    fontFamily: theme.fonts.semibold,
    fontSize: 13,
    color: theme.colors.primaryDark,
    lineHeight: 16,
    letterSpacing: 0.3,
  },
  labelSmActive: {
    color: theme.colors.onPrimary,
  },
});

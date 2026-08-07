import { Tabs } from 'expo-router';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import theme from '../../theme';
import { useCart } from '../../context/CartContext';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

type TabBarProps = {
  state: {
    index: number;
    routes: { key: string; name: string }[];
  };
  navigation: {
    navigate: (name: string) => void;
    emit: (event: {
      type: 'tabPress';
      target: string;
      canPreventDefault: true;
    }) => { defaultPrevented: boolean };
  };
};

const TAB_META: Record<string, { label: string; icon: IoniconsName; activeIcon: IoniconsName }> = {
  home: { label: 'Home', icon: 'home-outline', activeIcon: 'home' },
  search: { label: 'Shop', icon: 'storefront-outline', activeIcon: 'storefront' },
  cart: { label: 'Cart', icon: 'bag-handle-outline', activeIcon: 'bag-handle' },
  orders: { label: 'Orders', icon: 'receipt-outline', activeIcon: 'receipt' },
  profile: { label: 'Account', icon: 'person-outline', activeIcon: 'person' },
};

/**
 * Obsidian Glow flush bottom bar — sharp 0-radius edge-to-edge with cyan active rect.
 */
function LabTabBar({ state, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const { totalItems } = useCart();

  return (
    <View
      style={[
        styles.barWrap,
        { paddingBottom: insets.bottom > 0 ? insets.bottom : 8 },
      ]}
    >
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const meta = TAB_META[route.name];
          if (!meta) return null;

          const focused = state.index === index;
          const showBadge = route.name === 'cart' && totalItems > 0;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={styles.item}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
            >
              <View style={[styles.itemInner, focused && styles.itemInnerActive]}>
                <View>
                  <Ionicons
                    name={focused ? meta.activeIcon : meta.icon}
                    size={21}
                    color={focused ? theme.colors.primary : theme.colors.tabInactive}
                  />
                  {showBadge && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{totalItems > 9 ? '9+' : totalItems}</Text>
                    </View>
                  )}
                </View>
                <Text
                  numberOfLines={1}
                  style={[styles.label, focused && styles.labelActive]}
                >
                  {meta.label}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <LabTabBar {...props} />}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="search" />
      <Tabs.Screen name="cart" />
      <Tabs.Screen name="orders" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  barWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 0,
    backgroundColor: theme.colors.tabBar,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: theme.colors.tabBar,
    borderRadius: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  item: {
    flex: 1,
    alignItems: 'center',
  },
  itemInner: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 0,
    width: '100%',
  },
  itemInnerActive: {
    backgroundColor: theme.colors.secondaryContainer,
    borderTopWidth: 2,
    borderTopColor: theme.colors.primary,
  },
  label: {
    fontFamily: theme.fonts.mono,
    fontSize: 9,
    letterSpacing: 0.6,
    color: theme.colors.tabInactive,
    textTransform: 'uppercase',
  },
  labelActive: {
    color: theme.colors.primary,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    minWidth: 16,
    height: 16,
    borderRadius: 0,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.tabBar,
    paddingHorizontal: 3,
  },
  badgeText: {
    fontFamily: theme.fonts.bold,
    fontSize: 9,
    color: theme.colors.onPrimary,
    lineHeight: 11,
  },
});

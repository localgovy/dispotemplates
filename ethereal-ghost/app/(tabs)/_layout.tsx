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

/** Ultra-rounded floating glass bar with white active state. */
function GhostTabBar({ state, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const { totalItems } = useCart();

  return (
    <View
      style={[
        styles.barWrap,
        { paddingBottom: insets.bottom > 0 ? insets.bottom - 2 : 14 },
      ]}
      pointerEvents="box-none"
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
                    size={20}
                    color={focused ? theme.colors.background : theme.colors.tabInactive}
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
      tabBar={(props) => <GhostTabBar {...props} />}
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
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: theme.colors.tabBar,
    borderRadius: theme.radius.full,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.large,
  },
  item: {
    flex: 1,
    alignItems: 'center',
  },
  itemInner: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: theme.radius.full,
    width: '100%',
  },
  itemInnerActive: {
    backgroundColor: theme.colors.white,
  },
  label: {
    fontFamily: theme.fonts.medium,
    fontSize: 10,
    letterSpacing: 0.3,
    color: theme.colors.tabInactive,
  },
  labelActive: {
    fontFamily: theme.fonts.bold,
    color: theme.colors.background,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: theme.colors.tabBar,
    paddingHorizontal: 3,
  },
  badgeText: {
    fontFamily: theme.fonts.bold,
    fontSize: 9,
    color: theme.colors.background,
    lineHeight: 11,
  },
});

// app/(main)/(tabs)/_layout.jsx
import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import Avatar from '@/components/Avatar';
import { useAuth } from '../../../contexts/AuthContext';
import { hp } from '@/helpers/common';
import { theme, retroTheme } from '@/constants/theme';
import Icon from '@/assets/icons';

export default function TabLayout() {
  const { user } = useAuth();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#000000',
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabBarItem,
        headerShown: false,  // 기본 상단 헤더 숨기기
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: '',
          tabBarIcon: ({ color, focused }) => (
            <Icon
              name="home"
              size={hp(2.9)}
              strokeWidth={2}
              color={focused ? retroTheme.colors.rose : theme.colors.text}
              style={styles.icon}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="newPost"
        options={{
          title: '',
          tabBarIcon: ({ color, focused }) => (
            <Icon
              name="plus"
              size={hp(2.9)}
              strokeWidth={2}
              color={focused ? retroTheme.colors.rose : theme.colors.text}
              style={styles.icon}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '',
          tabBarIcon: ({ color, focused }) => (
            <Avatar
              uri={user?.image}
              size={hp(3.3)}
              rounded={theme.radius.xl}
              style={[styles.avatarImage, focused && styles.focusedAvatar]}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: hp(8),
    backgroundColor: '#fff',
    borderTopWidth: 0.5,
    borderTopColor: theme.colors.gray,
  },
  tabBarItem: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: hp(1),
  },
  icon: {
    marginTop: hp(3),
  },
  avatarImage: {
    borderWidth: 1,
    borderColor: theme.colors.gray,
    marginTop: hp(3),
  },
  focusedAvatar: {
    borderColor: retroTheme.colors.rose,
  },
});

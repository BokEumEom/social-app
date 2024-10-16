// social-app/app/_layout.jsx
import { Stack, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { getUserData } from '../services/userService';
import { SafeAreaProvider } from 'react-native-safe-area-context'; 

const _layout = () => {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <MainLayout />
      </SafeAreaProvider>
    </AuthProvider>
  );
};

const MainLayout = () => {
  const { setAuth, setUserData } = useAuth();  // Auth context에서 setAuth와 setUserData를 가져옵니다.
  const router = useRouter();  // router 객체를 사용하여 페이지 이동을 처리합니다.

  // 인증 상태 변화를 구독하는 useEffect
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session && session.user) { // session.user가 있는지 확인
        setAuth(session.user);  // 인증된 사용자 정보 설정
        await updateUserData(session.user, session.user.email);  // 사용자 데이터 업데이트
        router.replace('/(main)/(tabs)/home');  // 인증된 사용자면 홈 화면으로 리다이렉트
      } else {
        setAuth(null);  // 세션이 없으면 인증 상태를 null로 설정
        router.replace('/welcome');  // 인증되지 않은 사용자는 welcome 화면으로 리다이렉트
      }
    });

    // 컴포넌트가 unmount될 때 구독 취소
    return () => {
      authListener?.subscription?.unsubscribe();  // 안전하게 구독 해제
    };
  }, []);  // 빈 배열이므로 컴포넌트가 처음 렌더링될 때 한 번 실행

  // 사용자 데이터를 가져와서 setUserData로 상태 업데이트
  const updateUserData = async (user, email) => {
    try {
      const res = await getUserData(user.id);
      if (res.success) {
        setUserData({ ...res.data, email });
      }
    } catch (error) {
      console.error("Failed to update user data:", error);
    }
  };

  return (
    <Stack>
      {/* 메인 탭 레이아웃 */}
      <Stack.Screen name="(main)/(tabs)" options={{ headerShown: false }} />

      {/* 탭 외부에 있는 스택 화면 */}
      <Stack.Screen name="(main)/editProfile" options={{ headerShown: false, title: 'Edit Profile' }} />
      <Stack.Screen name="(main)/notifications" options={{ headerShown: false, title: 'Notifications' }} />
      <Stack.Screen name="(main)/postDetails" options={{ headerShown: false, title: 'Post Details' }} />
    </Stack>
  );
};

export default _layout;

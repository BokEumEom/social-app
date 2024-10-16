// ScreenWrapper.jsx
import { View } from 'react-native';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ScreenWrapper = ({ children, bg }) => {
  const { top } = useSafeAreaInsets();
  
  // SafeAreaInsets가 없는 경우 최소 여백을 20으로 설정
  const paddingTop = top > 0 ? top : 20;

  return (
    <View style={{ flex: 1, paddingTop, backgroundColor: bg || '#fff' }}>
      {children}
    </View>
  );
};

export default ScreenWrapper;

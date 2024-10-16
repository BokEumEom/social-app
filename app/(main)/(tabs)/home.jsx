import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import ScreenWrapper from '@/components/ScreenWrapper';
import Button from '@/components/Button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { hp, wp } from '@/helpers/common';
import { theme } from '@/constants/theme';
import Icon from '@/assets/icons';
import { useRouter } from 'expo-router';
import Avatar from '@/components/Avatar';
import { fetchPosts } from '../../../services/postService';
import PostCard from '@/components/PostCard';
import Loading from '@/components/Loading';
import { getUserData } from '../../../services/userService';
import { useFonts } from 'expo-font';
import { FlashList } from "@shopify/flash-list";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

var limit = 0;

const Home = () => {
  const { user, setAuth } = useAuth();
  const router = useRouter();

  const [posts, setPosts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);

  const [loaded, error] = useFonts({
    'DepartureMono': require('@/assets/fonts/DepartureMono-Regular.otf'),
  });

  // 슬라이드 애니메이션을 위한 sharedValue 생성
  const translateX = useSharedValue(0);

  const navigateToNewPost = () => {
    // 홈 화면을 오른쪽으로 슬라이드
    translateX.value = withTiming(300, { duration: 500 }, () => {
      // 슬라이드 후에 newPost 화면으로 전환
      router.push('newPost');
    });
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const handlePostEvent = async (payload) => {
    if (payload.eventType === 'INSERT' && payload?.new?.id) {
      let newPost = { ...payload.new };
      let res = await getUserData(newPost.userId);
      newPost.postLikes = [];
      newPost.comments = [{count: 0}];
      newPost.user = res.success ? res.data : {};
      setPosts(prevPosts => [newPost, ...prevPosts]);
    }
    if (payload.eventType === 'DELETE' && payload.old.id) {
      setPosts(prevPosts => {
        let updatedPosts = prevPosts.filter(post => post.id !== payload.old.id);
        return updatedPosts;
      });
    }
    if (payload.eventType === 'UPDATE' && payload?.new?.id) {
      setPosts(prevPosts => {
        let updatedPosts = prevPosts.map(post => {
          if (post.id === payload.new.id) {
            post.body = payload.new.body;
            post.file = payload.new.file;
          }
          return post;
        });
        return updatedPosts;
      });
    }    
  };

  // Update to handle real-time comment events
  const handleCommentEvent = (payload) => {
    setPosts((prevPosts) => {
      const updatedPosts = prevPosts.map((post) => {
        if (post.id === payload.new.postId) {
          const newCommentCount = payload.eventType === 'INSERT'
            ? (post.comments[0]?.count || 0) + 1
            : Math.max((post.comments[0]?.count || 0) - 1, 0);
          return {
            ...post,
            comments: [{ count: newCommentCount }],
          };
        }
        return post;
      });
      return updatedPosts;
    });
  };

  const handleNewNotification = async (payload) => {
    console.log('got new notification: ', payload);
    if (payload.eventType === 'INSERT' && payload.new.id) {
      setNotificationCount(prev => prev + 1);
    }
  };

  useEffect(() => {
    if (!user) return; // user가 없으면 실행하지 않음

    let postChannel = supabase
      .channel('posts')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'posts' }, handlePostEvent)
      .subscribe();
  
    let commentChannel = supabase
      .channel('comments')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'comments' }, handleCommentEvent)
      .subscribe();

    let notificationChannel = supabase
      .channel('notifications')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications',
        filter: `receiverId=eq.${user.id}` }, handleNewNotification)
      .subscribe();

    return () => {
      supabase.removeChannel(postChannel);
      supabase.removeChannel(commentChannel);
      supabase.removeChannel(notificationChannel);
    };
  }, [user]);

  useEffect(() => {
    if (loaded || error) {
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  const getPosts = async () => {
    if (!hasMore) return null;
    limit += 10;

    console.log('fetching post: ', limit);
    let res = await fetchPosts(limit);
    if (res.success) {
      if (posts.length === res.data.length) setHasMore(false);
      setPosts(res.data);
    }
  };

  return (
    <ScreenWrapper bg="white">
      {/* 애니메이션 적용된 View */}
      <Animated.View style={[styles.container, animatedStyle]}>
      {/* <View style={styles.container}> */}
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>SpaceYay</Text>
          <View style={styles.iconContainer}>
            <Pressable onPress={() => {
              setNotificationCount(0);
              router.push('notifications');
            }}>
              <Icon name="heart" size={hp(3.2)} strokeWidth={2} color={theme.colors.text} />
              {notificationCount > 0 && (
                <View style={styles.pill}>
                  <Text style={styles.pillText}>
                    {notificationCount}
                  </Text>
                </View>
              )}
            </Pressable>
            <Pressable onPress={() => router.push('newPost')}>
              <Icon name="send" size={hp(3.2)} strokeWidth={2} color={theme.colors.text} />
            </Pressable>
            {/* <Pressable onPress={() => router.push('newPost')}>
              <Icon name="plus" size={hp(3.2)} strokeWidth={2} color={theme.colors.text} />
            </Pressable>
            <Pressable onPress={() => router.push('profile')}>
              <Avatar
                uri={user?.image}
                size={hp(4.3)}
                rounded={theme.radius.sm}
                style={styles.avatarImage}
              />
            </Pressable> */}
          </View>
        </View>

        {/* posts */}
        <FlashList
          key={posts.length}
          data={posts}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listStyle}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => <PostCard item={item} currentUser={user} router={router} />}
          estimatedItemSize={100}
          onEndReached={() => {
            getPosts();
            console.log('got to the end');
          }}
          onEndReachedThreshold={0}
          ListFooterComponent={hasMore ? (
            <View style={{marginVertical: posts.length === 0 ? 200 : 30}}>
              <Loading />
            </View>
          ) : (
            <View style={{marginVertical: 30}}>
              <Text style={styles.noPosts}>No more posts</Text>
            </View>
          )}
        />
      {/* </View> */}
      </Animated.View>
    </ScreenWrapper>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(4),
    marginBottom: 10,
  },
  title: {
    color: theme.colors.text,
    fontSize: hp(3.2),
    fontWeight: theme.fonts.bold,
    fontFamily: 'DepartureMono-Regular',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarImage: {
    borderWidth: 2,
    borderColor: theme.colors.gray,
  },
  listStyle: {
    paddingTop: 20,
    paddingHorizontal: wp(4),
  },
  noPosts: {
    fontSize: hp(2),
    textAlign: 'center',
    color: theme.colors.text,
  },
  pill: {
    position: 'absolute',
    right: -10,
    top: -4,
    height: hp(2.2),
    width: hp(2.2),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: theme.colors.roseLight,
  },
  pillText: {
    color: 'white',
    fontSize: hp(1.2),
    fontWeight: theme.fonts.bold,
  },
});

// pokemon/components/Profile.jsx
import { Alert, FlatList, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'expo-router';
import ScreenWrapper from '@/components/ScreenWrapper';
import Header from '@/components/Header';
import { hp, wp } from '@/helpers/common';
import Icon from '@/assets/icons'
import { theme } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import Avatar from '@/components/Avatar';
import { fetchPosts } from '@/services/postService';
import PostCard from '@/components/PostCard';
import Loading from '@/components/Loading';
import { FlashList } from "@shopify/flash-list";

var limit = 0;
const Profile = () => {
  const { user, setAuth } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  const onLogout = async () => {
    const { error } = await supabase.auth.signOut();

    console.log('user: ', user);

    if (error) {
      Alert.alert('Sign Out', "Error signing out!")
    }
  }

  const getPosts = async () => {
    // call the api here

    if (!hasMore) return;
    limit += 10;

    console.log('fetching post: ', limit);
    let res = await fetchPosts(limit, user.id);
    if (res.success) {
      if (posts.length === res.data.length) setHasMore(false);
      else setPosts(prevPosts => [...prevPosts, ...res.data]);
    }
  }; 

  const handleLogout = async () => {
    // show confirm modal
    Alert.alert('Confirm', "Are you sure you want to log out?", [
      {
        text: 'Cancel',
        onPress: () => console.log('modal cancelled'),
        style: 'cancel'
      },
      {
        text: 'Logout',
        onPress: () => onLogout(),
        style: 'destructive'
      }
    ])
  }

  return (
    <ScreenWrapper bg="white">
      <FlashList
          data={posts}
          ListHeaderComponent={
            <UserHeader user={user} router={router} handleLogout={handleLogout} />
          }
          ListHeaderComponentStyle={{marginBottom: 30}}
          ListEmptyComponent={
            !hasMore && (
              <View style={{ marginVertical: 30 }}>
                <Text style={styles.noPosts}>No posts available</Text>
              </View>
            )
          }          
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listStyle}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => <PostCard 
            item={item} 
            currentUser={user} 
            router={router} 
          />}
          estimatedItemSize={100}
          onEndReached={()=>{
            getPosts();
            console.log('got to the end');
          }}
          onEndReachedThreshold={0}
          ListFooterComponent={hasMore? (
            <View style={{marginVertical: posts.length==0? 100: 30}}>
              <Loading />
            </View>
          ): (
            <View style={{marginVertical: 30}}>
              <Text style={styles.noPosts}>No more posts</Text>
            </View>
          )}
        />
    </ScreenWrapper>
  )
}

const UserHeader = ({ user, router, handleLogout }) => {
  console.log('Rendering UserHeader');
  console.log('Icon:', Icon);

  return (
    <View style={styles.headerContainer}>
      <View style={styles.container}>
        <Header title="Profile" />
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout}
          accessibilityLabel="Log out of your profile"
          accessibilityRole="button"
        >
          <Icon name="logout" color={theme.colors.rose} size={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        <View style={styles.contentWrapper}>
          <View style={styles.avatarContainer}>
            <Avatar
              uri={user?.image}
              size={hp(14)}
              rounded={theme.radius.xxl * 1.4}
              style={styles.avatar}
            />
            <Pressable style={styles.editIcon} onPress={() => router.push('editProfile')}>
              <Icon name="edit" strokeWidth={2.5} size={20} />
            </Pressable>
          </View>

          {/* username and address */}
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || 'Username'}</Text>
            <Text style={styles.infoText}>{user?.address || 'User address'}</Text>
          </View>

          {/* email, phone, bio */}
          <View style={styles.detailsContainer}>
            <View style={styles.info}>
              <Icon name="mail" color={theme.colors.primary} size={20} />
              <Text style={styles.infoText}>{user?.email || 'Email not available'}</Text>
            </View>
            {user?.phoneNumber && (
              <View style={styles.info}>
                <Icon name="call" color={theme.colors.primary} size={20} />
                <Text style={styles.infoText}>{user.phoneNumber}</Text>
              </View>
            )}
            {user?.bio && (
              <Text style={styles.bioText}>{user.bio}</Text>
            )}
          </View>
        </View>
      </View>
    </View>
  )
}

export default Profile

const styles = StyleSheet.create({
  headerContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    // paddingHorizontal: wp(1),
    // paddingTop: hp(0.1),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray,
    gap: 15
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentWrapper: {
    // paddingHorizontal: wp(1),
  },
  avatarContainer: {
    alignSelf: 'center',
    marginBottom: hp(1),
    position: 'relative',
  },
  avatar: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: -12,
    padding: 7,
    borderRadius: 50,
    backgroundColor: 'white',
    shadowColor: theme.colors.textLight,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 7
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: hp(3),
    fontWeight: 'bold',
    color: theme.colors.textDark,
    marginBottom: hp(0.5),
    fontFamily: 'DepartureMono',
  },
  infoText: {
    fontSize: hp(1.8),
    fontWeight: '500',
    color: theme.colors.textLight,
    textAlign: 'center',
    fontFamily: 'DepartureMono',
  },
  detailsContainer: {
    paddingHorizontal: wp(4),
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    paddingVertical: hp(2),
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(1),
  },
  bioText: {
    fontSize: hp(1.6),
    color: theme.colors.textLight,
    textAlign: 'left',
    fontFamily: 'DepartureMono',
  },
  logoutButton: {
    position: 'absolute',
    right: 0,
    padding: 5,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.darkLight
  },
  listStyle: {
    paddingHorizontal: wp(4),
    paddingBottom: 30,
  },
  noPosts: {
    fontSize: hp(2),
    textAlign: 'center',
    color: theme.colors.text,
  },
})

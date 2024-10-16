import { Alert, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { theme, retroTheme } from '@/constants/theme';
import { hp, wp, stripHtmlTags } from '@/helpers/common';
import Avatar from '@/components/Avatar';
import moment from 'moment';
import 'moment/locale/ko';
import Icon from '../assets/icons';
import RenderHtml from 'react-native-render-html';
import { downloadFile, getSupabaseFileUrl } from '../services/imageService';
import { Image } from 'expo-image';
import { Video } from 'expo-av';
import { createPostLike, removePostLike } from '../services/postService';
import Loading from './Loading';

moment.locale('ko');

// 스타일 지정 시 div는 지원하지 않으므로, 해당 스타일을 p 또는 View 등으로 변경
const tagsStyles = {
  p: {
    color: retroTheme.colors.text,
    fontSize: hp(2.5),
    lineHeight: hp(3.5),
    fontFamily: 'DepartureMono', // Retro-inspired font
  },
  h1: {
    color: retroTheme.colors.text,
    fontSize: hp(3),
    fontWeight: 'bold',
    fontFamily: 'DepartureMono', // Retro-inspired font
  },
  h4: {
    color: retroTheme.colors.text,
    fontSize: hp(2.5),
    fontWeight: 'bold',
    fontFamily: 'DepartureMono', // Retro-inspired font
  },
  // div 대신 View로 스타일을 지정해야 함
  view: {
    color: retroTheme.colors.text,
    fontSize: hp(2.5),
    lineHeight: hp(3.5),
    fontFamily: 'DepartureMono', // Retro-inspired font
  }
};

const PostCard = ({ 
  item, 
  currentUser, 
  router, 
  hasShadow, 
  showMoreIcon = true,
  showDelete = false,
  onDelete = () => {},
  onEdit = () => {}
}) => {
  const shadowStyles = {
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  };

  const [likes, setLikes] = useState([]);
  const [loading, setLoading] = useState(false);
  const liked = likes.some(like => like.userId === currentUser?.id);

  useEffect(() => {
    setLikes(item?.postLikes);
  }, [item?.postLikes]);

  const openPostDetails = () => {
    if (!showMoreIcon) return null;
    router.push({ pathname: 'postDetails', params: { postId: item?.id } });
  };

  const onLike = async () => {
    if (liked) {
      setLikes(prevLikes => prevLikes.filter(like => like.userId !== currentUser?.id));
      const res = await removePostLike(item?.id, currentUser?.id);
      if (!res.success) {
        Alert.alert('Post', 'Something went wrong!');
      }
    } else {
      const newLike = { userId: currentUser?.id, postId: item?.id };
      setLikes(prevLikes => [...prevLikes, newLike]);
      const res = await createPostLike(newLike);
      if (!res.success) {
        Alert.alert('Post', 'Something went wrong!');
      }
    }
  };

  const onShare = async () => {
    try {
      let content = { message: stripHtmlTags(item?.body) };
      if (item?.file) {
        setLoading(true);
        const fileUrl = getSupabaseFileUrl(item?.file).uri;
        const localUrl = await downloadFile(fileUrl);
        setLoading(false);
        content.url = localUrl;
      }
      await Share.share(content);
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Something went wrong while sharing!');
    }
  };

  const handlePostDelete = () => {
    Alert.alert('Confirm', "Are you sure you want to do this?", [
      { text: 'Cancel', onPress: () => {}, style: 'cancel' },
      { text: 'Delete', onPress: () => onDelete(item), style: 'destructive' }
    ]);
  };

  const createdAt = moment(item?.created_at).format('YYYY년 MM월 DD일 (ddd) A hh:mm');

  return (
    <View style={[styles.container, hasShadow && shadowStyles]}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Avatar size={hp(5)} uri={item?.user?.image} rounded={theme.radius.full} />
          <View style={styles.userTextContainer}>
            <Text style={styles.username}>{item?.user?.name}</Text>
            <Text style={styles.postTime}>{createdAt}</Text>
          </View>
        </View>
        {showMoreIcon && (
          <TouchableOpacity onPress={openPostDetails}>
            <Icon name="threeDotsHorizontal" size={hp(3)} strokeWidth={3} color={theme.colors.textLight} />
          </TouchableOpacity>
        )}
        {showDelete && currentUser.id === item?.userId && (
          <View style={styles.actions}>
            <TouchableOpacity onPress={() => onEdit(item)}>
              <Icon name="edit" size={hp(2.5)} color={theme.colors.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handlePostDelete}>
              <Icon name="delete" size={hp(2.5)} color={theme.colors.rose} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.content}>
        {item?.body && (
          <RenderHtml contentWidth={wp(100)} source={{ html: item?.body }} tagsStyles={tagsStyles} />
        )}
        {item?.file?.includes('postImages') && (
          <Image source={getSupabaseFileUrl(item?.file)} transition={200} style={styles.postMedia} contentFit="cover" />
        )}
        {item?.file?.includes('postVideos') && (
          <Video style={[styles.postMedia, { height: hp(30) }]} source={getSupabaseFileUrl(item?.file)} useNativeControls resizeMode="cover" isLooping />
        )}
      </View>

      <View style={styles.footer}>
        <View style={styles.footerButton}>
          <TouchableOpacity onPress={onLike}>
            <Icon
              name="heart"
              size={24}
              fill={liked ? retroTheme.colors.rose : 'transparent'}
              color={liked ? retroTheme.colors.rose : retroTheme.colors.textLight}
            />
          </TouchableOpacity>
          <Text style={styles.count}>{likes?.length}</Text>
        </View>
        <View style={styles.footerButton}>
          <TouchableOpacity onPress={openPostDetails}>
            <Icon name="comment" size={24} color={retroTheme.colors.textLight} />
          </TouchableOpacity>
          <Text style={styles.count}>{item?.comments[0]?.count}</Text>
        </View>
        <View style={styles.footerButton}>
          {loading ? (
            <Loading size="small" />
          ) : (
            <TouchableOpacity onPress={onShare}>
              <Icon name="share" size={24} color={retroTheme.colors.textLight} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

export default PostCard;

const styles = StyleSheet.create({
  container: {
    marginBottom: hp(2),
    backgroundColor: retroTheme.colors.background,
    borderWidth: 2,
    borderColor: retroTheme.colors.border,
    borderRadius: hp(1),
    shadowColor: '#000',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: wp(2),
    alignItems: 'center',
    backgroundColor: retroTheme.colors.background,
    borderBottomWidth: 2,
    borderColor: retroTheme.colors.border,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userTextContainer: {
    marginLeft: wp(2),
  },
  username: {
    fontSize: hp(2),
    color: retroTheme.colors.text,
    fontWeight: '700',
    fontFamily: 'DepartureMono',
  },
  postTime: {
    fontSize: hp(1.3),
    color: retroTheme.colors.textLight,
    fontFamily: 'DepartureMono',
  },
  content: {},
  postMedia: {
    height: hp(40),
    width: '100%',
    borderTopWidth: 2,
    borderColor: retroTheme.colors.border,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
    backgroundColor: retroTheme.colors.background,
    borderTopWidth: 2,
    borderColor: retroTheme.colors.border,
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: wp(4),
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  count: {
    color: retroTheme.colors.text,
    fontSize: hp(1.8),
    marginLeft: wp(1),
    fontFamily: 'DepartureMono',
  },
});

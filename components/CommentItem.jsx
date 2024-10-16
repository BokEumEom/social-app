import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect } from 'react';
import { hp, wp } from '@/helpers/common';
import { theme } from '@/constants/theme';
import Avatar from './Avatar';
import moment from 'moment';
import 'moment/locale/ko';
import Icon from '../assets/icons';

moment.locale('ko');

const CommentItem = ({
  item,
  canDelete = false,
  onDelete = ()=>{},
  highlight = false
}) => {
  const createdAt = moment(item?.created_at).format('MM월 DD일');

  const handleDelete = ()=>{
    Alert.alert('Confirm', "Are you sure you want to do this?", [
      {
        text: 'Cancel',
        onPress: () => console.log('modal cancelled'),
        style: 'cancel'
      },
      {
        text: 'Delete',
        onPress: () => onDelete(item),
        style: 'destructive'
      }
    ])
  }

  return (
    <View style={styles.container}>
      <Avatar
        uri={item?.user?.iamge}
      />
      <View style={[styles.content, highlight && styles.highlight]}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
          <View style={styles.nameContainer}>
            <Text style={styles.text}>
              {
                item?.user?.name
              }
            </Text>
            <Text>ㆍ</Text>
            <Text style={[styles.text, {color: theme.colors.textLight, fontFamily: 'DepartureMono'}]}>
              {
                createdAt
              }
            </Text>
          </View>
          {
            canDelete && (
              <TouchableOpacity onPress={handleDelete}>
                <Icon name="delete" size={20} color={theme.colors.rose} />
              </TouchableOpacity>
            )
          }
          
        </View>
        <Text style={[styles.text, {fontWeight: 'normal', fontFamily: 'DepartureMono'}]}>
          {item?.text}
        </Text>
      </View>
    </View>
  )
}

export default CommentItem

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    gap: 7,
  },
  
  content: {
    backgroundColor: 'rgba(0,0,0,0.06)',
    flex: 1,
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: theme.radius.md,
    borderCurve: 'continuous',
  },
  
  highlight: {
    borderWidth: 0.2,
    backgroundColor: 'white',
    borderColor: theme.colors.dark,
    shadowColor: theme.colors.dark,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  text: {
    fontSize: hp(1.6),
    fontWeight: theme.fonts.medium,
    color: theme.colors.textDark,
    fontFamily: 'DepartureMono'
  }  
})
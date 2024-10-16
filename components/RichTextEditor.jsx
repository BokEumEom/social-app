import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import {actions, RichEditor, RichToolbar} from "react-native-pell-rich-editor";
import { theme } from '../constants/theme';

const RichTextEditor = ({
  editorRef,
  onChange
}) => {

  return (
    <View style={{minHeight: 285}}>  
      <RichToolbar
        actions={[
          actions.setBold,
          actions.setItalic,
          actions.insertOrderedList,
          actions.blockquote,
          actions.alignLeft,
          actions.alignCenter,
          actions.alignRight,
          actions.setStrikethrough,
          actions.removeFormat,
          actions.code,
          actions.line,
          actions.undo,
          actions.heading1,
          actions.heading4,
        ]}
        iconMap={{
          [actions.heading1]: ({tintColor})=> <Text style={{color: tintColor}}>H1</Text>,
          [actions.heading4]: ({tintColor})=> <Text style={{color: tintColor}}>H4</Text>
        }}
        style={styles.richBar}
        flatContainerStyle={styles.flatStyle}
        selectedIconTint={theme.colors.primaryDark}
        editor={editorRef}
        disabled={false}
      />

      <RichEditor
        ref={editorRef}
        containerStyle={styles.rich}
        editorStyle={styles.contentStyle}
        placeholder={"What's on your mind?"}
        androidHardwareAccelerationDisabled={true}
        onChange={onChange}
        disabled = {false}
      />
    </View>
  )
}

export default RichTextEditor

const styles = StyleSheet.create({
  richBar: {
    borderTopRightRadius: theme.radius.xl,
    borderTopLeftRadius: theme.radius.xl,
    backgroundColor: theme.colors.gray
  },
  rich: {
    minHeight: 240,
    flex: 1,
    borderWidth: 1.5,
    borderTopWidth: 0,
    borderBottomLeftRadius: theme.radius.xl,
    borderBottomRightRadius: theme.radius.xl,
    borderColor: theme.colors.gray,
  },
  contentStyle: {
    color: theme.colors.textDark,
    placeholderColor: 'gray',
  },
  flatStyle: {
    paddingHorizontal: 8,
    gap: 3
  }
})
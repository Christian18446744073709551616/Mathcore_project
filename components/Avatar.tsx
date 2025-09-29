import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { StyleSheet, View, Alert, Image, TouchableOpacity } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import * as ImageManipulator from 'expo-image-manipulator'
import { MaterialIcons } from '@expo/vector-icons'

interface Props {
  size: number
  url: string | null
  onUpload: (filePath: string) => void
}

export default function Avatar({ url, size = 150, onUpload }: Props) {
  const [uploading, setUploading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  const avatarSize = { height: size, width: size, borderRadius: size / 2 }

  useEffect(() => {
    if (url) downloadImage(url)
  }, [url])

  async function downloadImage(path: string) {
    try {
      const { data, error } = await supabase.storage.from('avatars').download(path)
      if (error) throw error

      const fr = new FileReader()
      fr.readAsDataURL(data)
      fr.onload = () => setAvatarUrl(fr.result as string)
    } catch (error) {
      if (error instanceof Error) console.log('Error downloading image: ', error.message)
    }
  }

  async function uploadAvatar() {
    try {
      setUploading(true)

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: false,
        allowsEditing: true,
        quality: 1,
        exif: false,
      })

      if (result.canceled || !result.assets || result.assets.length === 0) return

      const image = result.assets[0]
      if (!image.uri) throw new Error('No image uri!')

      const resizedImage = await ImageManipulator.manipulateAsync(
        image.uri,
        [{ resize: { width: size, height: size } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      )

      const arraybuffer = await fetch(resizedImage.uri).then((res) => res.arrayBuffer())

      const fileExt = 'jpeg'
      const path = `${Date.now()}.${fileExt}`
      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, arraybuffer, { contentType: 'image/jpeg' })

      if (uploadError) throw uploadError
      onUpload(data.path)
    } catch (error) {
      if (error instanceof Error) Alert.alert(error.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <View style={styles.container}>
      {avatarUrl ? (
        <Image
          source={{ uri: avatarUrl }}
          accessibilityLabel="Avatar"
          style={[avatarSize, styles.avatar, styles.image]}
        />
      ) : (
        <View style={[avatarSize, styles.avatar, styles.noImage]} />
      )}

      <TouchableOpacity
        style={styles.editButton}
        onPress={uploadAvatar} // sempre abre seletor
      >
        <MaterialIcons name="edit" size={20} color="#666" />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    overflow: 'hidden',
    maxWidth: '300%',
  },
  image: {
    resizeMode: 'cover',
  },
  noImage: {
    backgroundColor: '#333',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'rgb(200, 200, 200)',
  },
  editButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'white',     // fundo branco
    borderColor: '#ccc',          // borda cinza
    borderWidth: 1,
    borderRadius: 20,
    padding: 5,
    elevation: 4,
    zIndex: 10,
  },
})

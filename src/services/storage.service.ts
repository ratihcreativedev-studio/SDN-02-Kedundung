import { createClient } from '@/lib/supabase/server'
import { v4 as uuidv4 } from 'uuid'

export const storageService = {
  async uploadImage(file: File, folder: string = 'general'): Promise<string> {
    const supabase = await createClient()

    const fileExt = file.name.split('.').pop()
    const fileName = `${folder}/${uuidv4()}.${fileExt}`

    const { error } = await supabase.storage
      .from('sipanda-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      throw new Error(`Gagal mengunggah gambar: ${error.message}`)
    }

    // Dapatkan URL publik
    const { data: publicUrlData } = supabase.storage
      .from('sipanda-images')
      .getPublicUrl(fileName)

    return publicUrlData.publicUrl
  },

  async uploadDocument(file: File, folder: string = 'documents'): Promise<string> {
    const supabase = await createClient()

    if (file.type !== 'application/pdf') {
      throw new Error('Hanya file PDF yang diperbolehkan')
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${folder}/${uuidv4()}.${fileExt}`

    const { error } = await supabase.storage
      .from('sipanda-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      throw new Error(`Gagal mengunggah dokumen: ${error.message}`)
    }

    // Dapatkan URL publik
    const { data: publicUrlData } = supabase.storage
      .from('sipanda-images')
      .getPublicUrl(fileName)

    return publicUrlData.publicUrl
  },

  async deleteImage(imageUrl: string): Promise<void> {
    const supabase = await createClient()

    try {
      // Ekstrak nama file dari URL publik Supabase
      const urlObj = new URL(imageUrl)
      const pathParts = urlObj.pathname.split('/sipanda-images/')
      if (pathParts.length !== 2) return

      const fileName = pathParts[1]
      
      const { error } = await supabase.storage
        .from('sipanda-images')
        .remove([fileName])

      if (error) {
        throw new Error(`Gagal menghapus gambar: ${error.message}`)
      }
    } catch (e) {
      console.error('Error deleting image:', e)
    }
  },

  async deleteDocument(fileUrl: string): Promise<void> {
    const supabase = await createClient()

    try {
      const urlObj = new URL(fileUrl)
      const pathParts = urlObj.pathname.split('/sipanda-images/')
      if (pathParts.length !== 2) return

      const fileName = pathParts[1]
      
      const { error } = await supabase.storage
        .from('sipanda-images')
        .remove([fileName])

      if (error) {
        throw new Error(`Gagal menghapus dokumen: ${error.message}`)
      }
    } catch (e) {
      console.error('Error deleting document:', e)
    }
  }
}

import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { CameraCapture } from '../components/CameraCapture'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Textarea } from '../components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

export const VisitorForm = () => {
  const [formData, setFormData] = useState({
    nama: '',
    asal: '',
    no_hp: '',
    keperluan: '',
    tujuan_pejabat: '',
    jumlah_pengikut: ''
  })
  const [photo, setPhoto] = useState(null)
  const [pejabatList, setPejabatList] = useState([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchPejabat()
  }, [])

  const fetchPejabat = async () => {
    console.log('Fetching pejabat list...')
    const { data, error } = await supabase
      .from('pejabat')
      .select('id_pejabat, nama, status')
      .order('nama')
    
    if (error) {
      console.error('Error fetching pejabat:', error)
      toast.error('Gagal memuat daftar pejabat. Pastikan tabel sudah dibuat.')
    } else {
      console.log('Pejabat loaded:', data?.length, 'records')
      setPejabatList(data || [])
      if (!data || data.length === 0) {
        toast.error('Belum ada data pejabat. Silakan tambahkan pejabat melalui admin dashboard.')
      }
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const uploadPhoto = async () => {
    if (!photo) return null

    try {
      console.log('=== UPLOAD PHOTO DEBUG ===')
      
      // Check if bucket exists first
      console.log('Checking if bucket exists...')
      const { data: bucketData, error: bucketError } = await supabase.storage.getBucket('guest-photos')
      
      if (bucketError) {
        console.error('Bucket check error:', bucketError)
        throw new Error(`Bucket 'guest-photos' tidak ditemukan. Silakan buat bucket terlebih dahulu.`)
      }
      
      console.log('Bucket exists:', bucketData)
      
      // Convert base64 to blob
      console.log('Converting photo to blob...')
      const base64Data = photo.split(',')[1]
      if (!base64Data) {
        throw new Error('Invalid photo format')
      }
      
      const byteCharacters = atob(base64Data)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: 'image/jpeg' })
      
      console.log('Blob created:', {
        size: blob.size,
        type: blob.type,
        sizeMB: (blob.size / 1024 / 1024).toFixed(2)
      })
      
      // Check file size (max 5MB)
      if (blob.size > 5 * 1024 * 1024) {
        throw new Error('Ukuran foto terlalu besar. Maksimal 5MB.')
      }

      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`
      console.log('Uploading file:', fileName)
      
      const { data, error } = await supabase.storage
        .from('guest-photos')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          upsert: false,
          cacheControl: '3600'
        })

      if (error) {
        console.error('Storage upload error details:', {
          message: error.message,
          statusCode: error.statusCode,
          error: error
        })
        
        if (error.statusCode === 400) {
          throw new Error('Format foto tidak valid atau bucket tidak dikonfigurasi dengan benar. Pastikan bucket bersifat PUBLIC.')
        }
        
        throw error
      }
      
      console.log('Upload successful:', data)

      const { data: { publicUrl } } = supabase.storage
        .from('guest-photos')
        .getPublicUrl(fileName)
      
      console.log('Public URL:', publicUrl)
      console.log('=== UPLOAD COMPLETE ===')

      return publicUrl
    } catch (error) {
      console.error('Error in uploadPhoto:', error)
      throw error
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!photo) {
      toast.error('Silakan ambil foto terlebih dahulu')
      return
    }

    setLoading(true)

    try {
      console.log('Starting photo upload...')
      const photoUrl = await uploadPhoto()
      
      if (!photoUrl) {
        toast.error('Gagal mengunggah foto. Pastikan storage bucket "guest-photos" sudah dibuat dan bersifat public.')
        setLoading(false)
        return
      }
      
      console.log('Photo uploaded successfully:', photoUrl)
      console.log('Inserting visitor data...')

      const insertData = {
        nama: formData.nama,
        asal: formData.asal,
        no_hp: formData.no_hp,
        keperluan: formData.keperluan,
        tujuan_pejabat: formData.tujuan_pejabat,
        foto_url: photoUrl,
        jumlah_pengikut: formData.jumlah_pengikut ? parseInt(formData.jumlah_pengikut) : null
      }
      
      console.log('Data to insert:', insertData)

      const { data, error } = await supabase.from('tamu').insert(insertData)

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      
      console.log('Insert successful:', data)

      toast.success('Data berhasil disimpan!')
      setSuccess(true)
      setTimeout(() => {
        setFormData({
          nama: '',
          asal: '',
          no_hp: '',
          keperluan: '',
          tujuan_pejabat: '',
          jumlah_pengikut: ''
        })
        setPhoto(null)
        setSuccess(false)
      }, 3000)
    } catch (error) {
      console.error('Full error object:', error)
      
      if (error.message) {
        console.error('Error message:', error.message)
      }
      
      if (error.code) {
        console.error('Error code:', error.code)
      }
      
      // Specific error messages
      if (error.message && error.message.includes('storage')) {
        toast.error('Gagal mengunggah foto. Pastikan storage bucket "guest-photos" sudah dibuat dan bersifat public.')
      } else if (error.code === '42P01') {
        toast.error('Tabel "tamu" belum dibuat. Silakan jalankan SQL schema di Supabase Dashboard terlebih dahulu.')
      } else if (error.code === '23503') {
        toast.error('Pejabat yang dipilih tidak valid. Silakan pilih pejabat lain.')
      } else if (error.message && error.message.includes('violates row-level security')) {
        toast.error('Permission denied. Silakan periksa RLS policies di Supabase.')
      } else if (error.message && error.message.includes('relation')) {
        toast.error('Database belum siap. Pastikan tabel sudah dibuat dengan menjalankan database_schema.sql')
      } else {
        toast.error(`Terjadi kesalahan: ${error.message || 'Unknown error'}`)
      }
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-12 pb-12">
            <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Terima Kasih!</h2>
            <p className="text-slate-600">Data Anda telah berhasil disimpan</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-6">
          <img 
            src="https://customer-assets.emergentagent.com/job_visitor-hub-15/artifacts/rpzl1xbx_logo-kejati.png" 
            alt="Logo Kejaksaan"
            className="w-24 h-24 mx-auto mb-4"
          />
          <h2 className="text-2xl font-bold text-emerald-800">Kejaksaan Tinggi Kalimantan Utara</h2>
        </div>
        <Card className="shadow-xl border-slate-200">
          <CardHeader className="bg-gradient-to-r from-emerald-700 to-emerald-600 text-white rounded-t-xl">
            <CardTitle className="text-3xl font-bold tracking-tight">Buku Tamu Digital</CardTitle>
            <CardDescription className="text-emerald-50">Silakan isi formulir di bawah ini</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="nama" className="text-sm font-medium text-slate-700">Nama Lengkap *</Label>
                <Input
                  id="nama"
                  data-testid="nama-input"
                  value={formData.nama}
                  onChange={(e) => handleInputChange('nama', e.target.value)}
                  required
                  className="h-12"
                  placeholder="Masukkan nama lengkap"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="asal" className="text-sm font-medium text-slate-700">Asal / Instansi *</Label>
                <Input
                  id="asal"
                  data-testid="asal-input"
                  value={formData.asal}
                  onChange={(e) => handleInputChange('asal', e.target.value)}
                  required
                  className="h-12"
                  placeholder="Nama instansi atau perusahaan"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="no_hp" className="text-sm font-medium text-slate-700">Nomor HP *</Label>
                <Input
                  id="no_hp"
                  data-testid="no-hp-input"
                  type="tel"
                  value={formData.no_hp}
                  onChange={(e) => handleInputChange('no_hp', e.target.value)}
                  required
                  className="h-12"
                  placeholder="08xxxxxxxxxx"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tujuan" className="text-sm font-medium text-slate-700">Tujuan Pejabat *</Label>
                <Select
                  value={formData.tujuan_pejabat}
                  onValueChange={(value) => handleInputChange('tujuan_pejabat', value)}
                  required
                >
                  <SelectTrigger className="h-12" data-testid="tujuan-select">
                    <SelectValue placeholder="Pilih pejabat yang dituju" />
                  </SelectTrigger>
                  <SelectContent>
                    {pejabatList.map((pejabat) => (
                      <SelectItem key={pejabat.id_pejabat} value={pejabat.id_pejabat}>
                        {pejabat.nama} {pejabat.status === 'di_tempat' ? '✓' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="keperluan" className="text-sm font-medium text-slate-700">Keperluan *</Label>
                <Textarea
                  id="keperluan"
                  data-testid="keperluan-textarea"
                  value={formData.keperluan}
                  onChange={(e) => handleInputChange('keperluan', e.target.value)}
                  required
                  className="min-h-24"
                  placeholder="Jelaskan keperluan kunjungan Anda"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="jumlah_pengikut" className="text-sm font-medium text-slate-700">Jumlah Pengikut (Opsional)</Label>
                <Input
                  id="jumlah_pengikut"
                  data-testid="jumlah-pengikut-input"
                  type="number"
                  min="0"
                  value={formData.jumlah_pengikut}
                  onChange={(e) => handleInputChange('jumlah_pengikut', e.target.value)}
                  className="h-12"
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Foto *</Label>
                <CameraCapture onCapture={setPhoto} />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-800 hover:to-emerald-700 text-white rounded-xl text-lg font-semibold shadow-lg shadow-emerald-700/30"
                data-testid="submit-button"
              >
                {loading ? 'Menyimpan...' : 'Kirim Data'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
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
    const { data, error } = await supabase
      .from('pejabat')
      .select('id_pejabat, nama, status')
      .order('nama')
    
    if (error) {
      console.error('Error fetching pejabat:', error)
    } else {
      setPejabatList(data || [])
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const uploadPhoto = async () => {
    if (!photo) return null

    const base64Data = photo.split(',')[1]
    const byteCharacters = atob(base64Data)
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: 'image/jpeg' })

    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`
    
    const { data, error } = await supabase.storage
      .from('guest-photos')
      .upload(fileName, blob, {
        contentType: 'image/jpeg',
        upsert: false
      })

    if (error) {
      console.error('Error uploading photo:', error)
      return null
    }

    const { data: { publicUrl } } = supabase.storage
      .from('guest-photos')
      .getPublicUrl(fileName)

    return publicUrl
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!photo) {
      toast.error('Silakan ambil foto terlebih dahulu')
      return
    }

    setLoading(true)

    try {
      const photoUrl = await uploadPhoto()
      
      if (!photoUrl) {
        toast.error('Gagal mengunggah foto')
        setLoading(false)
        return
      }

      const { error } = await supabase.from('tamu').insert({
        nama: formData.nama,
        asal: formData.asal,
        no_hp: formData.no_hp,
        keperluan: formData.keperluan,
        tujuan_pejabat: formData.tujuan_pejabat,
        foto_url: photoUrl,
        jumlah_pengikut: formData.jumlah_pengikut ? parseInt(formData.jumlah_pengikut) : null
      })

      if (error) throw error

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
      console.error('Error:', error)
      toast.error('Terjadi kesalahan saat menyimpan data')
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
        <Card className="shadow-xl border-slate-200">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-t-xl">
            <CardTitle className="text-3xl font-bold tracking-tight">Buku Tamu Digital</CardTitle>
            <CardDescription className="text-blue-50">Silakan isi formulir di bawah ini</CardDescription>
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
                className="w-full h-14 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-xl text-lg font-semibold shadow-lg"
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
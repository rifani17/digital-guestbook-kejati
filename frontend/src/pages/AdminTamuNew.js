import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate, Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Textarea } from '../components/ui/textarea'
import { ArrowLeft, Upload, X } from 'lucide-react'
import { toast } from 'sonner'

export const AdminTamuNew = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    nama: '',
    asal: '',
    no_hp: '',
    keperluan: '',
    tujuan_pejabat: '',
    jumlah_pengikut: ''
  })
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [pejabatList, setPejabatList] = useState([])
  const [loading, setLoading] = useState(false)

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
      toast.error('Gagal memuat data pejabat')
    } else {
      setPejabatList(data || [])
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Ukuran file maksimal 5MB')
        return
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error('File harus berupa gambar')
        return
      }

      setPhotoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const removePhoto = () => {
    setPhotoFile(null)
    setPhotoPreview(null)
  }

  const uploadPhoto = async () => {
    if (!photoFile) return null

    try {
      const fileExt = photoFile.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      
      const { data, error } = await supabase.storage
        .from('guest-photos')
        .upload(fileName, photoFile, {
          contentType: photoFile.type,
          upsert: false
        })

      if (error) {
        console.error('Storage upload error:', error)
        throw error
      }

      const { data: { publicUrl } } = supabase.storage
        .from('guest-photos')
        .getPublicUrl(fileName)

      return publicUrl
    } catch (error) {
      console.error('Error uploading photo:', error)
      return null
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      let photoUrl = null
      
      if (photoFile) {
        photoUrl = await uploadPhoto()
        if (!photoUrl) {
          toast.error('Gagal mengunggah foto, tetapi data akan tetap disimpan')
        }
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

      toast.success('Data tamu berhasil ditambahkan')
      navigate('/admin/dashboard')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Gagal menambahkan data tamu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="bg-gradient-to-r from-emerald-700 to-emerald-800 border-b border-emerald-900 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link to="/admin/dashboard">
              <Button variant="outline" className="h-10 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white" data-testid="back-button">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali
              </Button>
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-white">Tambah Tamu Manual</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-3xl">
        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Form Registrasi Tamu</CardTitle>
            <CardDescription>Input data tamu secara manual oleh admin</CardDescription>
          </CardHeader>
          <CardContent>
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
                  placeholder="Jelaskan keperluan kunjungan"
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
                <Label className="text-sm font-medium text-slate-700">Foto (Opsional)</Label>
                {!photoPreview ? (
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      id="photo-upload"
                      data-testid="photo-input"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                    <label htmlFor="photo-upload" className="cursor-pointer">
                      <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                      <p className="text-sm text-slate-600 mb-1">Klik untuk upload foto</p>
                      <p className="text-xs text-slate-500">JPG, PNG, atau JPEG (Maks. 5MB)</p>
                    </label>
                  </div>
                ) : (
                  <div className="relative">
                    <img src={photoPreview} alt="Preview" className="w-full h-64 object-cover rounded-xl" />
                    <Button
                      type="button"
                      onClick={removePhoto}
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      data-testid="remove-photo-button"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/admin/dashboard')}
                  className="flex-1 h-12"
                  data-testid="cancel-button"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 h-12 bg-blue-600 hover:bg-blue-700"
                  data-testid="submit-button"
                >
                  {loading ? 'Menyimpan...' : 'Simpan Data Tamu'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

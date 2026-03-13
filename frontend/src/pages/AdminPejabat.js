import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { ArrowLeft, Plus, Edit, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

export const AdminPejabat = () => {
  const [pejabatList, setPejabatList] = useState([])
  const [jabatanList, setJabatanList] = useState([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    nama: '',
    no_hp: '',
    id_jabatan: '',
    status: 'di_tempat'
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    await Promise.all([fetchPejabat(), fetchJabatan()])
  }

  const fetchPejabat = async () => {
    const { data, error } = await supabase
      .from('pejabat')
      .select(`
        *,
        jabatan:id_jabatan (nama_jabatan)
      `)
      .order('nama')

    if (error) {
      console.error('Error:', error)
      toast.error('Gagal memuat data pejabat')
    } else {
      setPejabatList(data || [])
    }
  }

  const fetchJabatan = async () => {
    const { data, error } = await supabase
      .from('jabatan')
      .select('*')
      .order('nama_jabatan')

    if (error) {
      console.error('Error:', error)
    } else {
      setJabatanList(data || [])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (editingId) {
      const { error } = await supabase
        .from('pejabat')
        .update(formData)
        .eq('id_pejabat', editingId)

      if (error) {
        toast.error('Gagal mengupdate pejabat')
      } else {
        toast.success('Pejabat berhasil diupdate')
      }
    } else {
      const { error } = await supabase
        .from('pejabat')
        .insert(formData)

      if (error) {
        toast.error('Gagal menambahkan pejabat')
      } else {
        toast.success('Pejabat berhasil ditambahkan')
      }
    }

    setIsDialogOpen(false)
    resetForm()
    fetchPejabat()
  }

  const handleEdit = (pejabat) => {
    setEditingId(pejabat.id_pejabat)
    setFormData({
      nama: pejabat.nama,
      no_hp: pejabat.no_hp,
      id_jabatan: pejabat.id_jabatan,
      status: pejabat.status
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus pejabat ini?')) return

    const { error } = await supabase
      .from('pejabat')
      .delete()
      .eq('id_pejabat', id)

    if (error) {
      toast.error('Gagal menghapus pejabat')
    } else {
      toast.success('Pejabat berhasil dihapus')
      fetchPejabat()
    }
  }

  const handleStatusChange = async (id, newStatus) => {
    const { error } = await supabase
      .from('pejabat')
      .update({ status: newStatus })
      .eq('id_pejabat', id)

    if (error) {
      toast.error('Gagal mengubah status')
    } else {
      toast.success('Status berhasil diubah')
      fetchPejabat()
    }
  }

  const resetForm = () => {
    setFormData({
      nama: '',
      no_hp: '',
      id_jabatan: '',
      status: 'di_tempat'
    })
    setEditingId(null)
  }

  const getStatusBadge = (status) => {
    const badges = {
      di_tempat: 'bg-green-100 text-green-800 border-green-200',
      rapat: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      dinas_luar: 'bg-red-100 text-red-800 border-red-200'
    }
    const labels = {
      di_tempat: 'Di Tempat',
      rapat: 'Rapat',
      dinas_luar: 'Dinas Luar'
    }
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${badges[status] || ''}`}>
        {labels[status] || status}
      </span>
    )
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
            <h1 className="text-2xl font-bold tracking-tight text-white">Kelola Pejabat</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl font-semibold">Data Pejabat</CardTitle>
                <CardDescription>Kelola data dan status pejabat</CardDescription>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={(open) => {
                setIsDialogOpen(open)
                if (!open) resetForm()
              }}>
                <DialogTrigger asChild>
                  <Button className="bg-emerald-700 hover:bg-emerald-800" data-testid="add-pejabat-button">
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Pejabat
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <form onSubmit={handleSubmit}>
                    <DialogHeader>
                      <DialogTitle>{editingId ? 'Edit Pejabat' : 'Tambah Pejabat'}</DialogTitle>
                      <DialogDescription>Isi data pejabat di bawah ini</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="nama">Nama Lengkap *</Label>
                        <Input
                          id="nama"
                          data-testid="nama-input"
                          value={formData.nama}
                          onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                          required
                          placeholder="Masukkan nama lengkap"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="no_hp">Nomor HP *</Label>
                        <Input
                          id="no_hp"
                          data-testid="no-hp-input"
                          value={formData.no_hp}
                          onChange={(e) => setFormData({ ...formData, no_hp: e.target.value })}
                          required
                          placeholder="08xxxxxxxxxx"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="jabatan">Jabatan *</Label>
                        <Select
                          value={formData.id_jabatan}
                          onValueChange={(value) => setFormData({ ...formData, id_jabatan: value })}
                          required
                        >
                          <SelectTrigger data-testid="jabatan-select">
                            <SelectValue placeholder="Pilih jabatan" />
                          </SelectTrigger>
                          <SelectContent>
                            {jabatanList.map((jabatan) => (
                              <SelectItem key={jabatan.id_jabatan} value={jabatan.id_jabatan}>
                                {jabatan.nama_jabatan}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="status">Status *</Label>
                        <Select
                          value={formData.status}
                          onValueChange={(value) => setFormData({ ...formData, status: value })}
                          required
                        >
                          <SelectTrigger data-testid="status-select">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="di_tempat">Di Tempat</SelectItem>
                            <SelectItem value="rapat">Rapat</SelectItem>
                            <SelectItem value="dinas_luar">Dinas Luar</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" data-testid="submit-button">
                        {editingId ? 'Update' : 'Simpan'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Jabatan</TableHead>
                    <TableHead>No. HP</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ubah Status</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pejabatList.map((pejabat) => (
                    <TableRow key={pejabat.id_pejabat}>
                      <TableCell className="font-medium">{pejabat.nama}</TableCell>
                      <TableCell>{pejabat.jabatan?.nama_jabatan || '-'}</TableCell>
                      <TableCell>{pejabat.no_hp}</TableCell>
                      <TableCell>{getStatusBadge(pejabat.status)}</TableCell>
                      <TableCell>
                        <Select
                          value={pejabat.status}
                          onValueChange={(value) => handleStatusChange(pejabat.id_pejabat, value)}
                        >
                          <SelectTrigger className="w-40" data-testid="status-change-select">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="di_tempat">Di Tempat</SelectItem>
                            <SelectItem value="rapat">Rapat</SelectItem>
                            <SelectItem value="dinas_luar">Dinas Luar</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(pejabat)}
                            data-testid="edit-button"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(pejabat.id_pejabat)}
                            data-testid="delete-button"
                            className="text-red-600 hover:text-red-700 hover:border-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
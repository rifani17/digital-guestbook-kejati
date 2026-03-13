import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { ArrowLeft, Plus, Edit, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

export const AdminJabatan = () => {
  const [jabatanList, setJabatanList] = useState([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({ nama_jabatan: '' })

  useEffect(() => {
    fetchJabatan()
  }, [])

  const fetchJabatan = async () => {
    const { data, error } = await supabase
      .from('jabatan')
      .select('*')
      .order('nama_jabatan')

    if (error) {
      console.error('Error:', error)
      toast.error('Gagal memuat data jabatan')
    } else {
      setJabatanList(data || [])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (editingId) {
      const { error } = await supabase
        .from('jabatan')
        .update(formData)
        .eq('id_jabatan', editingId)

      if (error) {
        toast.error('Gagal mengupdate jabatan')
      } else {
        toast.success('Jabatan berhasil diupdate')
      }
    } else {
      const { error } = await supabase
        .from('jabatan')
        .insert(formData)

      if (error) {
        toast.error('Gagal menambahkan jabatan')
      } else {
        toast.success('Jabatan berhasil ditambahkan')
      }
    }

    setIsDialogOpen(false)
    resetForm()
    fetchJabatan()
  }

  const handleEdit = (jabatan) => {
    setEditingId(jabatan.id_jabatan)
    setFormData({ nama_jabatan: jabatan.nama_jabatan })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus jabatan ini?')) return

    const { error } = await supabase
      .from('jabatan')
      .delete()
      .eq('id_jabatan', id)

    if (error) {
      if (error.code === '23503') {
        toast.error('Tidak dapat menghapus jabatan yang masih digunakan oleh pejabat')
      } else {
        toast.error('Gagal menghapus jabatan')
      }
    } else {
      toast.success('Jabatan berhasil dihapus')
      fetchJabatan()
    }
  }

  const resetForm = () => {
    setFormData({ nama_jabatan: '' })
    setEditingId(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link to="/admin/dashboard">
              <Button variant="outline" className="h-10" data-testid="back-button">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali
              </Button>
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Kelola Jabatan</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl font-semibold">Data Jabatan</CardTitle>
                <CardDescription>Kelola data jabatan pejabat</CardDescription>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={(open) => {
                setIsDialogOpen(open)
                if (!open) resetForm()
              }}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700" data-testid="add-jabatan-button">
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Jabatan
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <form onSubmit={handleSubmit}>
                    <DialogHeader>
                      <DialogTitle>{editingId ? 'Edit Jabatan' : 'Tambah Jabatan'}</DialogTitle>
                      <DialogDescription>Isi nama jabatan di bawah ini</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="nama_jabatan">Nama Jabatan *</Label>
                        <Input
                          id="nama_jabatan"
                          data-testid="nama-jabatan-input"
                          value={formData.nama_jabatan}
                          onChange={(e) => setFormData({ nama_jabatan: e.target.value })}
                          required
                          placeholder="Contoh: Kepala Bidang Hukum"
                        />
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
                    <TableHead>Nama Jabatan</TableHead>
                    <TableHead className="w-32">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jabatanList.map((jabatan) => (
                    <TableRow key={jabatan.id_jabatan}>
                      <TableCell className="font-medium">{jabatan.nama_jabatan}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(jabatan)}
                            data-testid="edit-button"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(jabatan.id_jabatan)}
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
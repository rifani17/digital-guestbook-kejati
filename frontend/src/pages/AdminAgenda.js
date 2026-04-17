import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchAgenda, createAgenda, updateAgenda, deleteAgenda } from '../lib/agendaService'
import { calculateStatus } from '../lib/agendaUtils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog'
import { ArrowLeft, Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

const initialFormData = {
  nama_agenda: '',
  tanggal_mulai: '',
  tanggal_akhir: '',
  waktu: '',
  tempat: ''
}

export const AdminAgenda = () => {
  const navigate = useNavigate()
  const [agendaList, setAgendaList] = useState([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState(initialFormData)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    loadAgenda()
  }, [])

  const loadAgenda = async () => {
    const { data, error } = await fetchAgenda()
    if (error) {
      console.error('Error:', error)
      toast.error('Gagal memuat data agenda')
    } else {
      setAgendaList(data || [])
    }
  }

  const resetForm = () => {
    setFormData(initialFormData)
    setEditingId(null)
  }

  const handleDeleteConfirm = (id) => {
    setDeletingId(id)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteExecute = async () => {
    const { error } = await deleteAgenda(deletingId)
    if (error) {
      console.error('Error:', error)
      toast.error('Gagal menghapus agenda')
    } else {
      toast.success('Agenda berhasil dihapus')
      loadAgenda()
    }
    setIsDeleteDialogOpen(false)
    setDeletingId(null)
  }

  const handleEdit = (agenda) => {
    setEditingId(agenda.id_agenda)
    setFormData({
      nama_agenda: agenda.nama_agenda,
      tanggal_mulai: agenda.tanggal_mulai,
      tanggal_akhir: agenda.tanggal_akhir,
      waktu: agenda.waktu || '',
      tempat: agenda.tempat || ''
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (editingId) {
      const { error } = await updateAgenda(editingId, formData)
      if (error) {
        console.error('Error:', error)
        toast.error('Gagal mengupdate agenda')
      } else {
        toast.success('Agenda berhasil diupdate')
        setIsDialogOpen(false)
        resetForm()
        loadAgenda()
      }
    } else {
      const { error } = await createAgenda(formData)
      if (error) {
        console.error('Error:', error)
        toast.error('Gagal menambahkan agenda')
      } else {
        toast.success('Agenda berhasil ditambahkan')
        setIsDialogOpen(false)
        resetForm()
        loadAgenda()
      }
    }
  }

  const isDateInvalid = formData.tanggal_akhir !== '' && formData.tanggal_mulai !== '' && formData.tanggal_akhir < formData.tanggal_mulai
  const isSubmitDisabled = formData.nama_agenda === '' || isDateInvalid

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="bg-gradient-to-r from-emerald-700 to-emerald-800 border-b border-emerald-900 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="h-10 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
              onClick={() => navigate('/admin/dashboard')}
              data-testid="back-button"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Button>
            <h1 className="text-2xl font-bold tracking-tight text-white">Manajemen Agenda</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl font-semibold">Data Agenda</CardTitle>
                <CardDescription>Kelola data agenda kegiatan kantor</CardDescription>
              </div>
              <Button
                className="bg-emerald-700 hover:bg-emerald-800"
                data-testid="add-agenda-button"
                onClick={() => {
                  setEditingId(null)
                  setFormData(initialFormData)
                  setIsDialogOpen(true)
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Tambah Agenda
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {agendaList.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-8" data-testid="empty-state">
                Belum ada agenda
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Agenda</TableHead>
                      <TableHead>Tanggal Mulai</TableHead>
                      <TableHead>Tanggal Akhir</TableHead>
                      <TableHead>Waktu</TableHead>
                      <TableHead>Tempat</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-28">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {agendaList.map((agenda) => {
                      const status = calculateStatus(agenda.tanggal_mulai, agenda.tanggal_akhir)
                      const badgeConfig = {
                        akan_datang: { cls: 'bg-yellow-100 text-yellow-800', label: 'Akan Datang' },
                        berjalan:    { cls: 'bg-green-100 text-green-800',  label: 'Berjalan' },
                        selesai:     { cls: 'bg-slate-100 text-slate-600',  label: 'Selesai' },
                      }[status]

                      return (
                        <TableRow key={agenda.id_agenda}>
                          <TableCell className="font-medium">{agenda.nama_agenda}</TableCell>
                          <TableCell>{agenda.tanggal_mulai}</TableCell>
                          <TableCell>{agenda.tanggal_akhir}</TableCell>
                          <TableCell>{agenda.waktu || '-'}</TableCell>
                          <TableCell>{agenda.tempat || '-'}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeConfig.cls}`} data-testid="status-badge">
                              {badgeConfig.label}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                data-testid="edit-button"
                                onClick={() => handleEdit(agenda)}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                data-testid="delete-button"
                                className="text-red-600 hover:text-red-700 hover:border-red-300"
                                onClick={() => handleDeleteConfirm(agenda.id_agenda)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogContent className="sm:max-w-md">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit Agenda' : 'Tambah Agenda'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="nama_agenda">Nama Agenda *</Label>
                  <Input
                    id="nama_agenda"
                    type="text"
                    value={formData.nama_agenda}
                    onChange={(e) => setFormData({ ...formData, nama_agenda: e.target.value })}
                    required
                    placeholder="Nama kegiatan"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tanggal_mulai">Tanggal Mulai *</Label>
                  <Input
                    id="tanggal_mulai"
                    type="date"
                    value={formData.tanggal_mulai}
                    onChange={(e) => setFormData({ ...formData, tanggal_mulai: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tanggal_akhir">Tanggal Akhir *</Label>
                  <Input
                    id="tanggal_akhir"
                    type="date"
                    value={formData.tanggal_akhir}
                    onChange={(e) => setFormData({ ...formData, tanggal_akhir: e.target.value })}
                    required
                  />
                  {isDateInvalid && (
                    <p className="text-sm text-red-600" data-testid="date-validation-error">
                      Tanggal akhir tidak boleh sebelum tanggal mulai
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="waktu">Waktu</Label>
                  <Input
                    id="waktu"
                    type="time"
                    value={formData.waktu}
                    onChange={(e) => setFormData({ ...formData, waktu: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tempat">Tempat</Label>
                  <Input
                    id="tempat"
                    type="text"
                    value={formData.tempat}
                    onChange={(e) => setFormData({ ...formData, tempat: e.target.value })}
                    placeholder="Lokasi kegiatan"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false)
                    resetForm()
                  }}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={isSubmitDisabled} data-testid="submit-button">
                  {editingId ? 'Update' : 'Simpan'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus Agenda</AlertDialogTitle>
              <AlertDialogDescription>
                Apakah Anda yakin ingin menghapus agenda ini? Tindakan ini tidak dapat dibatalkan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteExecute}>Hapus</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}

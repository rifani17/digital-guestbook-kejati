import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu'
import { Users, Calendar, LogOut, UserCog, Briefcase, UserPlus, Menu, UserCheck, TrendingUp, Edit, Trash2 } from 'lucide-react'
import { format, subDays, startOfDay, startOfMonth } from 'date-fns'
import { id } from 'date-fns/locale'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { toast } from 'sonner'

export const AdminDashboard = () => {
  const [visitors, setVisitors] = useState([])
  const [stats, setStats] = useState({ today: 0, thisMonth: 0, presentOfficials: 0 })
  const [pejabatStatus, setPejabatStatus] = useState([])
  const [chartData, setChartData] = useState([])
  const [chartFilter, setChartFilter] = useState('today')
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingVisitor, setEditingVisitor] = useState(null)
  const [editFormData, setEditFormData] = useState({
    nama: '',
    asal: '',
    no_hp: '',
    keperluan: '',
    tujuan_pejabat: '',
    jumlah_pengikut: ''
  })
  const { signOut } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchData()
    const subscription = supabase
      .channel('tamu_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tamu' }, fetchData)
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    fetchChartData()
  }, [chartFilter])

  const fetchData = async () => {
    await Promise.all([fetchVisitors(), fetchStats(), fetchPejabatStatus()])
  }

  const fetchVisitors = async () => {
    const { data, error } = await supabase
      .from('tamu')
      .select(`
        *,
        pejabat:tujuan_pejabat (
          nama,
          no_hp
        )
      `)
      .order('tanggal', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error fetching visitors:', error)
    } else {
      setVisitors(data || [])
    }
  }

  const fetchStats = async () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    const { data: todayData } = await supabase
      .from('tamu')
      .select('id_tamu', { count: 'exact' })
      .gte('tanggal', today.toISOString())

    const { data: monthData } = await supabase
      .from('tamu')
      .select('id_tamu', { count: 'exact' })
      .gte('tanggal', firstDayOfMonth.toISOString())

    const { data: presentOfficials } = await supabase
      .from('pejabat')
      .select('id_pejabat', { count: 'exact' })
      .eq('status', 'di_tempat')

    setStats({
      today: todayData?.length || 0,
      thisMonth: monthData?.length || 0,
      presentOfficials: presentOfficials?.length || 0
    })
  }

  const fetchPejabatStatus = async () => {
    const { data, error } = await supabase
      .from('pejabat')
      .select(`
        *,
        jabatan:id_jabatan (nama_jabatan)
      `)
      .order('nama')

    if (error) {
      console.error('Error fetching pejabat:', error)
    } else {
      setPejabatStatus(data || [])
    }
  }

  const fetchChartData = async () => {
    let startDate
    const now = new Date()
    
    if (chartFilter === 'today') {
      startDate = startOfDay(now)
    } else if (chartFilter === 'week') {
      startDate = startOfDay(subDays(now, 6))
    } else if (chartFilter === 'month') {
      startDate = startOfMonth(now)
    }

    const { data, error } = await supabase
      .from('tamu')
      .select('tanggal')
      .gte('tanggal', startDate.toISOString())
      .order('tanggal', { ascending: true })

    if (error) {
      console.error('Error fetching chart data:', error)
      return
    }

    const processedData = processChartData(data, startDate)
    setChartData(processedData)
  }

  const processChartData = (data, startDate) => {
    if (chartFilter === 'today') {
      const hours = Array.from({ length: 24 }, (_, i) => ({
        label: `${i.toString().padStart(2, '0')}:00`,
        value: 0
      }))
      
      data.forEach(visitor => {
        const hour = new Date(visitor.tanggal).getHours()
        hours[hour].value++
      })
      
      const nonZeroHours = hours.filter((h, i) => 
        h.value > 0 || 
        (i > 0 && hours[i - 1].value > 0) || 
        (i < 23 && hours[i + 1].value > 0)
      )
      
      return nonZeroHours.length > 0 ? nonZeroHours : hours.slice(8, 17)
    } else {
      const days = []
      const dayCount = chartFilter === 'week' ? 7 : 30
      
      for (let i = 0; i < dayCount; i++) {
        const date = new Date(startDate)
        date.setDate(date.getDate() + i)
        days.push({
          label: format(date, 'dd MMM', { locale: id }),
          value: 0,
          fullDate: format(date, 'yyyy-MM-dd')
        })
      }
      
      data.forEach(visitor => {
        const date = format(new Date(visitor.tanggal), 'yyyy-MM-dd')
        const dayIndex = days.findIndex(d => d.fullDate === date)
        if (dayIndex !== -1) {
          days[dayIndex].value++
        }
      })
      
      return days
    }
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
          <p className="text-sm font-semibold text-slate-900">{payload[0].payload.label}</p>
          <p className="text-sm text-emerald-600">{payload[0].value} pengunjung</p>
        </div>
      )
    }
    return null
  }


  const handleLogout = async () => {
    await signOut()
    navigate('/admin/login')
  }

  const sendWhatsApp = (visitor) => {
    if (!visitor.pejabat?.no_hp) return

    const message = `Halo Bapak/Ibu ${visitor.pejabat.nama}

Ada tamu yang ingin bertemu.

Nama: ${visitor.nama}
Asal: ${visitor.asal}
Keperluan: ${visitor.keperluan}

Silakan menuju resepsionis.`

    const encodedMessage = encodeURIComponent(message)
    const phone = visitor.pejabat.no_hp.replace(/^0/, '62')
    window.open(`https://wa.me/${phone}?text=${encodedMessage}`, '_blank')
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

  const handleEditVisitor = (visitor) => {
    setEditingVisitor(visitor)
    setEditFormData({
      nama: visitor.nama,
      asal: visitor.asal,
      no_hp: visitor.no_hp,
      keperluan: visitor.keperluan,
      tujuan_pejabat: visitor.tujuan_pejabat,
      jumlah_pengikut: visitor.jumlah_pengikut || ''
    })
    setEditDialogOpen(true)
  }

  const handleUpdateVisitor = async () => {
    if (!editingVisitor) return

    try {
      const { error } = await supabase
        .from('tamu')
        .update({
          nama: editFormData.nama,
          asal: editFormData.asal,
          no_hp: editFormData.no_hp,
          keperluan: editFormData.keperluan,
          tujuan_pejabat: editFormData.tujuan_pejabat,
          jumlah_pengikut: editFormData.jumlah_pengikut ? parseInt(editFormData.jumlah_pengikut) : null
        })
        .eq('id_tamu', editingVisitor.id_tamu)

      if (error) throw error

      toast.success('Data tamu berhasil diupdate')
      setEditDialogOpen(false)
      setEditingVisitor(null)
      fetchVisitors()
    } catch (error) {
      console.error('Error updating visitor:', error)
      toast.error('Gagal mengupdate data tamu')
    }
  }

  const handleDeleteVisitor = async (visitorId, visitorName) => {
    if (!window.confirm(`Yakin ingin menghapus data tamu "${visitorName}"?`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('tamu')
        .delete()
        .eq('id_tamu', visitorId)

      if (error) throw error

      toast.success('Data tamu berhasil dihapus')
      fetchVisitors()
      fetchStats() // Update stats after delete
    } catch (error) {
      console.error('Error deleting visitor:', error)
      toast.error('Gagal menghapus data tamu')
    }
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="bg-gradient-to-r from-emerald-700 to-emerald-800 border-b border-emerald-900 shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src="https://customer-assets.emergentagent.com/job_visitor-hub-15/artifacts/rpzl1xbx_logo-kejati.png" 
                alt="Logo Kejaksaan"
                className="w-12 h-12"
              />
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white">Dashboard Admin</h1>
                <p className="text-sm text-emerald-100">Kejaksaan Tinggi Kalimantan Utara</p>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex gap-3">
              <Link to="/admin/tamu/new">
                <Button className="h-10 bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold shadow-lg" data-testid="tambah-tamu-button">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Tambah Tamu
                </Button>
              </Link>
              <Link to="/admin/pejabat">
                <Button variant="outline" className="h-10 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white" data-testid="pejabat-link">
                  <UserCog className="w-4 h-4 mr-2" />
                  Kelola Pejabat
                </Button>
              </Link>
              <Link to="/admin/jabatan">
                <Button variant="outline" className="h-10 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white" data-testid="jabatan-link">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Kelola Jabatan
                </Button>
              </Link>
              <Button onClick={handleLogout} variant="outline" className="h-10 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white" data-testid="logout-button">
                <LogOut className="w-4 h-4 mr-2" />
                Keluar
              </Button>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="h-10 w-10 bg-white/10 border-white/20 text-white hover:bg-white/20" data-testid="mobile-menu-button">
                    <Menu className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link to="/admin/tamu/new" className="flex items-center cursor-pointer">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Tambah Tamu
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/admin/pejabat" className="flex items-center cursor-pointer">
                      <UserCog className="w-4 h-4 mr-2" />
                      Kelola Pejabat
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/admin/jabatan" className="flex items-center cursor-pointer">
                      <Briefcase className="w-4 h-4 mr-2" />
                      Kelola Jabatan
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    Keluar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="pb-3">
              <CardDescription className="text-sm uppercase tracking-wider text-slate-500">Pengunjung Hari Ini</CardDescription>
              <CardTitle className="text-4xl font-bold text-slate-900">{stats.today}</CardTitle>
            </CardHeader>
            <CardContent>
              <Users className="w-8 h-8 text-emerald-600" />
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200">
            <CardHeader className="pb-3">
              <CardDescription className="text-sm uppercase tracking-wider text-slate-500">Bulan Ini</CardDescription>
              <CardTitle className="text-4xl font-bold text-slate-900">{stats.thisMonth}</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar className="w-8 h-8 text-emerald-600" />
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200">
            <CardHeader className="pb-3">
              <CardDescription className="text-sm uppercase tracking-wider text-slate-500">Pejabat di Tempat</CardDescription>
              <CardTitle className="text-4xl font-bold text-slate-900">{stats.presentOfficials}</CardTitle>
            </CardHeader>
            <CardContent>
              <UserCheck className="w-8 h-8 text-emerald-600" />
            </CardContent>
          </Card>
        </div>

        {/* Visitor Chart */}
        <Card className="shadow-sm border-slate-200 mb-8">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  Statistik Kunjungan
                </CardTitle>
                <CardDescription>Grafik jumlah pengunjung</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={chartFilter === 'today' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartFilter('today')}
                  className={chartFilter === 'today' ? 'bg-emerald-700 hover:bg-emerald-800' : ''}
                >
                  Hari Ini
                </Button>
                <Button
                  variant={chartFilter === 'week' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartFilter('week')}
                  className={chartFilter === 'week' ? 'bg-emerald-700 hover:bg-emerald-800' : ''}
                >
                  7 Hari
                </Button>
                <Button
                  variant={chartFilter === 'month' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartFilter('month')}
                  className={chartFilter === 'month' ? 'bg-emerald-700 hover:bg-emerald-800' : ''}
                >
                  Bulan Ini
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="label" 
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    angle={chartFilter === 'month' ? -45 : 0}
                    textAnchor={chartFilter === 'month' ? 'end' : 'middle'}
                    height={chartFilter === 'month' ? 80 : 30}
                  />
                  <YAxis 
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.value > 0 ? '#059669' : '#e2e8f0'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pejabat Status */}
        <Card className="shadow-sm border-slate-200 mb-8">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Status Ketersediaan Pejabat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pejabatStatus.map((pejabat) => (
                <div key={pejabat.id_pejabat} className="p-4 border border-slate-200 rounded-lg">
                  <h4 className="font-semibold text-slate-900 mb-1">{pejabat.nama}</h4>
                  <p className="text-sm text-slate-500 mb-2">{pejabat.jabatan?.nama_jabatan || '-'}</p>
                  {getStatusBadge(pejabat.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Data Pengunjung</CardTitle>
            <CardDescription>Riwayat pengunjung terbaru</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Waktu</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Asal</TableHead>
                    <TableHead>Pejabat Dituju</TableHead>
                    <TableHead>Keperluan</TableHead>
                    <TableHead>Foto</TableHead>
                    <TableHead>Foto KTP</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visitors.map((visitor) => (
                    <TableRow key={visitor.id_tamu}>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(visitor.tanggal), 'dd MMM yyyy HH:mm', { locale: id })}
                      </TableCell>
                      <TableCell className="font-medium">{visitor.nama}</TableCell>
                      <TableCell>{visitor.asal}</TableCell>
                      <TableCell>{visitor.pejabat?.nama || '-'}</TableCell>
                      <TableCell className="max-w-xs truncate">{visitor.keperluan}</TableCell>
                      <TableCell>
                        {visitor.foto_url && (
                          <img src={visitor.foto_url} alt={visitor.nama} className="w-12 h-12 rounded-lg object-cover" />
                        )}
                      </TableCell>
                      <TableCell>
                        {visitor.foto_ktp_url && (
                          <img src={visitor.foto_ktp_url} alt={`KTP ${visitor.nama}`} className="w-12 h-12 rounded-lg object-cover" />
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleEditVisitor(visitor)}
                            variant="outline"
                            size="sm"
                            className="h-9"
                            data-testid="edit-visitor-button"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleDeleteVisitor(visitor.id_tamu, visitor.nama)}
                            variant="outline"
                            size="sm"
                            className="h-9 text-red-600 hover:text-red-700 hover:border-red-300"
                            data-testid="delete-visitor-button"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Hapus
                          </Button>
                          <Button
                            onClick={() => sendWhatsApp(visitor)}
                            size="sm"
                            className="bg-emerald-500 hover:bg-emerald-600 text-white h-9"
                            data-testid="whatsapp-button"
                          >
                            WhatsApp
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

        {/* Edit Visitor Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Data Tamu</DialogTitle>
              <DialogDescription>
                Update informasi pengunjung
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-nama">Nama Lengkap</Label>
                <Input
                  id="edit-nama"
                  value={editFormData.nama}
                  onChange={(e) => setEditFormData({ ...editFormData, nama: e.target.value })}
                  placeholder="Nama lengkap"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-asal">Asal / Instansi</Label>
                <Input
                  id="edit-asal"
                  value={editFormData.asal}
                  onChange={(e) => setEditFormData({ ...editFormData, asal: e.target.value })}
                  placeholder="Asal instansi"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-no-hp">Nomor HP</Label>
                <Input
                  id="edit-no-hp"
                  value={editFormData.no_hp}
                  onChange={(e) => setEditFormData({ ...editFormData, no_hp: e.target.value })}
                  placeholder="08xxxxxxxxxx"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-tujuan">Tujuan Pejabat</Label>
                <Select
                  value={editFormData.tujuan_pejabat}
                  onValueChange={(value) => setEditFormData({ ...editFormData, tujuan_pejabat: value })}
                >
                  <SelectTrigger id="edit-tujuan">
                    <SelectValue placeholder="Pilih pejabat" />
                  </SelectTrigger>
                  <SelectContent>
                    {pejabatStatus.map((pejabat) => (
                      <SelectItem key={pejabat.id_pejabat} value={pejabat.id_pejabat}>
                        {pejabat.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-keperluan">Keperluan</Label>
                <Textarea
                  id="edit-keperluan"
                  value={editFormData.keperluan}
                  onChange={(e) => setEditFormData({ ...editFormData, keperluan: e.target.value })}
                  placeholder="Keperluan kunjungan"
                  className="min-h-20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-jumlah">Jumlah Pengikut</Label>
                <Input
                  id="edit-jumlah"
                  type="number"
                  min="0"
                  value={editFormData.jumlah_pengikut}
                  onChange={(e) => setEditFormData({ ...editFormData, jumlah_pengikut: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
              >
                Batal
              </Button>
              <Button
                onClick={handleUpdateVisitor}
                className="bg-emerald-700 hover:bg-emerald-800"
              >
                Simpan Perubahan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
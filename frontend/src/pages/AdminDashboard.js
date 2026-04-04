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
import { Users, Calendar, LogOut, UserCog, Briefcase, UserPlus, Menu, UserCheck, TrendingUp, Edit, Trash2, Eye, Search } from 'lucide-react'
import { format, subDays, startOfDay, startOfMonth } from 'date-fns'
import { id } from 'date-fns/locale'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { toast } from 'sonner'

// Helper function to format date in local timezone
const formatLocalTime = (dateString, formatType = 'short') => {
  try {
    // Supabase returns UTC time without 'Z', so we need to append it
    const utcDateString = dateString.endsWith('Z') ? dateString : dateString + 'Z'
    const date = new Date(utcDateString)
    
    if (formatType === 'short') {
      // Format: 14 Mar 2026 16:20
      return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    } else {
      // Format: 14 Maret 2026, 16:20
      return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    }
  } catch (error) {
    console.error('Error formatting date:', error)
    return dateString
  }
}

export const AdminDashboard = () => {
  const [visitors, setVisitors] = useState([])
  const [stats, setStats] = useState({ today: 0, thisMonth: 0, presentOfficials: 0 })
  const [pejabatStatus, setPejabatStatus] = useState([])
  const [pejabatSearchTerm, setPejabatSearchTerm] = useState('')
  const [pejabatDialogOpen, setPejabatDialogOpen] = useState(false)
  const [selectedPejabat, setSelectedPejabat] = useState(null)
  const [chartData, setChartData] = useState([])
  const [chartFilter, setChartFilter] = useState('today')
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false)
  const [previewingVisitor, setPreviewingVisitor] = useState(null)
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
        const utcDateString = visitor.tanggal.endsWith('Z') ? visitor.tanggal : visitor.tanggal + 'Z'
        const hour = new Date(utcDateString).getHours()
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
        const utcDateString = visitor.tanggal.endsWith('Z') ? visitor.tanggal : visitor.tanggal + 'Z'
        const date = format(new Date(utcDateString), 'yyyy-MM-dd')
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

    const message = `Selamat pagi Bapak/Ibu ${visitor.pejabat.nama}

Ada tamu yang ingin bertemu.

Nama: ${visitor.nama}
Asal: ${visitor.asal}
Keperluan: ${visitor.keperluan}

Mohon arahan.`

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

  const handlePreviewVisitor = (visitor) => {
    setPreviewingVisitor(visitor)
    setPreviewDialogOpen(true)
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

  const handleDeleteVisitor = async (visitorObj) => {
    if (!window.confirm(`Yakin ingin menghapus data tamu "${visitorObj.nama}"?`)) {
      return
    }

    try {
      // 1. Fetch latest visitor data to get the correct photo URLs
      const { data: currentVisitor, error: fetchError } = await supabase
        .from('tamu')
        .select('foto_url, foto_ktp_url')
        .eq('id_tamu', visitorObj.id_tamu)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching visitor for deletion:', fetchError)
        throw fetchError
      }

      const fotoUrl = currentVisitor?.foto_url
      const fotoKtpUrl = currentVisitor?.foto_ktp_url

      // Helper to extract bucket path from URL or filename
      const extractFileName = (url) => url ? url.split('/').pop().split('?')[0] : null

      // 2. Delete visitor photo
      if (fotoUrl) {
        const fotoFileName = extractFileName(fotoUrl)
        if (fotoFileName) {
          const { error: removeError } = await supabase.storage
            .from('guest-photos')
            .remove([fotoFileName])
            
          if (removeError) {
            console.error('Error deleting visitor photo:', removeError)
          } else {
            console.log('Foto pengunjung dihapus:', fotoFileName)
          }
        }
      }

      // 3. Delete KTP photo
      if (fotoKtpUrl) {
        const ktpFileName = extractFileName(fotoKtpUrl)
        if (ktpFileName) {
          const { error: removeError } = await supabase.storage
            .from('ktp-photos')
            .remove([ktpFileName])
            
          if (removeError) {
            console.error('Error deleting KTP photo:', removeError)
          } else {
            console.log('Foto KTP dihapus:', ktpFileName)
          }
        }
      }

      // 4. Delete visitor record from database
      const { error: deleteError } = await supabase
        .from('tamu')
        .delete()
        .eq('id_tamu', visitorObj.id_tamu)

      if (deleteError) throw deleteError

      toast.success('Data tamu dan foto berhasil dihapus')
      fetchVisitors()
      fetchStats() // Update stats after delete
    } catch (error) {
      console.error('Error deleting visitor:', error)
      toast.error('Gagal menghapus data tamu')
    }
  }

  const handleUpdatePejabatStatus = async (newStatus) => {
    if (!selectedPejabat) return

    try {
      const { error } = await supabase
        .from('pejabat')
        .update({ status: newStatus })
        .eq('id_pejabat', selectedPejabat.id_pejabat)

      if (error) throw error

      toast.success('Status pejabat berhasil diupdate')
      setSelectedPejabat({ ...selectedPejabat, status: newStatus })
      fetchPejabatStatus()
      fetchStats()
    } catch (error) {
      console.error('Error updating pejabat status:', error)
      toast.error('Gagal mengupdate status pejabat')
    }
  }

  const filteredPejabatStatus = pejabatStatus.filter((pejabat) =>
    pejabat.nama.toLowerCase().includes(pejabatSearchTerm.toLowerCase())
  )

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
              <Link to="/form">
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
                    <Link to="/form" className="flex items-center cursor-pointer">
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
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-xl font-semibold">Status Ketersediaan Pejabat</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <Input
                type="text"
                placeholder="Cari Nama Pejabat..."
                className="pl-9"
                value={pejabatSearchTerm}
                onChange={(e) => setPejabatSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPejabatStatus.length > 0 ? (
                filteredPejabatStatus.map((pejabat) => (
                  <div 
                    key={pejabat.id_pejabat} 
                    className="p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => {
                      setSelectedPejabat(pejabat)
                      setPejabatDialogOpen(true)
                    }}
                  >
                    <h4 className="font-semibold text-slate-900 mb-1">{pejabat.nama}</h4>
                    <p className="text-sm text-slate-500 mb-2">{pejabat.jabatan?.nama_jabatan || '-'}</p>
                    {getStatusBadge(pejabat.status)}
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-slate-500">
                  Tidak ada data pejabat yang cocok.
                </div>
              )}
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
                        {formatLocalTime(visitor.tanggal, 'short')}
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
                            onClick={() => handlePreviewVisitor(visitor)}
                            variant="outline"
                            size="sm"
                            className="h-9"
                            data-testid="preview-visitor-button"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Preview
                          </Button>
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
                            onClick={() => handleDeleteVisitor(visitor)}
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

        {/* Preview Visitor Dialog */}
        <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">Detail Tamu</DialogTitle>
              <DialogDescription>
                Informasi lengkap pengunjung
              </DialogDescription>
            </DialogHeader>
            {previewingVisitor && (
              <div className="space-y-6 py-4">
                {/* Photos Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-600">Foto Pengunjung</Label>
                    {previewingVisitor.foto_url ? (
                      <img 
                        src={previewingVisitor.foto_url} 
                        alt={previewingVisitor.nama}
                        className="w-full h-48 object-cover rounded-lg border border-slate-200"
                      />
                    ) : (
                      <div className="w-full h-48 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200">
                        <span className="text-slate-400 text-sm">Tidak ada foto</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-600">Foto KTP</Label>
                    {previewingVisitor.foto_ktp_url ? (
                      <img 
                        src={previewingVisitor.foto_ktp_url} 
                        alt={`KTP ${previewingVisitor.nama}`}
                        className="w-full h-48 object-cover rounded-lg border border-slate-200"
                      />
                    ) : (
                      <div className="w-full h-48 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200">
                        <span className="text-slate-400 text-sm">Tidak ada foto KTP</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Info Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Nama Lengkap</Label>
                    <p className="text-base font-semibold text-slate-900">{previewingVisitor.nama}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Waktu Kunjungan</Label>
                    <p className="text-base text-slate-900">
                      {formatLocalTime(previewingVisitor.tanggal, 'long')}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Asal / Instansi</Label>
                    <p className="text-base text-slate-900">{previewingVisitor.asal}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Nomor HP</Label>
                    <p className="text-base text-slate-900">{previewingVisitor.no_hp}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tujuan Pejabat</Label>
                    <p className="text-base text-slate-900">{previewingVisitor.pejabat?.nama || '-'}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Jumlah Pengikut</Label>
                    <p className="text-base text-slate-900">{previewingVisitor.jumlah_pengikut || '0'} orang</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Keperluan</Label>
                  <p className="text-base text-slate-900 bg-slate-50 p-3 rounded-lg">{previewingVisitor.keperluan}</p>
                </div>
              </div>
            )}
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => setPreviewDialogOpen(false)}
              >
                Tutup
              </Button>
              <Button
                onClick={() => sendWhatsApp(previewingVisitor)}
                className="bg-green-600 hover:bg-green-700"
                disabled={!previewingVisitor?.pejabat?.no_hp}
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </Button>
              <Button
                onClick={() => {
                  setPreviewDialogOpen(false)
                  handleEditVisitor(previewingVisitor)
                }}
                className="bg-emerald-700 hover:bg-emerald-800"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Data
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Pejabat Status Dialog */}
        <Dialog open={pejabatDialogOpen} onOpenChange={setPejabatDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Detail Pejabat</DialogTitle>
              <DialogDescription>
                Informasi dan update status ketersediaan pejabat
              </DialogDescription>
            </DialogHeader>
            {selectedPejabat && (
              <div className="space-y-4 py-4">
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Nama Pejabat</Label>
                  <p className="text-base font-semibold text-slate-900">{selectedPejabat.nama}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Jabatan</Label>
                  <p className="text-base text-slate-900">{selectedPejabat.jabatan?.nama_jabatan || '-'}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Nomor HP</Label>
                  <p className="text-base text-slate-900">{selectedPejabat.no_hp || '-'}</p>
                </div>
                
                <div className="space-y-2 pt-4 border-t border-slate-100">
                  <Label className="text-sm font-medium text-slate-900">Ubah Status</Label>
                  <Select
                    value={selectedPejabat.status}
                    onValueChange={(value) => handleUpdatePejabatStatus(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="di_tempat">Di Tempat</SelectItem>
                      <SelectItem value="rapat">Rapat</SelectItem>
                      <SelectItem value="dinas_luar">Dinas Luar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setPejabatDialogOpen(false)}
              >
                Tutup
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
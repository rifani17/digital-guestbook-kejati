import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import { Users, Calendar, LogOut, UserCog, Briefcase } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

export const AdminDashboard = () => {
  const [visitors, setVisitors] = useState([])
  const [stats, setStats] = useState({ today: 0, thisMonth: 0 })
  const [pejabatStatus, setPejabatStatus] = useState([])
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

    setStats({
      today: todayData?.length || 0,
      thisMonth: monthData?.length || 0
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard Admin</h1>
          <div className="flex gap-3">
            <Link to="/admin/pejabat">
              <Button variant="outline" className="h-10" data-testid="pejabat-link">
                <UserCog className="w-4 h-4 mr-2" />
                Kelola Pejabat
              </Button>
            </Link>
            <Link to="/admin/jabatan">
              <Button variant="outline" className="h-10" data-testid="jabatan-link">
                <Briefcase className="w-4 h-4 mr-2" />
                Kelola Jabatan
              </Button>
            </Link>
            <Button onClick={handleLogout} variant="outline" className="h-10" data-testid="logout-button">
              <LogOut className="w-4 h-4 mr-2" />
              Keluar
            </Button>
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
              <Users className="w-8 h-8 text-blue-500" />
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200">
            <CardHeader className="pb-3">
              <CardDescription className="text-sm uppercase tracking-wider text-slate-500">Bulan Ini</CardDescription>
              <CardTitle className="text-4xl font-bold text-slate-900">{stats.thisMonth}</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar className="w-8 h-8 text-blue-500" />
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200">
            <CardHeader className="pb-3">
              <CardDescription className="text-sm uppercase tracking-wider text-slate-500">Status Pejabat</CardDescription>
              <CardTitle className="text-4xl font-bold text-slate-900">{pejabatStatus.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <UserCog className="w-8 h-8 text-blue-500" />
            </CardContent>
          </Card>
        </div>

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
                        <Button
                          onClick={() => sendWhatsApp(visitor)}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white h-10 px-4 rounded-full"
                          data-testid="whatsapp-button"
                        >
                          Kirim WhatsApp
                        </Button>
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
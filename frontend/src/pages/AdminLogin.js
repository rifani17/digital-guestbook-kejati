import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { LogIn } from 'lucide-react'
import { toast } from 'sonner'

export const AdminLogin = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await signIn(email, password)
      
      if (error) {
        toast.error('Email atau password salah')
      } else {
        toast.success('Login berhasil')
        navigate('/admin/dashboard')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl flex rounded-2xl overflow-hidden shadow-2xl bg-white">
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-700 to-emerald-900 relative">
          <div className="relative z-10 p-12 flex flex-col items-center justify-center text-white w-full">
            <img 
              src="https://customer-assets.emergentagent.com/job_visitor-hub-15/artifacts/rpzl1xbx_logo-kejati.png" 
              alt="Logo Kejaksaan"
              className="w-48 h-48 mb-8 drop-shadow-2xl"
            />
            <h1 className="text-4xl font-bold tracking-tight mb-3 text-center">Buku Tamu Digital</h1>
            <h2 className="text-2xl font-semibold mb-4 text-center text-amber-300">Kejaksaan Tinggi</h2>
            <h2 className="text-2xl font-semibold text-center text-amber-300">Kalimantan Utara</h2>
            <div className="mt-8 w-24 h-1 bg-amber-400 rounded-full"></div>
            <p className="text-lg text-emerald-100 mt-6 text-center">Sistem Manajemen Pengunjung Profesional</p>
          </div>
        </div>
        
        <div className="w-full lg:w-1/2 bg-white p-8 lg:p-12 flex items-center">
          <Card className="w-full border-0 shadow-none">
            <CardHeader className="space-y-1 text-center lg:text-left">
              <div className="lg:hidden flex flex-col items-center mb-6">
                <img 
                  src="https://customer-assets.emergentagent.com/job_visitor-hub-15/artifacts/rpzl1xbx_logo-kejati.png" 
                  alt="Logo Kejaksaan"
                  className="w-32 h-32 mb-4"
                />
                <h2 className="text-xl font-bold text-emerald-800">Kejaksaan Tinggi Kalimantan Utara</h2>
              </div>
              <CardTitle className="text-3xl font-bold tracking-tight text-slate-900">Login Admin</CardTitle>
              <CardDescription className="text-base text-slate-600">Masukkan kredensial Anda untuk mengakses dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-slate-700">Email</Label>
                  <Input
                    id="email"
                    data-testid="email-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                    placeholder="admin@guestbook.local"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-slate-700">Password</Label>
                  <Input
                    id="password"
                    data-testid="password-input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                    placeholder="••••••••"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold shadow-lg shadow-emerald-700/20"
                  data-testid="login-button"
                >
                  <LogIn className="w-5 h-5 mr-2" />
                  {loading ? 'Memproses...' : 'Masuk'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
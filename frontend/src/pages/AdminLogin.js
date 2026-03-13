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
      <div className="w-full max-w-6xl flex rounded-2xl overflow-hidden shadow-2xl">
        <div 
          className="hidden lg:flex lg:w-1/2 bg-cover bg-center relative"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1670262338361-f024287fcc2d?auto=format&fit=crop&q=80)' }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 to-slate-900/90" />
          <div className="relative z-10 p-12 flex flex-col justify-center text-white">
            <h1 className="text-5xl font-bold tracking-tight mb-4">Buku Tamu Digital</h1>
            <p className="text-xl text-blue-100">Sistem manajemen pengunjung profesional</p>
          </div>
        </div>
        
        <div className="w-full lg:w-1/2 bg-white p-8 lg:p-12 flex items-center">
          <Card className="w-full border-0 shadow-none">
            <CardHeader className="space-y-1">
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
                    className="h-12"
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
                    className="h-12"
                    placeholder="••••••••"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
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
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function SignupPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phoneDigits, setPhoneDigits] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const validatePhone = (digits: string) => {
    if (!digits) return '' // optional field
    if (!/^[0-9]{8}$/.test(digits)) return 'Please enter a valid 8-digit Hong Kong phone number.'
    return ''
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 8)
    setPhoneDigits(raw)
    if (phoneError) setPhoneError(validatePhone(raw))
  }

  const handlePhoneBlur = () => {
    setPhoneError(validatePhone(phoneDigits))
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    const err = validatePhone(phoneDigits)
    if (err) { setPhoneError(err); return }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    // Store full phone with +852 prefix
    const fullPhone = phoneDigits ? `+852${phoneDigits}` : null
    if (data.user && fullPhone) {
      await supabase
        .from('profiles')
        .update({ phone: fullPhone, full_name: fullName })
        .eq('id', data.user.id)
    }

    toast.success('Account created! Please check your email to confirm.')
    router.push('/login')
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-(--color-background) px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold text-(--color-primary)">
            🛍️ CC Pre-loved
          </Link>
          <h1 className="text-2xl font-bold mt-4 text-(--color-foreground)">Create account</h1>
          <p className="text-(--color-muted) mt-1 text-sm">Join the CC Pre-loved community</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-(--color-foreground) mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2.5 border border-(--color-border) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-primary) text-sm"
              placeholder="Maria Santos"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-(--color-foreground) mb-1">
              Email address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 border border-(--color-border) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-primary) text-sm"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-(--color-foreground) mb-1">
              Phone Number <span className="text-(--color-muted)">(optional)</span>
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 py-2.5 border border-r-0 border-(--color-border) rounded-l-lg bg-(--color-background) text-sm font-medium text-(--color-muted) select-none">
                +852
              </span>
              <input
                type="tel"
                inputMode="numeric"
                value={phoneDigits}
                onChange={handlePhoneChange}
                onBlur={handlePhoneBlur}
                maxLength={8}
                className={`flex-1 px-4 py-2.5 border rounded-r-lg focus:outline-none focus:ring-2 focus:ring-(--color-primary) text-sm ${
                  phoneError ? 'border-red-500' : 'border-(--color-border)'
                }`}
                placeholder="91234567"
              />
            </div>
            {phoneError && (
              <p className="text-red-600 text-xs mt-1">{phoneError}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-(--color-foreground) mb-1">
              Password <span className="text-(--color-muted)">(min 8 characters)</span>
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-(--color-border) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--color-primary) text-sm"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-(--color-primary) text-white py-2.5 rounded-lg font-semibold hover:bg-(--color-primary-dark) transition-colors disabled:opacity-60"
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-(--color-muted) mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-(--color-primary) font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'

const STORAGE_KEY = 'min_order_banner_dismissed'

export default function MinOrderBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Use sessionStorage so it reappears on next visit (new session)
    const dismissed = sessionStorage.getItem(STORAGE_KEY)
    if (!dismissed) setVisible(true)
  }, [])

  const dismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4">
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
        <span className="text-lg shrink-0 mt-0.5">🛍️</span>
        <p className="flex-1">
          <strong>Heads up!</strong> We have a minimum order of <strong>HK$100</strong> to make our weekend meetups worthwhile for everyone. Happy shopping!
        </p>
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="shrink-0 text-amber-500 hover:text-amber-700 font-bold text-lg leading-none mt-0.5"
        >
          ×
        </button>
      </div>
    </div>
  )
}

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-(--color-primary) text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-3">
              🛍️ CC <span className="text-(--color-accent)">Pre-loved</span>
            </h3>
            <p className="text-white/70 text-sm leading-relaxed">
              Your fashionable pre-loved shopping marketplace in Hong Kong. Affordable prices, great condition.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link href="/products" className="hover:text-white transition-colors">Shop Now</Link></li>
              <li><Link href="/signup" className="hover:text-white transition-colors">Create Account</Link></li>
              <li><Link href="/account/orders" className="hover:text-white transition-colors">My Orders</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">How It Works</h4>
            <ol className="space-y-2 text-sm text-white/70 list-decimal list-inside">
              <li>Browse & add to cart</li>
              <li>Book a weekend exchange slot</li>
              <li>Meet in person to receive items</li>
            </ol>
          </div>
        </div>
        <div className="border-t border-white/20 mt-8 pt-6 text-center text-sm text-white/50">
          © {new Date().getFullYear()} CC Pre-loved. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

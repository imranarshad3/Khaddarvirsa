import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, X } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useMoney } from '../../lib/currency'

export type AddedItem = { name: string; slug: string; image: string; option?: string | null; quantity: number; unitPrice: number }

// Module-level channel so any "add to cart" button can open the panel without threading props.
const listeners = new Set<(item: AddedItem) => void>()
export function showAddedToCart(item: AddedItem) {
  listeners.forEach((fn) => fn(item))
}

export default function AddedToCart() {
  const [item, setItem] = useState<(AddedItem & { key: number }) | null>(null)
  const [paused, setPaused] = useState(false)
  const seq = useRef(0)
  const cart = useCart()
  const money = useMoney()

  useEffect(() => {
    const fn = (next: AddedItem) => { setPaused(false); setItem({ ...next, key: ++seq.current }) }
    listeners.add(fn)
    return () => { listeners.delete(fn) }
  }, [])

  useEffect(() => {
    if (!item || paused) return
    const timer = setTimeout(() => setItem(null), 6000)
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setItem(null) }
    document.addEventListener('keydown', esc)
    return () => { clearTimeout(timer); document.removeEventListener('keydown', esc) }
  }, [item, paused])

  if (!item) return null
  const close = () => { setItem(null); setPaused(false) }

  return (
    <aside key={item.key} className="added-to-cart" role="status" aria-live="polite" aria-label="Added to your bag"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      <header>
        <span className="added-tick" aria-hidden="true"><Check size={14} strokeWidth={2.5} /></span>
        <strong>Added to your bag</strong>
        <button type="button" className="added-close" onClick={close} aria-label="Close"><X size={16} /></button>
      </header>
      <Link to={`/product/${item.slug}`} className="added-item" onClick={close}>
        <img src={item.image} alt="" />
        <span>
          <b>{item.name}</b>
          {item.option && <small>{item.option}</small>}
          <small>Qty {item.quantity} · {money(item.unitPrice * item.quantity)}</small>
        </span>
      </Link>
      <p className="added-summary">
        <span>{cart.count} item{cart.count === 1 ? '' : 's'} in your bag</span>
        <span>{money(cart.subtotal)}</span>
      </p>
      <div className="added-actions">
        <Link to="/cart" className="btn outline" onClick={close}>View bag</Link>
        <Link to="/checkout" className="btn" onClick={close}>Checkout</Link>
      </div>
      {!paused && <span className="added-timer" aria-hidden="true" />}
    </aside>
  )
}

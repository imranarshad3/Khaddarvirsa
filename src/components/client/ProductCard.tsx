import { useMoney } from '../../lib/currency'
import { showAddedToCart } from './AddedToCart'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'
import { useToast } from '../../context/ToastContext'
import { Spinner, Stars } from './Primitives'
import Icon from './Icon'
import type { ProductFull } from '../../lib/types'

const FALLBACK = '/assets/fashion/placeholder.jpg'

export function productCover(product: ProductFull) {
  return [...(product.images ?? [])].sort((a, b) => a.sort_order - b.sort_order)[0]?.url ?? FALLBACK
}

export default function ProductCard({ product }: { product: ProductFull }) {
  const money = useMoney()
  const navigate = useNavigate()
  const { add } = useCart()
  const wishlist = useWishlist()
  const toast = useToast()
  const [busy, setBusy] = useState<'cart' | 'buy' | null>(null)
  const [variantId, setVariantId] = useState<string | null>(null)
  const [cardNow] = useState(() => Date.now())

  const variants = [...(product.variants ?? [])].sort((a, b) => a.sort_order - b.sort_order)
  const selectedVariant = variants.find((v) => v.id === variantId) ?? variants.find((v) => v.is_active && v.stock_quantity > 0) ?? null
  const inStock = variants.length ? Boolean(selectedVariant && selectedVariant.stock_quantity > 0) : product.stock_quantity > 0
  const unitPrice = Number(product.price) + Number(selectedVariant?.price_delta ?? 0)
  const age = cardNow - new Date(product.created_at).getTime()
  const isNew = age >= 0 && age < 30 * 24 * 60 * 60 * 1000
  const low = inStock && product.stock_quantity <= product.low_stock_at
  const saved = wishlist.has(product.id)
  const was = Number(product.compare_at_price ?? 0) + Number(selectedVariant?.price_delta ?? 0)
  const off = was > unitPrice ? Math.round((1 - unitPrice / was) * 100) : 0

  async function handleAdd(then: 'stay' | 'checkout') {
    if (busy) return
    setBusy(then === 'stay' ? 'cart' : 'buy')
    const error = await add(product.id, selectedVariant?.id ?? null, 1)
    setBusy(null)
    if (error) {
      toast.error(error)
      return
    }
    if (then === 'checkout') navigate('/checkout')
    else showAddedToCart({ name: product.name, slug: product.slug, image: productCover(product), option: selectedVariant?.label, quantity: 1, unitPrice })
  }

  return (
    <article className="prod">
      <div className="imgwrap">
        {!inStock && <span className="stockflag">Out of stock</span>}
        {low && <span className="stockflag low">Only {product.stock_quantity} left</span>}
        {inStock && !low && isNew && <span className="stockflag new">New</span>}
        {off > 0 && <span className="salebadge">-{off}%</span>}
        <button
          type="button"
          className={`wishbtn ${saved ? 'on' : ''}`}
          aria-pressed={saved}
          aria-label={saved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
          onClick={async () => {
            const on = await wishlist.toggle(product.id)
            toast.notify(on ? 'Saved to your wishlist.' : 'Removed from your wishlist.')
          }}
        >
          <Icon name="heart" />
        </button>
        <Link to={`/product/${product.slug}`} aria-label={product.name}>
          <img className="productimg" src={productCover(product)} alt={product.name} loading="lazy" decoding="async" />
        </Link>
      </div>
      <div className="prodbody">
        <h3>
          <Link to={`/product/${product.slug}`}>{product.name}</Link>
        </h3>
        <div className={`card-rating ${product.rating_count ? '' : 'unrated'}`}>
          <Stars rating={product.rating_count > 0 ? Number(product.rating_avg) : 0} />
          <span>{product.rating_count > 0 ? `(${product.rating_count})` : 'No reviews yet'}</span>
        </div>
        {variants.length > 0 ? (
          <div className="sizes" aria-label="Available colours">
            <span className="size-caption">Available colours</span>
            {variants.map((v) => (
              <button type="button" key={v.id} aria-pressed={selectedVariant?.id === v.id} disabled={!v.is_active || v.stock_quantity <= 0} onClick={() => setVariantId(v.id)} aria-label={`Select ${v.label} for ${product.name}`}>{v.label}</button>
            ))}
          </div>
        ) : (
          <div className="sizes" aria-hidden="true" />
        )}
        <div className="price">{off > 0 && <del>{money(was)}</del>}{money(unitPrice)}</div>
        <div className="prod-actions">
          <button type="button" className="btn prod-add" onClick={() => handleAdd('stay')} disabled={!inStock || busy !== null}>
            {busy === 'cart' ? <Spinner label="Adding" /> : !inStock ? 'Out of Stock' : <><Icon name="cart" /> Add to Cart</>}
          </button>
          {inStock && (
            <button type="button" className="btn prod-buy" onClick={() => handleAdd('checkout')} disabled={busy !== null} aria-label={`Buy ${product.name} now`}>
              {busy === 'buy' ? <Spinner /> : <><Icon name="bag" /> Buy Now</>}
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

export function ProductCardSkeleton() {
  return (
    <article className="prod">
      <div className="skeleton" style={{ width: '100%', aspectRatio: '.97' }} />
      <div className="prodbody">
        <div className="skeleton" style={{ height: '1.375rem', marginBottom: '.75rem' }} />
        <div className="skeleton" style={{ height: '.875rem', width: '60%', marginBottom: '.875rem' }} />
        <div className="prod-actions">
          <div className="skeleton" style={{ height: '2.875rem', flex: 1 }} />
          <div className="skeleton" style={{ height: '2.875rem', flex: 1 }} />
        </div>
      </div>
    </article>
  )
}

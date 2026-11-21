import { LayoutDashboard, Package, Shirt, LayoutGrid, ShoppingBag, UsersRound, Images, FileText, Star, ChartSpline, SlidersHorizontal, Wallet, Clock3, Repeat2, Sparkles, Check, type LucideIcon } from 'lucide-react'

const icons: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard, products: Shirt, categories: LayoutGrid, orders: ShoppingBag,
  customers: UsersRound, banners: Images, pages: FileText, reviews: Star,
  analytics: ChartSpline, settings: SlidersHorizontal, revenue: Wallet,
  clock: Clock3, repeat: Repeat2, new: Sparkles, rating: Star, check: Check,
}
export default function AdminIcon({ name }: { name: string }) {
  const Icon = icons[name] ?? Package
  return <Icon className="admin-icon" size={20} strokeWidth={1.5} aria-hidden="true" />
}

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product } from '@/lib/products'

export type CartItem = {
  product: Product
  quantity: number
  selectedOptions: Record<string, string>  // e.g. { '處理方式': '切塊', '大小': '小隻' }
  cartKey: string  // product.id + JSON of options, used as unique key
}

type CartStore = {
  items: CartItem[]
  _hasHydrated: boolean
  setHasHydrated: (v: boolean) => void
  addItem: (product: Product, selectedOptions: Record<string, string>) => void
  removeItem: (cartKey: string) => void
  updateQuantity: (cartKey: string, quantity: number) => void
  clearCart: () => void
  totalItems: () => number
  totalPrice: () => number
}

function makeCartKey(productId: string, options: Record<string, string>) {
  return `${productId}::${JSON.stringify(options)}`
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      _hasHydrated: false,
      setHasHydrated: (v) => set({ _hasHydrated: v }),
      addItem: (product, selectedOptions) => {
        const cartKey = makeCartKey(product.id, selectedOptions)
        const items = get().items
        const existing = items.find((i) => i.cartKey === cartKey)
        if (existing) {
          set({ items: items.map((i) => i.cartKey === cartKey ? { ...i, quantity: i.quantity + 1 } : i) })
        } else {
          set({ items: [...items, { product, quantity: 1, selectedOptions, cartKey }] })
        }
      },
      removeItem: (cartKey) => set({ items: get().items.filter((i) => i.cartKey !== cartKey) }),
      updateQuantity: (cartKey, quantity) => {
        if (quantity <= 0) {
          get().removeItem(cartKey)
        } else {
          set({ items: get().items.map((i) => i.cartKey === cartKey ? { ...i, quantity } : i) })
        }
      },
      clearCart: () => set({ items: [] }),
      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: () => get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
    }),
    {
      name: 'liangchicken-cart',
      onRehydrateStorage: () => (state) => { state?.setHasHydrated(true) },
    }
  )
)

import AdminProductForm from '@/components/AdminProductForm'

export default function NewProductPage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="font-bold text-2xl text-gray-800 mb-6">新增商品</h1>
      <AdminProductForm />
    </div>
  )
}

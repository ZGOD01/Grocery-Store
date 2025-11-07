import React, { useState } from 'react'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'
import { Trash2, Pencil } from 'lucide-react' // icons

const ProductList = () => {
  const { products, currency, axios, fetchProducts } = useAppContext()

  // Local states
  const [isEditing, setIsEditing] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [editData, setEditData] = useState({
    name: '',
    category: '',
    offerPrice: '',
    quantity: '',
  })

  // Toggle Stock
  const toggleStock = async (id, inStock) => {
    try {
      const { data } = await axios.post('/api/product/stock', { id, inStock })
      if (data.success) {
        fetchProducts()
        toast.success(data.message)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  // Delete Product
  const deleteProduct = async (id) => {
    try {
      const { data } = await axios.delete(`/api/product/delete/${id}`, {
        withCredentials: true,
      })
      if (data.success) {
        fetchProducts()
        toast.success(data.message)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  // Update Product
  const updateProduct = async () => {
    try {
      const { data } = await axios.put(
        `/api/product/update/${selectedProduct._id}`,
        editData,
        { withCredentials: true }
      )

      if (data.success) {
        toast.success('Product updated successfully!')
        fetchProducts()
        setIsEditing(false)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll flex flex-col justify-between">
      <div className="w-full md:p-10 p-4">
        <h2 className="pb-4 text-lg font-medium">All Products</h2>
        <div className="flex flex-col items-center max-w-5xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
          <table className="md:table-auto table-fixed w-full overflow-hidden">
            <thead className="text-gray-900 text-sm text-left bg-gray-100">
              <tr>
                <th className="px-4 py-3 font-semibold truncate">Product</th>
                <th className="px-4 py-3 font-semibold truncate">Category</th>
                <th className="px-4 py-3 font-semibold truncate hidden md:block">Selling Price</th>
                <th className="px-4 py-3 font-semibold truncate text-center">In Stock</th>
                <th className="px-4 py-3 font-semibold truncate text-center">Stock Left</th>
                <th className="px-4 py-3 font-semibold truncate text-center">Edit</th>
                <th className="px-4 py-3 font-semibold truncate text-center">Delete</th>
              </tr>
            </thead>

            <tbody className="text-sm text-gray-500">
              {products.map((product) => (
                <tr key={product._id} className="border-t border-gray-500/20 hover:bg-gray-50">
                  <td className="md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3 truncate">
                    <div className="border border-gray-300 rounded p-2">
                      <img src={product.image[0]} alt="Product" className="w-16 h-16 object-cover" />
                    </div>
                    <span className="truncate max-sm:hidden w-full">{product.name}</span>
                  </td>

                  <td className="px-4 py-3">{product.category}</td>

                  <td className="px-4 py-3 max-sm:hidden">
                    {currency}
                    {product.offerPrice}
                  </td>

                  <td className="px-4 py-3 text-center">
                    <label className="relative inline-flex items-center cursor-pointer text-gray-900 gap-3">
                      <input
                        onChange={() => toggleStock(product._id, !product.inStock)}
                        checked={product.inStock}
                        type="checkbox"
                        className="sr-only peer"
                      />
                      <div className="w-12 h-7 bg-slate-300 rounded-full peer peer-checked:bg-blue-600 transition-colors duration-200"></div>
                      <span className="dot absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5"></span>
                    </label>
                  </td>

                  {/* Stock Left column */}
                  <td className="px-4 py-3 text-center font-medium text-gray-700">
                    {product.quantity}
                  </td>

                  {/* Edit button */}
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => {
                        setSelectedProduct(product)
                        setEditData({
                          name: product.name,
                          category: product.category,
                          offerPrice: product.offerPrice,
                          quantity: product.quantity,
                        })
                        setIsEditing(true)
                      }}
                      className="text-blue-500 hover:text-blue-700 transition"
                      title="Edit Product"
                    >
                      <Pencil size={20} />
                    </button>
                  </td>

                  {/* Delete button */}
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => deleteProduct(product._id)}
                      className="text-red-500 hover:text-red-700 transition"
                      title="Delete Product"
                    >
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🧩 Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">Edit Product Details</h2>

            <div className="flex flex-col gap-4">
              {/* Product Name */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Product Name</label>
                <input
                  type="text"
                  placeholder="Enter Product Name"
                  className="border p-2 rounded"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                />
              </div>

              {/* Category */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  placeholder="Enter Category"
                  className="border p-2 rounded"
                  value={editData.category}
                  onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                />
              </div>

              {/* Offer Price */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Offer Price</label>
                <input
                  type="number"
                  placeholder="Enter Offer Price"
                  className="border p-2 rounded"
                  value={editData.offerPrice}
                  onChange={(e) => setEditData({ ...editData, offerPrice: e.target.value })}
                />
              </div>

              {/* Quantity */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                <input
                  type="number"
                  placeholder="Enter Stock Quantity"
                  className="border p-2 rounded"
                  value={editData.quantity}
                  onChange={(e) => setEditData({ ...editData, quantity: e.target.value })}
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={updateProduct}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductList
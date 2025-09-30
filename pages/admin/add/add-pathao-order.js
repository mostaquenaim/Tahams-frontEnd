import React, { useEffect, useState } from 'react';
import {
  Package,
  User,
  Phone,
  MapPin,
  Truck,
  Weight,
  Hash,
  FileText,
  DollarSign,
  ShirtIcon,
} from 'lucide-react';
import { FaBangladeshiTakaSign } from 'react-icons/fa6';

const AddPathaoOrder = () => {
  const [formData, setFormData] = useState({
    store_id: 31663,
    merchant_order_id: '',
    recipient_name: '',
    recipient_phone: '',
    recipient_address: '',
    delivery_type: 48,
    item_type: 2,
    special_instruction: '',
    item_quantity: 1,
    item_weight: '0.5',
    item_description: '',
    amount_to_collect: 0,
  });

  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const pathaoHistory = localStorage.getItem('pathaoHistory');
      if (pathaoHistory) {
        try {
          const parsedData = JSON.parse(pathaoHistory);
          console.log('Parsed data:', parsedData);
          setOrderData(parsedData);
          
          // Extract data from the nested structure
          const history = parsedData.history;
          const orders = parsedData.orders || [];
          
          // Calculate total quantity from all orders
          const totalQuantity = orders.reduce((sum, order) => sum + (order.Quantity || 1), 0);
          
          // Create item description from order details
          const itemDescription = orders.map(order => 
            `${order.ProductName || 'Product'} - Size: ${order.size || 'N/A'} - Qty: ${order.Quantity || 1}`
          ).join(', ');
          
          // Calculate total weight (estimate based on quantity)
          // You might want to adjust this logic based on your actual weight calculation
          const estimatedWeight = (totalQuantity * 0.3).toFixed(1); // Assuming 0.3kg per item
          
          // Auto-fill form data from localStorage
          setFormData(prev => ({
            ...prev,
            recipient_name: history?.fullName || '',
            recipient_phone: history?.phone_no || '',
            recipient_address: `${history?.address || ''}, ${history?.city || ''}, ${history?.region || ''}`.trim(),
            amount_to_collect: parsedData.totalPrice + parsedData.deliveryFee || 0,
            item_description: itemDescription || `Order #${history?.id}`,
            merchant_order_id: history?.id ? `ORDER-${history.id}` : `ORDER-${Date.now()}`,
            item_quantity: totalQuantity || 1,
            item_weight: 0.5, // Minimum 0.5kg
          }));
        } catch (error) {
          console.error('Error parsing pathaoHistory:', error);
        }
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const orderPayload = {
      ...formData,
      merchant_order_id: formData.merchant_order_id || `ORDER-${Date.now()}`,
      item_quantity: Number(formData.item_quantity),
      amount_to_collect: Number(formData.amount_to_collect),
      item_weight: formData.item_weight.toString(),
      delivery_type: Number(formData.delivery_type),
      item_type: Number(formData.item_type),
    };

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API}/admin/create-pathao-order`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderPayload),
        },
      );

      const data = await res.json();

      if (res.ok) {
        alert('Order placed successfully!');
        setFormData({
          store_id: 31663,
          merchant_order_id: '',
          recipient_name: '',
          recipient_phone: '',
          recipient_address: '',
          delivery_type: 48,
          item_type: 2,
          special_instruction: '',
          item_quantity: 1,
          item_weight: '0.5',
          item_description: '',
          amount_to_collect: 0,
        });
        // Clear localStorage after successful submission
        localStorage.removeItem('pathaoHistory');
      } else {
        alert('Failed to place order: ' + (data.message || 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to get product details from the orders array
  const getProductDetails = () => {
    if (!orderData || !orderData.orders) return '';
    
    return orderData.orders.map(order => 
      `${order.ProductName || 'Product'} - Size: ${order.size || 'N/A'} - Qty: ${order.Quantity || 1}`
    ).join(', ');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Package className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-800">
              Create New Order
            </h1>
          </div>
          <p className="text-gray-600">
            Fill in the details to create a new delivery order
          </p>
          
          {/* Auto-fill Notification */}
          {orderData && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center gap-2 text-blue-700">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">
                  Order data auto-filled from previous selection
                </span>
              </div>
              {orderData.history && (
                <div className="mt-2 text-sm text-blue-600">
                  <p>Order #{orderData.history.id} - {orderData.history.fullName}</p>
                  <p>{orderData.orders?.length || 0} item(s) - Total: ৳{orderData.totalPrice || 0}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Column 1: Order Information */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-800 pb-2 border-b border-gray-200">
                    Order Information
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Store ID
                    </label>
                    <input
                      type="text"
                      name="store_id"
                      value={formData.store_id}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-500 cursor-not-allowed"
                      disabled
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Merchant Order ID{' '}
                      <span className="text-gray-400 text-xs">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      name="merchant_order_id"
                      placeholder="Auto-generated if empty"
                      value={formData.merchant_order_id}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Type
                    </label>
                    <select
                      name="delivery_type"
                      value={formData.delivery_type}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    >
                      <option value={48}>Normal Delivery</option>
                      <option value={12}>On Demand Delivery</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Item Type
                    </label>
                    <select
                      name="item_type"
                      value={formData.item_type}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    >
                      <option value={2}>Parcel</option>
                      <option value={1}>Document</option>
                    </select>
                  </div>
                </div>

                {/* Column 2: Recipient Details */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-800 pb-2 border-b border-gray-200">
                    Recipient Details
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Recipient Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="recipient_name"
                      placeholder="Enter recipient's full name"
                      value={formData.recipient_name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Recipient Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="recipient_phone"
                      placeholder="01XXXXXXXXX"
                      value={formData.recipient_phone}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Recipient Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="recipient_address"
                      placeholder="Enter complete delivery address with landmarks"
                      value={formData.recipient_address}
                      onChange={handleChange}
                      rows="4"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Special Instructions{' '}
                      <span className="text-gray-400 text-xs">(Optional)</span>
                    </label>
                    <textarea
                      name="special_instruction"
                      placeholder="Any special delivery instructions..."
                      value={formData.special_instruction}
                      onChange={handleChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none"
                    />
                  </div>
                </div>

                {/* Column 3: Item Details */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-800 pb-2 border-b border-gray-200">
                    Item Details
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Item Quantity
                      </label>
                      <input
                        type="number"
                        name="item_quantity"
                        placeholder="1"
                        value={formData.item_quantity}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        min="1"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Item Weight (kg)
                      </label>
                      <input
                        type="text"
                        name="item_weight"
                        placeholder="0.5"
                        value={formData.item_weight}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Item Description
                    </label>
                    <textarea
                      name="item_description"
                      placeholder="Describe the items being delivered"
                      value={formData.item_description}
                      onChange={handleChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount to Collect (৳)
                    </label>
                    <input
                      type="number"
                      name="amount_to_collect"
                      placeholder="0.00"
                      value={formData.amount_to_collect}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white font-medium py-3 px-8 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="animate-spin h-5 w-5"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Creating Order...
                      </span>
                    ) : (
                      'Create Order'
                    )}
                  </button>
                </div>
                <p className="text-right text-sm text-gray-500 mt-2">
                  Fields marked with <span className="text-red-500">*</span> are
                  required
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPathaoOrder;
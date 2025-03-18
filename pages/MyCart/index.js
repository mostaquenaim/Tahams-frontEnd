import { useEffect, useState } from 'react';
import useCart from '/Hooks/useCart';
import { useRouter } from 'next/router';
import { RiDeleteBin5Fill } from 'react-icons/ri';
import Swal from 'sweetalert2';
import useAxiosPublic from '../../Hooks/useAxiosPublic';
import Link from 'next/link';
import Head from 'next/head';

const MyCart = () => {
  const [cart, refetch] = useCart();
  const router = useRouter();
  const axiosPublic = useAxiosPublic();

  // State to track checked items
  const [checkedItems, setCheckedItems] = useState([]);

  useEffect(() => {
    const cartItem = parseInt(localStorage.getItem('defaultCartItem'))
    console.log('cartItem', cartItem);
    setCheckedItems([cartItem])
  }, [])

  // Toggle the selection of an item
  const toggleItemSelection = (itemId) => {
    console.log('cartItem', itemId);
    if (checkedItems.includes(itemId)) {
      setCheckedItems(checkedItems.filter((id) => id !== itemId));
    } else {
      setCheckedItems([...checkedItems, itemId]);
    }
  };

  // Handle checkout
  const handleCheckout = () => {
    // Get the selected items from the cart
    const selectedItems = cart.filter((item) => checkedItems.includes(item.id));

    // Store the selected items in localStorage
    localStorage.setItem('selectedItems', JSON.stringify(selectedItems));

    // Calculate total price
    const totalPrice = selectedItems.reduce((acc, item) => {
      return acc + parseInt(item.product.sellingPrice - (item.product.sellingPrice * item.product.discountPercentage / 100) + (item.product.sellingPrice * item.product.vatPercentage / 100)) * item.Quantity;
    }, 0);

    // Prepare items for dataLayer
    const tempItems = selectedItems.map((item) => ({
      item_id: item.product.id,
      item_name: item.product.name,
      item_color: item.ProductName?.split(" ")[0] || "Unknown",
      item_series: item.category?.category?.category?.name || "N/A",
      main_category: item.category?.category?.name || "N/A",
      sub_category: item.category?.name || "N/A",
      price: parseInt(item.product.sellingPrice - (item.product.sellingPrice * item.product.discountPercentage / 100) + (item.product.sellingPrice * item.product.vatPercentage / 100)) * item.Quantity || 0,
      total_views: item.product.totalViews || 0,
      selected_size: item.size || null,
      selected_maleSize: item.maleSize || null,
      selected_femaleSize: item.femaleSize || null,
      discount_percent: item.product.discountPercentage || 0,
      quantity: item.Quantity,
    }));

    // Push checkout data to dataLayer
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "begin_checkout",
      ecommerce: {
        currency: "BDT",
        totalPrice: totalPrice,
        items: tempItems
      }
    });

    // Navigate to the buy-now page
    router.push({
      pathname: '/buy-now',
    });
  };


  // Handle delete item with confirmation
  const handleDeleteItem = (item) => {
    // console.log('itemId==', item);
    Swal.fire({
      title: 'Are you sure?',
      text: 'You won\'t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: "remove_from_cart",
          ecommerce: {
            items: [
              {
                item_id: item.product.id,
                item_name: item.product.name,
                item_color: item.ProductName?.split(" ")[0] || "Unknown",
                item_series: item.category?.category?.category?.name || "N/A",
                main_category: item.category?.category?.name || "N/A",
                sub_category: item.category?.name || "N/A",
                price: parseInt(item.product.sellingPrice - (item.product.sellingPrice * item.product.discountPercentage / 100) + (item.product.sellingPrice * item.product.vatPercentage / 100)) * item.Quantity || 0,
                total_views: item.product.totalViews || 0,
                // selected_category: selectedCategory,
                selected_size: item.size,
                selected_maleSize: item.maleSize || null,
                selected_femaleSize: item.femaleSize || null,
                discount_percent: item.product.discountPercentage || 0,
                currency: "BDT",
                quantity: item.Quantity,
                // user_email: customEmail
              }
            ]
          }
        });
        const result = await axiosPublic.delete(`/admin/delete-cart/${item.uniqueId}`)
        if (result.data.affected > 0) {
          Swal.fire('Deleted!', 'Your item has been deleted.', 'success');
          refetch()
        }
      }
    });
  };

  // Handle delete selected items
  const handleDeleteSelected = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete them!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const result = await axiosPublic.delete('/admin/delete-carts', {
            data: { checkedItems }
          });
          if (result.data.affected > 0) {
            Swal.fire('Deleted!', 'Your selected items have been deleted.', 'success');
            refetch();
            setCheckedItems([]); // Clear selected items after deletion
          }
        } catch (error) {
          console.error('Error deleting selected items:', error);
          Swal.fire('Error!', 'Failed to delete selected items.', 'error');
        }
      }
    });
  };

  // Handle checkbox in the header
  const handleSelectAll = () => {
    if (checkedItems.length === cart.length) {
      // If all items are already selected, deselect all
      setCheckedItems([]);
    } else {
      // Otherwise, select all
      const allItemIds = cart.map((item) => item.id);
      setCheckedItems(allItemIds);
    }
  };

  return (
    <>
      <Head>
        <title>My Cart - Tahams</title>
      </Head>
      <section className='pt-20 lg:pt-40 min-h-screen'>
        <div className="container mx-auto px-4">
          <h1 className='font-semibold text-xl m-5'>Select cart items to checkout</h1>
          {cart.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {cart.map((item) => (
                <div key={item.id} className="bg-white shadow-md rounded-lg p-4 flex flex-col items-start justify-between space-y-4">
                  <div className="flex justify-between w-full">
                    <input
                      type="checkbox"
                      className="checkbox border-2 border-black"
                      checked={checkedItems.includes(item.id)}
                      onChange={() => toggleItemSelection(item.id)}
                    />
                    <button
                      onClick={() => handleDeleteItem(item)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <RiDeleteBin5Fill size={24} />
                    </button>
                  </div>
                  <div className="flex items-center space-x-4">
                    <img
                      className='w-16 h-16 rounded-full border-black border-2'
                      src={`${process.env.NEXT_PUBLIC_API}/admin/getImage/${item.product.filename}`}
                      alt={item.ProductName}
                    />
                    <div className="flex flex-col">
                      <span className="font-semibold">{item.ProductName}</span>
                      <span className="text-gray-500 text-sm">{item.category.category.category.name}</span>
                      <span className="text-gray-500 text-sm">Size: {item.size}</span>
                    </div>
                  </div>
                  <div className="flex justify-between w-full">
                    <span className="font-bold">{item.Quantity} pcs</span>
                    <span className="font-bold text-green-600">
                      {item.product.sellingPrice - parseInt(item.product.sellingPrice * item.product.discountPercentage / 100) + parseInt(item.product.sellingPrice * item.product.vatPercentage / 100)} BDT
                    </span>
                  </div>
                  <div className="w-full flex justify-between items-center">
                    <span className="font-semibold text-lg">Total: {item.Quantity * parseInt(item.product.sellingPrice - (item.product.sellingPrice * item.product.discountPercentage / 100) + parseInt(item.product.sellingPrice * item.product.vatPercentage / 100))} BDT</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className='text-4xl font-bold text-center'>
              No products in cart. <Link href={'/'} className='text-blue-600'>Shop now!</Link> 😃
            </p>
          )}

          {cart.length > 0 && (
            <div className="mt-8 flex justify-end gap-4">
              <button
                onClick={handleCheckout}
                className={`btn ${checkedItems.length === 0 ? 'btn-disabled' : 'btn-accent'}`}
              >
                Checkout
              </button>
              <button
                onClick={handleDeleteSelected}
                className={`btn ${checkedItems.length === 0 ? 'btn-disabled' : 'btn-error'}`}
              >
                <RiDeleteBin5Fill />
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default MyCart;

import { useEffect, useState } from 'react';
import useCart from '/Hooks/useCart';
import { useRouter } from 'next/router';
import { RiDeleteBin5Fill } from 'react-icons/ri';
import Swal from 'sweetalert2';
import useAxiosPublic from '../../Hooks/useAxiosPublic';
import Link from 'next/link';
import Head from 'next/head';
import { discountedPrice, generateTempItems, pushToDataLayer } from '../../utils/ga4';

const MyCart = () => {
  const [isLoading ,cart, refetch] = useCart();
  // console.log(cart,'cart');
  const router = useRouter();
  const axiosPublic = useAxiosPublic();

  // State to track checked items
  const [checkedItems, setCheckedItems] = useState([]);

  useEffect(() => {
    const cartItem = parseInt(localStorage.getItem('defaultCartItem'))
  // console.log('cartItem', cartItem);
    setCheckedItems([cartItem])
  }, [])

  // Toggle the selection of an item
  const toggleItemSelection = (itemId) => {
  // console.log('cartItem', itemId);
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
    const totalPrice = discountedPrice(selectedItems)

    // Prepare items for dataLayer
    const tempItems = generateTempItems(selectedItems)

    pushToDataLayer('begin_checkout',
      {
        currency: "BDT",
        totalPrice: totalPrice,
        items: tempItems
      }
    )

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
        pushToDataLayer('remove_from_cart',
          { item }
        )

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
                      src={`${process.env.NEXT_PUBLIC_API}/admin/getimage/${item.product.filename}`}
                      alt={item.ProductName}
                    />
                    <div className="flex flex-col">
                      <span className="font-semibold">{item.ProductName}</span>
                      <span className="text-gray-500 text-sm">{item?.category?.category?.category?.name}</span>
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

import { useState } from 'react';
import NavbarCompTwo from '/components/Header/NavbarComp';
import useCart from '/Hooks/useCart';
import { useRouter } from 'next/router';
import { RiDeleteBin5Fill } from 'react-icons/ri';
import Swal from 'sweetalert2';
import axios from 'axios';
import Link from 'next/link';

const MyCart = () => {
  const [cart, refetch] = useCart();
  const router = useRouter();

  // State to track checked items
  const [checkedItems, setCheckedItems] = useState([]);

  // Toggle the selection of an item
  const toggleItemSelection = (itemId) => {
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

    // Navigate to the buy-now page
    router.push({
      pathname: '/buy-now',
    });
  };

  // Handle delete item with confirmation
  const handleDeleteItem = (itemId) => {
    console.log(itemId, "41");
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
        const result = await axios.delete(`http://localhost:3000/admin/delete-cart/${itemId}`)
        console.log(result, "53");
        if (result.data.affected > 0) {
          Swal.fire('Deleted!', 'Your item has been deleted.', 'success');
          refetch()
        }
      }
    });
  };

  // Handle delete item with confirmation
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
          const result = await axios.delete('http://localhost:3000/admin/delete-carts', {
            data: { checkedItems }
          });
          console.log(result, "53");
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
      <NavbarCompTwo />
      <section className='pt-40'>
        <div className="overflow-x-auto">
          {cart.length > 0 ?
            <table className="table">
              {/* Table Head */}
              <thead>
                <tr>
                  <th>
                    <label>
                      <input type="checkbox" className="checkbox" onChange={handleSelectAll} />
                    </label>
                  </th>
                  <th>Product Name</th>
                  <th>Size</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Total</th>
                  <th className='flex items-center gap-2'>
                    <button onClick={handleCheckout} className={`btn ${checkedItems.length === 0 ? 'btn-disabled' : 'btn-accent'}`}>
                      Checkout
                    </button>
                    <button
                          onClick={handleDeleteSelected}
                          className={`btn ${checkedItems.length === 0 ? 'btn-disabled' : 'btn-error'}`}
                        >
                          <RiDeleteBin5Fill />
                        </button>
                  </th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody>
                {
                  cart.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <label>
                          <input
                            type="checkbox"
                            className="checkbox"
                            checked={checkedItems.includes(item.id)}
                            onChange={() => toggleItemSelection(item.id)}
                          />
                        </label>
                      </td>
                      <td className='flex gap-3 items-center'>
                        <img
                          className='w-16 rounded-full border-black  border-2'
                          src={`http://localhost:3000/admin/getImage/${item.product.filename}`}
                          alt={item.ProductName}
                        />
                        {item.ProductName}
                      </td>
                      <td>{item.size}</td>
                      <td>{item.product.sellingPrice} BDT</td>
                      <td>{item.Quantity}</td>
                      <td>{item.Quantity * item.product.sellingPrice}</td>
                      <td>
                        <button
                          onClick={() => handleDeleteItem(item.uniqueId)}
                          className="btn btn-error"
                        >
                          <RiDeleteBin5Fill />
                        </button>
                      </td>
                    </tr>
                  ))

                }
              </tbody>
            </table>

            :
            <p className='text-4xl font-bold flex justify-center items-center text-center h-screen'>
              No product is added to cart. Let's buy some goodies&nbsp;
              <Link href={'/'} className=' text-blue-600' >here</Link>
              &nbsp;:D
            </p>
          }
        </div>
      </section>
    </>
  );
};

export default MyCart;

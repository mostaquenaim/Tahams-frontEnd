import { useState } from 'react';
import NavbarCompTwo from '../components/Header/NavbarComp';
import useCart from '../Hooks/useCart';
import { useRouter } from 'next/router';
import { RiDeleteBin5Fill } from 'react-icons/ri';
import Swal from 'sweetalert2';

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
    Swal.fire({
      title: 'Are you sure?',
      text: 'You won\'t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        // Delete the item
        // Add your logic to delete the item from the cart
        // After deletion, you might want to refetch the cart or update the state
        Swal.fire('Deleted!', 'Your item has been deleted.', 'success');
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
                <th>Price</th>
                <th>Quantity</th>
                <th>Total</th>
                <th>
                  <button onClick={handleCheckout} className={`btn ${checkedItems.length === 0 ? 'btn-disabled' : 'btn-accent'}`}>
                    Checkout
                  </button>
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {cart.map((item) => (
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
                  <td>{item.product.sellingPrice} BDT</td>
                  <td>{item.Quantity}</td>
                  <td>{item.Quantity * item.product.sellingPrice}</td>
                  <td>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="btn btn-error"
                    >
                      <RiDeleteBin5Fill />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
};

export default MyCart;

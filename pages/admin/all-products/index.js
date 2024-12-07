import React, { useContext, useState } from 'react';
import { AuthContext } from '../../../Contexts/Auth/AuthProvider';
import Loading from '../../../components/Loading';
import Link from 'next/link';
import { motion } from 'framer-motion';
import useProduct from '../../../Hooks/useProduct';
import useAxiosPublic from '../../../Hooks/useAxiosPublic';
import Modal from 'react-modal';
import { FaSync } from 'react-icons/fa';

const ShowProducts = () => {
    const { user, loading } = useContext(AuthContext);
    const [products, refetch] = useProduct({ publishable: true });
    // console.log(products);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [editedProducts, setEditedProducts] = useState({});
    const axiosPublic = useAxiosPublic()
    const [syncing, setSyncing] = useState(false)

    const openDeleteModal = (id) => {
        setSelectedProduct(id);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setSelectedProduct(null);
    };

    const handleDelete = async () => {
        if (selectedProduct) {
            try {
                await axiosPublic.delete(`/admin/delete-product/${selectedProduct}?email=${user?.email}`);
                refetch();
                closeDeleteModal();
            } catch (error) {
                console.error('Error deleting product:', error);
            }
        }
    };

    const handleQuantityChange = (productId, pscId, change) => {
        setEditedProducts((prev) => {
            const product = prev[productId] || {};
            const updatedSizes = {
                ...product,
                [pscId]: (product[pscId] || 0) + change
            };
            return {
                ...prev,
                [productId]: updatedSizes
            };
        });
    };

    const handleCancel = (productId) => {
        setEditedProducts((prev) => {
            const updated = { ...prev };
            delete updated[productId];  // Remove the changes for this product
            return updated;
        });
    };

    const handleSave = async (productId) => {
        const updates = editedProducts[productId];
        try {
            await axiosPublic.put(`/admin/update-product-stock/${productId}`, {
                stockChanges: updates,
                email: user?.email
            });
            refetch();
            setEditedProducts((prev) => {
                const updated = { ...prev };
                delete updated[productId];
                return updated;
            });
        } catch (error) {
            console.error('Error updating product stock:', error);
        }
    };

    const handleSyncViews = async () => {
        try {
            setSyncing(true)
            const response = await axiosPublic.get('/admin/sync-view-count');
            // You can handle the response data here, e.g., updating the state or logging the result
            console.log('Sync view count response:', response.data);
        } catch (error) {
            console.error('Error fetching sync view count:', error);
            // Optionally, handle the error further (e.g., show a notification to the user)
        }
        finally {
            setSyncing(false)
        }
    };

    return (
        <div className='min-h-screen bg-gray-100 p-8'>
            <h1 className='text-3xl font-bold text-center mb-8'>Products</h1>
            <p className="flex justify-end">
                <button
                    onClick={handleSyncViews}
                    className={`btn ${syncing ? 'btn-disabled' : 'btn-accent'} m-2`}
                >
                    <FaSync />
                    {
                        syncing ?
                            <>
                                Syncing
                            </>
                            :
                            <>
                                Sync views
                            </>
                    }
                </button>
            </p>
            <div className='container mx-auto'>
                {loading ? (
                    <Loading />
                ) : products.length > 0 ? (
                    <table className='min-w-full bg-white'>
                        <thead>
                            <tr>
                                <th className='py-2 px-4 border-b'>ID</th>
                                <th className='py-2 px-4 border-b'>Product Name</th>
                                <th className='py-2 px-4 border-b'>Views</th>
                                <th className='py-2 px-4 border-b'>Color</th>
                                <th className='py-2 px-4 border-b'>Category</th>
                                <th className='py-2 px-4 border-b'>Price</th>
                                <th className='py-2 px-4 border-b'>Sizes</th>
                                <th className='py-2 px-4 border-b'>Total Stock</th>
                                <th className='py-2 px-4 border-b'>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product, index) => {
                                const totalStock = product.pscs.reduce(
                                    (acc, psc) => acc + psc.quantity,
                                    0
                                );
                                const productChanges = editedProducts[product.id] || {};

                                return (
                                    <motion.tr
                                        key={index}
                                        initial={{ y: -20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                        className={totalStock > 0 ? 'bg-white' : 'bg-red-100'} // Different color if out of stock
                                    >
                                        <td className='py-2 px-4 border-b'>{product.id}</td>
                                        <td className='py-2 px-4 border-b'>
                                            <Link href={`/products/details/${product.id}`}>
                                                <span className='text-blue-500 hover:underline'>{product.name}</span>
                                            </Link>
                                        </td>
                                        <td className='py-2 px-4 border-b'>{product?.totalViews}</td>
                                        <td className='py-2 px-4 border-b'>{product.color.name}</td>
                                        <td className='py-2 px-4 border-b'>{product.pscs[0]?.category?.name}, {product.pscs[0]?.size?.name} (Total {product.pscs.length} sizes)</td>
                                        <td className='py-2 px-4 border-b'>${product.sellingPrice.toFixed(2)}</td>

                                        <td className=' py-2 px-4 border-b'>
                                            {product.pscs.map((psc) => (
                                                <div key={psc.id} className='grid grid-flow-col col-span-3 space-x-1 space-y-1'>
                                                    <button
                                                        className="px-2 py-1 bg-gray-300 rounded"
                                                        onClick={() => handleQuantityChange(product.id, psc.id, -1)}
                                                        disabled={(psc.quantity + (productChanges[psc.id] || 0)) <= 0}
                                                    >
                                                        -
                                                    </button>
                                                    <span>{psc.size?.name}: {psc.quantity + (productChanges[psc.id] || 0)}</span>
                                                    <button
                                                        className="px-2 py-1 bg-gray-300 rounded"
                                                        onClick={() => handleQuantityChange(product.id, psc.id, 1)}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            ))}
                                        </td>

                                        <td className='py-2 px-4 border-b'>
                                            {totalStock > 0 ? totalStock : <span className="text-red-500">Out of stock</span>}
                                        </td>
                                        <td className='py-2 px-4 border-b flex gap-2 items-center'>
                                            <Link href={`/admin/edit/product/${product.id}`}>
                                                <span className='text-blue-500 hover:underline'>Edit</span>
                                            </Link>
                                            <span>|</span>
                                            <button onClick={() => openDeleteModal(product.id)}>
                                                <span className='text-red-500 hover:underline'>Delete</span>
                                            </button>
                                            <span>|</span>
                                            <button onClick={() => handleSave(product.id)} className={`btn btn-sm ${editedProducts[product.id] ? 'btn-success' : 'btn-disabled'}`}>
                                                <span className=' hover:underline'>
                                                    Save
                                                </span>
                                            </button>
                                            <span>|</span>
                                            <button onClick={() => handleCancel(product.id)} className={`btn btn-sm ${editedProducts[product.id] ? 'btn-warning' : 'btn-disabled'}`}>
                                                <span className='hover:underline'>Cancel</span>
                                            </button>
                                            {/* )} */}
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                ) : (
                    <p className='text-center text-gray-600'>No products found.</p>
                )}
            </div>

            <Modal
                isOpen={isDeleteModalOpen}
                onRequestClose={closeDeleteModal}
                contentLabel="Confirm Delete"
                ariaHideApp={false}
                className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
            >
                <div className="bg-white p-8 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold mb-4">Confirm Delete</h2>
                    <p>Are you sure you want to delete this product? This action cannot be undone.</p>
                    <div className="flex justify-end gap-4 mt-4">
                        <button onClick={closeDeleteModal} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
                        <button onClick={handleDelete} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Confirm</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ShowProducts;

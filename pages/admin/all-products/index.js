import React, { useContext, useState } from 'react';
import { AuthContext } from '../../../Contexts/Auth/AuthProvider';
import Loading from '../../../components/Loading';
import Link from 'next/link';
import { motion } from 'framer-motion';
import useProduct from '../../../Hooks/useProduct';
import useAxiosPublic from '../../../Hooks/useAxiosPublic';
import Modal from 'react-modal';

const ShowProducts = () => {
    const { user, loading } = useContext(AuthContext);
    const [products, refetch] = useProduct({ publishable: true });
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const axiosPublic = useAxiosPublic()

    console.log(products, 'products');

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

    return (
        <div className='min-h-screen bg-gray-100 p-8'>
            <h1 className='text-3xl font-bold text-center mb-8'>Products</h1>
            <div className='container mx-auto'>
                {loading ? (
                    <Loading />
                ) : products.length > 0 ? (
                    <table className='min-w-full bg-white'>
                        <thead>
                            <tr>
                                <th className='py-2 px-4 border-b'>ID</th>
                                <th className='py-2 px-4 border-b'>Product Name</th>
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
                                        <td className='py-2 px-4 border-b'>{product.color.name}</td>
                                        <td className='py-2 px-4 border-b'>{product.pscs[0]?.category?.name || 'Uncategorized'}</td>
                                        <td className='py-2 px-4 border-b'>${product.sellingPrice.toFixed(2)}</td>
                                        <td className='py-2 px-4 border-b'>
                                            {product.pscs.map((psc) => (
                                                <span key={psc.id} className='block'>
                                                    {psc.size?.name}: {psc.quantity}
                                                </span>
                                            ))}
                                        </td>
                                        <td className='py-2 px-4 border-b'>
                                            {totalStock > 0 ? totalStock : <span className="text-red-500">Out of stock</span>}
                                        </td>
                                        <td className='py-2 px-4 border-b flex gap-2'>
                                            <Link href={`/products/edit/${product.id}`}>
                                                <span className='text-blue-500 hover:underline'>Edit</span>
                                            </Link>
                                            <span>|</span>
                                            <button onClick={() => openDeleteModal(product.id)}>
                                                <span className='text-red-500 hover:underline'>Delete</span>
                                            </button>
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

import { useState, useMemo, useContext } from 'react';
import useAxiosPublic from '../../../Hooks/useAxiosPublic';
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table';
import Link from 'next/link';
import Modal from 'react-modal';
import useLoadProducts from '../../../Hooks/useLoadProducts';
import { AuthContext } from '../../../Contexts/Auth/AuthProvider';
import Head from 'next/head';

const Index = () => {
    const axiosPublic = useAxiosPublic();
    const { user } = useContext(AuthContext)

    const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const [unpublishedProducts, refetch] = useLoadProducts();

    const [token, setToken] = useState('')

    useEffect(() => {
        const at = localStorage.getItem('access_token');
        setToken(at)
    }, [])

    const openPublishModal = (product) => {
        setSelectedProduct(product);
        setIsPublishModalOpen(true);
    };

    const closePublishModal = () => {
        setIsPublishModalOpen(false);
        setSelectedProduct(null);
    };

    const openDeleteModal = (product) => {
        setSelectedProduct(product);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setSelectedProduct(null);
    };

    const handlePublish = async () => {
        if (selectedProduct) {
            try {
                await axiosPublic.put(
                    `/admin/publish-product/${selectedProduct.id}`,
                    { publishable: true }, // <-- this is the request body
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                refetch();
                closePublishModal();
            } catch (error) {
                console.error('Error publishing product:', error);
            }
        }
    };

    const handleDelete = async () => {
        if (selectedProduct) {
            try {
                await axiosPublic.delete(`/admin/delete-product/${selectedProduct.id}?email=${user?.email}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                refetch();
                closeDeleteModal();
            } catch (error) {
                console.error('Error deleting product:', error);
            }
        }
    };

    const columnHelper = createColumnHelper();

    const columns = useMemo(() => [
        columnHelper.accessor('id', {
            header: 'ID',
            cell: info => info.getValue(),
        }),
        columnHelper.accessor('name', {
            header: 'Name',
            cell: info => info.getValue(),
        }),
        columnHelper.accessor('serialNo', {
            header: 'Serial No',
            cell: info => info.getValue(),
        }),
        columnHelper.accessor('sellingPrice', {
            header: 'Price',
            cell: info => `$${info.getValue()}`,
        }),
        columnHelper.accessor('description', {
            header: 'Description',
            cell: info => {
                const description = info.getValue();
                return description.length > 50 ? `${description.substring(0, 50)}...` : description;
            },
        }),
        columnHelper.accessor('createdAt', {
            header: 'Created At',
            cell: info => {
                const date = new Date(Date.parse(info.getValue()));
                return date.toLocaleString();
            },
        }),
        columnHelper.accessor('filename', {
            header: 'Image',
            cell: info => <img src={`${process.env.NEXT_PUBLIC_API}/admin/getimage/${info.getValue()}`} alt="Product" className="w-16 h-16 object-cover inline-block" />,
        }),
        columnHelper.display({
            id: 'actions',
            header: 'Actions',
            cell: info => {
                const product = info.row.original;
                return (
                    <div className='flex gap-5'>
                        <Link href={`/products/details/${product.id}`} className="text-blue-500 hover:underline">Details</Link>
                        <button className="text-blue-500 hover:underline" onClick={() => openPublishModal(product)}>Publish</button>
                        <button className="text-red-500 hover:underline" onClick={() => openDeleteModal(product)}>Delete</button>
                    </div>
                );
            },
        }),
    ], []);

    const table = useReactTable({
        data: unpublishedProducts,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="min-h-screen flex flex-col">
            <Head>
                <title>Publish Product</title>
            </Head>
            <div className="flex flex-col items-center text-center mt-8">
                <h1 className="text-3xl font-bold mb-4">Products</h1>
                {unpublishedProducts.length > 0 ? (
                    <div className="w-full max-w-6xl p-4">
                        <h2 className="text-2xl font-semibold mb-4">Unpublished Products</h2>
                        <table className="min-w-full bg-white border border-gray-300">
                            <thead>
                                {table.getHeaderGroups().map(headerGroup => (
                                    <tr key={headerGroup.id}>
                                        {headerGroup.headers.map(header => (
                                            <th
                                                key={header.id}
                                                className="py-2 px-4 border-b border-gray-300 bg-gray-100 text-left text-sm font-semibold"
                                            >
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </thead>
                            <tbody>
                                {table.getRowModel().rows.map(row => (
                                    <tr key={row.id}>
                                        {row.getVisibleCells().map(cell => (
                                            <td
                                                key={cell.id}
                                                className="py-2 px-4 border-b border-gray-300 text-sm"
                                            >
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                {table.getFooterGroups().map(footerGroup => (
                                    <tr key={footerGroup.id}>
                                        {footerGroup.headers.map(header => (
                                            <th key={header.id}>
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.footer,
                                                        header.getContext()
                                                    )}
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </tfoot>
                        </table>
                    </div>
                ) : (
                    <div className="w-full max-w-6xl p-4">
                        <h2 className="text-2xl font-semibold mb-4">No Unpublished Products 🛒</h2>
                        <p className="text-lg">All products are published. Great job! 🎉</p>
                    </div>
                )}

                {/* Publish Confirmation Modal */}
                <Modal
                    isOpen={isPublishModalOpen}
                    onRequestClose={closePublishModal}
                    contentLabel="Confirm Publish"
                    ariaHideApp={false}
                    className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
                >
                    <div className="bg-white p-8 rounded-lg shadow-lg">
                        <h2 className="text-2xl font-bold mb-4">Confirm Publish</h2>
                        <p>Are you sure you want to publish this product?</p>
                        <div className="flex justify-end gap-4 mt-4">
                            <button onClick={closePublishModal} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
                            <button onClick={handlePublish} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Confirm</button>
                        </div>
                    </div>
                </Modal>

                {/* Delete Confirmation Modal */}
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
        </div>
    );
};

export default Index;

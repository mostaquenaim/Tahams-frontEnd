import { useEffect, useState, useMemo } from 'react';
import AdminDrawer from '../../../components/Drawers/AdminDrawer';
import useAxiosPublic from '../../../Hooks/useAxiosPublic';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import Link from 'next/link';
import Modal from 'react-modal';

const Index = () => {
    const axiosPublic = useAxiosPublic();

    const [products, setProducts] = useState([]);
    const [unpublishedProducts, setUnpublishedProducts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const loadProducts = async () => {
        try {
            const result = await axiosPublic.get('/admin/view-all-products');
            console.log(result.data);
            setProducts(result.data);
            const unpublished = result.data.filter(item => !item.publishable);
            setUnpublishedProducts(unpublished);
        } catch (error) {
            console.error('Error loading products:', error);
        }
    };

    const openModal = (product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedProduct(null);
    };

    const handlePublish = async () => {
        if (selectedProduct) {
            try {
                await axiosPublic.put(`/admin/publish-product/${selectedProduct.id}`, { publishable: true });
                loadProducts();
                closeModal();
            } catch (error) {
                console.error('Error publishing product:', error);
            }
        }
    };

    useEffect(() => {
        loadProducts();
    }, []);

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
                        <button className="text-blue-500 hover:underline" onClick={() => openModal(product)}>Publish</button>
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
            <AdminDrawer />
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
                <Modal
                    isOpen={isModalOpen}
                    onRequestClose={closeModal}
                    contentLabel="Confirm Publish"
                    ariaHideApp={false}
                    className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
                >
                    <div className="bg-white p-8 rounded-lg shadow-lg">
                        <h2 className="text-2xl font-bold mb-4">Confirm Publish</h2>
                        <p>Are you sure you want to publish this product?</p>
                        <div className="flex justify-end gap-4 mt-4">
                            <button onClick={closeModal} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
                            <button onClick={handlePublish} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Confirm</button>
                        </div>
                    </div>
                </Modal>
            </div>
        </div>
    );
};

export default Index;

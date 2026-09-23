import { useState, useMemo, useContext } from 'react';
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { FiExternalLink, FiImage, FiPlus, FiTrash2, FiUploadCloud } from 'react-icons/fi';
import useAxiosSecure from '../../../Hooks/useAxiosSecure';
import useLoadProducts from '../../../Hooks/useLoadProducts';
import { AuthContext } from '../../../Contexts/Auth/AuthProvider';
import {
    AdminPage,
    Button,
    IconButton,
    Modal,
    PageHeader,
    TBody,
    THead,
    Table,
    TableCard,
    TableEmpty,
    TableFooter,
    Td,
    Th,
    Tr,
} from '../../../components/Admin';

const Index = () => {
    const axiosSecure = useAxiosSecure();
    const { user, backendEmail } = useContext(AuthContext)

    const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [busy, setBusy] = useState(false);

    const [unpublishedProducts, refetch] = useLoadProducts();

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
            setBusy(true);
            try {
                await axiosSecure.put(
                    `/admin/publish-product/${selectedProduct.id}`,
                    { publishable: true }, // <-- this is the request body
                );
                refetch();
                closePublishModal();
            } catch (error) {
                console.error('Error publishing product:', error);
            } finally {
                setBusy(false);
            }
        }
    };

    const handleDelete = async () => {
        if (selectedProduct) {
            setBusy(true);
            try {
                await axiosSecure.delete(`/admin/delete-product/${selectedProduct.id}?email=${user?.email || backendEmail}`);
                refetch();
                closeDeleteModal();
            } catch (error) {
                console.error('Error deleting product:', error);
            } finally {
                setBusy(false);
            }
        }
    };

    const columnHelper = createColumnHelper();

    const columns = useMemo(() => [
        columnHelper.accessor('name', {
            header: 'Product',
            cell: info => {
                const product = info.row.original;
                return (
                    <div className="flex min-w-[14rem] items-center gap-3">
                        {product.filename ? (
                            <img
                                src={`${process.env.NEXT_PUBLIC_API}/admin/getimage/${product.filename}`}
                                alt={product.name}
                                className="h-10 w-10 shrink-0 rounded-lg border border-gray-200 object-cover"
                            />
                        ) : (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
                                <FiImage className="h-4 w-4" />
                            </div>
                        )}
                        <div className="min-w-0">
                            <p className="truncate font-medium text-gray-900">{info.getValue()}</p>
                            <p className="text-xs text-gray-500">#{product.id}</p>
                        </div>
                    </div>
                );
            },
        }),
        columnHelper.accessor('serialNo', {
            header: 'Serial no.',
            cell: info => info.getValue() || '—',
            meta: { nowrap: true },
        }),
        columnHelper.accessor('sellingPrice', {
            header: 'Price',
            cell: info => (
                <span className="font-medium tabular-nums text-gray-900">
                    ৳{Number(info.getValue() || 0).toLocaleString()}
                </span>
            ),
            meta: { align: 'right', nowrap: true },
        }),
        columnHelper.accessor('description', {
            header: 'Description',
            cell: info => {
                const description = info.getValue() || '';
                return (
                    <p className="max-w-xs truncate text-gray-600" title={description}>
                        {description}
                    </p>
                );
            },
        }),
        columnHelper.accessor('createdAt', {
            header: 'Created',
            cell: info => {
                const date = new Date(Date.parse(info.getValue()));
                return (
                    <>
                        <p className="text-gray-700">
                            {date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                        <p className="text-xs text-gray-500">
                            {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </>
                );
            },
            meta: { nowrap: true },
        }),
        columnHelper.display({
            id: 'actions',
            header: 'Actions',
            cell: info => {
                const product = info.row.original;
                return (
                    <div className="flex items-center justify-end gap-1">
                        <IconButton
                            label="View product page"
                            icon={<FiExternalLink />}
                            href={`/products/details/${product.productId}`}
                        />
                        <Button size="sm" variant="primary" icon={<FiUploadCloud />} onClick={() => openPublishModal(product)}>
                            Publish
                        </Button>
                        <IconButton
                            label="Delete"
                            icon={<FiTrash2 />}
                            variant="ghost-danger"
                            onClick={() => openDeleteModal(product)}
                        />
                    </div>
                );
            },
            meta: { align: 'right', nowrap: true },
        }),
    ], []);

    const table = useReactTable({
        data: unpublishedProducts,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <AdminPage title="Unpublished products">
            <PageHeader
                title="Unpublished products"
                description="Review draft products and publish them to the store."
                actions={
                    <Button variant="primary" icon={<FiPlus />} href="/admin/add/add-product">
                        Add product
                    </Button>
                }
            />

            <TableCard
                footer={
                    <TableFooter>
                        {unpublishedProducts.length} unpublished {unpublishedProducts.length === 1 ? 'product' : 'products'}
                    </TableFooter>
                }
            >
                <Table>
                    <THead>
                        {table.getHeaderGroups()[0]?.headers.map(header => (
                            <Th key={header.id} align={header.column.columnDef.meta?.align}>
                                {header.isPlaceholder
                                    ? null
                                    : flexRender(
                                        header.column.columnDef.header,
                                        header.getContext()
                                    )}
                            </Th>
                        ))}
                    </THead>
                    <TBody>
                        {table.getRowModel().rows.length === 0 ? (
                            <TableEmpty
                                colSpan={columns.length}
                                icon={<FiUploadCloud />}
                                title="Nothing waiting to be published"
                                description="All products are published."
                            />
                        ) : (
                            table.getRowModel().rows.map(row => (
                                <Tr key={row.id}>
                                    {row.getVisibleCells().map(cell => (
                                        <Td
                                            key={cell.id}
                                            align={cell.column.columnDef.meta?.align}
                                            nowrap={cell.column.columnDef.meta?.nowrap}
                                        >
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </Td>
                                    ))}
                                </Tr>
                            ))
                        )}
                    </TBody>
                </Table>
            </TableCard>

            {/* Publish Confirmation Modal */}
            <Modal
                open={isPublishModalOpen}
                onClose={closePublishModal}
                icon={<FiUploadCloud />}
                tone="info"
                title="Publish this product?"
                description={selectedProduct && `"${selectedProduct.name}" will become visible in the store.`}
                footer={
                    <>
                        <Button onClick={closePublishModal}>Cancel</Button>
                        <Button variant="primary" loading={busy} onClick={handlePublish}>Publish</Button>
                    </>
                }
            />

            {/* Delete Confirmation Modal */}
            <Modal
                open={isDeleteModalOpen}
                onClose={closeDeleteModal}
                icon={<FiTrash2 />}
                tone="danger"
                title="Delete this product?"
                description="This action cannot be undone."
                footer={
                    <>
                        <Button onClick={closeDeleteModal}>Cancel</Button>
                        <Button variant="danger" loading={busy} onClick={handleDelete}>Delete</Button>
                    </>
                }
            />
        </AdminPage>
    );
};

export default Index;

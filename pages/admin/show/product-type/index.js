import { useState } from "react";
import Swal from "sweetalert2";
import { FiCheck, FiEdit2, FiImage, FiPlus, FiTrash2, FiType, FiUpload, FiX } from "react-icons/fi";
import useLoadSubSubCategories from "../../../../Hooks/useLoadSubSubCategories";
import useAxiosSecure from "../../../../Hooks/useAxiosSecure";
import {
    AdminPage,
    Button,
    FileInput,
    IconButton,
    Input,
    Modal,
    PageHeader,
    SearchInput,
    SkeletonRows,
    TBody,
    THead,
    Table,
    TableCard,
    TableEmpty,
    TableFooter,
    Td,
    Th,
    Tr,
} from "../../../../components/Admin";

const ProductType = () => {
    const [subSubCategories, refetch, isPending] = useLoadSubSubCategories();
    const [myfile, setMyFile] = useState('');
    const [editItem, setEditItem] = useState(-1);
    const [savingChart, setSavingChart] = useState(false);
    const [isShowImage, setIsShowImage] = useState(false);
    const [imageToShow, setImageToShow] = useState('');
    const [editNameItemId, setEditNameItemId] = useState(-1);
    const [nameEdits, setNameEdits] = useState({});
    const [searchTerm, setSearchTerm] = useState('');

    const axiosSecure = useAxiosSecure();

    const handleEditSizeChart = async (item) => {
        if (editItem === item.id) {
            if (!myfile) {
                console.error('No file selected');
                return;
            }

            const formData = new FormData();
            formData.append('myFile', myfile);

            setSavingChart(true);
            try {
                const res = await axiosSecure.put(`/admin/update-sub-sub-category/${item.id}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                // console.log(res.data);
                handleCancelEdit();
                refetch();
            } catch (error) {
                console.error('Error uploading file:', error.response?.data || error.message);
            } finally {
                setSavingChart(false);
            }
        } else {
            setMyFile('');
            setEditItem(item.id);
        }
    };

    const handleCancelEdit = () => {
        setEditItem(-1);
        setMyFile('');
    };

    const handleShowImage = (filename) => {
        setImageToShow(`${process.env.NEXT_PUBLIC_API}/admin/getimage/${filename}`);
        setIsShowImage(true);
    };

    const closeImageModal = () => {
        setIsShowImage(false);
        setImageToShow('');
    };

    const handleDeleteCProductType = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
        });

        if (result.isConfirmed) {
            try {
                const response = await axiosSecure.delete(`/admin/delete-product-type/${id}`);

                await Swal.fire(
                    'Deleted!',
                    'Product type has been deleted.',
                    'success'
                );

                refetch(); // Refresh the data after deletion
            } catch (error) {
                console.error('Deleting failed:', error.message);
                Swal.fire(
                    'Failed!',
                    'An error occurred while deleting.',
                    'error'
                );
            }
        }
    };

    const handleChangeProductName = (id) => {
        setEditNameItemId(id);
        const currentItem = subSubCategories.find((item) => item.id === id);
        setNameEdits((prev) => ({ ...prev, [id]: currentItem.name }));
    };

    const handleSaveProductName = async (id) => {
        try {
            const newName = nameEdits[id];

            if (!newName.trim()) {
                return Swal.fire('Validation Error', 'Product name cannot be empty.', 'warning');
            }

          // console.log('come here');
            const res = await axiosSecure.put(`/admin/update-product-type-name/${id}`, {
                name: newName,
            });

            await Swal.fire('Success!', 'Product name updated successfully.', 'success');

            setEditNameItemId(-1);
            refetch();
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Failed to update name.', 'error');
        }
    };

    const handleCancelNameEdit = () => {
        setEditNameItemId(-1);
    };

    const allTypes = subSubCategories || [];
    const lowerSearch = searchTerm.toLowerCase();
    const filteredTypes = allTypes.filter((item) =>
        item.name?.toLowerCase().includes(lowerSearch) ||
        item.category?.name?.toLowerCase().includes(lowerSearch) ||
        item.category?.category?.name?.toLowerCase().includes(lowerSearch)
    );

    return (
        <AdminPage title="Product types">
            <PageHeader
                title="Product types"
                description="Rename product types, update their size charts, or remove them."
                actions={
                    <Button variant="primary" icon={<FiPlus />} href="/admin/add/add-product-type">
                        Add product type
                    </Button>
                }
            />

            <TableCard
                toolbar={
                    <SearchInput
                        value={searchTerm}
                        onValueChange={setSearchTerm}
                        placeholder="Search by name or parent category..."
                    />
                }
                footer={
                    !isPending && (
                        <TableFooter>
                            {filteredTypes.length} of {allTypes.length} product types
                        </TableFooter>
                    )
                }
            >
                <Table>
                    <THead>
                        <Th className="w-16">ID</Th>
                        <Th>Name</Th>
                        <Th>Size chart</Th>
                        <Th>Parent categories</Th>
                        <Th align="right">Actions</Th>
                    </THead>
                    <TBody>
                        {isPending ? (
                            <SkeletonRows rows={6} cols={5} />
                        ) : filteredTypes.length === 0 ? (
                            <TableEmpty
                                colSpan={5}
                                icon={<FiType />}
                                title="No product types found"
                                description={searchTerm ? 'Try a different search.' : 'Add a product type to get started.'}
                            />
                        ) : (
                            filteredTypes.map((item) => (
                                <Tr key={item.id}>
                                    <Td nowrap className="tabular-nums text-gray-500">{item.id}</Td>

                                    {/* item name update / edit  */}
                                    <Td nowrap>
                                        {editNameItemId === item.id ? (
                                            <div className="flex items-center gap-1">
                                                <Input
                                                    size="sm"
                                                    autoFocus
                                                    value={nameEdits[item.id] || ''}
                                                    onChange={(e) =>
                                                        setNameEdits((prev) => ({ ...prev, [item.id]: e.target.value }))
                                                    }
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') handleSaveProductName(item.id);
                                                        if (e.key === 'Escape') handleCancelNameEdit();
                                                    }}
                                                    aria-label="Product type name"
                                                    className="w-44"
                                                />
                                                <IconButton label="Save name" icon={<FiCheck />} variant="ghost-success" onClick={() => handleSaveProductName(item.id)} />
                                                <IconButton label="Cancel" icon={<FiX />} onClick={handleCancelNameEdit} />
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1">
                                                <span className="font-medium text-gray-900">{item.name}</span>
                                                <IconButton label="Rename" icon={<FiEdit2 />} size="sm" onClick={() => handleChangeProductName(item.id)} />
                                            </div>
                                        )}
                                    </Td>

                                    {/* size chart  */}
                                    <Td>
                                        <div className="flex min-w-[14rem] items-center gap-3">
                                            {item.filename ? (
                                                <button
                                                    type="button"
                                                    onClick={() => handleShowImage(item.filename)}
                                                    title="View size chart"
                                                    className="shrink-0 overflow-hidden rounded-lg border border-gray-200 transition hover:border-gray-300 hover:shadow-sm"
                                                >
                                                    <img
                                                        className="h-12 w-12 bg-white object-contain"
                                                        src={`${process.env.NEXT_PUBLIC_API}/admin/getimage/${item.filename}`}
                                                        alt="Size chart"
                                                    />
                                                </button>
                                            ) : (
                                                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-dashed border-gray-300 text-gray-400">
                                                    <FiImage className="h-4 w-4" />
                                                </span>
                                            )}

                                            {editItem === item.id ? (
                                                <div className="flex min-w-0 flex-col gap-2">
                                                    <FileInput onChange={(e) => setMyFile(e.target.files[0])} />
                                                    <div className="flex gap-1.5">
                                                        <Button
                                                            size="sm"
                                                            variant="primary"
                                                            icon={<FiUpload />}
                                                            loading={savingChart}
                                                            disabled={!myfile}
                                                            onClick={() => handleEditSizeChart(item)}
                                                        >
                                                            Save
                                                        </Button>
                                                        <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <Button size="sm" onClick={() => handleEditSizeChart(item)}>
                                                    {item.filename ? 'Replace' : 'Upload'}
                                                </Button>
                                            )}
                                        </div>
                                    </Td>

                                    {/* parent categories  */}
                                    <Td nowrap className="text-gray-600">
                                        {[item.category?.category?.name, item.category?.name].filter(Boolean).join(' › ') || '—'}
                                    </Td>
                                    <Td nowrap align="right">
                                        <IconButton
                                            label="Delete"
                                            icon={<FiTrash2 />}
                                            variant="ghost-danger"
                                            onClick={() => handleDeleteCProductType(item.id)}
                                        />
                                    </Td>
                                </Tr>
                            ))
                        )}
                    </TBody>
                </Table>
            </TableCard>

            {/* Image Modal */}
            <Modal open={isShowImage} onClose={closeImageModal} title="Size chart" size="xl">
                <img src={imageToShow} alt="Size chart" className="mx-auto max-h-[70vh] w-auto rounded-lg object-contain" />
            </Modal>
        </AdminPage>
    );
};

export default ProductType;

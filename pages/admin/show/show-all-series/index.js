import { useState } from 'react';
import Swal from 'sweetalert2';
import { FiEdit2, FiImage, FiList, FiPlus, FiTrash2 } from 'react-icons/fi';
import useAxiosSecure from '../../../../Hooks/useAxiosSecure';
import useLoadSeries from '../../../../Hooks/useLoadSeries';
import { handleUploadWithCloudinary } from '/components/Images/AddImageToCloudinary';
import {
  AdminPage,
  Badge,
  Button,
  FileInput,
  IconButton,
  Input,
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
} from '../../../../components/Admin';

const getAudience = (series) => {
  if (series.isForMen && !series.isForWomen) return 'Men';
  if (!series.isForMen && series.isForWomen) return 'Women';
  return null;
};

const ShowAllSeries = () => {
  const axiosSecure = useAxiosSecure();
  const [series, refetch, isPending] = useLoadSeries();

  const [editId, setEditId] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [nameEdits, setNameEdits] = useState({});
  const [imageEdits, setImageEdits] = useState({});
  const [imagePreview, setImagePreview] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  const handleDeleteCategory = async (id) => {
    const confirm = await Swal.fire({
      title: 'Are you sure?',
      text: 'This will permanently delete the category.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    });

    if (confirm.isConfirmed) {
      try {
        await axiosSecure.delete(`/admin/delete-category/${id}`);

        await Swal.fire('Deleted!', 'Category has been deleted.', 'success');
        refetch();
      } catch (error) {
        console.error('Delete failed:', error);
        Swal.fire('Error', 'Could not delete category.', 'error');
      }
    }
  };

  const handleStartEdit = (id, name, image) => {
    setEditId(id);
    setNameEdits({ ...nameEdits, [id]: name });
    setImagePreview({ ...imagePreview, [id]: image });
  };

  const handleCancelEdit = () => {
    setEditId(null);
    // Clean up preview URLs to prevent memory leaks
    Object.values(imagePreview).forEach((url) => {
      if (url && url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
    setImagePreview({});
    setImageEdits({});
  };

  const handleImageChange = (id, file) => {
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        Swal.fire('Invalid File', 'Please select an image file.', 'error');
        return;
      }

      // Validate file size (e.g., 5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire(
          'File Too Large',
          'Image size should be less than 5MB.',
          'error',
        );
        return;
      }

      setImageEdits({ ...imageEdits, [id]: file });

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview({ ...imagePreview, [id]: previewUrl });
    }
  };

  const handleSaveEdit = async (id) => {
    const newName = nameEdits[id]?.trim();

    if (!newName) {
      return Swal.fire(
        'Validation Error',
        'Category name cannot be empty.',
        'warning',
      );
    }

    setSavingId(id);
    try {
      const formData = new FormData();

      formData.append('name', newName);

      const imageLink = await handleUploadWithCloudinary(imageEdits[id]);

      // Add image if a new one was selected
      //   if (imageEdits[id]) {
      //     formData.append('image', imageEdits[id]);
      //   }

      // console.log(imageLink);

      formData.append('filename', imageLink);

      const res = await axiosSecure.put(`/admin/updateCategory/${id}`, {
        name: newName,
        filename: imageLink,
      });

      await Swal.fire('Updated!', 'Category updated successfully.', 'success');
      setEditId(null);

      // Clean up
      if (imagePreview[id] && imagePreview[id].startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview[id]);
      }
      setImagePreview({});
      setImageEdits({});

      refetch();
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to update category.', 'error');
    } finally {
      setSavingId(null);
    }
  };

  const allSeries = series || [];
  const filteredSeries = allSeries.filter((item) =>
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <AdminPage title="Series">
      <PageHeader
        title="Series"
        description="Rename series, change their cover image, or remove them."
        actions={
          <Button
            variant="primary"
            icon={<FiPlus />}
            href="/admin/add/add-series"
          >
            Add series
          </Button>
        }
      />

      <TableCard
        toolbar={
          <SearchInput
            value={searchTerm}
            onValueChange={setSearchTerm}
            placeholder="Search series..."
          />
        }
        footer={
          !isPending && (
            <TableFooter>
              {filteredSeries.length} of {allSeries.length} series
            </TableFooter>
          )
        }
      >
        <Table>
          <THead>
            <Th className="w-16">ID</Th>
            <Th>Image</Th>
            <Th>Name</Th>
            <Th align="right">Actions</Th>
          </THead>
          <TBody>
            {isPending ? (
              <SkeletonRows rows={6} cols={4} />
            ) : filteredSeries.length === 0 ? (
              <TableEmpty
                colSpan={4}
                icon={<FiList />}
                title="No series found"
                description={
                  searchTerm
                    ? 'Try a different search.'
                    : 'Add a series to get started.'
                }
              />
            ) : (
              filteredSeries.map((cat) => {
                const isEditing = editId === cat.id;
                const previewSrc =
                  isEditing && imagePreview[cat.id]?.startsWith('blob:')
                    ? imagePreview[cat.id]
                    : cat?.filename;
                const audience = getAudience(cat);

                return (
                  <Tr key={cat.id}>
                    <Td nowrap className="tabular-nums text-gray-500">
                      {cat.id}
                    </Td>

                    {/* Image Column */}
                    <Td>
                      <div className="flex items-center gap-3">
                        {previewSrc ? (
                          <img
                            src={previewSrc}
                            alt={cat.name}
                            className="h-12 w-12 shrink-0 rounded-lg border border-gray-200 object-cover"
                          />
                        ) : (
                          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-dashed border-gray-300 text-gray-400">
                            <FiImage className="h-4 w-4" />
                          </span>
                        )}
                        {isEditing && (
                          <FileInput
                            accept="image/*"
                            onChange={(e) =>
                              handleImageChange(cat.id, e.target.files[0])
                            }
                            className="max-w-[14rem]"
                          />
                        )}
                      </div>
                    </Td>

                    {/* Name Column */}
                    <Td nowrap>
                      {isEditing ? (
                        <Input
                          size="sm"
                          autoFocus
                          value={nameEdits[cat.id] || ''}
                          onChange={(e) =>
                            setNameEdits((prev) => ({
                              ...prev,
                              [cat.id]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(cat.id);
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                          aria-label="Series name"
                          className="w-56"
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">
                            {cat.name}
                          </span>
                          {audience && <Badge tone="info">{audience}</Badge>}
                        </div>
                      )}
                    </Td>

                    {/* Action Column */}
                    <Td nowrap align="right">
                      {isEditing ? (
                        <div className="flex justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="primary"
                            loading={savingId === cat.id}
                            onClick={() => handleSaveEdit(cat.id)}
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleCancelEdit}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-0.5">
                          <IconButton
                            label="Edit"
                            icon={<FiEdit2 />}
                            onClick={() =>
                              handleStartEdit(
                                cat.id,
                                cat.name,
                                cat.image || cat.imageUrl,
                              )
                            }
                          />
                          <IconButton
                            label="Delete"
                            icon={<FiTrash2 />}
                            variant="ghost-danger"
                            onClick={() => handleDeleteCategory(cat.id)}
                          />
                        </div>
                      )}
                    </Td>
                  </Tr>
                );
              })
            )}
          </TBody>
        </Table>
      </TableCard>
    </AdminPage>
  );
};

export default ShowAllSeries;

import { useState } from 'react';
import useAxiosPublic from '../../../../Hooks/useAxiosPublic';
import Loading from '../../../../components/Loading';
import Head from 'next/head';
import Swal from 'sweetalert2';
import useLoadSeries from '../../../../Hooks/useLoadSeries';
import { FaFile, FaFileUpload } from 'react-icons/fa';
import { FaFileImage } from 'react-icons/fa6';
import { FiUpload } from 'react-icons/fi';
import { handleUploadWithCloudinary } from '/components/Images/AddImageToCloudinary';

const ShowAllSeries = () => {
  const axiosPublic = useAxiosPublic();
  const [series, refetch, isPending] = useLoadSeries();
  // console.log(series, 'seriesss');

  const [editId, setEditId] = useState(null);
  const [nameEdits, setNameEdits] = useState({});
  const [imageEdits, setImageEdits] = useState({});
  const [imagePreview, setImagePreview] = useState({});

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
        const token = localStorage.getItem('access_token');
        await axiosPublic.delete(`/admin/delete-category/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

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

    try {
      const token = localStorage.getItem('access_token');
      const formData = new FormData();

      formData.append('name', newName);

      const imageLink = await handleUploadWithCloudinary(imageEdits[id]);

      // Add image if a new one was selected
      //   if (imageEdits[id]) {
      //     formData.append('image', imageEdits[id]);
      //   }

      // console.log(imageLink);

      formData.append('filename', imageLink);

      const res = await axiosPublic.put(
        `/admin/updateCategory/${id}`,
        {
          name: newName,
          filename: imageLink,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

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
    }
  };

  return (
    <div className="container mx-auto pt-20 lg:pt-40">
      <Head>
        <title>Series</title>
      </Head>
      <h1 className="text-2xl font-bold mb-6 text-center">All Series</h1>

      {isPending ? (
        <Loading />
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b text-left">ID</th>
                <th className="py-2 px-4 border-b text-left">Image</th>
                {/* <th className="py-2 px-4 border-b text-left">Filename</th> */}
                <th className="py-2 px-4 border-b text-left">Name</th>
                <th className="py-2 px-4 border-b text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {series.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{cat.id}</td>

                  {/* Image Column */}
                  <td className="py-2 px-4 border-b">
                    <div
                      className={`flex ${
                        editId === cat.id && 'flex-col'
                      } items-center gap-2`}
                    >
                      {cat?.filename && (
                        <img
                          src={`${cat.filename}`}
                          alt={cat.name}
                          className="w-16 h-16 object-cover rounded border"
                        />
                      )}
                      {editId === cat.id && (
                        <label>
                          {/* <FiUpload className='text-5xl'></FiUpload> */}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              handleImageChange(cat.id, e.target.files[0])
                            }
                            className=" file-input file-input-xs file-input-bordered max-w-xs"
                          />
                        </label>
                      )}
                    </div>
                  </td>

                  {/* Name Column */}
                  <td className="py-2 px-4 border-b">
                    {editId === cat.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={nameEdits[cat.id] || ''}
                          onChange={(e) =>
                            setNameEdits((prev) => ({
                              ...prev,
                              [cat.id]: e.target.value,
                            }))
                          }
                          className="input input-sm input-bordered"
                        />
                        <button
                          onClick={() => handleSaveEdit(cat.id)}
                          className="btn btn-xs btn-success"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="btn btn-xs btn-warning"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={`${cat.name}${
                            cat.isForMen && !cat.isForWomen
                              ? ' (Men)'
                              : !cat.isForMen && cat.isForWomen
                              ? ' (Women)'
                              : ''
                          }`}
                          disabled
                          className="input input-sm input-bordered"
                        />
                        <button
                          onClick={() =>
                            handleStartEdit(
                              cat.id,
                              cat.name,
                              cat.image || cat.imageUrl,
                            )
                          }
                          className="btn btn-xs btn-primary"
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </td>

                  {/* Action Column */}
                  <td className="py-2 px-4 border-b">
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="btn btn-xs btn-error"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ShowAllSeries;

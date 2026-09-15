import React, { useContext, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  FiCopy,
  FiEdit2,
  FiImage,
  FiMinus,
  FiPackage,
  FiPlus,
  FiSave,
  FiTrash2,
} from 'react-icons/fi';
import { AuthContext } from '../../../Contexts/Auth/AuthProvider';
import useProduct from '../../../Hooks/useProduct';
import useAxiosSecure from '../../../Hooks/useAxiosSecure';
import {
  AdminPage,
  Badge,
  Button,
  IconButton,
  Modal,
  PageHeader,
  Pagination,
  SearchInput,
  SkeletonRows,
  TBody,
  THead,
  Table,
  TableCard,
  TableEmpty,
  Td,
  Th,
  Tr,
} from '../../../components/Admin';

const ShowProducts = () => {
  const { user, loading } = useContext(AuthContext);
  const [products, refetch] = useProduct({ publishable: true });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [editedProducts, setEditedProducts] = useState({});
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [stockModalProduct, setStockModalProduct] = useState(null);
  const [savingStock, setSavingStock] = useState(false);
  const axiosSecure = useAxiosSecure();
  const [syncing, setSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const router = useRouter();

  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'ascending',
  });

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const filteredProducts = useMemo(() => {
    let sortableProducts = [...products];
    if (sortConfig.key) {
      sortableProducts.sort((a, b) => {
        // Handle different data types
        if (sortConfig.key === 'price') {
          if (a.sellingPrice < b.sellingPrice) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
          }
          if (a.sellingPrice > b.sellingPrice) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
          }
        } else if (sortConfig.key === 'stock') {
          const aStock = a.pscs.reduce((acc, psc) => acc + psc.quantity, 0);
          const bStock = b.pscs.reduce((acc, psc) => acc + psc.quantity, 0);
          if (aStock < bStock) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
          }
          if (aStock > bStock) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
          }
        } else if (sortConfig.key === 'views') {
          if ((a.totalViews || 0) < (b.totalViews || 0)) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
          }
          if ((a.totalViews || 0) > (b.totalViews || 0)) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
          }
        } else {
          // Default string comparison
          if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
          }
          if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
          }
        }
        return 0;
      });
    }

    return sortableProducts.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [products, searchTerm, sortConfig]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentProducts = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleDuplicate = (productId) => {
    const product = products.find((p) => p.id === productId);
    if (!product) {
      console.error('Product not found for duplication');
      return;
    }

    const duplicatedProduct = {
      buyingPrice: product.buyingPrice,
      color: product.color,
      description: product.description,
      discountPercentage: product.discountPercentage,
      fabric: product.fabric,
      filename: product.filename,
      ifStock: product.ifStock,
      longDescription: product.longDescription,
      name: product.name + ' Copy',
      note: product.note,
      pscs: product.pscs,
      sellingPrice: product.sellingPrice,
      serialNo: product.serialNo,
      tags: product.tags,
      vatPercentage: product.vatPercentage,
    };

    localStorage.removeItem('duplicate_product_data');
    localStorage.setItem(
      'duplicate_product_data',
      JSON.stringify(duplicatedProduct),
    );
    router.push('/admin/add/add-product');
  };

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
      setDeleting(true);
      try {
        await axiosSecure.delete(
          `/admin/delete-product/${selectedProduct}?email=${user?.email}`,
        );
        refetch();
        closeDeleteModal();
      } catch (error) {
        console.error('Error deleting product:', error);
      } finally {
        setDeleting(false);
      }
    }
  };

  const handleQuantityChange = (productId, pscId, change) => {
    setEditedProducts((prev) => {
      const product = prev[productId] || {};
      const updatedSizes = {
        ...product,
        [pscId]: (product[pscId] || 0) + change,
      };
      return {
        ...prev,
        [productId]: updatedSizes,
      };
    });
  };

  const handleCancel = (productId) => {
    setEditedProducts((prev) => {
      const updated = { ...prev };
      delete updated[productId];
      return updated;
    });
  };

  const handleSave = async (productId) => {
    const updates = editedProducts[productId];
    if (!updates || Object.keys(updates).length === 0) return;

    setSavingStock(true);
    try {
      await axiosSecure.put(`/admin/update-product-stock/${productId}`, {
        stockChanges: updates,
      });
      refetch();
      setEditedProducts((prev) => {
        const updated = { ...prev };
        delete updated[productId];
        return updated;
      });
      setIsStockModalOpen(false);
      setStockModalProduct(null);
    } catch (error) {
      console.error('Error updating product stock:', error);
    } finally {
      setSavingStock(false);
    }
  };

  const openStockModal = (product) => {
    setStockModalProduct(product);
    setIsStockModalOpen(true);
  };

  const closeStockModal = () => {
    if (stockModalProduct) handleCancel(stockModalProduct.id);
    setStockModalProduct(null);
    setIsStockModalOpen(false);
  };

  const handleSyncViews = async () => {
    try {
      setSyncing(true);
      const response = await axiosSecure.get('/admin/sync-view-count');
    // console.log('Sync view count response:', response.data);
    } catch (error) {
      console.error('Error fetching sync view count:', error);
    } finally {
      setSyncing(false);
    }
  };

  const sortableTh = (key, label, align) => (
    <Th
      sortable
      align={align}
      active={sortConfig.key === key}
      direction={sortConfig.direction}
      onSort={() => requestSort(key)}
    >
      {label}
    </Th>
  );

  const pendingStockChanges = Object.keys(
    editedProducts[stockModalProduct?.id] || {},
  ).length;

  return (
    <AdminPage title="Products">
      <PageHeader
        title="Products"
        description="Manage your product inventory and details."
        actions={
          <Button
            variant="primary"
            icon={<FiPlus />}
            href="/admin/add/add-product"
          >
            Add product
          </Button>
        }
      />

      <TableCard
        toolbar={
          <SearchInput
            value={searchTerm}
            onValueChange={handleSearch}
            placeholder="Search products..."
          />
        }
        footer={
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            totalItems={filteredProducts.length}
            pageSize={itemsPerPage}
            onPageChange={handlePageChange}
            itemLabel="products"
          />
        }
      >
        <Table>
          <THead>
            {sortableTh('id', 'ID')}
            {sortableTh('name', 'Product')}
            {sortableTh('views', 'Views', 'right')}
            <Th>Details</Th>
            {sortableTh('price', 'Price', 'right')}
            {sortableTh('stock', 'Stock')}
            <Th align="right">Actions</Th>
          </THead>
          <TBody>
            {loading ? (
              <SkeletonRows rows={8} cols={7} />
            ) : currentProducts.length === 0 ? (
              <TableEmpty
                colSpan={7}
                icon={<FiPackage />}
                title="No products found"
                description="No products match your search."
              />
            ) : (
              currentProducts.map((product) => {
                const totalStock = product.pscs.reduce(
                  (acc, psc) => acc + psc.quantity,
                  0,
                );
                const details = [
                  product.pscs[0]?.category?.name,
                  product.pscs[0]?.size?.name,
                ]
                  .filter(Boolean)
                  .join(' · ');

                return (
                  <Tr key={product.id}>
                    <Td nowrap className="font-medium text-gray-900">
                      #{product.id}
                    </Td>
                    <Td>
                      <div className="flex min-w-[14rem] items-center gap-3">
                        {product.filename ? (
                          <img
                            className="h-10 w-10 shrink-0 rounded-lg border border-gray-200 object-cover"
                            src={`${process.env.NEXT_PUBLIC_API}/admin/getimage/${product.filename}`}
                            alt={product.name}
                          />
                        ) : (
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
                            <FiImage className="h-4 w-4" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <Link
                            href={`/products/details/${product.productId}`}
                            className="block truncate font-medium text-gray-900 hover:underline"
                          >
                            {product.name}
                          </Link>
                          {product.color?.name && (
                            <p className="truncate text-xs text-gray-500">
                              {product.color.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </Td>
                    <Td nowrap align="right" className="tabular-nums">
                      {(product?.totalViews || 0).toLocaleString()}
                    </Td>
                    <Td nowrap className="text-gray-600">
                      <div className="flex items-center gap-2">
                        <span>{details || '—'}</span>
                        {product.pscs.length > 1 && (
                          <Badge>+{product.pscs.length - 1} more</Badge>
                        )}
                      </div>
                    </Td>
                    <Td
                      nowrap
                      align="right"
                      className="font-medium tabular-nums text-gray-900"
                    >
                      ৳{product.sellingPrice.toFixed(2)}
                    </Td>
                    <Td nowrap>
                      {totalStock > 0 ? (
                        <Badge tone="success" dot>
                          {totalStock} in stock
                        </Badge>
                      ) : (
                        <Badge tone="danger" dot>
                          Out of stock
                        </Badge>
                      )}
                    </Td>
                    <Td nowrap align="right">
                      <div className="flex items-center justify-end gap-0.5">
                        <IconButton
                          label="Edit"
                          icon={<FiEdit2 />}
                          href={`/admin/edit/product/${product.productId}`}
                        />
                        <IconButton
                          label="Manage stock"
                          icon={<FiPackage />}
                          onClick={() => openStockModal(product)}
                        />
                        <IconButton
                          label="Duplicate"
                          icon={<FiCopy />}
                          onClick={() => handleDuplicate(product.id)}
                        />
                        <IconButton
                          label="Delete"
                          icon={<FiTrash2 />}
                          variant="ghost-danger"
                          onClick={() => openDeleteModal(product.id)}
                        />
                      </div>
                    </Td>
                  </Tr>
                );
              })
            )}
          </TBody>
        </Table>
      </TableCard>

      {/* Sync Button */}
      {/* <button
        onClick={handleSyncViews}
        disabled={syncing}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg ${syncing ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'} text-white transition-colors`}
      >
        {syncing ? 'Syncing...' : 'Sync Views'}
      </button> */}

      {/* Delete Confirmation Modal */}
      <Modal
        open={isDeleteModalOpen}
        onClose={closeDeleteModal}
        icon={<FiTrash2 />}
        tone="danger"
        title="Delete this product?"
        description="This action cannot be undone."
        size="sm"
        footer={
          <>
            <Button onClick={closeDeleteModal}>Cancel</Button>
            <Button variant="danger" loading={deleting} onClick={handleDelete}>
              Delete
            </Button>
          </>
        }
      />

      {/* Manage Stock Modal */}
      <Modal
        open={isStockModalOpen}
        onClose={closeStockModal}
        title="Manage stock"
        description={stockModalProduct?.name}
        size="lg"
        footer={
          <>
            <Button onClick={closeStockModal} disabled={savingStock}>
              Cancel
            </Button>
            <Button
              variant="primary"
              icon={<FiSave />}
              loading={savingStock}
              disabled={!pendingStockChanges}
              onClick={() => handleSave(stockModalProduct.id)}
            >
              Save changes
            </Button>
          </>
        }
      >
        {stockModalProduct?.pscs?.length ? (
          <ul className="-my-1 divide-y divide-gray-100">
            {stockModalProduct.pscs.map((psc) => {
              const pendingChange =
                (editedProducts[stockModalProduct.id] || {})[psc.id] || 0;
              const displayQty = psc.quantity + pendingChange;

              return (
                <li
                  key={psc.id}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <div className="min-w-0 text-sm">
                    <p className="truncate font-medium text-gray-900">
                      {psc.category?.name}
                    </p>
                    {psc.size?.name && (
                      <p className="text-xs text-gray-500">{psc.size.name}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {pendingChange !== 0 && (
                      <Badge tone="info">
                        {pendingChange > 0 ? `+${pendingChange}` : pendingChange}
                      </Badge>
                    )}
                    <IconButton
                      label="Decrease"
                      icon={<FiMinus />}
                      variant="secondary"
                      size="sm"
                      disabled={displayQty <= 0}
                      onClick={() =>
                        handleQuantityChange(stockModalProduct.id, psc.id, -1)
                      }
                    />
                    <span className="w-8 text-center text-sm font-semibold tabular-nums text-gray-900">
                      {displayQty}
                    </span>
                    <IconButton
                      label="Increase"
                      icon={<FiPlus />}
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        handleQuantityChange(stockModalProduct.id, psc.id, 1)
                      }
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">
            No size/category rows for this product.
          </p>
        )}
      </Modal>
    </AdminPage>
  );
};

export default ShowProducts;

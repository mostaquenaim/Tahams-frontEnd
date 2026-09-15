import React, { useContext, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  FiActivity,
  FiArrowLeft,
  FiCheck,
  FiCopy,
  FiEdit2,
  FiExternalLink,
  FiFileText,
  FiImage,
  FiMail,
  FiMessageSquare,
  FiMoreHorizontal,
  FiPackage,
  FiPlus,
  FiSend,
  FiShoppingBag,
  FiTrash2,
  FiTruck,
  FiUser,
  FiXCircle,
} from 'react-icons/fi';
import { AuthContext } from '../../../../Contexts/Auth/AuthProvider';
import OrderComp from '../../../../components/orderComp';
import useAxiosSecure from '../../../../Hooks/useAxiosSecure';
import useOrderGroup from '/Hooks/useOrderGroup';
import { getOrderStatus } from '../../../../utils/orderStatus';
import {
  AdminPage,
  Badge,
  Button,
  DetailItem,
  DetailList,
  Dropdown,
  DropdownItem,
  EmptyState,
  IconButton,
  Modal,
  PageHeader,
  Section,
  Textarea,
  cx,
} from '../../../../components/Admin';

const NOTE_MAX_LENGTH = 250;

const formatDateTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getCategoryPath = (category) =>
  [category?.category?.category?.name, category?.category?.name, category?.name]
    .filter(Boolean)
    .join(' › ');

function DetailsSkeleton() {
  const bar = 'animate-pulse rounded bg-gray-200/70';
  const card = (lines, height) => (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className={cx(bar, 'h-4 w-32')} />
      <div className="mt-5 space-y-3">
        {Array.from({ length: lines }, (_, i) => (
          <div key={i} className={cx(bar, 'w-full', height)} />
        ))}
      </div>
    </div>
  );

  return (
    <>
      <div className="mb-6 space-y-3">
        <div className={cx(bar, 'h-4 w-28')} />
        <div className={cx(bar, 'h-7 w-56')} />
        <div className={cx(bar, 'h-4 w-44')} />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {card(3, 'h-16')}
          {card(4, 'h-8')}
        </div>
        <div className="space-y-6">
          {card(3, 'h-4')}
          {card(3, 'h-4')}
        </div>
      </div>
    </>
  );
}

const ShowOrderDetails = () => {
  const router = useRouter();
  const { id } = router.query;
  const { loading } = useContext(AuthContext);
  const { specificOrders: group, refetch, isPending } = useOrderGroup(id);
  const axiosSecure = useAxiosSecure();

  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmationMessageBoxOpen, setIsConfirmationMessageBoxOpen] =
    useState(false);
  const [message, setMessage] = useState('');
  const [phoneCopied, setPhoneCopied] = useState(false);

  // Admin note for this order, stored on the order history (adminNote) and
  // also shown on the orders list.
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [noteError, setNoteError] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);

  const history = group?.[0]?.history;
  const customer = group?.[0]?.customer;
  const hasNote = Boolean(history?.adminNote?.trim());

  useEffect(() => {
    setNoteText(history?.adminNote || '');
  }, [history?.adminNote]);

  // Modal handlers
  const openMessageBox = () => setIsConfirmationMessageBoxOpen(true);
  const closeMessageBox = () => setIsConfirmationMessageBoxOpen(false);

  const openConfirmationModal = () => setIsConfirmationModalOpen(true);
  const closeConfirmationModal = () => setIsConfirmationModalOpen(false);

  // Note modal handlers
  const openNoteModal = () => {
    setNoteText(history?.adminNote || '');
    setNoteError('');
    setIsNoteModalOpen(true);
  };
  const closeNoteModal = () => setIsNoteModalOpen(false);

  const handleSaveNote = async () => {
    const normalizedNote = noteText.trim();

    if (!normalizedNote) {
      setNoteError('Note is required.');
      return;
    }

    if (normalizedNote.length > NOTE_MAX_LENGTH) {
      setNoteError(`Note cannot exceed ${NOTE_MAX_LENGTH} characters.`);
      return;
    }

    try {
      setIsSavingNote(true);
      // axiosSecure attaches the admin access_token itself - order-note is
      // guarded by the admin JWT.
      await axiosSecure.patch(`/admin/order-note/${history?.id}`, {
        note: normalizedNote,
      });
      setNoteText(normalizedNote);
      await refetch();
      closeNoteModal();
    } catch (error) {
      console.error('Failed to save order note:', error);
      setNoteError(error.response?.data?.message || 'Failed to save note.');
    } finally {
      setIsSavingNote(false);
    }
  };

  // Handle delete with confirmation
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await axiosSecure.put(`/admin/delete-history/${history?.trackingToken}`);
      closeConfirmationModal();
      router.push('/admin/show/show-orders');
    } catch (error) {
      console.error('Failed to delete order history:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle message sending
  const handleSendMessage = async () => {
    try {
      // Implementation here
      closeMessageBox();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleCancellation = () => {
    router.push(
      `/my-orders/details/cancel-or-return/${history?.trackingToken}`,
    );
  };

  // Opened in a new tab there is no page to go back to.
  const goBackToOrders = () => {
    if (window.history.length > 1) router.back();
    else router.push('/admin/show/show-orders');
  };

  const phone = history?.phone_no || customer?.mbl_no;

  const copyPhone = async () => {
    try {
      await navigator.clipboard.writeText(String(phone));
      setPhoneCopied(true);
      setTimeout(() => setPhoneCopied(false), 1500);
    } catch (error) {
      console.error('Could not copy phone number:', error);
    }
  };

  const isLoading = loading || isPending;
  const notFound = !isLoading && group.length === 0;

  const subtotal = group.reduce((acc, order) => acc + (order.totalPrice || 0), 0);
  const deliveryFee = history?.deliveryFee || 0;
  const status = getOrderStatus(history);
  const customerName = customer?.name || history?.fullName;
  const paymentProofSrc =
    history?.screenshot &&
    `${process.env.NEXT_PUBLIC_API}/admin/getimage/${history.screenshot}`;

  return (
    <AdminPage
      title={history?.id ? `Order #${history.id}` : 'Order details'}
      width="narrow"
    >
      {isLoading ? (
        <DetailsSkeleton />
      ) : notFound ? (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <EmptyState
            icon={<FiPackage />}
            title="Order not found"
            description="This order may have been deleted, or the link is wrong."
            action={
              <Button icon={<FiArrowLeft />} href="/admin/show/show-orders">
                Back to orders
              </Button>
            }
          />
        </div>
      ) : (
        <>
          <PageHeader
            eyebrow={
              <button
                type="button"
                onClick={goBackToOrders}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
              >
                <FiArrowLeft className="h-4 w-4" />
                Back to orders
              </button>
            }
            title={`Order #${history?.id}`}
            badge={
              <>
                <Badge tone={status.tone} dot>
                  {status.label}
                </Badge>
                {history?.isChecked ? (
                  <Badge tone="success">
                    <FiCheck className="h-3 w-3" />
                    Checked
                  </Badge>
                ) : (
                  <Badge>Not checked</Badge>
                )}
              </>
            }
            description={`Placed on ${formatDateTime(history?.BuyingDate)}`}
            actions={
              <>
                <Button icon={<FiMail />} onClick={openMessageBox}>
                  Send message
                </Button>
                <Dropdown label="More" icon={<FiMoreHorizontal />} width="w-48">
                  <DropdownItem
                    icon={<FiXCircle />}
                    onClick={handleCancellation}
                  >
                    Cancel order
                  </DropdownItem>
                  <DropdownItem
                    icon={<FiTrash2 />}
                    tone="danger"
                    onClick={openConfirmationModal}
                  >
                    Delete order
                  </DropdownItem>
                </Dropdown>
              </>
            }
          />

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main column */}
            <div className="min-w-0 space-y-6 lg:col-span-2">
              <Section
                title="Items"
                icon={<FiShoppingBag />}
                actions={
                  <span className="text-xs text-gray-500">
                    {group.length} {group.length === 1 ? 'item' : 'items'}
                  </span>
                }
              >
                <ul className="divide-y divide-gray-100">
                  {group.map((order) => {
                    const productHref = `/products/details/${order.product?.productId}`;
                    const isCouples =
                      order.category?.category?.category?.name === 'Couples';

                    return (
                      <li
                        key={order.id}
                        className="flex gap-4 py-4 first:pt-0 last:pb-0"
                      >
                        <Link
                          href={productHref}
                          className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 transition hover:border-gray-300"
                        >
                          {order.product?.filename ? (
                            <Image
                              src={`${process.env.NEXT_PUBLIC_API}/admin/getimage/${order.product.filename}`}
                              alt={order.product?.name || 'Product image'}
                              fill
                              sizes="80px"
                              className="object-cover"
                            />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center text-gray-400">
                              <FiImage className="h-5 w-5" />
                            </span>
                          )}
                        </Link>
                        <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:justify-between sm:gap-4">
                          <div className="min-w-0">
                            <Link
                              href={productHref}
                              className="font-medium text-gray-900 hover:underline"
                            >
                              {order.product?.name || 'Unavailable product'}
                            </Link>
                            {getCategoryPath(order.category) && (
                              <p className="mt-0.5 text-xs text-gray-500">
                                {getCategoryPath(order.category)}
                              </p>
                            )}
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              <Badge>
                                {isCouples ? 'Male size' : 'Size'}: {order.size}
                              </Badge>
                              {isCouples && (
                                <Badge>Female size: {order.femaleSize}</Badge>
                              )}
                              <Badge>Qty: {order.Quantity}</Badge>
                            </div>
                          </div>
                          <p className="shrink-0 font-semibold tabular-nums text-gray-900">
                            ৳{(order.totalPrice || 0).toLocaleString()}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </Section>

              <Section
                title="Order progress"
                icon={<FiActivity />}
                bodyClassName="px-5 py-2"
              >
                <OrderComp
                  orderDetails={history}
                  admin={true}
                  onUpdated={refetch}
                />
              </Section>

              {paymentProofSrc && (
                <Section
                  title="Payment proof"
                  icon={<FiImage />}
                  actions={
                    <IconButton
                      label="Open full size"
                      icon={<FiExternalLink />}
                      href={paymentProofSrc}
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  }
                >
                  <div className="relative h-96 w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                    <Image
                      src={paymentProofSrc}
                      alt="Payment proof"
                      fill
                      sizes="(min-width: 1024px) 66vw, 100vw"
                      className="object-contain"
                    />
                  </div>
                </Section>
              )}
            </div>

            {/* Sidebar */}
            <div className="min-w-0 space-y-6">
              <Section title="Summary" icon={<FiFileText />}>
                <DetailList>
                  <DetailItem label="Subtotal">
                    <span className="tabular-nums">
                      ৳{subtotal.toLocaleString()}
                    </span>
                  </DetailItem>
                  <DetailItem label="Delivery fee">
                    <span className="tabular-nums">
                      ৳{deliveryFee.toLocaleString()}
                    </span>
                  </DetailItem>
                </DetailList>
                <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-3">
                  <span className="text-sm font-semibold text-gray-900">
                    Total
                  </span>
                  <span className="text-lg font-semibold tabular-nums text-gray-900">
                    ৳{(subtotal + deliveryFee).toLocaleString()}
                  </span>
                </div>
              </Section>

              <Section title="Customer" icon={<FiUser />}>
                <DetailList>
                  <DetailItem label="Name">{customerName || 'N/A'}</DetailItem>
                  {customer?.email && (
                    <DetailItem label="Email">
                      <a
                        href={`mailto:${customer.email}`}
                        className="break-all hover:underline"
                      >
                        {customer.email}
                      </a>
                    </DetailItem>
                  )}
                  <DetailItem label="Phone">
                    {phone ? (
                      <span className="inline-flex items-center gap-1">
                        <a
                          href={`tel:${phone}`}
                          className="tabular-nums hover:underline"
                        >
                          {phone}
                        </a>
                        <IconButton
                          size="sm"
                          label={phoneCopied ? 'Copied' : 'Copy phone'}
                          icon={
                            phoneCopied ? (
                              <FiCheck className="text-emerald-600" />
                            ) : (
                              <FiCopy />
                            )
                          }
                          onClick={copyPhone}
                          className="-my-1 text-gray-400"
                        />
                      </span>
                    ) : (
                      'N/A'
                    )}
                  </DetailItem>
                </DetailList>
              </Section>

              <Section
                title="Admin note"
                icon={<FiMessageSquare />}
                actions={
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={hasNote ? <FiEdit2 /> : <FiPlus />}
                    onClick={openNoteModal}
                  >
                    {hasNote ? 'Edit' : 'Add'}
                  </Button>
                }
              >
                {hasNote ? (
                  <p className="whitespace-pre-wrap break-words rounded-lg border border-amber-100 bg-amber-50/60 p-3 text-sm text-gray-800">
                    {history.adminNote}
                  </p>
                ) : (
                  <p className="text-sm text-gray-400">
                    No note yet. Use it to record calls, delays or
                    cancellation reasons.
                  </p>
                )}
              </Section>

              <Section title="Delivery" icon={<FiTruck />}>
                <DetailList>
                  <DetailItem label="Address" stacked>
                    {history?.address || 'N/A'}
                  </DetailItem>
                  {history?.city && (
                    <DetailItem label="City">{history.city}</DetailItem>
                  )}
                  {history?.region && (
                    <DetailItem label="Region">{history.region}</DetailItem>
                  )}
                  <DetailItem label="Payment method">
                    {history?.paymentMethod?.name || 'N/A'}
                  </DetailItem>
                </DetailList>
              </Section>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        open={isConfirmationModalOpen}
        onClose={closeConfirmationModal}
        icon={<FiTrash2 />}
        tone="danger"
        title="Delete this order?"
        description="This action cannot be undone."
        size="sm"
        footer={
          <>
            <Button onClick={closeConfirmationModal}>Cancel</Button>
            <Button variant="danger" loading={isDeleting} onClick={handleDelete}>
              Delete order
            </Button>
          </>
        }
      />

      {/* Message Modal */}
      <Modal
        open={isConfirmationMessageBoxOpen}
        onClose={closeMessageBox}
        title="Send message"
        description={customerName && `To ${customerName}`}
        footer={
          <>
            <Button onClick={closeMessageBox}>Cancel</Button>
            <Button variant="primary" icon={<FiSend />} onClick={handleSendMessage}>
              Send message
            </Button>
          </>
        }
      >
        <Textarea
          rows={6}
          placeholder="Type your message here..."
          aria-label="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </Modal>

      {/* Note Modal */}
      <Modal
        open={isNoteModalOpen}
        onClose={closeNoteModal}
        title={hasNote ? 'Edit note' : 'Add note'}
        description="Shown on the orders list next to this order."
        footer={
          <>
            <Button onClick={closeNoteModal}>Cancel</Button>
            <Button
              variant="primary"
              loading={isSavingNote}
              onClick={handleSaveNote}
            >
              Save note
            </Button>
          </>
        }
      >
        <Textarea
          rows={5}
          autoFocus
          maxLength={NOTE_MAX_LENGTH}
          placeholder="e.g. didn't answer call, cancelled - reason..."
          aria-label="Note"
          value={noteText}
          onChange={(e) => {
            setNoteText(e.target.value);
            setNoteError('');
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSaveNote();
          }}
        />
        <div className="mt-2 flex items-center justify-between gap-3 text-xs">
          <span className="text-red-600">{noteError}</span>
          <span
            className={cx(
              'tabular-nums',
              noteText.length > NOTE_MAX_LENGTH - 10
                ? 'font-semibold text-amber-700'
                : 'text-gray-500',
            )}
          >
            {noteText.length}/{NOTE_MAX_LENGTH}
          </span>
        </div>
      </Modal>
    </AdminPage>
  );
};

export default ShowOrderDetails;

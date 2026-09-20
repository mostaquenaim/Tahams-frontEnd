import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiPackage, FiTruck, FiUser } from 'react-icons/fi';
import useAxiosPublic from '../../../Hooks/useAxiosPublic';
import useAxiosSecure from '../../../Hooks/useAxiosSecure';
import {
  AdminPage,
  Alert,
  Button,
  Field,
  Input,
  PageHeader,
  Section,
  Select,
  Textarea,
  getErrorMessage,
} from '../../../components/Admin';

const STORE_ID = 31663;

const INITIAL_FORM = {
  merchant_order_id: '',
  recipient_name: '',
  recipient_phone: '',
  recipient_address: '',
  delivery_type: '48',
  item_type: '2',
  special_instruction: '',
  item_quantity: '1',
  item_weight: '0.5',
  item_description: '',
  amount_to_collect: '0',
};

const PHONE_PATTERN = /^(?:\+?88)?01\d{9}$/;

const describeItems = (orders) =>
  orders
    .map(
      (order) =>
        `${order.ProductName || 'Product'} - Size: ${
          order.size || 'N/A'
        } - Qty: ${order.Quantity || 1}`,
    )
    .join(', ');

// The orders list stashes the chosen order in localStorage before navigating
// here so the form can be pre-filled.
const readPathaoHistory = () => {
  try {
    const raw = localStorage.getItem('pathaoHistory');
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error('Error parsing pathaoHistory:', error);
    return null;
  }
};

const buildInitialForm = (data) => {
  const history = data.history;
  const orders = data.orders || [];
  const totalQuantity = orders.reduce(
    (sum, order) => sum + (order.Quantity || 1),
    0,
  );
  const amount = (Number(data.totalPrice) || 0) + (Number(data.deliveryFee) || 0);

  return {
    ...INITIAL_FORM,
    recipient_name: history?.fullName || '',
    recipient_phone: history?.phone_no || '',
    recipient_address: [history?.address, history?.city, history?.region]
      .filter(Boolean)
      .join(', '),
    amount_to_collect: String(amount),
    item_description: describeItems(orders) || `Order #${history?.id ?? ''}`,
    merchant_order_id: history?.id
      ? `ORDER-${history.id}`
      : `ORDER-${Date.now()}`,
    item_quantity: String(totalQuantity || 1),
  };
};

const AddPathaoOrder = () => {
  const axiosPublic = useAxiosPublic();
  const axiosSecure = useAxiosSecure();

  const [form, setForm] = useState(INITIAL_FORM);
  const [orderData, setOrderData] = useState(null);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [warning, setWarning] = useState('');
  const [loading, setLoading] = useState(false);
  // Set once Pathao has accepted the order, to block accidental duplicates.
  const [created, setCreated] = useState(false);

  useEffect(() => {
    const data = readPathaoHistory();
    if (!data) return;
    setOrderData(data);
    setForm(buildInitialForm(data));
  }, []);

  const set = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setFormError('');
  };

  const validate = () => {
    const next = {};
    if (!form.recipient_name.trim()) next.recipient_name = 'Name is required.';
    const phone = form.recipient_phone.replace(/\s|-/g, '');
    if (!phone) next.recipient_phone = 'Phone is required.';
    else if (!PHONE_PATTERN.test(phone)) {
      next.recipient_phone = 'Enter an 11-digit number like 01XXXXXXXXX.';
    }
    if (!form.recipient_address.trim()) {
      next.recipient_address = 'Address is required.';
    }
    if (!(Number(form.item_quantity) >= 1)) {
      next.item_quantity = 'Quantity must be at least 1.';
    }
    if (!(Number(form.item_weight) > 0)) {
      next.item_weight = 'Weight must be greater than 0.';
    }
    if (!form.item_description.trim()) {
      next.item_description = 'Describe the items.';
    }
    if (form.amount_to_collect === '' || Number(form.amount_to_collect) < 0) {
      next.amount_to_collect = 'Enter 0 or more.';
    }
    return next;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    setWarning('');

    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const payload = {
      store_id: STORE_ID,
      merchant_order_id:
        form.merchant_order_id.trim() || `ORDER-${Date.now()}`,
      recipient_name: form.recipient_name.trim(),
      recipient_phone: form.recipient_phone.replace(/\s|-/g, ''),
      recipient_address: form.recipient_address.trim(),
      delivery_type: Number(form.delivery_type),
      item_type: Number(form.item_type),
      special_instruction: form.special_instruction.trim(),
      item_quantity: Number(form.item_quantity),
      item_weight: String(form.item_weight),
      item_description: form.item_description.trim(),
      amount_to_collect: Number(form.amount_to_collect),
    };

    setLoading(true);
    let pathaoData;
    try {
      const res = await axiosSecure.post('/admin/create-pathao-order', payload);
      pathaoData = res.data;
    } catch (err) {
      console.error(err);
      setFormError(getErrorMessage(err, 'Failed to place the Pathao order.'));
      setLoading(false);
      return;
    }

    toast.success('Pathao order placed');

    // Save the courier details against the order. The Pathao order already
    // exists at this point, so a failure here must not look like a total failure.
    const trackingToken = orderData?.history?.trackingToken;
    if (trackingToken) {
      try {
        await axiosPublic.post(
          `/admin/add-courier/${trackingToken}`,
          {
            consignment_id: pathaoData?.data?.consignment_id || null,
            merchant_order_id:
              pathaoData?.data?.merchant_order_id || payload.merchant_order_id,
            order_status: pathaoData?.data?.status || 'pending',
            delivery_fee: pathaoData?.data?.delivery_fee || 0,
            courier_name: 'Pathao',
            tracking_number: trackingToken,
            recipient_name: payload.recipient_name,
            recipient_phone: payload.recipient_phone,
            delivery_address: payload.recipient_address,
          },
          { headers: { 'Content-Type': 'application/json' } },
        );
      } catch (err) {
        console.error(err);
        setWarning(
          `The Pathao order was created (${
            pathaoData?.data?.consignment_id
              ? `consignment ${pathaoData.data.consignment_id}`
              : payload.merchant_order_id
          }) but its courier details could not be saved to the order: ${getErrorMessage(
            err,
            'unknown error',
          )}. Do not submit again - it would create a duplicate.`,
        );
        setCreated(true);
        setLoading(false);
        return;
      }
    }

    localStorage.removeItem('pathaoHistory');
    setOrderData(null);
    setForm(INITIAL_FORM);
    setLoading(false);
    window.open('https://merchant.pathao.com/courier/orders/list', '_blank');
  };

  const history = orderData?.history;

  return (
    <AdminPage title="Create Pathao order" width="narrow">
      <PageHeader
        eyebrow={
          <Button
            href="/admin/show/show-orders"
            variant="ghost"
            size="sm"
            className="-ml-2"
          >
            ← Back to orders
          </Button>
        }
        title="Create Pathao order"
        description="Book a courier delivery for an order."
      />

      <div className="mb-5 space-y-3">
        {history ? (
          <Alert tone="info" title="Filled in from the selected order">
            Order #{history.id} · {history.fullName} ·{' '}
            {orderData.orders?.length || 0} item(s) · Total ৳
            {(Number(orderData.totalPrice) || 0) +
              (Number(orderData.deliveryFee) || 0)}
          </Alert>
        ) : (
          <Alert tone="info">
            No order is selected, so the form starts empty. To pre-fill it,
            start from the orders list.
          </Alert>
        )}
        <Alert tone="warning">{warning}</Alert>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid gap-5 lg:grid-cols-3">
          <Section title="Delivery" icon={<FiTruck />}>
            <div className="space-y-4">
              <Field label="Store ID" htmlFor="store_id">
                <Input id="store_id" value={STORE_ID} disabled className="w-full" />
              </Field>
              <Field
                label="Merchant order ID"
                htmlFor="merchant_order_id"
                optional
                hint="Generated automatically if left empty."
              >
                <Input
                  id="merchant_order_id"
                  value={form.merchant_order_id}
                  onChange={(e) => set('merchant_order_id', e.target.value)}
                  className="w-full"
                />
              </Field>
              <Field label="Delivery type" htmlFor="delivery_type">
                <Select
                  id="delivery_type"
                  value={form.delivery_type}
                  onValueChange={(value) => set('delivery_type', value)}
                  width="w-full"
                >
                  <option value="48">Normal delivery</option>
                  <option value="12">On-demand delivery</option>
                </Select>
              </Field>
              <Field label="Item type" htmlFor="item_type">
                <Select
                  id="item_type"
                  value={form.item_type}
                  onValueChange={(value) => set('item_type', value)}
                  width="w-full"
                >
                  <option value="2">Parcel</option>
                  <option value="1">Document</option>
                </Select>
              </Field>
            </div>
          </Section>

          <Section title="Recipient" icon={<FiUser />}>
            <div className="space-y-4">
              <Field
                label="Name"
                htmlFor="recipient_name"
                required
                error={errors.recipient_name}
              >
                <Input
                  id="recipient_name"
                  value={form.recipient_name}
                  onChange={(e) => set('recipient_name', e.target.value)}
                  placeholder="Full name"
                  className="w-full"
                />
              </Field>
              <Field
                label="Phone"
                htmlFor="recipient_phone"
                required
                error={errors.recipient_phone}
              >
                <Input
                  id="recipient_phone"
                  type="tel"
                  value={form.recipient_phone}
                  onChange={(e) => set('recipient_phone', e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full"
                />
              </Field>
              <Field
                label="Address"
                htmlFor="recipient_address"
                required
                error={errors.recipient_address}
              >
                <Textarea
                  id="recipient_address"
                  rows={3}
                  value={form.recipient_address}
                  onChange={(e) => set('recipient_address', e.target.value)}
                  placeholder="Full delivery address with landmarks"
                />
              </Field>
              <Field
                label="Special instructions"
                htmlFor="special_instruction"
                optional
              >
                <Textarea
                  id="special_instruction"
                  rows={2}
                  value={form.special_instruction}
                  onChange={(e) => set('special_instruction', e.target.value)}
                  placeholder="Anything the courier should know"
                />
              </Field>
            </div>
          </Section>

          <Section title="Parcel" icon={<FiPackage />}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="Quantity"
                  htmlFor="item_quantity"
                  required
                  error={errors.item_quantity}
                >
                  <Input
                    id="item_quantity"
                    type="number"
                    min={1}
                    value={form.item_quantity}
                    onChange={(e) => set('item_quantity', e.target.value)}
                    className="w-full"
                  />
                </Field>
                <Field
                  label="Weight (kg)"
                  htmlFor="item_weight"
                  required
                  error={errors.item_weight}
                >
                  <Input
                    id="item_weight"
                    type="number"
                    min={0.1}
                    step="0.1"
                    value={form.item_weight}
                    onChange={(e) => set('item_weight', e.target.value)}
                    className="w-full"
                  />
                </Field>
              </div>
              <Field
                label="Item description"
                htmlFor="item_description"
                required
                error={errors.item_description}
              >
                <Textarea
                  id="item_description"
                  rows={3}
                  value={form.item_description}
                  onChange={(e) => set('item_description', e.target.value)}
                  placeholder="What is being delivered"
                />
              </Field>
              <Field
                label="Amount to collect (৳)"
                htmlFor="amount_to_collect"
                required
                hint="Cash the courier collects on delivery. Use 0 if already paid."
                error={errors.amount_to_collect}
              >
                <Input
                  id="amount_to_collect"
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.amount_to_collect}
                  onChange={(e) => set('amount_to_collect', e.target.value)}
                  className="w-full"
                />
              </Field>
            </div>
          </Section>
        </div>

        <div className="mt-5 space-y-3">
          <Alert tone="danger">{formError}</Alert>
          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={created}
            >
              {loading ? 'Creating order...' : 'Create order'}
            </Button>
          </div>
        </div>
      </form>
    </AdminPage>
  );
};

export default AddPathaoOrder;

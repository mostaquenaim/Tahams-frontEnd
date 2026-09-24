import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { FiAlertCircle, FiCheck, FiMapPin, FiShoppingBag, FiTruck } from 'react-icons/fi';
import useAxiosPublic from '../../Hooks/useAxiosPublic';
import { AuthContext } from '../../Contexts/Auth/AuthProvider';
import { generateTempItems, pushToDataLayer } from '../../utils/ga4';
import { addGuestOrderToken } from '../../utils/guestCustomer';
import { cartSubtotal, formatBDT } from '../../utils/pricing';

const DISPLAY_CENTERS = [
  {
    id: 'dc1',
    name: 'DC1 - Shahabuddin Plaza',
    address: 'Shop: 35-36, 2nd Floor, Shahabuddin Plaza, 1207 Ring Rd, Dhaka',
  },
  {
    id: 'dc2',
    name: 'DC2 - Bashundhara City',
    address:
      'Shop No: 1, Block: A, Level: 5, Bashundhara City Shopping Complex , Dhaka, Bangladesh, 1215',
  },
  {
    id: 'dc3',
    name: 'DC3 - Lalbagh',
    address: '23, 4-C Shaista Khan Rd, Dhaka',
  },
];

const FEES = { dhakaCity: 80, aroundDhaka: 120, outsideDhaka: 150, other: 150 };
const DHAKA_CITY_AREAS = ['Dhaka - North', 'Dhaka - South'];

const FACEBOOK_PATTERN = /^(https?:\/\/)?(www\.)?(facebook|fb)\.com\/.+/i;
const SAVED_INFO_KEY = 'checkoutInfo';

const INPUT =
  'w-full rounded-xl border border-gray-300 bg-white px-3.5 py-3 text-sm shadow-sm transition placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10';
const INPUT_ERROR = 'border-red-400 focus:border-red-500 focus:ring-red-500/10';

// Accepts +8801XXXXXXXXX, 8801XXXXXXXXX, 01XXX-XXXXXX etc. and returns the
// plain 11-digit form, or '' if it isn't a Bangladeshi mobile number.
const normalizePhone = (raw) => {
  let digits = String(raw || '').replace(/[\s\-()]/g, '');
  if (digits.startsWith('+88')) digits = digits.slice(3);
  else if (digits.startsWith('88') && digits.length === 13) digits = digits.slice(2);
  return /^01[3-9]\d{8}$/.test(digits) ? digits : '';
};

const readSavedInfo = () => {
  try {
    return JSON.parse(localStorage.getItem(SAVED_INFO_KEY)) || null;
  } catch (error) {
    return null;
  }
};

const loadAreas = async (file) => {
  try {
    const res = await fetch(file);
    if (!res.ok) return [];
    const list = await res.json();
    return [...new Set(list.map((area) => area.name))];
  } catch (error) {
    console.error(`Could not load ${file}:`, error);
    return [];
  }
};

function Field({ id, label, optional, error, hint, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-gray-800">
        {label}
        {optional && (
          <span className="ml-1.5 text-xs font-normal text-gray-400">Optional</span>
        )}
      </label>
      {children}
      {error ? (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
          <FiAlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-gray-500">{hint}</p>
      )}
    </div>
  );
}

function Step({ number, title, children }) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="mb-5 flex items-center gap-3 text-base font-semibold">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-xs font-bold text-white">
          {number}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function ChoiceCard({ selected, onSelect, icon, title, subtitle, name }) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition ${
        selected
          ? 'border-black bg-gray-50'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <input
        type="radio"
        name={name}
        checked={selected}
        onChange={onSelect}
        className="sr-only"
      />
      <span
        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
          selected ? 'bg-black text-white' : 'bg-gray-100 text-gray-500'
        }`}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{title}</span>
        <span className="block text-xs text-gray-500">{subtitle}</span>
      </span>
      {selected && <FiCheck className="mt-1 h-4 w-4 shrink-0" />}
    </label>
  );
}

const BuyingAddress = ({ regions = [], items, onDeliveryFeeChange }) => {
  const router = useRouter();
  const axiosPublic = useAxiosPublic();
  const { user } = useContext(AuthContext);

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    facebook: '',
    address: '',
    notes: '',
  });
  const [mode, setMode] = useState('home');
  const [dcId, setDcId] = useState('');
  const [region, setRegion] = useState('');
  const [city, setCity] = useState('');
  const [payOnline, setPayOnline] = useState(false);
  const [showFacebook, setShowFacebook] = useState(false);
  const [areas, setAreas] = useState({ inside: [], outside: [], loaded: false });
  const [savedUser, setSavedUser] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitGuard = useRef(false);

  const subtotal = cartSubtotal(items);
  const isPickup = mode === 'pickup';

  // Dhaka areas (used for city choice and pricing).
  useEffect(() => {
    let cancelled = false;
    Promise.all([
      loadAreas('/Dhaka-inside-delivery.json'),
      loadAreas('/Dhaka-outside-delivery.json'),
    ]).then(([inside, outside]) => {
      if (!cancelled) setAreas({ inside, outside, loaded: true });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Pre-fill from the customer's account, or from the last order on this device.
  useEffect(() => {
    let cancelled = false;

    const prefill = async () => {
      let saved = readSavedInfo();

      if (user) {
        try {
          const idToken = await user.getIdToken();
          const result = await axiosPublic.get(
            `admin/get-user-by-email/${user.email}`,
            { headers: { Authorization: `Bearer ${idToken}` } },
          );
          setSavedUser(result.data);
          saved = {
            fullName: result.data?.name,
            phone: result.data?.mbl_no,
            region: result.data?.region,
            city: result.data?.city,
            address: result.data?.address,
          };
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }

      if (cancelled || !saved) return;

      // Never overwrite something the customer has already typed.
      setForm((prev) => ({
        ...prev,
        fullName: prev.fullName || saved.fullName || '',
        phone: prev.phone || saved.phone || '',
        address: prev.address || saved.address || '',
      }));
      if (saved.region && regions.some((item) => item.name === saved.region)) {
        setRegion((prev) => prev || saved.region);
        setCity((prev) => prev || saved.city || '');
      }
    };

    prefill();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email]);

  const cityGroups = useMemo(() => {
    const cityCore = areas.inside.filter((name) => DHAKA_CITY_AREAS.includes(name));
    const around = areas.inside.filter((name) => !DHAKA_CITY_AREAS.includes(name));
    const outside = areas.outside.filter((name) => !areas.inside.includes(name));
    return { cityCore, around, outside };
  }, [areas]);

  // A saved city that isn't a valid choice would silently price wrongly.
  useEffect(() => {
    if (!areas.loaded || region !== 'Dhaka' || !city) return;
    const all = [...areas.inside, ...areas.outside];
    // (If the area lists failed to load, the field is free text - leave it.)
    if (all.length > 0 && !all.includes(city)) setCity('');
  }, [areas, region, city]);

  const hasAreaLists = areas.inside.length + areas.outside.length > 0;

  const computedFee = useMemo(() => {
    if (isPickup) return 0;
    if (!region) return null;
    if (region !== 'Dhaka') return FEES.other;
    if (!city) return null;
    if (DHAKA_CITY_AREAS.includes(city)) return FEES.dhakaCity;
    if (cityGroups.outside.includes(city)) return FEES.outsideDhaka;
    return FEES.aroundDhaka;
  }, [isPickup, region, city, cityGroups]);

  useEffect(() => {
    onDeliveryFeeChange(computedFee);
  }, [computedFee, onDeliveryFeeChange]);

  const setField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setSubmitError('');
  };

  const handleRegionChange = (value) => {
    setRegion(value);
    setCity('');
    setErrors((prev) => ({ ...prev, region: undefined, city: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!form.fullName.trim()) next.fullName = 'Please enter your name.';
    if (!normalizePhone(form.phone)) {
      next.phone = 'Enter a mobile number like 01XXXXXXXXX.';
    }
    if (form.facebook.trim() && !FACEBOOK_PATTERN.test(form.facebook.trim())) {
      next.facebook = 'That does not look like a Facebook profile link.';
    }
    if (isPickup) {
      if (!dcId) next.dc = 'Choose where you would like to pick up.';
    } else {
      if (!region) next.region = 'Choose your region.';
      if (region === 'Dhaka' && !city) next.city = 'Choose your area.';
      if (!form.address.trim()) next.address = 'Please enter your full address.';
    }
    return next;
  };

  const focusFirstError = (found) => {
    const order = ['fullName', 'phone', 'facebook', 'dc', 'region', 'city', 'address'];
    const first = order.find((key) => found[key]);
    const target = first && document.getElementById(`co-${first}`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      target.focus?.({ preventScroll: true });
    }
  };

  const rememberCustomer = (details) => {
    if (!user) {
      // A pickup order says nothing about the customer's own address.
      const toSave = isPickup
        ? { ...readSavedInfo(), fullName: details.fullName, phone: details.phone }
        : details;
      localStorage.setItem(SAVED_INFO_KEY, JSON.stringify(toSave));
      return;
    }

    // Keep the account's default address current (best effort - never blocks the order).
    if (savedUser?.id && !isPickup) {
      const changed =
        details.fullName !== savedUser.name ||
        details.region !== savedUser.region ||
        details.city !== savedUser.city ||
        details.address !== savedUser.address;
      if (changed) {
        user
          .getIdToken()
          .then((idToken) =>
            axiosPublic.put(
              `admin/update-user-address/${savedUser.id}`,
              {
                name: details.fullName,
                region: details.region,
                city: details.city,
                address: details.address,
              },
              { headers: { Authorization: `Bearer ${idToken}` } },
            ),
          )
          .catch((error) => console.error('Could not update saved address:', error));
      }
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitGuard.current) return;

    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) {
      focusFirstError(found);
      return;
    }

    submitGuard.current = true;
    setIsSubmitting(true);
    setSubmitError('');

    const dc = isPickup ? DISPLAY_CENTERS.find((item) => item.id === dcId) : null;
    const phone = normalizePhone(form.phone);
    const details = {
      fullName: form.fullName.trim(),
      phone,
      region: dc ? 'Dhaka' : region,
      city: dc ? dc.name : region === 'Dhaka' ? city : '',
      address: dc ? dc.address : form.address.trim(),
    };
    const finalFee = dc ? 0 : computedFee;

    const orderData = {
      fullName: details.fullName,
      region: details.region,
      city: details.city,
      address: details.address,
      phone_no: phone,
      BuyingDate: new Date(),
      carts: items.map((item) => item.id),
      deliveryFee: finalFee,
      // Pay-on-pickup and cash-on-delivery are recorded up front; online
      // payment is completed (and recorded) on the next screen.
      paymentMethodId: isPickup && !payOnline ? 8 : 1,
      ...(dc && { isPickup: true, pickupCenter: dc.name }),
      ...(form.facebook.trim() && { facebookProfile: form.facebook.trim() }),
      ...(form.notes.trim() && { notes: form.notes.trim() }),
    };

    let response;
    try {
      response = await axiosPublic.post('/admin/add-to-buy', orderData);
    } catch (error) {
      console.error('Error submitting order:', error);
      const serverMessage = error?.response?.data?.message;
      setSubmitError(
        typeof serverMessage === 'string' && serverMessage
          ? serverMessage
          : "We couldn't place your order. Nothing has been charged - please try again.",
      );
      submitGuard.current = false;
      setIsSubmitting(false);
      return;
    }

    const token = response.data?.trackingToken;

    if (!user && token) addGuestOrderToken(token);
    rememberCustomer(details);

    // try {
    //   pushToDataLayer('purchase', {
    //     order_id: response.data?.id,
    //     currency: 'BDT',
    //     totalPrice: subtotal + (finalFee || 0),
    //     coupon: items[0]?.coupon,
    //     fullName: details.fullName,
    //     region: details.region,
    //     city: details.city,
    //     address: details.address,
    //     phone_no: phone,
    //     BuyingDate: new Date(),
    //     items: generateTempItems(items),
    //   });
    // } catch (error) {
    //   console.error('Analytics event failed:', error);
    // }

    // The order exists now - make sure "back" can never place it twice.
    localStorage.removeItem('selectedItems');
    localStorage.removeItem('deliveryFee');
    localStorage.removeItem('defaultCartItem');

    router.push(
      payOnline
        ? `/confirm-order/${token}`
        : `/my-orders/details/${token}?placed=1`,
    );
  };

  const total = subtotal + (computedFee || 0);
  const feeKnown = computedFee !== null;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* 1 - Contact */}
      <Step number={1} title="Your details">
        <div className="space-y-4">
          <Field id="co-fullName" label="Full name" error={errors.fullName}>
            <input
              id="co-fullName"
              type="text"
              autoComplete="name"
              value={form.fullName}
              onChange={(e) => setField('fullName', e.target.value)}
              placeholder="Your name"
              className={`${INPUT} ${errors.fullName ? INPUT_ERROR : ''}`}
            />
          </Field>
          <Field
            id="co-phone"
            label="Mobile number"
            error={errors.phone}
            hint="We'll call or message this number about your delivery."
          >
            <input
              id="co-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={(e) => setField('phone', e.target.value)}
              placeholder="01XXXXXXXXX"
              className={`${INPUT} ${errors.phone ? INPUT_ERROR : ''}`}
            />
          </Field>
          {showFacebook ? (
            <Field
              id="co-facebook"
              label="Facebook profile link"
              optional
              error={errors.facebook}
              hint="Our team may reach out on Messenger about your order."
            >
              <input
                id="co-facebook"
                type="url"
                value={form.facebook}
                onChange={(e) => setField('facebook', e.target.value)}
                placeholder="facebook.com/yourname"
                className={`${INPUT} ${errors.facebook ? INPUT_ERROR : ''}`}
              />
            </Field>
          ) : (
            <button
              type="button"
              onClick={() => setShowFacebook(true)}
              className="text-xs font-medium text-gray-500 underline-offset-4 hover:text-black hover:underline"
            >
              + Add Facebook profile (optional)
            </button>
          )}
        </div>
      </Step>

      {/* 2 - Delivery */}
      <Step number={2} title="Delivery">
        <div className="grid gap-3 sm:grid-cols-2">
          <ChoiceCard
            name="delivery-mode"
            selected={!isPickup}
            onSelect={() => {
              setMode('home');
              setErrors((prev) => ({ ...prev, dc: undefined }));
            }}
            icon={<FiTruck className="h-4 w-4" />}
            title="Home delivery"
            subtitle="Delivered to your door"
          />
          <ChoiceCard
            name="delivery-mode"
            selected={isPickup}
            onSelect={() => {
              setMode('pickup');
              setErrors((prev) => ({
                ...prev,
                region: undefined,
                city: undefined,
                address: undefined,
              }));
            }}
            icon={<FiShoppingBag className="h-4 w-4" />}
            title="Store pickup"
            subtitle="Free · collect from a display center"
          />
        </div>

        {isPickup ? (
          <div className="mt-5" id="co-dc" tabIndex={-1}>
            <p className="mb-2 text-sm font-medium text-gray-800">Pickup center</p>
            <div className="space-y-2">
              {DISPLAY_CENTERS.map((center) => (
                <label
                  key={center.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-3.5 transition ${
                    dcId === center.id
                      ? 'border-black bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="pickup-center"
                    checked={dcId === center.id}
                    onChange={() => {
                      setDcId(center.id);
                      setErrors((prev) => ({ ...prev, dc: undefined }));
                    }}
                    className="mt-1 h-4 w-4 shrink-0 accent-black"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">{center.name}</span>
                    <span className="mt-0.5 flex items-start gap-1 text-xs text-gray-500">
                      <FiMapPin className="mt-0.5 h-3 w-3 shrink-0" />
                      {center.address}
                    </span>
                  </span>
                </label>
              ))}
            </div>
            {errors.dc && (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
                <FiAlertCircle className="h-3.5 w-3.5" />
                {errors.dc}
              </p>
            )}
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="co-region" label="Region" error={errors.region}>
                <select
                  id="co-region"
                  value={region}
                  onChange={(e) => handleRegionChange(e.target.value)}
                  className={`${INPUT} ${errors.region ? INPUT_ERROR : ''}`}
                >
                  <option value="">Select a region</option>
                  {regions.map((item) => (
                    <option key={item.id} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </Field>

              {region === 'Dhaka' && (
                <Field id="co-city" label="Area" error={errors.city}>
                  {areas.loaded && !hasAreaLists ? (
                    <input
                      id="co-city"
                      type="text"
                      value={city}
                      onChange={(e) => {
                        setCity(e.target.value);
                        setErrors((prev) => ({ ...prev, city: undefined }));
                      }}
                      placeholder="Your area or thana"
                      className={`${INPUT} ${errors.city ? INPUT_ERROR : ''}`}
                    />
                  ) : (
                  <select
                    id="co-city"
                    value={city}
                    onChange={(e) => {
                      setCity(e.target.value);
                      setErrors((prev) => ({ ...prev, city: undefined }));
                    }}
                    disabled={!areas.loaded}
                    className={`${INPUT} ${errors.city ? INPUT_ERROR : ''}`}
                  >
                    <option value="">
                      {areas.loaded ? 'Select your area' : 'Loading areas...'}
                    </option>
                    {cityGroups.cityCore.length > 0 && (
                      <optgroup label={`Dhaka city - ${formatBDT(FEES.dhakaCity)}`}>
                        {cityGroups.cityCore.map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                      </optgroup>
                    )}
                    {cityGroups.around.length > 0 && (
                      <optgroup label={`Around Dhaka - ${formatBDT(FEES.aroundDhaka)}`}>
                        {cityGroups.around.map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                      </optgroup>
                    )}
                    {cityGroups.outside.length > 0 && (
                      <optgroup label={`Outside Dhaka - ${formatBDT(FEES.outsideDhaka)}`}>
                        {cityGroups.outside.map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                  )}
                </Field>
              )}
            </div>

            <Field id="co-address" label="Full address" error={errors.address}>
              <textarea
                id="co-address"
                rows={3}
                autoComplete="street-address"
                value={form.address}
                onChange={(e) => setField('address', e.target.value)}
                placeholder="House / flat, road, area, landmark"
                className={`${INPUT} resize-none ${errors.address ? INPUT_ERROR : ''}`}
              />
            </Field>
          </div>
        )}
      </Step>

      {/* 3 - Payment */}
      <Step number={3} title="Payment">
        <div className="grid gap-3 sm:grid-cols-2">
          <ChoiceCard
            name="payment-choice"
            selected={!payOnline}
            onSelect={() => setPayOnline(false)}
            icon={<FiCheck className="h-4 w-4" />}
            title={isPickup ? 'Pay at pickup' : 'Cash on delivery'}
            subtitle={isPickup ? 'Pay when you collect' : 'Pay when it arrives'}
          />
          <ChoiceCard
            name="payment-choice"
            selected={payOnline}
            onSelect={() => setPayOnline(true)}
            icon={<FiCheck className="h-4 w-4" />}
            title="Pay online now"
            subtitle="bKash, Nagad, Rocket or bank transfer"
          />
        </div>
        {payOnline && (
          <p className="mt-3 text-xs text-gray-500">
            After you place the order, you'll get the payment number and can
            upload your payment screenshot.
          </p>
        )}
      </Step>

      {/* Notes */}
      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
        <Field id="co-notes" label="Order notes" optional>
          <textarea
            id="co-notes"
            rows={2}
            value={form.notes}
            onChange={(e) => setField('notes', e.target.value)}
            placeholder="Anything we should know about this order?"
            className={`${INPUT} resize-none`}
          />
        </Field>
      </section>

      {submitError && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <FiAlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {submitError}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-black px-6 py-4 text-sm font-semibold text-white shadow-md transition hover:bg-gray-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            Placing your order...
          </>
        ) : payOnline ? (
          `Place order & continue to payment${feeKnown ? ` · ${formatBDT(total)}` : ''}`
        ) : (
          `Place order${feeKnown ? ` · ${formatBDT(total)}` : ''}`
        )}
      </button>
      <p className="text-center text-xs text-gray-400">
        By placing your order you agree to our{' '}
        <a href="/terms" className="underline underline-offset-2">
          terms
        </a>
        .
      </p>
    </form>
  );
};

export default BuyingAddress;

import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { MdEmail, MdCheckCircle, MdHighlightOff, MdSchedule } from 'react-icons/md';
import { FaRegCheckCircle } from "react-icons/fa";
import { FaRegClock } from "react-icons/fa";

const BINARY_SERVER_URL = import.meta.env.VITE_HCC_SERVER_URL;
const BINARY_CLIENT_ID = import.meta.env.VITE_HCC_CLIENT_ID;
const TRYLIST_ADMIN_PASSWORD = import.meta.env.VITE_TRYLIST_ADMIN_PASSWORD;
const TRYLIST_AUTH_STORAGE_KEY = 'trylist_admin_auth';
const TRYLIST_AUTH_TTL_MS = 60 * 60 * 1000;

const emptyContact = { phone: '', email: '', secondaryEmail: '', secondaryPhone: '', website: '' };
const safeArray = (value) => (Array.isArray(value) ? value : []);
const money = (amount = 0, currency = 'KES') => `${currency} ${Number(amount || 0).toLocaleString()}`;
const title = (value) => String(value || '').replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
const fmtDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' });
};
const fmtDateTime = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('en-KE', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
};
const tone = (status) => {
  const key = String(status || '').toLowerCase();
  if (['active', 'success'].includes(key)) return 'border-orange-200 bg-orange-100 text-orange-700';
  if (key === 'pending') return 'border-gray-200 bg-gray-100 text-gray-700';
  if (['failed', 'cancelled', 'reversed'].includes(key)) return 'border-rose-200 bg-rose-100 text-rose-700';
  if (key === 'completed') return 'border-slate-200 bg-slate-100 text-slate-700';
  return 'border-blue-200 bg-blue-100 text-blue-700';
};
const paid = (service) => safeArray(service?.paymentHistory).some((entry) => String(entry?.status || '').toLowerCase() === 'success');
const amountDue = (service) => Number(service?.paymentType === 'subscription' ? service?.monthlyCost : (service?.setupCost || service?.monthlyCost || 0));
const due = (service) => {
  if (!service) return false;
  const status = String(service.status || '').toLowerCase();
  if (['completed', 'cancelled'].includes(status)) return false;
  if (service.paymentType === 'subscription') {
    if (!service.renewDate) return false;
    return new Date(service.renewDate).setHours(0, 0, 0, 0) <= new Date().setHours(0, 0, 0, 0);
  }
  return !paid(service) && ['pending', 'active'].includes(status);
};
const dueText = (service) => {
  if (!due(service)) return 'Up to date';
  if (service.paymentType === 'subscription') return service.renewDate ? `Due since ${fmtDate(service.renewDate)}` : 'Renewal due';
  return 'Initial invoice unpaid';
};
const lastFive = (service) => safeArray(service?.paymentHistory).slice().sort((a, b) => new Date(b?.date || 0) - new Date(a?.date || 0)).slice(0, 5);

const getServiceInvoices = (service) => {
  const invoices = safeArray(service?.invoices) || [];
  const currentYear = new Date().getFullYear();

  // For each invoice, determine if it's paid or unpaid this year
  invoices.forEach(invoice => {
    if (service.cycleLength === 'MONTHLY') {
      // Monthly: check if current year is in paidYears
      invoice.paidThisYear = invoice.paidYears && invoice.paidYears.includes(currentYear);
      invoice.displayStatus = invoice.paidThisYear ? 'paid' : 'pending';
    } else if (service.cycleLength === 'YEARLY') {
      // Yearly: check if the invoice year is in paidYears
      const invoiceYear = parseInt(invoice.period);
      invoice.paidThisYear = invoice.paidYears && invoice.paidYears.includes(invoiceYear);
      invoice.displayStatus = invoice.paidThisYear ? 'paid' : 'pending';
    }

    // Mark as overdue if pending and past due date
    if (invoice.displayStatus === 'pending' && new Date(invoice.dueDate) < new Date()) {
      invoice.displayStatus = 'overdue';
    }
  });

  // Return in original order (January at top, December at bottom)
  return invoices.slice(0, 12);
};

const invoiceStatusColor = (status) => {
  const key = String(status || '').toLowerCase();
  if (key === 'paid') return 'border-orange-500 bg-orange-50 text-orange-700 font-semibold';
  if (key === 'overdue') return 'border-red-500 bg-red-50 text-red-700 font-semibold';
  if (key === 'pending') return 'border-gray-400 bg-gray-100 text-gray-400 font-semibold';
  return 'border-slate-300 bg-slate-100 text-slate-700';
};

const invoiceCardBg = (status) => {
  const key = String(status || '').toLowerCase();
  if (key === 'paid') return 'border-orange-200 bg-orange-50';
  if (key === 'overdue') return 'border-red-200 bg-red-50';
  if (key === 'pending') return 'border-gray-200 bg-gray-100';
  return 'border-slate-200 bg-slate-50';
};

const paymentCardBg = (status) => {
  const key = String(status || '').toLowerCase();
  if (key === 'success') return 'border-orange-200 bg-orange-50';
  if (['failed', 'cancelled', 'reversed'].includes(key)) return 'border-red-200 bg-red-50';
  if (key === 'pending') return 'border-gray-200 bg-gray-100';
  return 'border-slate-200 bg-slate-50';
};

const getStatusIcon = (status) => {
  const key = String(status || '').toLowerCase();
  if (key === 'paid' || key === 'success') return <MdCheckCircle className="text-lg text-orange-600" />;
  if (['failed', 'cancelled', 'reversed', 'overdue'].includes(key)) return <MdHighlightOff className="text-lg text-red-600" />;
  if (key === 'pending') return <MdSchedule className="text-lg text-gray-400" />;
  return null; 
};

const isInvoicePayable = (invoice) => {
  return invoice.displayStatus === 'pending' || invoice.displayStatus === 'overdue';
};

const hasValidTrylistSession = () => {
  try {
    const raw = localStorage.getItem(TRYLIST_AUTH_STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    const expiresAt = Number(parsed?.expiresAt || 0);
    if (!expiresAt || Date.now() >= expiresAt) {
      localStorage.removeItem(TRYLIST_AUTH_STORAGE_KEY);
      return false;
    }
    return true;
  } catch {
    localStorage.removeItem(TRYLIST_AUTH_STORAGE_KEY);
    return false;
  }
};

const saveTrylistSession = () => {
  const expiresAt = Date.now() + TRYLIST_AUTH_TTL_MS;
  localStorage.setItem(TRYLIST_AUTH_STORAGE_KEY, JSON.stringify({ expiresAt }));
};

const MetricCard = ({ label, value, className }) => (
  <div className={`rounded-lg border p-3 shadow-sm ${className}`}>
    <p className="text-xs font-semibold uppercase opacity-70">{label}</p>
    <p className="mt-2 text-2xl font-semibold">{value}</p>
  </div>
);

const InfoRow = ({ label, value }) => (
  <div className="flex items-start justify-between gap-2 border-b border-slate-100 py-1.5 last:border-b-0">
    <span className="text-xs uppercase text-slate-500">{label}</span>
    <span className="text-right text-xs font-medium text-slate-800 break-all">{value || '-'}</span>
  </div>
);

export default function Trylist() {
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [authUnlocked, setAuthUnlocked] = useState(false);
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [editingContact, setEditingContact] = useState(false);
  const [contactForm, setContactForm] = useState(emptyContact);
  const [contactSaving, setContactSaving] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [paymentModal, setPaymentModal] = useState({ service: null, mode: 'invoice' });
  const [invoicePaymentModal, setInvoicePaymentModal] = useState({ invoice: null });

  const base = useMemo(() => String(BINARY_SERVER_URL || '').replace(/\/$/, ''), []);
  const endpoint = useMemo(() => `${base}/single/${BINARY_CLIENT_ID}`, [base]);

  const refreshClient = useCallback(async () => {
    const response = await fetch(endpoint);
    const result = await response.json();
    if (!response.ok) throw new Error(result?.message || 'Failed to load client details');

    const data = result?.data || null;
    setClient(data);
    setContactForm({
      phone: data?.contact?.phone || '',
      email: data?.contact?.email || '',
      secondaryEmail: data?.contact?.secondaryEmail || '',
      secondaryPhone: data?.contact?.secondaryPhone || '',
      website: data?.contact?.website || ''
    });
    return data;
  }, [endpoint]);

  useEffect(() => {
    const run = async () => {
      if (!BINARY_CLIENT_ID) {
        setError('Missing BINARY_CLIENT_ID/VITE_BINARY_CLIENT_ID in env.');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError('');
        await refreshClient();
      } catch (requestError) {
        setError(requestError.message || 'Failed to load client details');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [refreshClient]);

  const services = safeArray(client?.services);
  const dueServices = services.filter(due);
  const subscriptionServices = services.filter((entry) => entry.paymentType === 'subscription');

  useEffect(() => {
    const syncSession = () => {
      setAuthUnlocked(hasValidTrylistSession());
    };

    syncSession();
    const intervalId = setInterval(syncSession, 30_000);
    return () => clearInterval(intervalId);
  }, []);

  const handleContactChange = (event) => {
    const { name, value } = event.target;
    setContactForm((prev) => ({ ...prev, [name]: value }));
  };

  const saveContact = async () => {
    if (!contactForm.phone || !contactForm.email) {
      toast.error('Phone and email are required.');
      return;
    }
    setContactSaving(true);
    try {
      const response = await fetch(`${base}/single/${BINARY_CLIENT_ID}/contact`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.message || 'Failed to update contact');
      await refreshClient();
      setEditingContact(false);
      toast.success('Contact info updated.');
    } catch (saveError) {
      toast.error(saveError.message || 'Failed to update contact');
    } finally {
      setContactSaving(false);
    }
  };

  const submitOrder = async () => {
    const service = paymentModal.service;
    if (!service) return;
    if (paymentModal.mode === 'autopay' && service.paymentType !== 'subscription') {
      toast.error('Automatic billing only applies to subscriptions.');
      return;
    }

    const amount = amountDue(service);
    if (amount <= 0) {
      toast.error('This service has no chargeable amount configured.');
      return;
    }

    setCheckoutLoading(true);
    const toastId = toast.loading('Preparing Pesapal checkout...');
    try {
      const response = await fetch(`${base}/pesapal/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: BINARY_CLIENT_ID,
          serviceId: service._id,
          amount,
          description: paymentModal.mode === 'autopay' ? `Recurring payment setup for ${service.serviceName}` : `Invoice payment for ${service.serviceName}`,
          paymentType: service.paymentType === 'subscription' ? 'subscription' : 'one-time',
          callbackUrl: `${window.location.origin}${window.location.pathname}`
        })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.message || 'Failed to create Pesapal order');
      if (!result?.data?.redirect_url) throw new Error('Pesapal did not return a redirect URL.');
      toast.success('Redirecting to Pesapal...', { id: toastId });
      window.location.href = result.data.redirect_url;
    } catch (checkoutError) {
      toast.error(checkoutError.message || 'Failed to start Pesapal checkout', { id: toastId });
    } finally {
      setCheckoutLoading(false);
    }
  };

  const submitInvoicePayment = async () => {
    const invoice = invoicePaymentModal.invoice;
    if (!invoice) return;

    setCheckoutLoading(true);
    const toastId = toast.loading('Preparing Pesapal checkout...');
    try {
      const response = await fetch(`${base}/pesapal/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: BINARY_CLIENT_ID,
          serviceId: invoice.serviceId,
          amount: invoice.amount,
          description: `Invoice payment for ${invoice.serviceName} - ${invoice.period}`,
          paymentType: 'one-time', // Invoice payments are always one-time
          callbackUrl: `${window.location.origin}${window.location.pathname}`,
          invoicePeriod: invoice.period // Pass invoice period for tracking
        })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.message || 'Failed to create Pesapal order');
      if (!result?.data?.redirect_url) throw new Error('Pesapal did not return a redirect URL.');
      toast.success('Redirecting to Pesapal...', { id: toastId });
      window.location.href = result.data.redirect_url;
    } catch (checkoutError) {
      toast.error(checkoutError.message || 'Failed to start Pesapal checkout', { id: toastId });
    } finally {
      setCheckoutLoading(false);
    }
  };

  const submitAuthPassword = (event) => {
    event.preventDefault();
    if (!TRYLIST_ADMIN_PASSWORD) {
      setAuthError('Admin password is not configured. Set VITE_TRYLIST_ADMIN_PASSWORD in your env file.');
      return;
    }

    console.log(`auth password`, authPassword);
    console.log(`auth password ENV`, TRYLIST_ADMIN_PASSWORD);
    if (authPassword === TRYLIST_ADMIN_PASSWORD) {
      saveTrylistSession();
      setAuthUnlocked(true);
      setAuthPassword('');
      setAuthError('');
      return;
    }

    setAuthError('Invalid password. Please try again.');
  };

  return (
    <article className="relative p-5">
      <div className={`w-full space-y-6 transition ${authUnlocked ? '' : 'pointer-events-none select-none blur-[2px]'}`}>
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-[radial-gradient(circle_at_top_left,#dbeafe_0%,#ffffff_40%,#f8fafc_100%)] shadow-sm">
          <div className="grid gap-4 px-4 py-4 lg:px-5">
            <div>
              <p className="text-xs font-semibold uppercase text-blue-700">Trylist Client Billing</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              <MetricCard label="Active Services" value={services.filter((entry) => entry.status === 'active').length} className="border-blue-200 bg-white text-slate-900" />
              <MetricCard label="Due Now" value={dueServices.length} className="border-amber-200 bg-amber-50 text-amber-900" />
              <MetricCard label="Recurring Services" value={subscriptionServices.length} className="border-orange-200 bg-orange-50 text-orange-900" />
            </div>
          </div>
        </section>

        {loading && <div className="rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm">Loading client billing dashboard...</div>}
        {!loading && error && <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

        {!loading && !error && client && (
          <>
            <div className="grid gap-3 xl:grid-cols-[0.9fr,1.1fr]">
              <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">Client Information</p>
                    <h2 className="mt-1 text-lg font-semibold text-slate-900">{client.clientName}</h2>
                  </div>
                  <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${tone(client.accountStatus)}`}>{title(client.accountStatus)}</span>
                </div>
                <div className="mt-3">
                  <InfoRow label="Business Name" value={client.businessName} />
                  <InfoRow label="Website" value={client?.contact?.website} />
                  <InfoRow label="Assigned Developer" value={client.assignedManager} />
                  <InfoRow label="Support Tel" value='+254791880412' />
                  <InfoRow label="Support Email" value='trylistsolutions@gmail.com' />
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">Contact Details</p>
                    <h2 className="mt-1 text-lg font-semibold text-slate-900">Billing Contact</h2>
                  </div>
                  {!editingContact && <button type="button" onClick={() => setEditingContact(true)} className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">Edit</button>}
                </div>

                {editingContact ? (
                  <div className="mt-3 grid gap-2 md:grid-cols-2">
                    {[
                      ['phone', 'Phone', 'tel'],
                      ['email', 'Email', 'email'],
                      ['secondaryPhone', 'Secondary Phone', 'tel'],
                      ['secondaryEmail', 'Secondary Email', 'email'],
                      ['website', 'Website', 'url']
                    ].map(([name, label, inputType]) => (
                      <label key={name} className={`block text-xs font-semibold uppercase text-slate-500 ${name === 'website' ? 'md:col-span-2' : ''}`}>
                        {label}
                        <input type={inputType} name={name} value={contactForm[name]} onChange={handleContactChange} className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-2 text-xs text-slate-900 outline-none transition focus:border-blue-500" />
                      </label>
                    ))}
                    <div className="flex flex-wrap gap-2 md:col-span-2">
                      <button type="button" disabled={contactSaving} onClick={saveContact} className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60">{contactSaving ? 'Saving...' : 'Save Changes'}</button>
                      <button type="button" disabled={contactSaving} onClick={() => setEditingContact(false)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-5">
                    <InfoRow label="Email" value={client.contact?.email} />
                    <InfoRow label="Phone" value={client.contact?.phone} />
                    <InfoRow label="Secondary Email" value={client.contact?.secondaryEmail} />
                    <InfoRow label="Secondary Phone" value={client.contact?.secondaryPhone} />
                    <InfoRow label="Website" value={client.contact?.website} />
                  </div>
                )}
              </section>
            </div>

            <section className="rounded-lg">

              {services.length === 0 ? (
                <div className="mt-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">No services have been assigned to this client yet.</div>
              ) : (
                <div className="mt-4 space-y-5">
                  {services.map((service) => (
                    <article key={service._id} className="overflow-hidden rounded-lg border-2 border-gray-200 bg-white shadow-sm">
                      <div className="border-b border-slate-200 px-4 py-3">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${tone(service.status)}`}>{title(service.status)}</span>
                              <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                                {service.paymentType === 'subscription' ? 'Recurring' : 'One-Time'}
                              </span>
                            </div>
                            <h3 className="mt-2 text-base font-semibold text-slate-950">{service.serviceName}</h3>
                            <p className="mt-0.5 text-xs text-slate-500">{service.serviceCategory || 'Uncategorised'}</p>
                          </div>
                          {service.paymentType === 'subscription' && (
                            <button
                              type="button"
                              onClick={() => setPaymentModal({ service, mode: 'autopay' })}
                              className={`flex items-center gap-2 cursor-pointer rounded-lg px-3 py-1.5 text-lg font-semibold transition whitespace-nowrap ${service.autoBillingEnabled ? 'border border-orange-500 bg-orange-50 text-orange-700 hover:bg-orange-100' : 'border border-red-500 bg-red-500 text-white hover:bg-red-800'}`}
                            >
                            {/* add react-icons check icon when auto billing is on and clock when yet */}
                              {service.autoBillingEnabled ? <FaRegCheckCircle /> : <FaRegClock />} {service.autoBillingEnabled ? 'Auto Billing On' : 'Setup Auto Billing'}
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="grid gap-3 px-4 py-3">
                        <div className="space-y-3">
                          <div className="grid gap-2 sm:grid-cols-2">
                            <div className="rounded-lg border border-slate-200 bg-white p-3">
                              <p className="text-xs font-semibold uppercase text-slate-500">Base Fee</p>
                              <p className="mt-1 text-base font-semibold text-slate-950">{money(amountDue(service), service.currency)}</p>
                            </div>
                            <div className="rounded-lg border border-slate-200 bg-white p-3">
                              <p className="text-xs font-semibold uppercase text-slate-500">Cycle</p>
                              <p className="mt-1 text-base font-semibold text-slate-950">{service.paymentType === 'subscription' ? title(service.cycleLength || 'monthly') : 'One-Off'}</p>
                            </div>
                          </div>
                          <div className="rounded-lg border border-slate-200 bg-white p-3">
                            <InfoRow label="Start Date" value={fmtDate(service.startDate)} />
                            <InfoRow label="Upcoming Due Date" value={fmtDate(service.renewDate)} />
                            <InfoRow label="Completed" value={fmtDate(service.completeDate)} />
                            <InfoRow label="Auto Billing" value={service.autoBillingEnabled ? `Active${service.autoBillingActivatedAt ? ` since ${fmtDate(service.autoBillingActivatedAt)}` : ''}` : 'Not enabled yet'} />
                          </div>
                          {service.developerDetails && <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-600">{service.developerDetails}</div>}
                          <div className="flex flex-wrap gap-2">
                            {due(service) && <button type="button" onClick={() => setPaymentModal({ service, mode: 'invoice' })} className="rounded-lg bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800">Pay Invoice</button>}
                          </div>
                        </div>

                        <div className="rounded-lg border border-slate-200 bg-white p-3">
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <div>
                              <p className="text-xs font-semibold uppercase text-slate-500">Invoices</p>
                              <p className="mt-0.5 text-xs text-slate-500">Recent invoices</p>
                            </div>
                            <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">{getServiceInvoices(service).length}</span>
                          </div>
                          <div className="space-y-2">
                            {getServiceInvoices(service).length === 0 ? (
                              <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 text-xs text-slate-500">No invoices yet.</div>
                            ) : (
                              getServiceInvoices(service).map((invoice) => (
                                <div key={`${service._id}-${invoice.period}`} className={`rounded-lg border p-4 ${invoiceCardBg(invoice.displayStatus)}`}>
                                  <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                                    <p className="text-xs text-slate-600">
                                      <span className='text-xl'>{title(invoice.period)}</span> • Due: {fmtDate(invoice.dueDate)}{invoice.paidAt ? ` • Paid: ${fmtDate(invoice.paidAt)}` : ''}
                                    </p>

                                    <div className="flex gap-4 ">
                                      <span className={`rounded-md border px-2 py-0.5 text-xs font-semibold inline-block ${invoiceStatusColor(invoice.displayStatus)}`}>
                                        {title(invoice.displayStatus)}
                                      </span>
                                      <p className="mt-1 text-xs font-semibold text-slate-900">{money(invoice.amount, service.currency)}</p>
                                      <div className="mt-1 flex gap-1.5 text-[10px] items-center">
                                        <span title={invoice.emailSent ? 'Email sent' : 'Email pending'} className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 ${invoice.emailSent ? 'bg-orange-100 text-orange-700 border border-orange-300' : 'bg-gray-100 text-gray-700 border border-gray-300'}`}>
                                          <MdEmail className="text-xs" />
                                          {invoice.emailSent ? 'sent' : 'pending'}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => setInvoicePaymentModal({ invoice: { ...invoice, serviceId: service._id, serviceName: service.serviceName, currency: service.currency } })}
                                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${!isInvoicePayable(invoice) || checkoutLoading ? 'bg-orange-300 text-orange-500 cursor-not-allowed cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'}`}
                                        disabled={!isInvoicePayable(invoice) || checkoutLoading}
                                      >
                                        Pay
                                      </button>
                                      {getStatusIcon(invoice.displayStatus)}
                                    </div>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        <div className="rounded-lg border border-slate-200 bg-white p-3 mt-3">
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <div>
                              <p className="text-xs font-semibold uppercase text-slate-500">Payment History</p>
                              <p className="mt-0.5 text-xs text-slate-500">Last 5 transactions</p>
                            </div>
                            <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">{lastFive(service).length}</span>
                          </div>
                          <div className="space-y-2">
                            {lastFive(service).length === 0 ? (
                              <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 text-xs text-slate-500">No payment history yet.</div>
                            ) : (
                              lastFive(service).map((payment) => (
                                <div key={payment._id || `${payment.date}-${payment.amount}`} className={`rounded-lg border p-2.5 ${paymentCardBg(payment.status)}`}>
                                  <div className="flex flex-wrap items-start justify-between gap-2">
                                    <div className="flex-1">
                                      <p className="text-xs font-semibold text-slate-900">{money(payment.amount, payment.currency || service.currency)}</p>
                                      <p className="mt-0.5 text-xs text-slate-600">{payment.method || 'Method pending'} • {fmtDateTime(payment.date)}</p>
                                      {payment.description && <p className="mt-1 text-xs text-slate-500">{payment.description}</p>}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold whitespace-nowrap ${tone(payment.status)}`}>{title(payment.status || 'pending')}</span>
                                      {getStatusIcon(payment.status)}
                                    </div>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <div className="grid gap-3">
              <section className="rounded-lg border border-slate-200 bg-slate-950 p-4 text-white shadow-sm">
                <p className="text-xs font-semibold uppercase text-slate-300">Automatic Billing Instructions</p>
                <h2 className="mt-1.5 text-lg font-semibold">PAYMENT PROCESSING IS HANDLED BY PESAPAL</h2>
                <div className="mt-3 space-y-2 text-xs leading-5 text-slate-300">
                  <p>1. Click on the bright red button labelled "Setup Auto Billing".</p>
                    <p>2. You will be redirected to Pesapal's secure checkout page.</p>
                    <p>3. On Pesapal, you can choose your preferred payment method (card, M-PESA, etc.) and complete the setup.</p>
                    <p>4. IMPORTANT: AUTOMATIC PAYMENTS ARE ONLY AVAILABLE FOR CARD/VISA OPTIONS.</p>
                    <p>5. Scroll to the bottom and check the option to "Setup future recurring / subsciption based payments for account SUB-7e30d1-7e30d2 (Optional)"</p>
                    <p>6. Set the first date for recurring to the subsequent billing cycle.(Because on click "Proceed", the current month/year shall be deducted immediately)</p>
                    <p>7. After first payment, PESAPAL will handle subsequent payments automatically.</p>
                </div>
              </section>
            </div>
          </>
        )}
      </div>

      {paymentModal.service && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[32px] bg-white shadow-2xl">
            <div className="bg-[linear-gradient(135deg,#0f172a,#1d4ed8)] px-6 py-6 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase text-blue-100">{paymentModal.mode === 'autopay' ? 'Automatic Billing Setup' : 'Manual Invoice Payment'}</p>
                  <h3 className="mt-2 text-2xl font-semibold">{paymentModal.service.serviceName}</h3>
                  <p className="mt-2 text-sm text-blue-100">The client will now be redirected to Pesapal, where they can choose card, M-PESA, or any other supported payment option directly on Pesapal.</p>
                </div>
                <button type="button" onClick={() => setPaymentModal({ service: null, mode: 'invoice' })} className="rounded-full border border-white/25 px-3 py-1 text-sm text-white/85 hover:bg-white/10">Close</button>
              </div>
            </div>
            <div className="space-y-4 px-5 py-5">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <InfoRow label="Client" value={client?.clientName} />
                <InfoRow label="Service" value={paymentModal.service.serviceName} />
                <InfoRow label="Flow" value={paymentModal.mode === 'autopay' ? 'Recurring Billing Setup' : 'Invoice Payment'} />
                <InfoRow label="Amount" value={money(amountDue(paymentModal.service), paymentModal.service.currency)} />
              </div>
              <div className="rounded-lg border border-orange-300 bg-orange-50 p-3 text-xs text-orange-900">
                Pesapal will present the available payment methods on its own checkout page, so no local method selection is needed here.
              </div>
              <button type="button" disabled={checkoutLoading} onClick={submitOrder} className="w-full rounded-lg bg-slate-950 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
                {checkoutLoading ? 'Preparing checkout...' : paymentModal.mode === 'autopay' ? 'Continue To Pesapal Setup' : 'Continue To Pesapal Checkout'}
              </button>
            </div>
          </div>
        </div>
      )}

      {invoicePaymentModal.invoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-lg bg-white shadow-2xl">
            <div className="bg-[linear-gradient(135deg,#0f172a,#1d4ed8)] px-5 py-5 text-white">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase text-blue-100">Invoice Payment</p>
                  <h3 className="mt-1.5 text-lg font-semibold">{invoicePaymentModal.invoice.serviceName}</h3>
                  <p className="mt-1 text-xs text-blue-100">Pay this specific invoice. You'll be redirected to Pesapal to complete the payment.</p>
                </div>
                <button type="button" onClick={() => setInvoicePaymentModal({ invoice: null })} className="rounded-lg border border-white/25 px-2.5 py-0.5 text-xs text-white/85 hover:bg-white/10">Close</button>
              </div>
            </div>
            <div className="space-y-4 px-5 py-5">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <InfoRow label="Client" value={client?.clientName} />
                <InfoRow label="Service" value={invoicePaymentModal.invoice.serviceName} />
                <InfoRow label="Invoice Period" value={title(invoicePaymentModal.invoice.period)} />
                <InfoRow label="Due Date" value={fmtDate(invoicePaymentModal.invoice.dueDate)} />
                <InfoRow label="Amount" value={money(invoicePaymentModal.invoice.amount, invoicePaymentModal.invoice.currency)} />
                <InfoRow label="Status" value={title(invoicePaymentModal.invoice.displayStatus)} />
              </div>
              <div className="rounded-lg border border-orange-300 bg-orange-50 p-3 text-xs text-orange-900">
                Pesapal will present the available payment methods on its own checkout page.
              </div>
              <button type="button" disabled={checkoutLoading} onClick={submitInvoicePayment} className="w-full rounded-lg bg-slate-950 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
                {checkoutLoading ? 'Preparing checkout...' : 'Continue To Pesapal Checkout'}
              </button>
            </div>
          </div>
        </div>
      )}

      {!authUnlocked && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl border border-white/20 bg-white/95 p-6 shadow-2xl">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Restricted Tab</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">Enter admin password</h2>
            <p className="mt-1 text-sm text-slate-600">This billing tab is locked. Please enter password to proceed.</p>

            <form onSubmit={submitAuthPassword} className="mt-5 space-y-3">
              <label className="block text-xs font-semibold uppercase text-slate-500">
                Password
                <input
                  type="password"
                  value={authPassword}
                  onChange={(event) => {
                    setAuthPassword(event.target.value);
                    if (authError) setAuthError('');
                  }}
                  autoComplete="current-password"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500"
                  placeholder="Enter password"
                />
              </label>

              {authError && <p className="text-xs font-medium text-rose-600">{authError}</p>}

              <button
                type="submit"
                className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Unlock Billing Tab
              </button>
            </form>
          </div>
        </div>
      )}
    </article>
  );
}

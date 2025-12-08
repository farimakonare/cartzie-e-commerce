'use client';

import { useEffect, useMemo, useState } from 'react';
import { Truck } from 'lucide-react';
import { useNotification } from '@/components/NotificationProvider';

type ShipmentEvent = {
  event_id: number;
  status: string;
  note?: string | null;
  created_at: string;
};

type ShipmentRecord = {
  shipment_id: number;
  order_id: number;
  shipment_date: string;
  status: string;
  tracking_number: string | null;
  carrier: string | null;
  order?: {
    user?: { user_name: string; user_email: string; user_phone?: string | null } | null;
  } | null;
  events?: ShipmentEvent[];
};

type FormValues = {
  status: string;
  tracking_number: string;
  carrier: string;
  note: string;
};

const statusOptions = [
  'pending_payment',
  'preparing_shipment',
  'in_transit',
  'delivered',
  'cancelled',
];

const statusRank = statusOptions.reduce<Record<string, number>>((acc, status, index) => {
  acc[status] = index;
  return acc;
}, {});

export default function AdminShipmentsPage() {
  const { notify } = useNotification();
  const [shipments, setShipments] = useState<ShipmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [formState, setFormState] = useState<Record<number, FormValues>>({});
  const [statusFilter, setStatusFilter] = useState<'all' | string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [shipmentPage, setShipmentPage] = useState(1);
  const [shipmentsPerPage, setShipmentsPerPage] = useState(8);

  useEffect(() => {
    fetchShipments();
  }, []);

  useEffect(() => {
    const initial: Record<number, FormValues> = {};
    shipments.forEach((shipment) => {
      initial[shipment.shipment_id] = {
        status: shipment.status,
        tracking_number: shipment.tracking_number || '',
        carrier: shipment.carrier || '',
        note: '',
      };
    });
    setFormState(initial);
  }, [shipments]);

  const fetchShipments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/shipments', { cache: 'no-store' });
      const data = await res.json();
      setShipments(data);
    } catch (error) {
      console.error('Error fetching shipments:', error);
      notify({ title: 'Error', message: 'Unable to load shipments.' });
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (shipmentId: number, field: keyof FormValues, value: string) => {
    if (field === 'status') {
      const shipment = shipments.find((s) => s.shipment_id === shipmentId);
      if (!shipment) return;
      const currentRank = statusRank[shipment.status] ?? 0;
      const nextRank = statusRank[value] ?? 0;
      if (nextRank < currentRank) {
        notify({
          title: 'Cannot revert status',
          message: 'Shipments can only move forward in the delivery timeline.',
        });
        return;
      }
    }
    setFormState((prev) => ({
      ...prev,
      [shipmentId]: {
        ...(prev[shipmentId] || { status: '', tracking_number: '', carrier: '', note: '' }),
        [field]: value,
      },
    }));
  };

  const shipmentStatusIsLocked = (status: string) => ['delivered', 'cancelled'].includes(status);

  const orderStatusFromShipment = (status: string) => {
    switch (status) {
      case 'pending_payment':
        return 'pending_payment';
      case 'preparing_shipment':
        return 'preparing_shipment';
      case 'in_transit':
        return 'in_transit';
      case 'delivered':
        return 'completed';
      case 'cancelled':
        return 'cancelled';
      default:
        return 'processing';
    }
  };

  const handleSave = async (shipment: ShipmentRecord) => {
    const current = formState[shipment.shipment_id];
    if (!current) return;
    if (shipmentStatusIsLocked(shipment.status)) {
      notify({
        title: 'Status locked',
        message: 'Delivered or cancelled shipments cannot be edited.',
      });
      return;
    }
    try {
      await fetch(`/api/shipments/${shipment.shipment_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: current.status,
          tracking_number: current.tracking_number || null,
          carrier: current.carrier || null,
        }),
      });

      if (shipment.status !== current.status || current.note.trim()) {
        await fetch('/api/shipment-events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            shipment_id: shipment.shipment_id,
            status: current.status,
            note: current.note.trim() || null,
          }),
        });
      }

      const nextOrderStatus = orderStatusFromShipment(current.status);
      if (nextOrderStatus) {
        await fetch(`/api/orders/${shipment.order_id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: nextOrderStatus }),
        });
      }

      await notify({
        title: 'Shipment updated',
        message: `Shipment #${shipment.shipment_id} details saved.`,
      });
      fetchShipments();
    } catch (error) {
      console.error('Error updating shipment:', error);
      notify({ title: 'Update failed', message: 'Unable to update shipment.' });
    }
  };

  const formatStatus = (status: string) =>
    status
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

  const filteredShipments = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return shipments.filter((shipment) => {
      const matchesStatus = statusFilter === 'all' ? true : shipment.status === statusFilter;
      const matchesSearch = normalizedSearch
        ? [
            String(shipment.shipment_id),
            String(shipment.order_id),
            shipment.order?.user?.user_name ?? '',
            shipment.order?.user?.user_email ?? '',
            shipment.order?.user?.user_phone ?? '',
          ].some((value) => value.toLowerCase().includes(normalizedSearch))
        : true;
      return shipment.status !== 'pending_payment' && matchesStatus && matchesSearch;
    });
  }, [shipments, statusFilter, searchTerm]);

  const totalShipmentPages = Math.max(1, Math.ceil(filteredShipments.length / shipmentsPerPage));

  useEffect(() => {
    setShipmentPage(1);
  }, [statusFilter, searchTerm, shipmentsPerPage]);

  useEffect(() => {
    if (shipmentPage > totalShipmentPages) {
      setShipmentPage(totalShipmentPages);
    }
  }, [totalShipmentPages, shipmentPage]);

  const paginatedShipments = useMemo(() => {
    const start = (shipmentPage - 1) * shipmentsPerPage;
    return filteredShipments.slice(start, start + shipmentsPerPage);
  }, [filteredShipments, shipmentPage, shipmentsPerPage]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Truck className="w-5 h-5 text-brand-500" />
            Shipments
          </h1>
          <p className="text-gray-600 mt-1">Track and update delivery progress.</p>
        </div>
        <span className="text-sm text-gray-500">
          Showing {filteredShipments.length} of {shipments.length} shipment
          {shipments.length === 1 ? '' : 's'}
        </span>
      </div>

      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <input
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search shipment/order/customer"
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
        >
          <option value="all">All shipment statuses</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {formatStatus(status)}
            </option>
          ))}
        </select>
        {/* <div className="flex items-center justify-end text-sm text-gray-500">
          Showing {filteredShipments.length} of {shipments.length} shipments • Updated{' '}
          {new Date().toLocaleTimeString()}
        </div> */}
      </div>

      <div className="space-y-4">
        {filteredShipments.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center text-gray-500">
            No shipments match your filters.
          </div>
        )}
        {paginatedShipments.map((shipment) => {
          const form = formState[shipment.shipment_id];
          const events = shipment.events || [];
          const isLocked = shipmentStatusIsLocked(shipment.status);

          return (
            <div key={shipment.shipment_id} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-gray-500">
                    {new Date(shipment.shipment_date).toLocaleDateString()}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Shipment #{shipment.shipment_id} • Order #{shipment.order_id}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {shipment.order?.user?.user_name || 'Unknown customer'} •{' '}
                    {shipment.order?.user?.user_email}
                  </p>
                  {shipment.order?.user?.user_phone && (
                    <p className="text-sm text-gray-600">
                      {shipment.order.user.user_phone}
                    </p>
                  )}
                </div>
                <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                  {formatStatus(shipment.status)}
                </span>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-gray-600 uppercase">
                    Tracking number
                  </label>
                  <input
                    type="text"
                    value={form?.tracking_number ?? ''}
                    onChange={(e) =>
                      handleFieldChange(shipment.shipment_id, 'tracking_number', e.target.value)
                    }
                    disabled={isLocked}
                    className={`w-full rounded-lg border border-gray-300 px-3 py-2 text-sm ${
                      isLocked ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
                    }`}
                    placeholder="Enter tracking number"
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-gray-600 uppercase">
                    Carrier
                  </label>
                  <input
                    type="text"
                    value={form?.carrier ?? ''}
                    onChange={(e) =>
                      handleFieldChange(shipment.shipment_id, 'carrier', e.target.value)
                    }
                    disabled={isLocked}
                    className={`w-full rounded-lg border border-gray-300 px-3 py-2 text-sm ${
                      isLocked ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
                    }`}
                    placeholder="e.g. DHL, FedEx"
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-gray-600 uppercase">
                    Status
                  </label>
                  <select
                    value={form?.status ?? shipment.status}
                    onChange={(e) =>
                      handleFieldChange(shipment.shipment_id, 'status', e.target.value)
                    }
                    disabled={isLocked}
                    className={`w-full rounded-lg border border-gray-300 px-3 py-2 text-sm ${
                      isLocked ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
                    }`}
                  >
                    {statusOptions.map((status) => (
                      <option
                        key={status}
                        value={status}
                        disabled={statusRank[status] < (statusRank[shipment.status] ?? 0)}
                      >
                        {formatStatus(status)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-gray-600 uppercase">
                    Update note
                  </label>
                  <textarea
                    value={form?.note ?? ''}
                    onChange={(e) =>
                      handleFieldChange(shipment.shipment_id, 'note', e.target.value)
                    }
                    disabled={isLocked}
                    className={`w-full rounded-lg border border-gray-300 px-3 py-2 text-sm ${
                      isLocked ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
                    }`}
                    placeholder="Optional note for this update"
                    rows={2}
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => handleSave(shipment)}
                  disabled={isLocked}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold text-white ${
                    isLocked
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-brand-600 hover:bg-brand-700'
                  }`}
                >
                  Save update
                </button>
              </div>

              {isLocked && (
                <p className="mt-2 text-xs font-medium text-gray-500">
                  Shipment marked as {shipment.status}. Further edits are disabled.
                </p>
              )}

              <div className="mt-6 border-t border-gray-200 pt-4">
                <p className="text-sm font-semibold text-gray-900 mb-3">Tracking timeline</p>
                {events.length === 0 ? (
                  <p className="text-sm text-gray-500">No updates yet.</p>
                ) : (
                  <div className="space-y-3">
                    {events.map((event) => (
                      <div key={event.event_id} className="relative pl-5">
                        <span className="absolute left-1 top-2 h-2 w-2 rounded-full bg-brand-500" />
                        <p className="text-sm font-semibold text-gray-900">
                          {formatStatus(event.status)}{' '}
                          <span className="ml-2 text-xs font-normal text-gray-500">
                            {new Date(event.created_at).toLocaleString()}
                          </span>
                        </p>
                        {event.note && <p className="text-sm text-gray-600">{event.note}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filteredShipments.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 rounded-3xl border border-gray-200 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span>
                Page {shipmentPage} of {totalShipmentPages}
              </span>
              <select
                value={shipmentsPerPage}
                onChange={(e) => setShipmentsPerPage(Number(e.target.value))}
                className="w-[100px] rounded-lg border border-gray-300 px-2 py-1 text-sm"
              >
                {[2, 5, 8, 15, 30].map((size) => (
                  <option key={size} value={size}>
                    {size} / page
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShipmentPage((prev) => Math.max(1, prev - 1))}
                disabled={shipmentPage === 1}
                className="rounded-lg border border-gray-300 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setShipmentPage((prev) => Math.min(totalShipmentPages, prev + 1))}
                disabled={shipmentPage === totalShipmentPages}
                className="rounded-lg border border-gray-300 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
      </div>
  );
}

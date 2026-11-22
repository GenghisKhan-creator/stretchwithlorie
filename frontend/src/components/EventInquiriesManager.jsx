import { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Users,
  Search,
  Phone,
  Mail,
  MessageCircle,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Eye,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { studioSocket } from '../services/websocket';

function cleanPhoneForWhatsApp(phone) {
  if (!phone) return '';
  let cleaned = String(phone).replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    cleaned = '233' + cleaned.slice(1);
  }
  return cleaned;
}

export default function EventInquiriesManager({ showToast }) {
  const [inquiries, setInquiries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchInquiries = async () => {
    setIsLoading(true);
    try {
      const data = await api.getEventInquiries();
      setInquiries(data || []);
    } catch (err) {
      console.error('Error fetching event inquiries:', err);
      showToast?.('error', 'Could not load private inquiries.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    api.getEventInquiries().then((data) => {
      if (isMounted) {
        setInquiries(data || []);
        setIsLoading(false);
      }
    }).catch((err) => {
      if (isMounted) {
        console.error('Error fetching event inquiries:', err);
        setIsLoading(false);
      }
    });

    // Real-time listener for incoming celebration inquiries
    const unsubNew = studioSocket.subscribe('NEW_EVENT_INQUIRY', (newInq) => {
      if (!newInq) return;
      const normalized = {
        id: newInq.id,
        occasionType: newInq.occasion_type || newInq.occasionType,
        fullName: newInq.full_name || newInq.fullName,
        phone: newInq.phone,
        email: newInq.email,
        guestCount: newInq.guest_count !== undefined ? newInq.guest_count : newInq.guestCount,
        preferredDate: newInq.preferred_date || newInq.preferredDate,
        locationPreference: newInq.location_preference || newInq.locationPreference,
        notes: newInq.notes,
        status: newInq.status || 'pending',
        createdAt: newInq.created_at || newInq.createdAt || new Date().toISOString()
      };
      setInquiries((prev) => [normalized, ...prev.filter((i) => i.id !== normalized.id)]);
      showToast?.('info', `💌 New celebration inquiry: ${normalized.occasionType} from ${normalized.fullName}!`);
    });

    // Real-time listener for inquiry status updates
    const unsubStatus = studioSocket.subscribe('EVENT_STATUS_UPDATED', (updated) => {
      if (!updated) return;
      setInquiries((prev) =>
        prev.map((i) => (i.id === updated.id ? { ...i, status: updated.status } : i))
      );
    });

    return () => {
      isMounted = false;
      unsubNew();
      unsubStatus();
    };
  }, [showToast]);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      setUpdatingId(id);
      await api.updateEventStatus(id, newStatus);
      setInquiries((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
      );
      if (selectedInquiry && selectedInquiry.id === id) {
        setSelectedInquiry((prev) => ({ ...prev, status: newStatus }));
      }
      showToast?.('success', `Inquiry status updated to ${newStatus}.`);
    } catch (err) {
      console.error('Failed to update status:', err);
      showToast?.('error', 'Failed to update status.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter inquiries by search & status
  const filteredInquiries = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return inquiries.filter((inq) => {
      const matchesSearch =
        !query ||
        inq.fullName?.toLowerCase().includes(query) ||
        inq.email?.toLowerCase().includes(query) ||
        inq.phone?.toLowerCase().includes(query) ||
        inq.occasionType?.toLowerCase().includes(query) ||
        inq.locationPreference?.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === 'ALL' || inq.status?.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [inquiries, searchQuery, statusFilter]);

  // Aggregate metrics
  const stats = useMemo(() => {
    const total = inquiries.length;
    const pending = inquiries.filter((i) => i.status === 'pending').length;
    const contacted = inquiries.filter((i) => i.status === 'contacted').length;
    const confirmed = inquiries.filter((i) => i.status === 'confirmed').length;
    return { total, pending, contacted, confirmed };
  }, [inquiries]);

  const getStatusBadge = (status) => {
    const s = (status || 'pending').toLowerCase();
    switch (s) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
            Confirmed
          </span>
        );
      case 'contacted':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 border border-sky-200 px-2.5 py-0.5 text-xs font-bold text-sky-800">
            <MessageCircle className="h-3 w-3 text-sky-600" />
            Contacted
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 border border-stone-200 px-2.5 py-0.5 text-xs font-medium text-stone-600">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-bold text-amber-800">
            <AlertCircle className="h-3 w-3 text-amber-600" />
            Pending Review
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E6E1D8] pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#E5ECE2] border border-[#DCE4D9] px-2.5 py-0.5 text-xs font-semibold text-[#5A6952]">
            <Sparkles className="h-3.5 w-3.5 text-[#7A8B71]" />
            <span>Private Celebrations & Custom Inquiries</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2B2E31] mt-1.5">
            Celebration & Retreat Inquiries
          </h2>
          <p className="text-xs sm:text-sm text-[#5C6260]">
            Review incoming requests for Bridal Showers, Birthdays, Corporate Retreats, and Private 1-on-1s.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchInquiries}
          className="flex items-center gap-1.5 self-start sm:self-auto rounded-2xl border border-[#E6E1D8] bg-white px-3.5 py-2 text-xs font-semibold text-[#5C6260] hover:bg-[#FAF8F5] transition-colors shadow-2xs cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Inquiries</span>
        </button>
      </div>

      {/* Metrics Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-3xl border border-[#E6E1D8] bg-white p-4 sm:p-5 shadow-2xs">
          <span className="text-xs font-semibold text-[#5C6260]">Total Inquiries</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-serif text-2xl sm:text-3xl font-bold text-[#2B2E31]">
              {stats.total}
            </span>
            <span className="text-[11px] text-[#5C6260]">received</span>
          </div>
        </div>

        <div className="rounded-3xl border border-amber-200 bg-amber-50/50 p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900">Needs Response</span>
            <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-serif text-2xl sm:text-3xl font-bold text-amber-900">
              {stats.pending}
            </span>
            <span className="text-[11px] font-bold text-amber-800">pending</span>
          </div>
        </div>

        <div className="rounded-3xl border border-sky-200 bg-sky-50/50 p-4 sm:p-5 shadow-2xs">
          <span className="text-xs font-semibold text-sky-900">Contacted</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-serif text-2xl sm:text-3xl font-bold text-sky-900">
              {stats.contacted}
            </span>
            <span className="text-[11px] text-sky-700">in conversation</span>
          </div>
        </div>

        <div className="rounded-3xl border border-emerald-200 bg-emerald-50/50 p-4 sm:p-5 shadow-2xs">
          <span className="text-xs font-semibold text-emerald-900">Confirmed Events</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-serif text-2xl sm:text-3xl font-bold text-emerald-900">
              {stats.confirmed}
            </span>
            <span className="text-[11px] text-emerald-700">booked</span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5C6260]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by client name, phone, occasion..."
            className="w-full rounded-2xl border border-[#E6E1D8] bg-white pl-10 pr-4 py-2.5 text-xs text-[#2B2E31] focus:border-[#7A8B71] outline-none shadow-2xs"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {['ALL', 'pending', 'contacted', 'confirmed', 'cancelled'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold capitalize whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#7A8B71] text-white shadow-2xs'
                  : 'bg-white text-[#5C6260] border border-[#E6E1D8] hover:bg-[#FAF8F5]'
              }`}
            >
              {st === 'ALL' ? 'All Inquiries' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Inquiries Table / Cards */}
      <div className="rounded-3xl border border-[#E6E1D8] bg-white shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-[#5C6260]">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#7A8B71] border-t-transparent" />
            <p className="mt-3 text-xs font-semibold">Loading celebration inquiries...</p>
          </div>
        ) : filteredInquiries.length === 0 ? (
          <div className="p-12 text-center text-[#5C6260]">
            <Sparkles className="mx-auto h-8 w-8 text-[#C8A253]/60 mb-2" />
            <h4 className="font-serif text-base font-bold text-[#2B2E31]">No inquiries found</h4>
            <p className="text-xs text-[#5C6260] mt-1">
              {searchQuery ? 'Try modifying your search or filter.' : 'When clients request private celebrations on the website, they will appear here.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] text-[11px] font-bold uppercase tracking-wider text-[#5C6260] border-b border-[#E6E1D8]">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Occasion & Client</th>
                  <th className="py-3.5 px-4">Contact & Outreach</th>
                  <th className="py-3.5 px-4">Guests & Date</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Status & Action</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E1D8]">
                {filteredInquiries.map((inq) => {
                  const waPhone = cleanPhoneForWhatsApp(inq.phone);
                  const waMessage = encodeURIComponent(
                    `Hello ${inq.fullName}! This is Lorie from Stretch with Lorie. I received your inquiry for the ${inq.occasionType} celebration. I would love to connect and curate a wonderful experience!`
                  );

                  return (
                    <tr key={inq.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                      {/* Occasion & Client Name */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex flex-col gap-1">
                          <span className="inline-block rounded-full bg-[#FAF5EB] border border-[#E8D7B0] px-2 py-0.5 text-[10px] font-bold text-[#8C6D23] max-w-fit">
                            {inq.occasionType}
                          </span>
                          <span className="font-serif text-sm font-bold text-[#2B2E31]">
                            {inq.fullName}
                          </span>
                          <span className="text-[10px] text-[#5C6260] flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {inq.createdAt ? new Date(inq.createdAt).toLocaleDateString() : 'Recent'}
                          </span>
                        </div>
                      </td>

                      {/* Contact & 1-Click Outreach */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[#2B2E31] font-medium">{inq.phone}</span>
                            {waPhone && (
                              <a
                                href={`https://wa.me/${waPhone}?text=${waMessage}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 rounded-lg bg-[#E5ECE2] border border-[#DCE4D9] px-2 py-0.5 text-[11px] font-bold text-[#5A6952] hover:bg-[#DCE4D9] transition-colors"
                                title="Chat on WhatsApp"
                              >
                                <MessageCircle className="h-3 w-3 text-[#5A6952]" />
                                <span>WhatsApp</span>
                              </a>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-[#5C6260]">
                            <Mail className="h-3 w-3 shrink-0" />
                            <a href={`mailto:${inq.email}`} className="hover:underline truncate max-w-[150px]">
                              {inq.email}
                            </a>
                          </div>
                        </div>
                      </td>

                      {/* Guests & Date */}
                      <td className="py-4 px-4">
                        <div className="space-y-0.5">
                          <span className="flex items-center gap-1.5 font-bold text-[#2B2E31]">
                            <Users className="h-3.5 w-3.5 text-[#7A8B71]" />
                            {inq.guestCount} {inq.guestCount === 1 ? 'Guest' : 'Guests'}
                          </span>
                          <span className="text-[11px] text-[#5C6260] flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-[#7A8B71]" />
                            {inq.preferredDate || 'Flexible Date'}
                          </span>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-4 px-4 text-xs text-[#5C6260]">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-[#C8A253] shrink-0" />
                          <span className="truncate max-w-[140px]">
                            {inq.locationPreference || 'Studio Sanctuary'}
                          </span>
                        </span>
                      </td>

                      {/* Status & Quick Status Changer */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          {getStatusBadge(inq.status)}
                          <div className="relative inline-block">
                            <select
                              disabled={updatingId === inq.id}
                              value={inq.status || 'pending'}
                              onChange={(e) => handleUpdateStatus(inq.id, e.target.value)}
                              className="rounded-xl border border-[#E6E1D8] bg-white px-2 py-1 text-[11px] font-semibold text-[#5C6260] outline-none hover:bg-[#FAF8F5] cursor-pointer"
                            >
                              <option value="pending">Pending</option>
                              <option value="contacted">Contacted</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedInquiry(inq)}
                          className="rounded-xl border border-[#E6E1D8] p-2 text-[#5C6260] hover:bg-[#FAF8F5] hover:text-[#2B2E31] transition-colors cursor-pointer"
                          title="View Special Requests & Notes"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inquiry Detail Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#2B2E31]/75 backdrop-blur-sm p-4 overscroll-contain animate-in fade-in duration-200">
          <div className="flex min-h-full items-center justify-center py-6">
            <div className="relative w-full max-w-lg rounded-3xl bg-[#FAF8F5] p-6 shadow-2xl border border-[#E6E1D8]">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#E6E1D8]">
                <div>
                  <span className="rounded-full bg-[#FAF5EB] border border-[#E8D7B0] px-2.5 py-0.5 text-xs font-bold text-[#8C6D23]">
                    {selectedInquiry.occasionType}
                  </span>
                  <h3 className="font-serif text-xl font-bold text-[#2B2E31] mt-1.5">
                    {selectedInquiry.fullName}
                  </h3>
                </div>
                {getStatusBadge(selectedInquiry.status)}
              </div>

              {/* Body Details */}
              <div className="mt-4 space-y-4 text-xs sm:text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white p-3 border border-[#E6E1D8]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#5C6260]">
                      Guest Count
                    </span>
                    <p className="font-serif text-base font-bold text-[#2B2E31] mt-0.5">
                      {selectedInquiry.guestCount} Guests
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white p-3 border border-[#E6E1D8]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#5C6260]">
                      Preferred Date
                    </span>
                    <p className="font-serif text-base font-bold text-[#2B2E31] mt-0.5">
                      {selectedInquiry.preferredDate || 'Flexible'}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl bg-white p-3.5 border border-[#E6E1D8] space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#5C6260]">
                    Location Preference
                  </span>
                  <p className="font-medium text-[#2B2E31]">
                    {selectedInquiry.locationPreference || 'Studio Sanctuary'}
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-4 border border-[#E6E1D8] space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#5C6260]">
                    Client Notes & Special Requests
                  </span>
                  <p className="text-xs text-[#2B2E31] leading-relaxed whitespace-pre-wrap">
                    {selectedInquiry.notes || 'No special requests submitted.'}
                  </p>
                </div>

                {/* Quick Outreach Action Bar */}
                <div className="flex items-center gap-2 pt-2">
                  {cleanPhoneForWhatsApp(selectedInquiry.phone) && (
                    <a
                      href={`https://wa.me/${cleanPhoneForWhatsApp(selectedInquiry.phone)}?text=${encodeURIComponent(
                        `Hello ${selectedInquiry.fullName}! This is Lorie from Stretch with Lorie. I received your inquiry for the ${selectedInquiry.occasionType} celebration. Let's arrange a time to chat!`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-[#5A6952] text-white py-2.5 text-xs font-bold hover:bg-[#475441] transition-colors"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>Message on WhatsApp</span>
                    </a>
                  )}

                  <a
                    href={`tel:${selectedInquiry.phone}`}
                    className="flex items-center gap-1.5 rounded-2xl border border-[#E6E1D8] bg-white px-4 py-2.5 text-xs font-bold text-[#2B2E31] hover:bg-[#FAF8F5] transition-colors"
                  >
                    <Phone className="h-4 w-4 text-[#7A8B71]" />
                    <span>Call</span>
                  </a>
                </div>
              </div>

              {/* Close */}
              <div className="mt-5 text-right border-t border-[#E6E1D8] pt-4">
                <button
                  type="button"
                  onClick={() => setSelectedInquiry(null)}
                  className="rounded-2xl bg-[#E5ECE2] border border-[#DCE4D9] px-4 py-2 text-xs font-bold text-[#5A6952] hover:bg-[#DCE4D9] transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

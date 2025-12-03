import React, { useMemo, useState, useEffect } from 'react';
import { FiCalendar, FiChevronDown, FiRefreshCw, FiCopy, FiExternalLink } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import './Booking.css';

const defaultSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00',
  '11:30', '12:00', '14:00', '14:30', '15:00',
  '15:30', '16:00'
];

const Booking = () => {
  const { user } = useAuth();
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [selectedSlot, setSelectedSlot] = useState('');
  const [guest, setGuest] = useState({ name: '', email: '', phone: '', comment: '' });
  const [step, setStep] = useState('select'); // select -> confirm
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Packages (services) the owner offers
  const [packages, setPackages] = useState([]);
  const [formSelectedPackageId, setFormSelectedPackageId] = useState(''); // For form booking
  const [newPackage, setNewPackage] = useState({ name: '', price: '', duration: '', description: '' });
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  const [links, setLinks] = useState([]);
  const [linksLoading, setLinksLoading] = useState(false);
  const [linkError, setLinkError] = useState('');
  const [linkForm, setLinkForm] = useState({
    name: '',
    packageId: 'all',
    bookingLimit: '',
    redirectUrl: '',
  });

  // Fetch packages on mount
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        const response = await api.getPackages();
        setPackages(response.packages || []);
      } catch (err) {
        console.error('Error fetching packages:', err);
        setError('Failed to load packages');
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, []);

  const fetchLinks = async () => {
    try {
      setLinksLoading(true);
      setLinkError('');
      const response = await api.getLinks();
      setLinks(response.links || []);
    } catch (err) {
      console.error('Error fetching links:', err);
      setLinkError(err.message || 'Failed to load booking links.');
    } finally {
      setLinksLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  // Fetch availability when date changes
  useEffect(() => {
    if (user?.id && date) {
      const fetchAvailability = async () => {
        try {
          setLoadingAvailability(true);
          const response = await api.getAvailability(user.id, date);
          setBookedSlots(response.booked_slots || []);
        } catch (err) {
          console.error('Error fetching availability:', err);
          setBookedSlots([]);
        } finally {
          setLoadingAvailability(false);
        }
      };
      fetchAvailability();
    } else {
      setBookedSlots([]);
    }
  }, [date, user?.id]);
  

  const meetingLink = useMemo(() => {
    if (!selectedSlot) return '';
    const token = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `https://dontforget.app/meet/${date}-${selectedSlot}-${token}`;
  }, [date, selectedSlot]);

  const isGuestValid = guest.name.trim() && guest.email.trim() && guest.phone.trim();
  const formSelectedPackage = packages.find(p => String(p.id) === String(formSelectedPackageId));
  const isFormValid = isGuestValid && selectedSlot && formSelectedPackageId;

  const handleConfirm = async (e) => {
    e.preventDefault();
    
    if (!formSelectedPackageId) {
      setError('Please select a package to create a booking.');
      return;
    }
    
    if (!isGuestValid || !selectedSlot) {
      setError('Please fill in all required fields.');
      return;
    }
    
    if (!user?.id) {
      setError('User not authenticated');
      return;
    }

    // Always create booking directly, skip payment step
    await createBooking();
  };

  const createBooking = async () => {
    try {
      setLoading(true);
      setError('');
      
      const bookingData = {
        user_id: user.id,
        package_id: formSelectedPackageId || null,
        guest_name: guest.name,
        guest_email: guest.email,
        guest_phone: guest.phone,
        guest_comment: guest.comment || null,
        date: date,
        time_slot: selectedSlot,
        meeting_link: meetingLink,
      };
      
      await api.createBooking(bookingData);
      setStep('confirm');
    } catch (err) {
      setError(err.message || 'Failed to create booking. Please try again.');
      console.error('Error creating booking:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetBooking = () => {
    setSelectedSlot('');
    setGuest({ name: '', email: '', phone: '', comment: '' });
    setFormSelectedPackageId('');
    setStep('select');
    setError('');
  };

  const copyMeetingLink = async (link) => {
    try {
      await navigator.clipboard.writeText(link);
      alert('Meeting link copied!');
    } catch (e) {
      console.error(e);
    }
  };

  const addPackage = async (e) => {
    e.preventDefault();
    if (!newPackage.name || !newPackage.duration) return;
    
    try {
      setLoading(true);
      setError('');
      const response = await api.createPackage({
        name: newPackage.name.trim(),
        price: Number(newPackage.price) || 0,
        duration: Number(newPackage.duration) || 0,
        description: newPackage.description?.trim() || ''
      });
      setPackages(prev => [...prev, response.package]);
      setNewPackage({ name: '', price: '', duration: '', description: '' });
    } catch (err) {
      setError(err.message || 'Failed to create package');
      console.error('Error creating package:', err);
    } finally {
      setLoading(false);
    }
  };

  const removePackage = async (id) => {
    try {
      setLoading(true);
      setError('');
      await api.deletePackage(id);
      setPackages(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError(err.message || 'Failed to delete package');
      console.error('Error deleting package:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkFormChange = (e) => {
    const { name, value } = e.target;
    setLinkForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateLink = async (e) => {
    e.preventDefault();
    if (!linkForm.name.trim()) {
      setLinkError('Please enter a name for the booking link.');
      return;
    }

    try {
      setLinksLoading(true);
      setLinkError('');
      await api.createLink({
        name: linkForm.name.trim(),
        package_id: linkForm.packageId === 'all' ? null : linkForm.packageId,
        booking_limit: linkForm.bookingLimit ? Number(linkForm.bookingLimit) : null,
        redirect_url: linkForm.redirectUrl?.trim() || null,
      });
      setLinkForm({
        name: '',
        packageId: 'all',
        bookingLimit: '',
        redirectUrl: '',
      });
      await fetchLinks();
    } catch (err) {
      console.error('Error creating booking link:', err);
      setLinkError(err.message || 'Failed to create booking link.');
    } finally {
      setLinksLoading(false);
    }
  };

  const getShareableLink = (slug) => {
    try {
      const origin = window?.location?.origin || '';
      return `${origin}/book?link=${slug}`;
    } catch {
      return `/book?link=${slug}`;
    }
  };

  const handleCopyShareLink = async (slug) => {
    try {
      await navigator.clipboard.writeText(getShareableLink(slug));
      alert('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy link:', err);
      alert('Could not copy link.');
    }
  };

  return (
    <div className="booking-page">
      <div className="content-header">
        <div className="section-title">
          <span className="title-icon"><FiCalendar /></span>
          <h2>Booking Setup</h2>
        </div>
        <p className="section-desc">Copy and share your booking link so clients can view your availability, choose a date and time, and book their appointment — all updates appear automatically on your dashboard.</p>
      </div>

      {/* Packages Builder */}
      <div className="packages-builder">
        <h3>Create Packages</h3>
        {error && (
          <div style={{ color: 'red', marginBottom: '1rem', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}
        <form onSubmit={addPackage} className="packages-form">
          <div className="form-row">
            <input placeholder="Package name" value={newPackage.name} onChange={(e)=>setNewPackage({ ...newPackage, name: e.target.value })} required className="form-input" />
            <input type="number" min="0" step="0.01" placeholder="Price ($)" value={newPackage.price} onChange={(e)=>setNewPackage({ ...newPackage, price: e.target.value })} className="form-input" />
          </div>
          <div className="form-row">
            <input type="number" min="0" step="5" placeholder="Duration (min)" value={newPackage.duration} onChange={(e)=>setNewPackage({ ...newPackage, duration: e.target.value })} required className="form-input" />
            <input placeholder="Description (optional)" value={newPackage.description} onChange={(e)=>setNewPackage({ ...newPackage, description: e.target.value })} className="form-input" />
          </div>
          <div className="form-row">
            <button className="primary-btn" type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Package'}
            </button>
          </div>
        </form>
        {packages.length > 0 && (
          <div className="packages-list">
            {packages.map(p => (
              <div key={p.id} className="package-item">
                <div className="package-info">
                  <div className="package-name"><strong>{p.name}</strong></div>
                  <div className="package-details">
                    <span className="package-price">${(Number(p.price) || 0).toFixed(2)}</span>
                    <span className="package-duration">{p.duration}m</span>
                  </div>
                  {p.description && (
                    <div className="package-description">{p.description}</div>
                  )}
                </div>
                <button className="secondary-btn remove-btn" onClick={()=>removePackage(p.id)} disabled={loading}>Remove</button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="links-section">
        <h3>Create Booking Links</h3>
        <p className="section-desc">Generate unique booking links with optional booking limits and post-booking redirects.</p>
        {linkError && (
          <div className="error-banner">
            {linkError}
          </div>
        )}
        <form className="links-form" onSubmit={handleCreateLink}>
          <div className="form-row">
            <input
              name="name"
              className="form-input"
              placeholder="Link name (e.g., Free Consultation)"
              value={linkForm.name}
              onChange={handleLinkFormChange}
              required
            />
            <select
              name="packageId"
              className="form-input"
              value={linkForm.packageId}
              onChange={handleLinkFormChange}
            >
              <option value="all">All packages</option>
              {packages.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} — {(Number(p.duration) || 0)}m
                </option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <input
              type="number"
              min="0"
              name="bookingLimit"
              className="form-input"
              placeholder="Booking limit (leave blank for unlimited)"
              value={linkForm.bookingLimit}
              onChange={handleLinkFormChange}
            />
            <input
              type="url"
              name="redirectUrl"
              className="form-input"
              placeholder="Redirect URL after booking (optional)"
              value={linkForm.redirectUrl}
              onChange={handleLinkFormChange}
            />
            <button type="submit" className="primary-btn" disabled={linksLoading}>
              {linksLoading ? 'Saving...' : 'Create Link'}
            </button>
          </div>
        </form>
        <div className="links-list">
          {linksLoading ? (
            <div className="links-empty">Loading booking links...</div>
          ) : links.length === 0 ? (
            <div className="links-empty">No booking links yet. Create your first link above.</div>
          ) : (
            <div className="links-table-wrapper">
              <table className="links-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Package</th>
                    <th>Bookings</th>
                    <th>Share Link</th>
                    <th>Redirect</th>
                  </tr>
                </thead>
                <tbody>
                  {links.map(link => (
                    <tr key={link.id}>
                      <td>
                        <div className="link-title">{link.name}</div>
                        <div className="link-meta">
                          {link.booking_limit ? `Limit: ${link.booking_limit}` : 'Unlimited'}
                        </div>
                      </td>
                      <td>{link.package ? link.package.name : 'All packages'}</td>
                      <td>
                        {link.booking_limit
                          ? `${link.bookings_count}/${link.booking_limit}`
                          : link.bookings_count}
                      </td>
                      <td>
                        <div className="link-actions">
                          <code className="mono link-url">{getShareableLink(link.slug)}</code>
                          <div className="link-action-buttons">
                            <button
                              type="button"
                              className="icon-btn"
                              onClick={() => handleCopyShareLink(link.slug)}
                            >
                              <FiCopy />
                            </button>
                            <a
                              href={getShareableLink(link.slug)}
                              className="icon-btn"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <FiExternalLink />
                            </a>
                          </div>
                        </div>
                      </td>
                      <td>
                        {link.redirect_url ? (
                          <a href={link.redirect_url} target="_blank" rel="noopener noreferrer">
                            {link.redirect_url}
                          </a>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <div className="content-subhead">
        <h3>Create Test Booking</h3>
        <p className="section-desc">Test the booking flow by creating a booking directly. Pick a time slot, enter guest details, select a package (optional), and create the booking.</p>
      </div>

      {step !== 'confirm' && (
        <div className="booking-container">
          <div className="booking-main">
            <div className="booking-grid">
              <div className="calendar-card">
                <div className="card-title">Select Date</div>
                <input
                  type="date"
                  className="date-input"
                  value={date}
                  onChange={(e) => { 
                    setDate(e.target.value); 
                    setSelectedSlot(''); 
                    setBookedSlots([]); // Clear booked slots when date changes
                  }}
                />
                <div className="card-title" style={{ marginTop: 12 }}>Available Slots</div>
                {loadingAvailability && (
                  <div style={{ textAlign: 'center', padding: '0.5rem', color: '#6b7280', fontSize: '0.875rem' }}>
                    Checking availability...
                  </div>
                )}
                <div className="slots-grid">
                  {defaultSlots.map(t => {
                    const isBooked = bookedSlots.includes(t);
                    return (
                    <button
                      key={t}
                        className={`slot-btn ${selectedSlot === t ? 'selected' : ''} ${isBooked ? 'booked' : ''}`}
                        onClick={() => !isBooked && setSelectedSlot(t)}
                        disabled={isBooked}
                        title={isBooked ? 'This time slot is already booked' : ''}
                      >
                        {t}
                        {isBooked && <span style={{ fontSize: '0.7rem', marginLeft: '0.25rem' }}>✕</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              <form className="details-card" onSubmit={handleConfirm}>
                <div className="card-title">Guest Details</div>
                
                {packages.length > 0 ? (
                  <div className="form-row" style={{ marginBottom: '1rem' }}>
                    <div className="form-field full">
                      <label>Select Package *</label>
                      <select 
                        value={formSelectedPackageId} 
                        onChange={(e)=>setFormSelectedPackageId(e.target.value)} 
                        className="filter-select"
                        style={{ width: '100%', padding: '0.75rem', fontSize: '0.95rem' }}
                        required
                      >
                        <option value="">Choose a package...</option>
                        {packages.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name} — ${(Number(p.price) || 0).toFixed(2)} • {p.duration}m
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div style={{ 
                    padding: '1rem', 
                    background: '#fef3c7', 
                    borderRadius: '6px', 
                    marginBottom: '1rem',
                    border: '1px solid #fbbf24',
                    color: '#92400e'
                  }}>
                    <strong>No packages available.</strong> Please create at least one package above before creating a booking.
                  </div>
                )}

                {formSelectedPackage && (
                  <div style={{ 
                    padding: '0.75rem', 
                    background: '#f3f4f6', 
                    borderRadius: '6px', 
                    marginBottom: '1rem',
                    border: '1px solid #d1d5db'
                  }}>
                    <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{formSelectedPackage.name}</div>
                    <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                      ${(Number(formSelectedPackage.price) || 0).toFixed(2)} • {formSelectedPackage.duration} minutes
                    </div>
                  </div>
                )}

                {error && (
                  <div style={{ color: 'red', marginBottom: '1rem', fontSize: '0.9rem', padding: '0.5rem', background: '#fee2e2', borderRadius: '4px' }}>
                    {error}
                  </div>
                )}

                <div className="form-row">
                  <div className="form-field">
                    <label>Name</label>
                    <input value={guest.name} onChange={(e)=>setGuest({ ...guest, name: e.target.value })} placeholder="Guest full name" required />
                  </div>
                  <div className="form-field">
                    <label>Email</label>
                    <input type="email" value={guest.email} onChange={(e)=>setGuest({ ...guest, email: e.target.value })} placeholder="Guest email address" required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-field">
                    <label>Phone</label>
                    <input value={guest.phone} onChange={(e)=>setGuest({ ...guest, phone: e.target.value })} placeholder="Guest phone number" required />
                  </div>
                </div>
            <div className="form-row">
              <div className="form-field full">
                <label>Comment</label>
                <textarea value={guest.comment} onChange={(e)=>setGuest({ ...guest, comment: e.target.value })} placeholder="Anything we should know?" rows={4} />
              </div>
            </div>


            {step === 'select' && (
              <div className="actions-row">
                <button type="submit" className="primary-btn" disabled={!isFormValid || loading || packages.length === 0}>
                  {loading ? 'Creating...' : 'Create Booking'}
                </button>
              </div>
            )}
              </form>
            </div>
          </div>
        </div>
      )}

      {step === 'confirm' && (
        <div className="confirmation-card">
          <div className="card-title">Booking Created Successfully! ✅</div>
          <ul className="confirm-list">
            {formSelectedPackage && (
              <li><strong>Package:</strong> {formSelectedPackage.name} — ${(Number(formSelectedPackage.price) || 0).toFixed(2)}</li>
            )}
            <li><strong>Guest:</strong> {guest.name} ({guest.email})</li>
            <li><strong>Date/Time:</strong> {date} at {selectedSlot}</li>
            {meetingLink && (
              <li><strong>Meeting link:</strong> <span className="mono">{meetingLink}</span> <button className="secondary-btn" onClick={()=>copyMeetingLink(meetingLink)} style={{ marginLeft: 8 }}>Copy</button></li>
            )}
            {guest.comment && (<li><strong>Notes:</strong> {guest.comment}</li>)}
          </ul>
          <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#d1fae5', borderRadius: '6px', color: '#065f46', fontSize: '0.9rem' }}>
            This booking has been saved to your bookings list. You can view it in the Bookings section.
          </div>
          <div className="actions-row">
            <button className="secondary-btn" onClick={resetBooking}>Create Another Booking</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Booking;




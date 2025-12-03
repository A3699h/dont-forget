import React, { useMemo, useState, useEffect, useRef } from 'react';
import { FiCalendar, FiRefreshCw, FiArrowLeft } from 'react-icons/fi';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../utils/api';
import './Booking.css';

const defaultSlots = [
  '00:00', '00:30', '01:00', '01:30', '02:00', '02:30', '03:00', '03:30', '04:00', '04:30', '05:00', '05:30', '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00',
  '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00', '23:30'
];

const PublicBooking = () => {
  const [searchParams] = useSearchParams();
  const linkSlug = searchParams.get('link');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [selectedSlot, setSelectedSlot] = useState('');
  const [guest, setGuest] = useState({ name: '', email: '', phone: '', comment: '' });
  const [step, setStep] = useState('select'); // select -> payment -> confirm
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [requirePayment, setRequirePayment] = useState(false); // Owner link allows optional payment by default
  const [payNow, setPayNow] = useState(false); // Client chooses to pay now or not
  const [stripeLoaded, setStripeLoaded] = useState(false);
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [currentBookingId, setCurrentBookingId] = useState(null);
  const [isSharedLink, setIsSharedLink] = useState(true);
  const [ownerName, setOwnerName] = useState('us');
  const [stripeKey, setStripeKey] = useState('');
  const [paypalKey, setPaypalKey] = useState('');
  const stripeInstanceRef = useRef(null);
  const [packages, setPackages] = useState([]);
  const [selectedPackageId, setSelectedPackageId] = useState('');
  const [isPackagePreSelected, setIsPackagePreSelected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [linkInfo, setLinkInfo] = useState(null);

  // In a real app, you might fetch owner-configured pricing here; for now, payment is optional without service selection

  // Handle URL parameters for shared links
  useEffect(() => {
    const owner = searchParams.get('owner');
    const payment = searchParams.get('payment');
    const packageId = searchParams.get('packageId');
    const pkgs = searchParams.get('pkgs');
    
    // if (owner === 'true') {
    //   setIsSharedLink(true);
    //   if (!linkSlug) {
    //     setOwnerName('the account owner');
    //   }
    // }
    
    if (payment === 'optional') {
      setRequirePayment(false);
    } else if (payment === 'required') {
      setRequirePayment(true);
    }
    
    if (!linkSlug && pkgs) {
      try {
        const json = decodeURIComponent(escape(atob(pkgs)));
        const list = JSON.parse(json);
        const normalized = list.map(p => ({ id: p.id, name: p.n, price: Number(p.pr)||0, duration: Number(p.du)||0, description: p.d||'' }));
        if (Array.isArray(normalized) && normalized.length > 0) {
          setPackages(normalized);
          if (packageId) {
            const foundPackage = normalized.find(p => String(p.id) === String(packageId));
            if (foundPackage) {
              setSelectedPackageId(packageId);
              setIsPackagePreSelected(true);
            }
          }
        }
      } catch (e) {
        console.error('Invalid packages payload');
      }
    }
  }, [searchParams, linkSlug]);

  const bookingUserId = linkInfo?.user_id || searchParams.get('userId');

  useEffect(() => {
    if (!linkSlug) return;
    const fetchLink = async () => {
      try {
        const response = await api.getPublicLink(linkSlug);
        setLinkInfo(response);
        const displayName =
          response.branding?.display_name ||
          response.link?.name ||
          'the account owner';
        setOwnerName(displayName);
        setStripeKey(response.stripe || '');
        setPaypalKey(response.paypal || '');
        if (response.package) {
          setPackages([response.package]);
          setSelectedPackageId(response.package.id);
          setIsPackagePreSelected(true);
        } else {
          setIsPackagePreSelected(false);
        }
      } catch (err) {
        console.error('Error loading link:', err);
        setError(err.message || 'Invalid or expired booking link.');
      }
    };
    fetchLink();
  }, [linkSlug]);

  // Handle PayPal return after payment
  useEffect(() => {
    const handlePayPalReturn = async () => {
      const paypalOrderId = searchParams.get('token') || sessionStorage.getItem('pending_paypal_order_id');
      const pendingBookingData = sessionStorage.getItem('pending_booking_data');
      
      if (paypalOrderId && pendingBookingData) {
        try {
          setLoading(true);
          setError('');
          
          const bookingData = JSON.parse(pendingBookingData);
          
          // Capture PayPal payment and create booking
          const response = await api.capturePayPalPayment({
            order_id: paypalOrderId,
            ...bookingData,
          });

          // Clear session storage
          sessionStorage.removeItem('pending_booking_data');
          sessionStorage.removeItem('pending_paypal_order_id');
          sessionStorage.removeItem('pending_paypal_user_id');

          // Update state with booking data
          setSelectedPackageId(bookingData.package_id);
          setGuest({
            name: bookingData.guest_name,
            email: bookingData.guest_email,
            phone: bookingData.guest_phone,
            comment: bookingData.guest_comment || '',
          });
          setDate(bookingData.date);
          setSelectedSlot(bookingData.time_slot);
          setCurrentBookingId(response.booking?.id);
          setStep('confirm');

          // Remove PayPal return params from URL
          const newUrl = window.location.pathname + window.location.search.replace(/[?&]token=[^&]*/g, '').replace(/[?&]PayerID=[^&]*/g, '');
          window.history.replaceState({}, '', newUrl);
        } catch (err) {
          setError(err.message || 'Failed to complete PayPal payment. Please try again.');
          console.error('Error completing PayPal payment:', err);
          // Clear session storage on error
          sessionStorage.removeItem('pending_booking_data');
          sessionStorage.removeItem('pending_paypal_order_id');
          sessionStorage.removeItem('pending_paypal_user_id');
        } finally {
          setLoading(false);
        }
      }
    };

    handlePayPalReturn();
  }, [searchParams]);

  useEffect(() => {
    if (!bookingUserId || linkInfo?.package) return;
    const fetchPackages = async () => {
      try {
        const response = await api.getUserPackages(bookingUserId);
        if (response.packages && response.packages.length > 0) {
          setPackages(response.packages);
          const packageId = searchParams.get('packageId');
          if (packageId) {
            const foundPackage = response.packages.find(p => String(p.id) === String(packageId));
            if (foundPackage) {
              setSelectedPackageId(packageId);
              setIsPackagePreSelected(true);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching packages:', err);
      }
    };
    fetchPackages();
  }, [bookingUserId, linkInfo, searchParams]);

  // Fetch availability when date or user changes
  useEffect(() => {
    if (bookingUserId && date) {
      const fetchAvailability = async () => {
        try {
          setLoadingAvailability(true);
          const response = await api.getAvailability(bookingUserId, date);
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
  }, [date, bookingUserId]);

  const meetingLink = useMemo(() => {
    if (!selectedSlot) return '';
    const token = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `https://dontforget.app/meet/${date}-${selectedSlot}-${token}`;
  }, [date, selectedSlot]);

  const isGuestValid = guest.name.trim() && guest.email.trim() && guest.phone.trim();
  const selectedPackage = packages.find(p => String(p.id) === String(selectedPackageId));
  const needsPayment = (requirePayment || payNow) && !!selectedPackage;
  const isFormValid = isGuestValid && selectedSlot && selectedPackageId;
  const isLinkFull = linkInfo?.link?.is_full;

  const branding = linkInfo?.branding || {};
  const brandColor = branding.color || '#FF7043';
  const brandLogo = branding.logo || null;

  // Load Stripe.js and initialize Elements
  useEffect(() => {
    if (step === 'payment' && paymentMethod === 'stripe') {
      const loadStripe = async () => {
        if (!window.Stripe) {
          const script = document.createElement('script');
          script.src = 'https://js.stripe.com/v3/';
          script.async = true;
          await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
            document.body.appendChild(script);
          });
        }

        const stripePublishableKey = stripeKey  ;
        // const stripePublishableKey= 'pk_test_51LAGhyGCsoxWmu8rfamgqdppLfcq5II57VaaeTwckr3edyDoGQKfmAeFVVT97YIj3UhubLVLVs3hmeDp72HZtZP600PpdRDjdR';
        if (!stripePublishableKey) {
          setError('Stripe is not configured. Please contact the booking owner.');
          return;
        }

        const stripe = window.Stripe(stripePublishableKey);
        // Store the Stripe instance in a ref so we can reuse it
        stripeInstanceRef.current = stripe;
        
        const elements = stripe.elements();
        
        // Create and mount card element
        const cardElement = elements.create('card', {
          style: {
            base: {
              fontSize: '16px',
              color: '#424770',
              '::placeholder': {
                color: '#aab7c4',
              },
            },
            invalid: {
              color: '#9e2146',
            },
          },
        });

        const cardElementContainer = document.getElementById('stripe-card-element');
        if (cardElementContainer && !cardElementContainer.__stripeElement) {
          cardElement.mount('#stripe-card-element');
          cardElementContainer.__stripeElement = cardElement;

          // Listen for errors
          cardElement.on('change', ({error}) => {
            const displayError = document.getElementById('stripe-card-errors');
            if (displayError) {
              displayError.textContent = error ? error.message : '';
            }
          });
        }

        setStripeLoaded(true);
      };

      loadStripe().catch(err => {
        console.error('Error loading Stripe:', err);
        setError('Failed to load payment processor. Please refresh the page.');
      });
    }
  }, [step, paymentMethod]);

  // Load PayPal SDK
  useEffect(() => {
    if (step === 'payment' && paymentMethod === 'paypal') {
      const loadPayPal = async () => {
        if (!window.paypal) {
          // PayPal client ID should come from backend/user settings
          // For now, using a placeholder
          const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID || 'YOUR_CLIENT_ID';
          const script = document.createElement('script');
          script.src = `https://www.paypal.com/sdk/js?client-id=${paypalClientId}&currency=USD`;
          script.async = true;
          await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
            document.body.appendChild(script);
          });
        }

        setPaypalLoaded(true);
      };

      loadPayPal().catch(err => {
        console.error('Error loading PayPal:', err);
        setError('Failed to load payment processor. Please refresh the page.');
      });
    }
  }, [step, paymentMethod]);

  const handleConfirm = async (e) => {
    e.preventDefault();
    
    if (!selectedPackageId) {
      setError('Please select a package to continue.');
      return;
    }
    
    if (!isGuestValid || !selectedSlot) {
      setError('Please fill in all required fields.');
      return;
    }
    
    const userId = bookingUserId;
    if (!userId) {
      setError('Invalid booking link. Missing user ID.');
      return;
    }
    
    if (isLinkFull) {
      setError('This booking link has reached its booking limit.');
      return;
    }
    
    if (step === 'select') {
      if (needsPayment) {
        setStep('payment');
      } else {
        // Create booking directly
        await createBooking(userId);
      }
      return;
    }
    if (step === 'payment') {
      // Process payment first, then create booking
      await processPayment(userId);
    }
  };

  const createBooking = async (userId, paymentStatus = 'pending', paymentIntentId = null) => {
    try {
      setLoading(true);
      setError('');
      
      const bookingData = {
        user_id: userId,
        package_id: selectedPackageId || null,
        guest_name: guest.name,
        guest_email: guest.email,
        guest_phone: guest.phone,
        guest_comment: guest.comment || null,
        date: date,
        time_slot: selectedSlot,
        meeting_link: meetingLink,
        link_slug: linkSlug || null,
      };
      
      const response = await api.createBooking(bookingData);
      const bookingId = response.booking?.id;
      
      if (bookingId && paymentStatus === 'paid' && paymentIntentId) {
        // Confirm payment on backend to update payment status
        try {
          await api.confirmStripePayment({
            payment_intent_id: paymentIntentId,
            booking_id: bookingId,
          });
        } catch (updateErr) {
          console.error('Error confirming payment status:', updateErr);
          // Even if confirmation fails, booking is created - we can handle this separately
        }
      }
      
      setCurrentBookingId(bookingId);
      setStep('confirm');
      if (linkInfo?.link?.redirect_url) {
        setTimeout(() => {
          window.location.href = linkInfo.link.redirect_url;
        }, 2000);
      }
    } catch (err) {
      setError(err.message || 'Failed to create booking. Please try again.');
      console.error('Error creating booking:', err);
      throw err; // Re-throw so payment flow can handle it
    } finally {
      setLoading(false);
    }
  };

  const processPayment = async (userId) => {
    if (!selectedPackage) {
      setError('Please select a package to continue.');
      return;
    }

    const amount = Number(selectedPackage.price) || 0;
    if (amount <= 0) {
      setError('Invalid package price.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Process payment first - booking will only be created after successful payment
      if (paymentMethod === 'stripe') {
        await processStripePayment(userId, amount);
      } else if (paymentMethod === 'paypal') {
        await processPayPalPayment(userId, amount);
      }
    } catch (err) {
      setError(err.message || 'Payment processing failed. Please try again.');
      console.error('Error processing payment:', err);
      setLoading(false);
    }
  };

  const processStripePayment = async (userId, amount) => {
    try {
      // Create payment intent
      const intentResponse = await api.createStripeIntent({
        package_id: selectedPackageId,
        user_id: userId,
        amount: amount,
      });

      // Use the same Stripe instance that was used to create the Elements
      const stripe = stripeInstanceRef.current;
      if (!stripe) {
        throw new Error('Stripe is not initialized. Please wait a moment and try again.');
      }

      const cardElementContainer = document.getElementById('stripe-card-element');
      const cardElement = cardElementContainer?.__stripeElement;

      if (!cardElement) {
        throw new Error('Card input is not ready. Please wait a moment and try again.');
      }
      
      // Confirm payment with Stripe using the same instance
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        intentResponse.client_secret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: guest.name,
              email: guest.email,
            },
          },
        }
      );

      if (error) {
        const displayError = document.getElementById('stripe-card-errors');
        if (displayError) {
          displayError.textContent = error.message;
        }
        throw new Error(error.message);
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment succeeded - now create the booking with payment_status='paid'
        await createBooking(userId, 'paid', paymentIntent.id);
      } else {
        throw new Error('Payment not completed. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Stripe payment failed. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const processPayPalPayment = async (userId, amount) => {
    try {
      // Create PayPal order with return URLs
      const currentUrl = window.location.origin + window.location.pathname + (linkSlug ? `?link=${linkSlug}` : '');
      const orderResponse = await api.createPayPalOrder({
        package_id: selectedPackageId,
        user_id: userId,
        amount: amount,
        return_url: currentUrl,
        cancel_url: currentUrl,
        link_slug: linkSlug || null,
      });

      if (orderResponse.approval_url) {
        // Store booking data in sessionStorage to create booking after payment
        const bookingData = {
          user_id: userId,
          package_id: selectedPackageId,
          guest_name: guest.name,
          guest_email: guest.email,
          guest_phone: guest.phone,
          guest_comment: guest.comment || null,
          date: date,
          time_slot: selectedSlot,
          meeting_link: meetingLink,
          link_slug: linkSlug || null,
        };
        
        sessionStorage.setItem('pending_booking_data', JSON.stringify(bookingData));
        sessionStorage.setItem('pending_paypal_order_id', orderResponse.order_id);
        sessionStorage.setItem('pending_paypal_user_id', userId);
        
        // Redirect to PayPal for payment
        window.location.href = orderResponse.approval_url;
      } else {
        throw new Error('Failed to get PayPal approval URL.');
      }
    } catch (err) {
      setError(err.message || 'PayPal payment failed. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };


  const resetBooking = () => {
    setSelectedSlot('');
    setGuest({ name: '', email: '', phone: '', comment: '' });
    setPaymentMethod('stripe');
    setStep('select');
    setPayNow(false);
    setError('');
    // Don't reset selectedPackageId if it was pre-selected by owner
    if (!isPackagePreSelected) {
      setSelectedPackageId('');
    }
  };

  if (!isSharedLink) {
    return (
      <div className="public-booking-page">
        <div className="public-header">
          <div className="public-header-content">
            <Link to="/" className="back-link"><FiArrowLeft /> Back to Home</Link>
            <div className="public-logo"><FiCalendar /><span>Don't Forget</span></div>
          </div>
        </div>
        <div className="booking-page">
          <div className="content-header">
            <div className="section-title">
              <span className="title-icon"><FiCalendar /></span>
              <h2>Link Required</h2>
            </div>
            <p className="section-desc">This booking page is only accessible via a shared link from the account owner.</p>
          </div>
          <div className="actions-row">
            <Link to="/" className="primary-btn">Go to Home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="public-booking-page">
      {/* Public Header */}
      <div className="public-header" style={{ borderBottomColor: brandColor }}>
        <div className="public-header-content">
          <Link to="/" className="back-link">
            <FiArrowLeft />
            Back to Home
          </Link>
          <div className="public-logo">
            {brandLogo ? (
              <img src={brandLogo} alt={ownerName} className="branding-logo" />
            ) : (
            <FiCalendar />
            )}
            <span>{ownerName}</span>
          </div>
        </div>
      </div>

      <div className="booking-page">
        <div className="content-header">
          <div className="section-title">
            <span className="title-icon"><FiCalendar /></span>
            <h2>Book Your Appointment</h2>
          </div>
          <p className="section-desc">
            {isSharedLink 
              ? `Schedule a meeting with ${ownerName}. No account required - just pick a time, enter your details, and we'll confirm your appointment instantly.`
              : 'Schedule a meeting with us. No account required - just pick a time, enter your details, and we\'ll confirm your appointment instantly.'
            }
          </p>
        </div>

        {isLinkFull && (
          <div className="warning-banner" style={{ marginBottom: '1rem' }}>
            This booking link has reached its booking limit. Please contact the owner for a new link.
          </div>
        )}

        {step !== 'confirm' && !isLinkFull && (
          <div className="booking-container">
            <div className="booking-main">
              <div className="booking-grid">
                <div className="calendar-card">
                  <div className="card-title">Select Date</div>
                  <input
                    type="date"
                    className="date-input"
                    value={date}
                    onChange={(e) => { setDate(e.target.value); setSelectedSlot(''); }}
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
                  <div className="card-title">Your Details</div>
                  
                  {/* Show package details if pre-selected by owner */}
                  {isPackagePreSelected && selectedPackage && (
                    <div className="selected-package-info" style={{ 
                      padding: '1.25rem', 
                      background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)', 
                      borderRadius: '12px', 
                      marginBottom: '1.5rem',
                      border: '2px solid #3b82f6',
                      boxShadow: '0 4px 6px rgba(59, 130, 246, 0.1)'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        marginBottom: '0.75rem'
                      }}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.5rem',
                          color: '#1e40af',
                          fontWeight: 700,
                          fontSize: '0.875rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          <FiCalendar size={16} />
                          Selected Package
                        </div>
                        <div style={{ 
                          fontSize: '0.75rem', 
                          color: '#64748b',
                          background: 'rgba(255, 255, 255, 0.7)',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px'
                        }}>
                          Pre-selected by owner
                        </div>
                      </div>
                      <div style={{ 
                        fontSize: '1.25rem', 
                        fontWeight: 600, 
                        marginBottom: '0.5rem',
                        color: '#1e3a8a'
                      }}>
                        {selectedPackage.name}
                      </div>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '1rem',
                        marginBottom: '0.75rem',
                        color: '#1e40af',
                        fontSize: '1rem',
                        fontWeight: 500
                      }}>
                        <span>${(Number(selectedPackage.price) || 0).toFixed(2)}</span>
                        <span style={{ color: '#64748b' }}>•</span>
                        <span>{selectedPackage.duration} minutes</span>
                      </div>
                      {selectedPackage.description && (
                        <div style={{ 
                          marginTop: '0.75rem', 
                          paddingTop: '0.75rem',
                          borderTop: '1px solid #93c5fd',
                          color: '#1e3a8a', 
                          fontSize: '0.95rem',
                          lineHeight: '1.5'
                        }}>
                          {selectedPackage.description}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Show package selector if owner chose "let client choose" */}
                  {!isPackagePreSelected && packages.length > 0 && (
                    <>
                      <div className="form-row" style={{ marginBottom: '1rem' }}>
                        <div className="form-field full">
                          <label>Select a Package *</label>
                          <select 
                            value={selectedPackageId} 
                            onChange={(e)=>setSelectedPackageId(e.target.value)} 
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
                      {/* Show selected package details when client chooses one */}
                      {selectedPackage && (
                        <div className="selected-package-info" style={{ 
                          padding: '1rem', 
                          background: '#f3f4f6', 
                          borderRadius: '8px', 
                          marginBottom: '1rem',
                          border: '1px solid #d1d5db'
                        }}>
                          <div style={{ 
                            fontWeight: 600, 
                            marginBottom: '0.5rem',
                            color: '#374151'
                          }}>
                            Selected Package:
                          </div>
                          <div style={{ 
                            fontSize: '1rem', 
                            fontWeight: 500, 
                            marginBottom: '0.25rem',
                            color: '#1f2937'
                          }}>
                            {selectedPackage.name}
                          </div>
                          <div style={{ 
                            color: '#6b7280', 
                            fontSize: '0.9rem',
                            marginBottom: '0.25rem'
                          }}>
                            ${(Number(selectedPackage.price) || 0).toFixed(2)} • {selectedPackage.duration} minutes
                          </div>
                          {selectedPackage.description && (
                            <div style={{ 
                              marginTop: '0.5rem', 
                              color: '#4b5563', 
                              fontSize: '0.9rem',
                              paddingTop: '0.5rem',
                              borderTop: '1px solid #e5e7eb'
                            }}>
                              {selectedPackage.description}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}

                  <div className="form-row">
                    <div className="form-field">
                      <label>Full Name *</label>
                      <input 
                        value={guest.name} 
                        onChange={(e)=>setGuest({ ...guest, name: e.target.value })} 
                        placeholder="Your full name" 
                        required 
                      />
                    </div>
                    <div className="form-field">
                      <label>Email *</label>
                      <input 
                        type="email"
                        value={guest.email} 
                        onChange={(e)=>setGuest({ ...guest, email: e.target.value })} 
                        placeholder="your.email@example.com" 
                        required 
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-field">
                      <label>Phone *</label>
                      <input 
                        value={guest.phone} 
                        onChange={(e)=>setGuest({ ...guest, phone: e.target.value })} 
                        placeholder="Your phone number" 
                        required 
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-field full">
                      <label>Comments</label>
                      <textarea 
                        value={guest.comment} 
                        onChange={(e)=>setGuest({ ...guest, comment: e.target.value })} 
                        placeholder="Any special requests?" 
                        rows={4} 
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={payNow}
                        onChange={(e) => setPayNow(e.target.checked)}
                      />
                      Pay now (optional)
                    </label>
                  </div>

                  {error && (
                    <div style={{ color: 'red', marginBottom: '1rem', fontSize: '0.9rem' }}>
                      {error}
                    </div>
                  )}
                  
                  {step === 'select' && (
                    <div className="actions-row">
                      <button type="submit" className="primary-btn" disabled={!isFormValid || loading}>
                        {loading ? 'Creating...' : (needsPayment ? 'Continue to Payment' : 'Confirm Booking')}
                      </button>
                    </div>
                  )}

                  {step === 'payment' && (
                    <div className="payment-panel">
                      <div className="card-title">Payment</div>
                      <div className="payment-info">
                        <p className="payment-note">
                          {selectedPackage 
                            ? `Pay $${(Number(selectedPackage.price) || 0).toFixed(2)} for ${selectedPackage.name}.` 
                            : 'You chose to pay now. Complete payment to confirm your booking.'}
                        </p>
                      </div>
                      
                      <div className="pay-methods">
                      {stripeKey && (
                        <label className="radio">
                          <input 
                            type="radio" 
                            name="pay" 
                            checked={paymentMethod==='stripe'} 
                            onChange={()=>setPaymentMethod('stripe')} 
                          /> 
                          Stripe
                        </label>
                        )}
                        {paypalKey && (
                        <label className="radio">
                          <input 
                            type="radio" 
                            name="pay" 
                            checked={paymentMethod==='paypal'} 
                            onChange={()=>setPaymentMethod('paypal')} 
                          /> 
                          PayPal
                        </label>
                        )}
                      </div>

                      {paymentMethod === 'stripe' && stripeKey && (
                        <div className="stripe-payment-form" style={{ marginTop: '1rem' }}>
                          <div id="stripe-card-element" style={{ 
                            padding: '12px', 
                            border: '1px solid #d1d5db', 
                            borderRadius: '8px',
                            marginBottom: '1rem'
                          }}>
                            {/* Stripe Elements will mount here */}
                          </div>
                          <div id="stripe-card-errors" role="alert" style={{ color: 'red', fontSize: '0.875rem', marginBottom: '1rem' }}></div>
                        </div>
                      )}

                      {paymentMethod === 'paypal' && paypalKey && (
                        <div className="paypal-payment-form" style={{ marginTop: '1rem' }}>
                          <div id="paypal-button-container" style={{ marginBottom: '1rem' }}>
                            {/* PayPal button will mount here */}
                          </div>
                        </div>
                      )}

                      <div className="actions-row">
                        <button 
                          type="button" 
                          className="secondary-btn" 
                          onClick={() => setStep('select')} 
                          disabled={loading}
                        >
                          Back
                        </button>
                        <button 
                          type="submit" 
                          className="primary-btn" 
                          disabled={loading}
                        >
                          {loading ? 'Processing...' : 'Pay and Confirm'}
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        )}

        {step === 'confirm' && (
          <div className="confirmation-card">
            <div className="card-title">Booking Confirmed! 🎉</div>
            <ul className="confirm-list">
              {selectedPackage && (
                <li><strong>Package:</strong> {selectedPackage.name} — ${(Number(selectedPackage.price) || 0).toFixed(2)}</li>
              )}
              <li><strong>Date/Time:</strong> {date} at {selectedSlot}</li>
              <li><strong>Meeting link:</strong> <span className="mono">{meetingLink}</span> <button className="secondary-btn" onClick={()=>navigator.clipboard.writeText(meetingLink)} style={{ marginLeft: 8 }}>Copy</button></li>
              <li><strong>Payment:</strong> {payNow || requirePayment ? 'Collected' : 'Not collected'}</li>
              {guest.comment && (<li><strong>Notes:</strong> {guest.comment}</li>)}
            </ul>
            <div className="confirmation-note">
              <p>We've sent a confirmation email to <strong>{guest.email}</strong> with all the details.</p>
            </div>
            <div className="actions-row">
              <button className="secondary-btn" onClick={resetBooking}>Book Another</button>
              <Link to="/" className="primary-btn">Back to Home</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicBooking;

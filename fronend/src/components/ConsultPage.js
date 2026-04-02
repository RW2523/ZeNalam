import React, { useState, useEffect } from 'react';
import PageLayout from './PageLayout';
import { api } from '../apiClient';

function ConsultPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookingMessage, setBookingMessage] = useState('');
  const [doctorsList, setDoctorsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get('/api/content/consultants');
        if (!cancelled) {
          setDoctorsList(Array.isArray(res.data) ? res.data : []);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e.message || 'Could not load consultants.');
          setDoctorsList([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filteredDoctors = doctorsList.filter(
    (doc) =>
      (doc.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.specialization || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBook = (doctor) => {
    setSelectedDoctor(doctor);
    setBookingMessage('');
  };

  const confirmBooking = () => {
    setBookingMessage(
      `Appointment requested with ${selectedDoctor.name}. Confirmation will be sent to ${selectedDoctor.contact}.`
    );
    setSelectedDoctor(null);
  };

  return (
    <PageLayout
      title="Wellness consultations"
      subtitle="Specialists from our directory. Book a session to get started."
      wide
      noCard
    >
      {loading && <p className="page-shell__subtitle">Loading directory…</p>}
      {error && (
        <div className="page-alert page-alert--error" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <input
            type="search"
            className="page-consult-search"
            placeholder="Search by name or specialization…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search doctors"
          />

          <div className="page-consult-grid">
            {filteredDoctors.map((doc) => (
              <div key={doc.id} className="page-consult-card">
                <img src={doc.imageUrl} alt={doc.name} />
                <h3>{doc.name}</h3>
                <p>
                  <strong>{doc.specialization}</strong>
                </p>
                <p>
                  {doc.hospital} · {doc.location}
                </p>
                <p>
                  <small>{doc.availableHours}</small>
                </p>
                <button type="button" className="page-consult-book" onClick={() => handleBook(doc)}>
                  Book appointment
                </button>
              </div>
            ))}
          </div>

          {filteredDoctors.length === 0 && (
            <p className="page-shell__subtitle" style={{ marginTop: '1rem' }}>
              No matches. Try another search.
            </p>
          )}
        </>
      )}

      {selectedDoctor && (
        <div className="page-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="consult-modal-title">
          <div className="page-modal">
            <h3 id="consult-modal-title">Confirm booking</h3>
            <p>
              <strong>Doctor:</strong> {selectedDoctor.name}
            </p>
            <p>
              <strong>Specialization:</strong> {selectedDoctor.specialization}
            </p>
            <p>
              <strong>Hospital:</strong> {selectedDoctor.hospital}
            </p>
            <div className="page-modal-actions">
              <button type="button" className="page-modal-btn page-modal-btn--confirm" onClick={confirmBooking}>
                Confirm
              </button>
              <button
                type="button"
                className="page-modal-btn page-modal-btn--cancel"
                onClick={() => setSelectedDoctor(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {bookingMessage && (
        <div className="page-alert page-alert--success" style={{ marginTop: '1.5rem' }} role="status">
          {bookingMessage}
        </div>
      )}
    </PageLayout>
  );
}

export default ConsultPage;

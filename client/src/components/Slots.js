import React, { useEffect, useState } from 'react';
import API from '../api';

const Slots = ({ companyId }) => {
  const [slots, setSlots] = useState([]);

  // Dohvatanje slotova pri mount-u i kad se promeni companyId
  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const res = await API.get(`/slots?companyId=${companyId}`);
        setSlots(res.data);
      } catch (err) {
        console.error(err);
        alert('Greška pri učitavanju slotova');
      }
    };
    fetchSlots();
  }, [companyId]);

  // Bookiranje termina
  const bookSlot = async (slotId) => {
    try {
      await API.post('/bookings', { companyId, service: 'Termin', slotId });

      alert('Booking uspešan!');

      // 🔑 Update lokalnog state-a odmah nakon bookinga
      setSlots(prev =>
        prev.map(s => s.slot_id === slotId ? { ...s, is_booked: true } : s)
      );
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Greška pri bookingu');
    }
  };

  return (
    <div>
      <h2>Slots</h2>
      <ul>
        {slots.map(s => (
          <li key={s.slot_id}>
            {s.provider_name} ({new Date(s.start_time).toLocaleString()} - {new Date(s.end_time).toLocaleTimeString()})
            <button onClick={() => bookSlot(s.slot_id)} disabled={s.is_booked}>
              {s.is_booked ? 'Booked' : 'Book'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Slots;

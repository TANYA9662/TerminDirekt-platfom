import React, { useEffect, useState } from 'react';
import API from '../api';

const Slots = () => {
  const [slots, setSlots] = useState([]);

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const res = await API.get('/slots');
        setSlots(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSlots();
  }, []);

  const bookSlot = async (slot_id) => {
    try {
      await API.post('/bookings', { slot_id, service: 'Termin' });
      alert('Booking uspešan!');
    } catch (err) {
      console.error(err);
      alert('Greška pri bookingu');
    }
  };

  return (
    <div>
      <h2>Slots</h2>
      <ul>
        {slots.map(s => (
          <li key={s.slot_id}>
            {s.provider_name} ({new Date(s.slot_time).toLocaleString()} - {new Date(s.end_time).toLocaleString()})
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

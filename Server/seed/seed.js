// Server/seed/seed.js
import 'dotenv/config';
import { pool } from '../config/db.js';
import * as Company from '../models/Company.js';
import * as Provider from '../models/Provider.js';
import * as Slot from '../models/Slot.js';
import * as Booking from '../models/Booking.js';

const seed = async () => {
  try {
    console.log('🔄 Seed pokrenut...');

    // 0️⃣ Očisti sve tabele koristeći TRUNCATE ... CASCADE
    await pool.query(`
      TRUNCATE rezervacije, termini, providers, company_images, companies, services, users RESTART IDENTITY CASCADE;
    `);
    console.log('🧹 Sve tabele očišćene');

    // 1️⃣ Users
    const admin = await User.createUser({ name: 'Admin', email: 'admin@example.com', password: 'admin123', role: 'admin' });
    const malena = await User.createUser({ name: 'Malena', email: 'malena@example.com', password: 'malena123', role: 'user' });

    // 2️⃣ Services
    const serviceNames = ['Frizer', 'Kozmeticki salon', 'Stomatolog', 'Automehanicar'];
    const services = [];
    for (const name of serviceNames) {
      const service = await Service.createService({ name });
      services.push(service);
    }

    // 3️⃣ Companies
    const companiesData = [
      { name: 'Studio Belo', category: 'Frizer', city: 'Novi Sad', address: 'Ulica 1', phone: '0601234567', description: 'Profesionalni frizerski studio', images: ['/uploads/companies/frizer.jpg'], user_id: malena.id },
      { name: 'Kozmeticki Studio', category: 'Kozmeticki salon', city: 'Beograd', address: 'Ulica 2', phone: '0609876543', description: 'Savremeni kozmeticki tretmani', images: ['/uploads/companies/kozmetika1.jpg'], user_id: malena.id },
    ];

    const companies = [];
    for (const data of companiesData) {
      const { images, ...companyData } = data;
      const company = await Company.createCompany(companyData);
      companies.push(company);

      for (const img of images) {
        await pool.query(
          'INSERT INTO company_images (company_id, image_path) VALUES ($1, $2)',
          [company.id, img]
        );
      }
    }

    // 4️⃣ Providers
    const providersData = [
      { name: 'Frizer Jovan', company_id: companies[0].id, description: 'Strucan i brz', city: 'Novi Sad', rating: 4.8 },
      { name: 'Kozmeticar Ana', company_id: companies[1].id, description: 'Tretmani lica i tela', city: 'Beograd', rating: 4.7 },
    ];

    const providers = [];
    for (const p of providersData) {
      const provider = await Provider.createProvider(p);
      providers.push(provider);
    }

    // 5️⃣ Slots
    const slotsData = [
      { provider_id: providers[0].id, service_id: services[0].id, start_time: '2025-11-12 10:00', end_time: '2025-11-12 11:00', is_booked: false },
      { provider_id: providers[1].id, service_id: services[1].id, start_time: '2025-11-12 12:00', end_time: '2025-11-12 13:00', is_booked: false },
    ];

    const slots = [];
    for (const s of slotsData) {
      const slot = await Slot.createSlot(s);
      slots.push(slot);
    }

    // 6️⃣ Bookings
    await Booking.createBooking({ user_id: malena.id, slot_id: slots[0].id, service: 'Frizerski termin', status: 'confirmed' });
    await Booking.createBooking({ user_id: malena.id, slot_id: slots[1].id, service: 'Kozmeticki tretman', status: 'pending' });

    console.log('✅ Seed podaci uspešno ubačeni!');

  } catch (err) {
    console.error('❌ Greška pri seed-u:', err);
  } finally {
    await pool.end();
  }
};

seed();
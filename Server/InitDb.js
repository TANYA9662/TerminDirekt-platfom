const { Pool } = require('pg');

// Podesi parametre svoje baze
const pool = new Pool({
  user: 'malena',
  host: 'localhost',
  database: 'moja_baza',
  password: '',
  port: 5432,
});

const createTables = async () => {
  try {
    await pool.query(`
      -- Tabela korisnici
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'user'
      );

      -- Tabela kategorije
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL
      );

      -- Tabela provajderi
      CREATE TABLE IF NOT EXISTS providers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        category_id INT REFERENCES categories(id),
        description TEXT,
        city VARCHAR(50),
        rating DECIMAL(2,1)
      );

      -- Tabela termini
      CREATE TABLE IF NOT EXISTS slots (
        id SERIAL PRIMARY KEY,
        provider_id INT REFERENCES providers(id),
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP NOT NULL,
        is_booked BOOLEAN DEFAULT FALSE
      );

      -- Tabela rezervacije
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id),
        slot_id INT REFERENCES slots(id),
        service VARCHAR(100),
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabela kompanije
      CREATE TABLE IF NOT EXISTS companies (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        city VARCHAR(50) NOT NULL,
        description TEXT,
        phone VARCHAR(20),
        email VARCHAR(100),
        user_id INT REFERENCES users(id),
        services JSON DEFAULT '[]'
      );

      -- Tabela slike kompanija
      CREATE TABLE IF NOT EXISTS company_images (
        id SERIAL PRIMARY KEY,
        company_id INT REFERENCES companies(id) ON DELETE CASCADE,
        image_path TEXT NOT NULL
      );
    `);

    // Dodavanje početnog admina
    const adminEmail = 'admin@example.com';
    const res = await pool.query(`SELECT * FROM users WHERE email = $1`, [adminEmail]);
    if (res.rows.length === 0) {
      await pool.query(
        `INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)`,
        ['Admin', adminEmail, 'sifra123', 'admin']
      );
      console.log('Admin dodat u bazu.');
    } else {
      console.log('Admin već postoji.');
    }

    console.log('Tabele su uspešno kreirane.');
  } catch (err) {
    console.error('Greška pri kreiranju tabela:', err);
  } finally {
    await pool.end();
  }
};

createTables();

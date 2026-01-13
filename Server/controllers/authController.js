// controllers/authController.js
import pool from '../db/pool.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


export const registerUser = async (req, res) => {
  const { name, email, password, role, city, phone } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'Nedostaju obavezna polja' });
  }

  try {
    // 1. Hash lozinke
    const hashedPassword = await bcrypt.hash(password, 10);

    // 2. Ubaci usera u bazu
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role) 
       VALUES ($1, $2, $3, $4) RETURNING id, name, email, role`,
      [name, email, hashedPassword, role]
    );

    const user = result.rows[0];

    let company = null;

    // 3. Ako je user firma, kreiraj automatski zapis u companies tabeli
    if (role === 'company') {
      const companyResult = await pool.query(
        `INSERT INTO companies (user_id, name, city, phone) 
         VALUES ($1, $2, $3, $4) RETURNING id, name, city, phone`,
        [user.id, name, city || null, phone || null]
      );
      company = companyResult.rows[0];
    }

    // 4. Napravi token
    const token = jwt.sign(
      { id: user.id, role: user.role, company_id: company ? company.id : null },
      process.env.JWT_SECRET || 'tajni_kljuc',
      { expiresIn: '2h' }
    );

    // 5. Vrati user + token + eventualno company
    res.json({ token, user, company });
  } catch (err) {
    console.error('Greška pri registraciji:', err);
    res.status(500).json({ message: 'Greška pri registraciji' });
  }
};


export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Nedostaju email ili lozinka' });
  }

  try {
    const userQuery = await pool.query(
      'SELECT id, email, password, role FROM users WHERE email = $1',
      [email]
    );

    if (userQuery.rows.length === 0) {
      return res.status(401).json({ message: 'Pogrešan email ili lozinka' });
    }

    const user = userQuery.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ message: 'Pogrešan email ili lozinka' });
    }

    // Dohvati firmu ako je korisnik kompanija
    let company = null;
    if (user.role === 'company') {
      const companyResult = await pool.query(
        'SELECT * FROM companies WHERE user_id=$1',
        [user.id]
      );
      company = companyResult.rows[0] || null;
    }

    // Napravi JWT token
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        company_id: company ? company.id : null,
      },
      process.env.JWT_SECRET || 'tajni_kljuc',
      { expiresIn: '2h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      company,
    });
  } catch (err) {
    console.error('Greška pri prijavi:', err);
    res.status(500).json({ message: 'Greška pri prijavi' });
  }
};


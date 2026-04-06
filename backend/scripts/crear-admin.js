/**
 * Script para crear el primer administrador.
 * Uso: node scripts/crear-admin.js
 *
 * Variables de entorno necesarias en .env:
 *   DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/votacion_db
 */
import 'dotenv/config';
import bcrypt from 'bcrypt';
import { pool } from '../src/db.js';
import * as readline from 'readline';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((res) => rl.question(q, res));

async function main() {
  const nombre = await ask('Nombre del admin: ');
  const email = await ask('Email: ');
  const password = await ask('Contraseña (mín. 8 caracteres): ');

  if (password.length < 8) {
    console.error('La contraseña debe tener al menos 8 caracteres');
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 12);

  try {
    const result = await pool.query(
      'INSERT INTO admins (nombre, email, password_hash) VALUES ($1, $2, $3) RETURNING id, email',
      [nombre.trim(), email.trim().toLowerCase(), hash]
    );
    console.log(`\n✓ Admin creado: ${result.rows[0].email} (id=${result.rows[0].id})`);
  } catch (err) {
    if (err.code === '23505') {
      console.error('Ya existe un admin con ese email');
    } else {
      console.error('Error:', err.message);
    }
    process.exit(1);
  } finally {
    rl.close();
    await pool.end();
  }
}

main();

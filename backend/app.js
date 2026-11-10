const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

function validateBarang(body) {
  if (typeof body.nama !== 'string' || !body.nama.trim()) return 'Nama barang wajib diisi';
  if (typeof body.kategori !== 'string' || !body.kategori.trim()) return 'Kategori wajib diisi';
  if (!Number.isInteger(body.stok) || body.stok < 0) return 'Stok harus angka bulat 0 atau lebih';
  if (typeof body.harga !== 'number' || Number.isNaN(body.harga) || body.harga < 0) return 'Harga harus angka 0 atau lebih';
  return null;
}

app.get('/api/barang', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM barang ORDER BY id DESC');
  res.json(rows);
});

app.get('/api/barang/:id', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM barang WHERE id = ?', [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ message: 'Barang tidak ditemukan' });
  res.json(rows[0]);
});

app.post('/api/barang', async (req, res) => {
  const error = validateBarang(req.body);
  if (error) return res.status(400).json({ message: error });
  const { nama, kategori, stok, harga } = req.body;
  const [result] = await pool.execute(
    'INSERT INTO barang (nama, kategori, stok, harga) VALUES (?, ?, ?, ?)',
    [nama.trim(), kategori.trim(), stok, harga]
  );
  const [rows] = await pool.query('SELECT * FROM barang WHERE id = ?', [result.insertId]);
  res.status(201).json(rows[0]);
});

app.put('/api/barang/:id', async (req, res) => {
  const error = validateBarang(req.body);
  if (error) return res.status(400).json({ message: error });
  const { nama, kategori, stok, harga } = req.body;
  const [result] = await pool.execute(
    'UPDATE barang SET nama = ?, kategori = ?, stok = ?, harga = ? WHERE id = ?',
    [nama.trim(), kategori.trim(), stok, harga, req.params.id]
  );
  if (result.affectedRows === 0) return res.status(404).json({ message: 'Barang tidak ditemukan' });
  const [rows] = await pool.query('SELECT * FROM barang WHERE id = ?', [req.params.id]);
  res.json(rows[0]);
});

app.delete('/api/barang/:id', async (req, res) => {
  const [result] = await pool.execute('DELETE FROM barang WHERE id = ?', [req.params.id]);
  if (result.affectedRows === 0) return res.status(404).json({ message: 'Barang tidak ditemukan' });
  res.json({ message: 'Barang berhasil dihapus' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Terjadi kesalahan di server' });
});

module.exports = app;
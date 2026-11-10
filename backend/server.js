const app = require('./app');
const pool = require('./db');

const PORT = process.env.PORT || 4000;

async function start() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS barang (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nama VARCHAR(100) NOT NULL,
      kategori VARCHAR(50) NOT NULL,
      stok INT NOT NULL DEFAULT 0,
      harga DECIMAL(12,2) NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  app.listen(PORT, () => console.log(`Backend jalan di http://localhost:${PORT}`));
}

start().catch((err) => {
  console.error('Gagal start server:', err.message);
  process.exit(1);
});
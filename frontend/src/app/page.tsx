"use client";

import { useEffect, useState } from "react";
import {
  Barang,
  getBarang,
  tambahBarang,
  editBarang,
  hapusBarang,
} from "@/lib/api";

const rupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

const emptyForm = {
  nama: "",
  kategori: "Elektronik",
  stok: 1,
  harga: 0,
};

export default function Home() {
  const [barang, setBarang] = useState<Barang[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Semua");
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  async function loadBarang() {
    try {
      setError("");
      const data = await getBarang();

      setBarang(
        data.map((item) => ({
          ...item,
          harga: Number(item.harga),
        })),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengambil data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function fetchData() {
      await loadBarang();
    }

    fetchData();
  }, []);

  const filtered = barang.filter((item) => {
    const cocokNama = item.nama.toLowerCase().includes(search.toLowerCase());

    const cocokKategori = filter === "Semua" || item.kategori === filter;

    return cocokNama && cocokKategori;
  });

  const totalStok = barang.reduce((sum, item) => sum + item.stok, 0);

  const totalNilai = barang.reduce(
    (sum, item) => sum + item.stok * item.harga,
    0,
  );

  const stokMenipis = barang.filter(
    (item) => item.stok > 0 && item.stok <= 5,
  ).length;

  function openTambah() {
    setEditingId(null);
    setForm(emptyForm);
    setModal(true);
  }

  function openEdit(item: Barang) {
    setEditingId(item.id);
    setForm({
      nama: item.nama,
      kategori: item.kategori,
      stok: item.stok,
      harga: item.harga,
    });
    setModal(true);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const data = {
        nama: form.nama.trim(),
        kategori: form.kategori,
        stok: Number(form.stok),
        harga: Number(form.harga),
      };

      if (editingId !== null) {
        await editBarang(editingId, data);
      } else {
        await tambahBarang(data);
      }

      setModal(false);
      await loadBarang();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan barang");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Yakin ingin menghapus barang ini?")) return;

    try {
      setError("");
      await hapusBarang(id);
      await loadBarang();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus barang");
    }
  }

  return (
    <div className="min-h-screen bg-[#f6f8f6] text-[#202b24] md:flex">
      <aside className="bg-[#123b2a] text-white md:fixed md:inset-y-0 md:w-[250px]">
        <div className="border-b border-white/10 px-7 py-7">
          <h1 className="text-2xl font-bold tracking-wider">ALPIN</h1>
          <p className="mt-1 text-xs text-green-100/60">Inventory Management</p>
        </div>

        <nav className="p-4">
          <div className="rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold">
            ▦ &nbsp; Dashboard
          </div>
          <div className="mt-2 rounded-xl px-4 py-3 text-sm text-green-100/70">
            ▤ &nbsp; Data Barang
          </div>
        </nav>

        <div className="hidden p-6 md:block">
          <div className="rounded-xl border border-white/10 p-4">
            <p className="text-sm font-semibold">ALPIN System</p>
            <p className="mt-2 text-xs text-green-100/60">Database MySQL</p>
            <p className="mt-3 text-xs text-green-300">● API Connected</p>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-5 sm:p-8 md:ml-[250px] lg:p-10">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500">Pages / Dashboard</p>
            <h2 className="mt-2 text-3xl font-bold">Dashboard</h2>
            <p className="mt-1 text-sm text-gray-500">
              Kelola inventaris barang ALPIN.
            </p>
          </div>

          <button
            onClick={openTambah}
            className="rounded-xl bg-[#176b43] px-5 py-3 text-sm font-semibold text-white hover:bg-[#105334]"
          >
            + Tambah Barang
          </button>
        </header>

        {error && (
          <div className="mb-5 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
            <button onClick={() => setError("")}>×</button>
          </div>
        )}

        <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Stat label="Total Jenis Barang" value={barang.length.toString()} />
          <Stat label="Total Stok" value={totalStok.toLocaleString("id-ID")} />
          <Stat label="Stok Menipis" value={stokMenipis.toString()} />
          <Stat label="Nilai Inventaris" value={rupiah(totalNilai)} />
        </section>

        <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-lg font-bold">Data Inventaris</h3>
              <p className="mt-1 text-sm text-gray-500">
                Data langsung dari database.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari barang..."
                className="min-w-0 rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-green-600"
              />

              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm"
              >
                <option>Semua</option>
                <option>Elektronik</option>
                <option>Aksesoris</option>
                <option>Penyimpanan</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-6 py-4">Nama Barang</th>
                  <th className="px-6 py-4">Kategori</th>
                  <th className="px-6 py-4">Stok</th>
                  <th className="px-6 py-4">Harga</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-gray-400"
                    >
                      Mengambil data dari database...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-gray-400"
                    >
                      Belum ada barang ditemukan.
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-5 font-semibold">{item.nama}</td>
                      <td className="px-6 py-5 text-gray-500">
                        {item.kategori}
                      </td>
                      <td className="px-6 py-5">{item.stok}</td>
                      <td className="px-6 py-5">{rupiah(item.harga)}</td>
                      <td className="px-6 py-5">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            item.stok === 0
                              ? "bg-red-50 text-red-600"
                              : item.stok <= 5
                                ? "bg-amber-50 text-amber-700"
                                : "bg-green-50 text-green-700"
                          }`}
                        >
                          {item.stok === 0
                            ? "Habis"
                            : item.stok <= 5
                              ? "Menipis"
                              : "Tersedia"}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEdit(item)}
                            className="rounded-lg border border-gray-200 px-3 py-2 text-xs hover:bg-gray-100"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="rounded-lg border border-red-100 px-3 py-2 text-xs text-red-600 hover:bg-red-50"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-gray-100 px-6 py-4 text-xs text-gray-400">
            Menampilkan {filtered.length} dari {barang.length} barang
          </div>
        </section>

        {modal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <h3 className="mb-6 text-xl font-bold">
                {editingId !== null ? "Edit Barang" : "Tambah Barang"}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Nama Barang
                  </label>
                  <input
                    required
                    value={form.nama}
                    onChange={(e) => setForm({ ...form, nama: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
                    placeholder="Nama barang"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Kategori
                  </label>
                  <select
                    value={form.kategori}
                    onChange={(e) =>
                      setForm({ ...form, kategori: e.target.value })
                    }
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm"
                  >
                    <option>Elektronik</option>
                    <option>Aksesoris</option>
                    <option>Penyimpanan</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Stok
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      required
                      value={form.stok}
                      onChange={(e) =>
                        setForm({ ...form, stok: Number(e.target.value) })
                      }
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Harga
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={form.harga}
                      onChange={(e) =>
                        setForm({ ...form, harga: Number(e.target.value) })
                      }
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setModal(false)}
                    className="flex-1 rounded-xl border border-gray-200 py-3 text-sm"
                  >
                    Batal
                  </button>

                  <button
                    disabled={saving}
                    type="submit"
                    className="flex-1 rounded-xl bg-[#176b43] py-3 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {saving ? "Menyimpan..." : "Simpan Barang"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-4 text-2xl font-bold">{value}</p>
    </div>
  );
}

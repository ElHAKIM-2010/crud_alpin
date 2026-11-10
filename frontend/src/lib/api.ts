const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type Barang = {
  id: number;
  nama: string;
  kategori: string;
  stok: number;
  harga: number;
  created_at?: string;
};

async function request(endpoint: string, options?: RequestInit) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Terjadi kesalahan API");
  }

  return response.json();
}

export const getBarang = (): Promise<Barang[]> => request("/api/barang");

export const tambahBarang = (data: Omit<Barang, "id" | "created_at">) =>
  request("/api/barang", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const editBarang = (
  id: number,
  data: Omit<Barang, "id" | "created_at">,
) =>
  request(`/api/barang/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const hapusBarang = (id: number) =>
  request(`/api/barang/${id}`, {
    method: "DELETE",
  });

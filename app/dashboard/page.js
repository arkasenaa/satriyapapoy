"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import "bootstrap/dist/css/bootstrap.min.css";
import "./style.css";

// ✅ Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function BlogDashboard() {
  const [posts, setPosts] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkAction, setBulkAction] = useState("");

  const [categories, setCategories] = useState([]);   // semua kategori
  const [dates, setDates] = useState([]);             // semua tanggal unik
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const router = useRouter();
  const pathname = usePathname();

  // ✅ Cek session
  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push(`/login?redirect=${pathname}`);
      }
    }
    checkSession();
  }, [pathname]);

  // ✅ Fetch semua kategori & tanggal unik
  async function fetchFilters() {
    // Ambil kategori unik
    const { data: catData } = await supabase
      .from("posts")
      .select("category")
      .eq("status", "published");

    if (catData) {
      const uniqueCats = [...new Set(catData.map((p) => p.category).filter(Boolean))];
      setCategories(uniqueCats);
    }

    // Ambil tanggal unik
    const { data: dateData } = await supabase
      .from("posts")
      .select("created_at")
      .eq("status", "published");

    if (dateData) {
      const uniqueDates = [
        ...new Set(
          dateData.map((p) =>
            new Date(p.created_at).toISOString().split("T")[0] // ambil YYYY-MM-DD
          )
        ),
      ].sort((a, b) => new Date(b) - new Date(a)); // urut terbaru dulu
      setDates(uniqueDates);
    }
  }

  // ✅ Fetch posts (pakai filter jika ada)
  async function fetchPosts() {
    let query = supabase
      .from("posts")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false });

    if (selectedCategory) {
      query = query.eq("category", selectedCategory);
    }

    if (selectedDate) {
      // filter tanggal spesifik
      const start = new Date(selectedDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(selectedDate);
      end.setHours(23, 59, 59, 999);

      query = query.gte("created_at", start.toISOString()).lte("created_at", end.toISOString());
    }

    const { data, error } = await query;
    if (!error && data) setPosts(data);
  }

  // ambil data saat load pertama
  useEffect(() => {
    fetchFilters();
    fetchPosts();
  }, []);

  // refetch posts jika filter berubah
  useEffect(() => {
    fetchPosts();
  }, [selectedCategory, selectedDate]);

  // ✅ Checkbox toggle
  function toggleSelect(id) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  // ✅ Bulk Apply
  async function applyBulkAction() {
    if (selectedIds.length === 0) {
      alert("Pilih dulu post yang mau diproses!");
      return;
    }

    if (bulkAction === "Edit") {
      router.push(`/blogeditor?id=${selectedIds[0]}`);
    }

    if (bulkAction === "Delete") {
      if (!confirm("Yakin mau hapus post terpilih?")) return;

      const { error } = await supabase.from("posts").delete().in("id", selectedIds);

      if (error) {
        alert("Gagal hapus: " + error.message);
      } else {
        alert("Post berhasil dihapus");
        setSelectedIds([]);
        fetchPosts();
        fetchFilters();
      }
    }
  }

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar">
        <h1>Blog Dashboard</h1>
      </nav>

      <div className="container">
        {/* Search Bar */}
        <div className="search-container">
          <input type="text" placeholder="Search Posts" />
          <button>Search Posts</button>
        </div>

        {/* Actions Row */}
        <div className="actions">
          <div className="bulk-actions">
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
            >
              <option value="">Bulk Actions</option>
              <option value="Edit">Edit</option>
              <option value="Delete">Delete</option>
            </select>
            <button onClick={applyBulkAction}>Apply</button>
          </div>

          {/* Dropdown tanggal */}
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          >
            <option value="">All dates</option>
            {dates.map((d) => (
              <option key={d} value={d}>
                {new Date(d).toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </option>
            ))}
          </select>

          {/* Dropdown kategori */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <button onClick={fetchPosts}>Filter</button>
          <button className="new-post" onClick={() => router.push("/blogeditor")}>
            New Post
          </button>
        </div>

        {/* Table */}
        <table>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  onChange={(e) =>
                    setSelectedIds(
                      e.target.checked ? posts.map((p) => p.id) : []
                    )
                  }
                  checked={selectedIds.length === posts.length && posts.length > 0}
                />
              </th>
              <th>Title</th>
              <th>Category</th>
              <th>Author</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 ? (
              <tr>
                <td colSpan={5}>Tidak ada post published.</td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr key={post.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(post.id)}
                      onChange={() => toggleSelect(post.id)}
                    />
                  </td>
                  <td>{post.title || "(no title)"}</td>
                  <td>{post.category || "-"}</td>
                  <td>{post.author || "-"}</td>
                  <td>
                    {new Date(post.created_at).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

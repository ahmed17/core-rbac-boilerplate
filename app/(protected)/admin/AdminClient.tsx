"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Role {
  id: string;
  name: string;
}

interface User {
  id: string;
  name: string | null;
  email: string | null;
  roleId: string | null;
  role: { name: string } | null;
  failedAttempts: number;
  lockedUntil: string | null;
}

export default function AdminClient() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", roleId: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Real-time password validation logic
  const isLengthValid = newUser.password.length >= 8;
  const hasLowercase = /[a-z]/.test(newUser.password);
  const hasUppercase = /[A-Z]/.test(newUser.password);
  const hasNumber = /[0-9]/.test(newUser.password);
  const hasSymbol = /[^a-zA-Z0-9]/.test(newUser.password);
  
  const isPasswordValid = newUser.password.length > 0 && isLengthValid && hasLowercase && hasUppercase && hasNumber && hasSymbol;

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users);
        setRoles(data.roles);
      }
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((u) => 
    (u.name?.toLowerCase() || "").includes(search.toLowerCase()) || 
    (u.email?.toLowerCase() || "").includes(search.toLowerCase())
  );

  const handleUpdateRole = async (userId: string, roleId: string) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "UPDATE_ROLE", userId, roleId }),
      });
      if (res.ok) {
        fetchUsers(); // refresh data
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Gagal mengubah role");
      }
    } catch (err) {
      alert("Terjadi kesalahan server");
    }
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "DELETE", userId: userToDelete }),
      });
      if (res.ok) {
        fetchUsers();
        setUserToDelete(null);
      } else {
        const data = await res.json();
        alert(data.error || "Gagal menghapus user");
      }
    } catch (err) {
      alert("Terjadi kesalahan server");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "CREATE", ...newUser }),
      });
      const data = await res.json();
      
      if (res.ok) {
        setIsModalOpen(false);
        setNewUser({ name: "", email: "", password: "", roleId: "" });
        fetchUsers();
      } else {
        setError(data.error || "Gagal membuat user");
      }
    } catch (err) {
      setError("Terjadi kesalahan server");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <span className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-2">
            Kelola pengguna, tetapkan role, dan pantau status akun.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          Add User
        </button>
      </div>

      {/* Toolbar: Search */}
      <div className="flex items-center gap-4">
        <div className="relative w-full max-w-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input
            type="text"
            placeholder="Cari nama atau email..."
            className="input-field pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden border border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    Tidak ada pengguna ditemukan.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isLocked = user.lockedUntil && new Date(user.lockedUntil) > new Date();
                  
                  return (
                    <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">{user.name || "-"}</td>
                      <td className="px-6 py-4 text-muted-foreground">{user.email}</td>
                      <td className="px-6 py-4">
                        <select
                          className="bg-transparent border border-border rounded-lg text-sm px-2 py-1.5 focus:ring-2 focus:ring-primary focus:outline-none"
                          value={user.roleId || ""}
                          onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                        >
                          <option value="">No Role (User)</option>
                          {roles.map((r) => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        {isLocked ? (
                          <span className="px-2.5 py-1 text-xs font-semibold rounded-full tracking-wide bg-error/10 text-error">Locked</span>
                        ) : (
                          <span className="px-2.5 py-1 text-xs font-semibold rounded-full tracking-wide bg-green-500/10 text-green-500">Active</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setUserToDelete(user.id)}
                          className="text-error hover:text-error/80 transition-colors p-2 rounded-lg hover:bg-error/10"
                          title="Hapus Pengguna"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add User */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-md p-6">
            <h2 className="text-xl font-semibold mb-4">Create New User</h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-error bg-error/10 border border-error/20 rounded-xl">
                  {error}
                </div>
              )}
              
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Name</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  required
                  className="input-field"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    className="input-field pr-10"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    )}
                  </button>
                </div>
                <div className="flex flex-col gap-1.5 mt-2">
                  <p className={`text-[0.75rem] flex items-center gap-1.5 transition-colors ${isLengthValid ? 'text-green-600 dark:text-green-500' : 'text-muted-foreground/70'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    Minimal 8 karakter
                  </p>
                  <p className={`text-[0.75rem] flex items-center gap-1.5 transition-colors ${hasUppercase && hasLowercase ? 'text-green-600 dark:text-green-500' : 'text-muted-foreground/70'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    Huruf besar & huruf kecil
                  </p>
                  <p className={`text-[0.75rem] flex items-center gap-1.5 transition-colors ${hasNumber ? 'text-green-600 dark:text-green-500' : 'text-muted-foreground/70'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    Minimal 1 angka
                  </p>
                  <p className={`text-[0.75rem] flex items-center gap-1.5 transition-colors ${hasSymbol ? 'text-green-600 dark:text-green-500' : 'text-muted-foreground/70'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    Minimal 1 simbol unik
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Role</label>
                <select
                  className="input-field"
                  value={newUser.roleId}
                  onChange={(e) => setNewUser({ ...newUser, roleId: e.target.value })}
                >
                  <option value="">User (Default)</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setError("");
                  }}
                  className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-xl transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isSubmitting || !isPasswordValid}
                >
                  {isSubmitting ? "Creating..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Delete Confirmation */}
      {userToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-sm p-6 text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-error/10 text-error rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
            </div>
            <h2 className="text-xl font-semibold">Confirm Deletion</h2>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to permanently delete this user? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-xl transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteUser}
                className="btn-primary bg-error hover:bg-error/90 text-white"
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

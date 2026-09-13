"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useSession } from "next-auth/react";

interface Permission {
  id: string;
  action: string;
  description: string | null;
  _count?: { roles: number };
}

export default function PermissionsClient() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({ id: "", action: "", description: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  const [permissionToDelete, setPermissionToDelete] = useState<Permission | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: session } = useSession() as any;
  const userPermissions = session?.user?.permissions || [];
  const canCreate = userPermissions.includes("create:permissions");
  const canDelete = userPermissions.includes("delete:permissions");

  const fetchPermissions = async () => {
    try {
      const res = await fetch("/api/admin/permissions");
      const data = await res.json();
      if (res.ok) {
        setPermissions(data.permissions);
      }
    } catch (err) {
      console.error("Failed to fetch permissions", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const filteredPermissions = permissions.filter(p => 
    p.action.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setFormData({ id: "", action: "", description: "" });
    setError("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (perm: Permission) => {
    setIsEditing(true);
    setFormData({ id: perm.id, action: perm.action, description: perm.description || "" });
    setError("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const payload = {
        requestAction: isEditing ? "UPDATE" : "CREATE",
        ...formData
      };

      const res = await fetch("/api/admin/permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      
      if (res.ok) {
        setIsModalOpen(false);
        fetchPermissions();
      } else {
        setError(data.error || "Gagal menyimpan permission");
      }
    } catch (err) {
      setError("Terjadi kesalahan server");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeletePermission = async () => {
    if (!permissionToDelete) return;
    setIsDeleting(true);
    
    try {
      const res = await fetch("/api/admin/permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestAction: "DELETE", id: permissionToDelete.id }),
      });
      if (res.ok) {
        fetchPermissions();
        setPermissionToDelete(null);
      } else {
        const data = await res.json();
        alert(data.error || "Gagal menghapus permission");
      }
    } catch (err) {
      alert("Terjadi kesalahan server");
    } finally {
      setIsDeleting(false);
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Permissions Management</h1>
          <p className="text-muted-foreground mt-2">
            Kelola data master permission / kunci akses untuk aplikasi Anda.
          </p>
        </div>
        {canCreate && (
          <button 
            onClick={handleOpenAddModal}
            className="btn-primary flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            Add Permission
          </button>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative w-full max-w-sm">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </div>
          <input
            type="text"
            placeholder="Cari permission..."
            className="input-field !pl-10"
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
                <th className="px-6 py-4 font-medium">Action String</th>
                <th className="px-6 py-4 font-medium">Description</th>
                <th className="px-6 py-4 font-medium text-center">Used in Roles</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredPermissions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                    Tidak ada permission ditemukan.
                  </td>
                </tr>
              ) : (
                filteredPermissions.map((perm) => (
                  <tr key={perm.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded-md border border-primary/20">
                        {perm.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{perm.description || "-"}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-semibold">
                        {perm._count?.roles || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(perm)}
                          className="text-primary hover:text-primary/80 transition-colors p-2 rounded-lg hover:bg-primary/10"
                          title="Edit"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                        </button>
                        {canDelete ? (
                          <button
                            onClick={() => setPermissionToDelete(perm)}
                            className="text-error hover:text-error/80 transition-colors p-2 rounded-lg hover:bg-error/10 disabled:opacity-50"
                            title="Delete Permission"
                            disabled={perm._count?.roles ? perm._count.roles > 0 : false}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                          </button>
                        ) : (
                          <span className="text-xs text-muted-foreground italic px-2 py-2">Read-only</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add/Edit */}
      {isModalOpen && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-zinc-950 border border-border w-full max-w-lg p-6 rounded-2xl shadow-xl">
            <h2 className="text-xl font-semibold mb-4">{isEditing ? "Edit Permission" : "Create New Permission"}</h2>
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="p-3 text-sm text-error bg-error/10 border border-error/20 rounded-xl mb-4">
                  {error}
                </div>
              )}
              
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Action String</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. create:laporan"
                    className="input-field lowercase"
                    value={formData.action}
                    onChange={(e) => setFormData({ ...formData, action: e.target.value.toLowerCase() })}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Disarankan menggunakan format <code>[action]:[resource]</code></p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Description (Optional)</label>
                  <textarea
                    rows={3}
                    className="input-field"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-xl transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Permission"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Modal Delete Confirmation */}
      {permissionToDelete && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-zinc-950 border border-border w-full max-w-sm p-6 text-center space-y-4 rounded-2xl shadow-xl">
            <div className="mx-auto w-12 h-12 bg-error/10 text-error rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/></svg>
            </div>
            <h2 className="text-xl font-semibold">Delete Permission</h2>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete <strong>{permissionToDelete.action}</strong>?
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPermissionToDelete(null)}
                className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-xl transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeletePermission}
                className="btn-primary bg-error hover:bg-error/90 text-white"
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

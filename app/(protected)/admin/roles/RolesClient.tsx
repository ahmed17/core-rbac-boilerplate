"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface Permission {
  id: string;
  action: string;
  description: string | null;
}

interface Role {
  id: string;
  name: string;
  description: string | null;
  permissions: Permission[];
  _count: { users: number };
}

export default function RolesClient() {
  const router = useRouter();
  const [roles, setRoles] = useState<Role[]>([]);
  const [masterPermissions, setMasterPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ id: "", name: "", description: "" });
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: session } = useSession() as any;
  const userPermissions = session?.user?.permissions || [];
  const canCreate = userPermissions.includes("create:roles");
  const canUpdate = userPermissions.includes("update:roles");
  const canDelete = userPermissions.includes("delete:roles");

  const fetchRoles = async () => {
    try {
      const res = await fetch("/api/admin/roles");
      const data = await res.json();
      if (res.ok) {
        setRoles(data.roles);
        setMasterPermissions(data.permissions);
      }
    } catch (err) {
      console.error("Failed to fetch roles", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const filteredRoles = roles.filter((r) => 
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setFormData({ id: "", name: "", description: "" });
    setSelectedPermissions([]);
    setError("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (role: Role) => {
    setIsEditing(true);
    setFormData({ id: role.id, name: role.name, description: role.description || "" });
    setSelectedPermissions(role.permissions.map(p => p.id));
    setError("");
    setIsModalOpen(true);
  };

  const togglePermission = (permId: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permId) ? prev.filter(id => id !== permId) : [...prev, permId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const payload = {
        action: isEditing ? "UPDATE" : "CREATE",
        roleId: formData.id,
        name: formData.name,
        description: formData.description,
        permissionIds: selectedPermissions,
      };

      const res = await fetch("/api/admin/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      
      if (res.ok) {
        setIsModalOpen(false);
        fetchRoles();
      } else {
        setError(data.error || "Gagal menyimpan role");
      }
    } catch (err) {
      setError("Terjadi kesalahan server");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteRole = async () => {
    if (!roleToDelete) return;
    setIsDeleting(true);
    
    try {
      const res = await fetch("/api/admin/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "DELETE", roleId: roleToDelete.id }),
      });
      if (res.ok) {
        fetchRoles();
        setRoleToDelete(null);
      } else {
        const data = await res.json();
        alert(data.error || "Gagal menghapus role");
      }
    } catch (err) {
      alert("Terjadi kesalahan server");
    } finally {
      setIsDeleting(false);
    }
  };

  // --- Logic untuk Permission Matrix ---
  const { matrixData, sortedVerbs } = useMemo(() => {
    const data: Record<string, Record<string, Permission>> = {};
    const allowedVerbs = ["read", "create", "update", "delete"];

    masterPermissions.forEach(perm => {
      let verb = "other";
      let resource = perm.action;
      
      if (perm.action.includes(":")) {
        const parts = perm.action.split(":");
        verb = parts[0];
        resource = parts.slice(1).join(":"); // ex: 'users', 'admin_panel'
      }

      // Hanya masukkan jika verb termasuk dalam allowedVerbs (CRUD)
      if (allowedVerbs.includes(verb)) {
        if (!data[resource]) data[resource] = {};
        data[resource][verb] = perm;
      }
    });

    return { matrixData: data, sortedVerbs: allowedVerbs };
  }, [masterPermissions]);

  const toggleRowPermissions = (resource: string) => {
    const rowPerms = Object.values(matrixData[resource] || {}).map(p => p.id);
    const isAllSelected = rowPerms.every(id => selectedPermissions.includes(id));
    
    if (isAllSelected) {
      setSelectedPermissions(prev => prev.filter(id => !rowPerms.includes(id)));
    } else {
      setSelectedPermissions(prev => {
        const newSet = new Set([...prev, ...rowPerms]);
        return Array.from(newSet);
      });
    }
  };

  const isRowFullySelected = (resource: string) => {
    const rowPerms = Object.values(matrixData[resource] || {}).map(p => p.id);
    if (rowPerms.length === 0) return false;
    return rowPerms.every(id => selectedPermissions.includes(id));
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
          <h1 className="text-3xl font-bold tracking-tight">Roles</h1>
          <p className="text-muted-foreground mt-2">
            Buat dan atur hak akses untuk masing-masing kelompok pengguna.
          </p>
        </div>
        {canCreate && (
          <button 
            onClick={handleOpenAddModal}
            className="btn-primary flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            Add Role
          </button>
        )}
      </div>

      {/* Toolbar: Search */}
      <div className="flex items-center gap-4">
        <div className="relative w-full max-w-sm">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </div>
          <input
            type="text"
            placeholder="Cari role..."
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
                <th className="px-6 py-4 font-medium">Role Name</th>
                <th className="px-6 py-4 font-medium">Description</th>
                <th className="px-6 py-4 font-medium text-center">Users</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredRoles.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                    Tidak ada role ditemukan.
                  </td>
                </tr>
              ) : (
                filteredRoles.map((role) => (
                  <tr key={role.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">{role.name}</td>
                    <td className="px-6 py-4 text-muted-foreground">{role.description || "-"}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-semibold">
                        {role._count.users}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {role.name !== "ADMIN" && canUpdate && (
                          <button
                            onClick={() => handleOpenEditModal(role)}
                            className="text-primary hover:text-primary/80 transition-colors p-2 rounded-lg hover:bg-primary/10"
                            title="Edit Role"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                          </button>
                        )}
                        {role.name !== "ADMIN" && canDelete && (
                          <button
                            onClick={() => setRoleToDelete(role)}
                            className="text-error hover:text-error/80 transition-colors p-2 rounded-lg hover:bg-error/10"
                            title="Delete Role"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                          </button>
                        )}
                        {(role.name === "ADMIN" || (!canUpdate && !canDelete)) && (
                          <span className="text-xs text-muted-foreground italic px-2 py-2">
                            {role.name === "ADMIN" ? "Protected" : "Read-only"}
                          </span>
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

      {/* Modal Add/Edit Role */}
      {isModalOpen && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-zinc-950 border border-border w-full max-w-5xl max-h-[90vh] flex flex-col p-6 rounded-2xl shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{isEditing ? "Edit Role Configuration" : "Create New Role"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col min-h-0">
              {error && (
                <div className="p-3 text-sm text-error bg-error/10 border border-error/20 rounded-xl mb-4 shrink-0">
                  {error}
                </div>
              )}
              
              <div className="overflow-y-auto pr-2 space-y-6 flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Role Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. EDITOR, MANAGER"
                      className="input-field uppercase"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
                      disabled={isEditing && formData.name === "ADMIN"}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Description (Optional)</label>
                    <input
                      type="text"
                      className="input-field"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="border-b border-border/50 pb-2">
                    <label className="text-lg font-bold text-primary">Konfigurasi Hak Akses (Permission Matrix)</label>
                    <p className="text-xs text-muted-foreground">Pilih hak akses (CRUD) yang sesuai untuk setiap modul aplikasi.</p>
                  </div>
                  
                  {/* Matrix Table */}
                  <div className="border border-border rounded-xl overflow-x-auto bg-background/50">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted/50 border-b border-border text-xs uppercase text-muted-foreground">
                        <tr>
                          <th className="px-4 py-3 font-semibold min-w-[150px]">Modul & Submenu</th>
                          {sortedVerbs.map(verb => (
                            <th key={verb} className="px-4 py-3 font-semibold text-center">{verb}</th>
                          ))}
                          <th className="px-4 py-3 font-semibold text-center bg-muted/80">Pilih Semua</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {Object.entries(matrixData).map(([resource, verbsMap]) => (
                          <tr key={resource} className="hover:bg-muted/20 transition-colors">
                            <td className="px-4 py-3 font-bold text-primary capitalize flex items-center gap-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 7h10"/><path d="M7 12h10"/><path d="M7 17h10"/></svg>
                              {resource.replace(/_/g, " ")}
                            </td>
                            {sortedVerbs.map(verb => {
                              const perm = verbsMap[verb];
                              if (!perm) {
                                return <td key={verb} className="px-4 py-3 text-center text-muted-foreground/30">-</td>;
                              }
                              return (
                                <td key={verb} className="px-4 py-3 text-center">
                                  <label className="flex items-center justify-center cursor-pointer p-1">
                                    <input
                                      type="checkbox"
                                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-background"
                                      checked={selectedPermissions.includes(perm.id)}
                                      onChange={() => togglePermission(perm.id)}
                                      title={perm.description || perm.action}
                                    />
                                  </label>
                                </td>
                              );
                            })}
                            <td className="px-4 py-3 text-center bg-muted/10">
                              <label className="flex items-center justify-center cursor-pointer p-1">
                                <input
                                  type="checkbox"
                                  className="w-4 h-4 rounded text-blue-500 focus:ring-blue-500 bg-background"
                                  checked={isRowFullySelected(resource)}
                                  onChange={() => toggleRowPermissions(resource)}
                                  title={`Pilih semua akses untuk ${resource}`}
                                />
                              </label>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-border/50 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-xl transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Role"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Modal Delete Confirmation */}
      {roleToDelete && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-zinc-950 border border-border w-full max-w-sm p-6 text-center space-y-4 rounded-2xl shadow-xl">
            <div className="mx-auto w-12 h-12 bg-error/10 text-error rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/></svg>
            </div>
            <h2 className="text-xl font-semibold">Delete Role</h2>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete <strong>{roleToDelete.name}</strong>?
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRoleToDelete(null)}
                className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-xl transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteRole}
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

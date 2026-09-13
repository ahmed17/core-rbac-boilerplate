"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { icons } from "lucide-react";
import { useSession } from "next-auth/react";

interface Permission {
  id: string;
  action: string;
}

interface Menu {
  id: string;
  title: string;
  url: string | null;
  icon: string | null;
  sortOrder: number;
  parentId: string | null;
  permissionId: string | null;
  permission: Permission | null;
  children: Menu[];
}

const DynamicIcon = ({ name, className }: { name: string | null; className?: string }) => {
  if (!name) return null;
  const LucideIcon = icons[name as keyof typeof icons] as any;
  if (!LucideIcon) {
    const FallbackIcon = icons["Circle"] as any;
    return <FallbackIcon className={className} />;
  }
  return <LucideIcon className={className} />;
};

export default function MenusClient() {
  const router = useRouter();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const { data: session } = useSession() as any;
  const userPermissions = session?.user?.permissions || [];
  const canCreate = userPermissions.includes("create:menus");
  const canUpdate = userPermissions.includes("update:menus");
  const canDelete = userPermissions.includes("delete:menus");
  
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    url: "",
    icon: "",
    sortOrder: "0",
    parentId: "",
    permissionId: "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  const [menuToDelete, setMenuToDelete] = useState<Menu | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchMenus = async () => {
    try {
      const res = await fetch("/api/admin/menus");
      const data = await res.json();
      if (res.ok) {
        setMenus(data.menus);
        setPermissions(data.permissions);
      }
    } catch (err) {
      console.error("Failed to fetch menus", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const handleOpenAddModal = (parentId: string = "") => {
    setIsEditing(false);
    setFormData({ id: "", title: "", url: "", icon: "", sortOrder: "0", parentId, permissionId: "" });
    setError("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (menu: Menu, parentId: string = "") => {
    setIsEditing(true);
    setFormData({ 
      id: menu.id, 
      title: menu.title, 
      url: menu.url || "", 
      icon: menu.icon || "", 
      sortOrder: menu.sortOrder.toString(), 
      parentId: parentId, 
      permissionId: menu.permissionId || "" 
    });
    setError("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const payload = {
        action: isEditing ? "UPDATE" : "CREATE",
        ...formData
      };

      const res = await fetch("/api/admin/menus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      
      if (res.ok) {
        setIsModalOpen(false);
        fetchMenus();
        router.refresh(); // Refresh layout to update Sidebar immediately
      } else {
        setError(data.error || "Gagal menyimpan menu");
      }
    } catch (err) {
      setError("Terjadi kesalahan server");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteMenu = async () => {
    if (!menuToDelete) return;
    setIsDeleting(true);
    
    try {
      const res = await fetch("/api/admin/menus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "DELETE", id: menuToDelete.id }),
      });
      if (res.ok) {
        fetchMenus();
        router.refresh(); // Refresh layout to update Sidebar immediately
        setMenuToDelete(null);
      } else {
        const data = await res.json();
        alert(data.error || "Gagal menghapus menu");
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
          <h1 className="text-3xl font-bold tracking-tight">Menu Management</h1>
          <p className="text-muted-foreground mt-2">
            Atur struktur navigasi sidebar dan kaitkan dengan hak akses (RBAC).
          </p>
        </div>
        {canCreate && (
          <button 
            onClick={() => handleOpenAddModal("")}
            className="btn-primary flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            Add Parent Menu
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
            placeholder="Cari menu..."
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
                <th className="px-6 py-4 font-medium w-16 text-center">Order</th>
                <th className="px-6 py-4 font-medium">Menu Title</th>
                <th className="px-6 py-4 font-medium">URL Path</th>
                <th className="px-6 py-4 font-medium">Permission Req.</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(() => {
                const filteredMenus = search.trim() === "" ? menus : menus.reduce((acc: Menu[], parent) => {
                  const parentMatches = parent.title.toLowerCase().includes(search.toLowerCase());
                  const matchingChildren = parent.children.filter(child => child.title.toLowerCase().includes(search.toLowerCase()));

                  if (parentMatches || matchingChildren.length > 0) {
                    acc.push({
                      ...parent,
                      children: parentMatches ? parent.children : matchingChildren
                    });
                  }
                  return acc;
                }, []);

                if (filteredMenus.length === 0) {
                  return (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                        Belum ada menu yang dikonfigurasi atau ditemukan.
                      </td>
                    </tr>
                  );
                }

                return filteredMenus.map((parentMenu) => (
                  <React.Fragment key={parentMenu.id}>
                    {/* Parent Row */}
                    <tr className="hover:bg-muted/30 transition-colors bg-muted/10">
                      <td className="px-6 py-4 text-center font-bold text-foreground">
                        {parentMenu.sortOrder}
                      </td>
                      <td className="px-6 py-4 font-semibold text-foreground flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                          <DynamicIcon name={parentMenu.icon} className="w-4 h-4" />
                        </div>
                        {parentMenu.title}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {parentMenu.url || <span className="text-xs italic">N/A (Group)</span>}
                      </td>
                      <td className="px-6 py-4">
                        {parentMenu.permission ? (
                          <span className="px-2 py-1 text-[10px] font-medium bg-primary/10 text-primary rounded-md border border-primary/20">
                            {parentMenu.permission.action}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Public (No Req.)</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {canCreate && (
                            <button
                              onClick={() => handleOpenAddModal(parentMenu.id)}
                              className="text-emerald-500 hover:text-emerald-400 transition-colors p-2 rounded-lg hover:bg-emerald-500/10"
                              title="Add Sub-menu"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                            </button>
                          )}
                          {canUpdate && (
                            <button
                              onClick={() => handleOpenEditModal(parentMenu)}
                              className="text-primary hover:text-primary/80 transition-colors p-2 rounded-lg hover:bg-primary/10"
                              title="Edit"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => setMenuToDelete(parentMenu)}
                              className="text-error hover:text-error/80 transition-colors p-2 rounded-lg hover:bg-error/10"
                              title="Delete"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                            </button>
                          )}
                          {!canCreate && !canUpdate && !canDelete && (
                            <span className="text-xs text-muted-foreground italic px-2 py-2">Read-only</span>
                          )}
                        </div>
                      </td>
                    </tr>
                    
                    {/* Children Rows */}
                    {parentMenu.children.map(child => (
                      <tr key={child.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-3 text-center text-muted-foreground text-xs">
                          {parentMenu.sortOrder}.{child.sortOrder}
                        </td>
                        <td className="px-6 py-3 text-sm text-foreground flex items-center gap-3 pl-12">
                          <DynamicIcon name={child.icon} className="w-3.5 h-3.5 text-muted-foreground" />
                          {child.title}
                        </td>
                        <td className="px-6 py-3 text-muted-foreground text-sm">
                          {child.url}
                        </td>
                        <td className="px-6 py-3">
                          {child.permission ? (
                            <span className="px-2 py-0.5 text-[10px] font-medium bg-primary/10 text-primary rounded-md border border-primary/20">
                              {child.permission.action}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">Follows Parent</span>
                          )}
                        </td>
                        <td className="px-6 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            {canUpdate && (
                              <button
                                onClick={() => handleOpenEditModal(child, parentMenu.id)}
                                className="text-primary hover:text-primary/80 transition-colors p-1.5 rounded-lg hover:bg-primary/10"
                                title="Edit"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                              </button>
                            )}
                            {canDelete && (
                              <button
                                onClick={() => setMenuToDelete(child)}
                                className="text-error hover:text-error/80 transition-colors p-1.5 rounded-lg hover:bg-error/10"
                                title="Delete"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                              </button>
                            )}
                            {!canUpdate && !canDelete && (
                              <span className="text-[10px] text-muted-foreground italic px-2 py-1">Read-only</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ));
              })()}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add/Edit Menu */}
      {isModalOpen && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-zinc-950 border border-border w-full max-w-xl flex flex-col p-6 rounded-2xl shadow-xl">
            <h2 className="text-xl font-semibold mb-4">{isEditing ? "Edit Menu" : "Create New Menu"}</h2>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col min-h-0">
              {error && (
                <div className="p-3 text-sm text-error bg-error/10 border border-error/20 rounded-xl mb-4 shrink-0">
                  {error}
                </div>
              )}
              
              <div className="overflow-y-auto pr-2 space-y-4 flex-1">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Menu Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Reports"
                      className="input-field"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">URL Path</label>
                    <input
                      type="text"
                      placeholder="e.g. /admin/reports (Optional)"
                      className="input-field"
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Icon (Lucide React)</label>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="e.g. Users, LayoutDashboard"
                          className="input-field"
                          value={formData.icon}
                          onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                        />
                      </div>
                      <div className="w-10 h-10 shrink-0 rounded-lg bg-muted flex items-center justify-center border border-border">
                        <DynamicIcon name={formData.icon} className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Sort Order</label>
                    <input
                      type="number"
                      required
                      className="input-field"
                      value={formData.sortOrder}
                      onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Parent Menu (Optional)</label>
                  <select
                    className="input-field"
                    value={formData.parentId}
                    onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                  >
                    <option value="">-- No Parent (Root Level) --</option>
                    {menus.map((m) => (
                      <option key={m.id} value={m.id}>{m.title}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Required Permission (RBAC)</label>
                  <select
                    className="input-field"
                    value={formData.permissionId}
                    onChange={(e) => setFormData({ ...formData, permissionId: e.target.value })}
                  >
                    <option value="">-- Public / Follows Parent --</option>
                    {permissions.map((p) => (
                      <option key={p.id} value={p.id}>{p.action}</option>
                    ))}
                  </select>
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
                  {isSubmitting ? "Saving..." : "Save Menu"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Modal Delete Confirmation */}
      {menuToDelete && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-zinc-950 border border-border w-full max-w-sm p-6 text-center space-y-4 rounded-2xl shadow-xl">
            <div className="mx-auto w-12 h-12 bg-error/10 text-error rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/></svg>
            </div>
            <h2 className="text-xl font-semibold">Delete Menu</h2>
            <p className="text-sm text-muted-foreground">
              Yakin ingin menghapus menu <strong>{menuToDelete.title}</strong>?
              {!menuToDelete.parentId && " Menghapus menu induk akan menghapus semua sub-menunya."}
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setMenuToDelete(null)}
                className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-xl transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteMenu}
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

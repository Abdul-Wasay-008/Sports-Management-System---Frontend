"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { ApiError } from "@/lib/api";
import {
  createAdminStudent,
  deleteAdminStudent,
  getAdminLookups,
  listAdminStudents,
  setAdminStudentStatus,
  updateAdminStudent,
  type AdminStudentRow,
} from "@/lib/admin-api";

const STUDENT_FETCH_LIMIT = 500;

function groupStudentsByDepartment(students: AdminStudentRow[]) {
  const map = new Map<string, AdminStudentRow[]>();
  for (const student of students) {
    const department = student.department?.trim() || "Unassigned";
    const list = map.get(department) ?? [];
    list.push(student);
    map.set(department, list);
  }

  return Array.from(map.entries())
    .map(([department, deptStudents]) => ({
      department,
      students: deptStudents.slice().sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => a.department.localeCompare(b.department));
}

export default function AdminStudentsPage() {
  const [rows, setRows] = useState<AdminStudentRow[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [searchDraft, setSearchDraft] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState<string[]>([]);

  const [createOpen, setCreateOpen] = useState(false);
  const [editRow, setEditRow] = useState<AdminStudentRow | null>(null);
  const [statusRow, setStatusRow] = useState<AdminStudentRow | null>(null);
  const [deleteRow, setDeleteRow] = useState<AdminStudentRow | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listAdminStudents({
        search: search || undefined,
        status: statusFilter || undefined,
        page: 1,
        limit: STUDENT_FETCH_LIMIT,
      });
      setRows(res.students);
      setTotal(res.total);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to load students.");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  const groupedStudents = useMemo(() => groupStudentsByDepartment(rows), [rows]);
  const truncated = total > rows.length;

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    getAdminLookups()
      .then((l) => setDepartments(l.departments))
      .catch(() => setDepartments([]));
  }, []);

  async function submitCreate(form: FormData) {
    setBusy(true);
    try {
      await createAdminStudent({
        name: String(form.get("name") ?? ""),
        email: String(form.get("email") ?? ""),
        registrationNumber: String(form.get("registrationNumber") ?? ""),
        gender: form.get("gender") === "female" ? "female" : "male",
        department: String(form.get("department") ?? ""),
        password: String(form.get("password") ?? ""),
      });
      toast.success("Student created.");
      setCreateOpen(false);
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Create failed.");
    } finally {
      setBusy(false);
    }
  }

  async function submitEdit(form: FormData) {
    if (!editRow) return;
    setBusy(true);
    try {
      await updateAdminStudent(editRow.id, {
        name: String(form.get("name") ?? ""),
        email: String(form.get("email") ?? ""),
        registrationNumber: String(form.get("registrationNumber") ?? ""),
        gender: form.get("gender") === "female" ? "female" : "male",
        department: String(form.get("department") ?? ""),
        status:
          form.get("status") === "inactive"
            ? "inactive"
            : form.get("status") === "suspended"
              ? "suspended"
              : "active",
      });
      toast.success("Student updated.");
      setEditRow(null);
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Update failed.");
    } finally {
      setBusy(false);
    }
  }

  async function confirmStatus(next: "active" | "suspended") {
    if (!statusRow) return;
    setBusy(true);
    try {
      await setAdminStudentStatus(statusRow.id, next);
      toast.success(next === "suspended" ? "Student access blocked." : "Student access restored.");
      setStatusRow(null);
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Status update failed.");
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelete() {
    if (!deleteRow) return;
    if (deleteConfirm.trim().toUpperCase() !== deleteRow.registrationNumber.trim().toUpperCase()) {
      toast.error("Registration number does not match.");
      return;
    }
    setBusy(true);
    try {
      await deleteAdminStudent(deleteRow.id);
      toast.success("Student permanently removed.");
      setDeleteRow(null);
      setDeleteConfirm("");
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Delete failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AdminShell
      title="Students"
      subtitle="Search, create, edit, block, or permanently remove student accounts."
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div className="flex flex-wrap items-end gap-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Search</label>
            <input
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              placeholder="Name, email, reg #"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <button
            type="button"
            className="rounded-lg bg-brand-900 px-3 py-2 text-sm font-medium text-brand-amber-300"
            onClick={() => setSearch(searchDraft.trim())}
          >
            Apply
          </button>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
        <button
          type="button"
          className="rounded-xl bg-linear-to-r from-brand-amber-500 to-amber-600 px-4 py-2 text-sm font-semibold text-brand-950 shadow-sm"
          onClick={() => setCreateOpen(true)}
        >
          Add student
        </button>
      </div>

      {truncated ? (
        <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50/60 px-4 py-3 text-sm text-amber-900">
          Showing {rows.length} of {total} students. Use search or status filters to narrow the list.
        </p>
      ) : null}

      {loading ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <p className="text-slate-600">Loading…</p>
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <p className="text-slate-600">No students match your filters.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedStudents.map(({ department, students }) => (
            <section
              key={department}
              className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm"
            >
              <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 sm:px-5">
                <h2 className="font-heading text-lg text-brand-900">{department}</h2>
                <p className="text-xs text-slate-500">
                  {students.length === 1 ? "1 student" : `${students.length} students`}
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-slate-200 bg-white text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Reg #</th>
                      <th className="px-4 py-3">Gender</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Regs</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s) => (
                      <StudentTableRow
                        key={s.id}
                        student={s}
                        onEdit={() => setEditRow(s)}
                        onToggleStatus={() => setStatusRow(s)}
                        onDelete={() => {
                          setDeleteRow(s);
                          setDeleteConfirm("");
                        }}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      )}

      {!loading && rows.length > 0 ? (
        <p className="mt-4 text-sm text-slate-600">
          {total} student{total === 1 ? "" : "s"} across {groupedStudents.length} department
          {groupedStudents.length === 1 ? "" : "s"}
        </p>
      ) : null}

      {createOpen ? (
        <Modal title="Add student" onClose={() => !busy && setCreateOpen(false)}>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              submitCreate(new FormData(e.currentTarget));
            }}
          >
            <Field label="Full name" name="name" required />
            <Field label="Email (@cust.pk)" name="email" type="email" required />
            <Field label="Registration number" name="registrationNumber" required />
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">Gender</label>
              <select name="gender" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" required>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">Department</label>
              <select name="department" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" required>
                <option value="">Select…</option>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <Field label="Initial password" name="password" type="password" required />
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className="rounded-lg px-3 py-2 text-sm text-slate-600" onClick={() => setCreateOpen(false)}>
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy}
                className="rounded-lg bg-brand-900 px-4 py-2 text-sm font-medium text-brand-amber-300 disabled:opacity-50"
              >
                {busy ? "Saving…" : "Create"}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}

      {editRow ? (
        <Modal title="Edit student" onClose={() => !busy && setEditRow(null)}>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              submitEdit(new FormData(e.currentTarget));
            }}
          >
            <Field label="Full name" name="name" defaultValue={editRow.name} required />
            <Field label="Email" name="email" type="email" defaultValue={editRow.email} required />
            <Field label="Registration number" name="registrationNumber" defaultValue={editRow.registrationNumber} required />
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">Gender</label>
              <select
                name="gender"
                defaultValue={editRow.gender}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                required
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">Department</label>
              <select
                name="department"
                defaultValue={editRow.department}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                required
              >
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">Account status</label>
              <select
                name="status"
                defaultValue={editRow.status}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className="rounded-lg px-3 py-2 text-sm text-slate-600" onClick={() => setEditRow(null)}>
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy}
                className="rounded-lg bg-brand-900 px-4 py-2 text-sm font-medium text-brand-amber-300 disabled:opacity-50"
              >
                {busy ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}

      {statusRow ? (
        <Modal title={statusRow.status === "active" ? "Block student?" : "Restore student access?"} onClose={() => !busy && setStatusRow(null)}>
          <p className="text-sm text-slate-600">
            {statusRow.status === "active"
              ? `Block sign-in for ${statusRow.name}? They will not be able to use the student dashboard until unblocked.`
              : `Allow ${statusRow.name} to sign in again?`}
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" className="rounded-lg px-3 py-2 text-sm text-slate-600" onClick={() => setStatusRow(null)}>
              Cancel
            </button>
            <button
              type="button"
              disabled={busy}
              className="rounded-lg bg-brand-900 px-4 py-2 text-sm font-medium text-brand-amber-300 disabled:opacity-50"
              onClick={() => confirmStatus(statusRow.status === "active" ? "suspended" : "active")}
            >
              {busy ? "…" : statusRow.status === "active" ? "Block access" : "Restore access"}
            </button>
          </div>
        </Modal>
      ) : null}

      {deleteRow ? (
        <Modal title="Hard delete student" onClose={() => !busy && setDeleteRow(null)}>
          <p className="text-sm text-slate-600">
            This removes the account and related registrations/notifications. Type the registration number{" "}
            <strong>{deleteRow.registrationNumber}</strong> to confirm.
          </p>
          <input
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm uppercase"
            placeholder="Registration number"
            autoComplete="off"
          />
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" className="rounded-lg px-3 py-2 text-sm text-slate-600" onClick={() => setDeleteRow(null)}>
              Cancel
            </button>
            <button
              type="button"
              disabled={busy}
              className="rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              onClick={() => confirmDelete()}
            >
              {busy ? "Deleting…" : "Delete permanently"}
            </button>
          </div>
        </Modal>
      ) : null}
    </AdminShell>
  );
}

function StudentTableRow({
  student: s,
  onEdit,
  onToggleStatus,
  onDelete,
}: {
  student: AdminStudentRow;
  onEdit: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
}) {
  return (
    <tr className="border-b border-slate-100">
      <td className="px-4 py-3 font-medium text-brand-900">{s.name}</td>
      <td className="px-4 py-3 text-slate-700">{s.email}</td>
      <td className="px-4 py-3 text-slate-600">{s.registrationNumber}</td>
      <td className="px-4 py-3 capitalize text-slate-600">{s.gender}</td>
      <td className="px-4 py-3">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            s.status === "active"
              ? "bg-emerald-100 text-emerald-800"
              : s.status === "suspended"
                ? "bg-red-100 text-red-800"
                : "bg-slate-100 text-slate-700"
          }`}
        >
          {s.status}
        </span>
      </td>
      <td className="px-4 py-3 text-slate-600">{s.registrationCount}</td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="text-xs font-medium text-brand-amber-700 hover:underline"
            onClick={onEdit}
          >
            Edit
          </button>
          {s.status === "active" ? (
            <button
              type="button"
              className="text-xs font-medium text-red-600 hover:underline"
              onClick={onToggleStatus}
            >
              Block
            </button>
          ) : (
            <button
              type="button"
              className="text-xs font-medium text-emerald-700 hover:underline"
              onClick={onToggleStatus}
            >
              Unblock
            </button>
          )}
          <button
            type="button"
            className="text-xs font-medium text-red-800 hover:underline"
            onClick={onDelete}
          >
            Hard delete
          </button>
        </div>
      </td>
    </tr>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
        role="dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-heading text-xl text-brand-900">{title}</h2>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-700">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
      />
    </div>
  );
}

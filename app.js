function $(sel) { return document.querySelector(sel); }
function el(tag, attrs = {}, children = []) {
  const e = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === "dataset") Object.assign(e.dataset, v);
    else if (k in e) e[k] = v; else e.setAttribute(k, v);
  });
  children.forEach(c => e.appendChild(typeof c === "string" ? document.createTextNode(c) : c));
  return e;
}

// Tabs
document.querySelectorAll("nav.tabs button").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("nav.tabs button").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab").forEach(sec => sec.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});

async function api(path, opts) {
  const res = await fetch(path, opts);
  if (!res.ok) throw new Error(await res.text());
  return res.status === 204 ? null : res.json();
}

function buildTable(table, rows, columns, onEdit, onDelete) {
  table.innerHTML = "";
  const thead = el("thead");
  const headerRow = el("tr");
  columns.forEach(c => headerRow.appendChild(el("th", {}, [c.label])));
  headerRow.appendChild(el("th", {}, ["Actions"]));
  thead.appendChild(headerRow);
  const tbody = el("tbody");
  rows.forEach(r => {
    const tr = el("tr");
    columns.forEach(c => tr.appendChild(el("td", {}, [String(r[c.key] ?? "")])));
    const editBtn = el("button", { onclick: () => onEdit && onEdit(r) }, ["Edit"]);
    const delBtn = el("button", { onclick: () => onDelete && onDelete(r) }, ["Delete"]);
    tr.appendChild(el("td", {}, [editBtn, delBtn]));
    tbody.appendChild(tr);
  });
  table.appendChild(thead); table.appendChild(tbody);
}

// PRODUCTS
const pTable = $("#product-table");
const pForm = $("#product-form");
const pSearch = $("#product-search");

async function loadProducts() {
  const q = pSearch.value?.trim() || "";
  const url = q ? `/api/products?search=${encodeURIComponent(q)}` : `/api/products`;
  const rows = await api(url);
  buildTable(pTable, rows, [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    { key: "sku", label: "SKU" },
    { key: "category", label: "Category" },
    { key: "unit_price", label: "Price" },
    { key: "stock_quantity", label: "Stock" },
    { key: "status", label: "Status" }
  ], (r) => editProduct(r), (r) => deleteProduct(r.id));
}
pSearch.addEventListener("input", () => loadProducts());
pForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(pForm));
  data.unit_price = parseFloat(data.unit_price);
  data.stock_quantity = parseInt(data.stock_quantity, 10);
  await api("/api/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
  pForm.reset(); loadProducts();
});
async function editProduct(row) {
  const name = prompt("Name", row.name); if (name == null) return;
  const sku = prompt("SKU", row.sku); if (sku == null) return;
  await api(`/api/products/${row.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, sku }) });
  loadProducts();
}
async function deleteProduct(id) {
  if (!confirm("Delete product?")) return;
  await api(`/api/products/${id}`, { method: "DELETE" });
  loadProducts();
}

// USERS
const uTable = $("#user-table");
const uForm = $("#user-form");
async function loadUsers() {
  const rows = await api("/api/users");
  buildTable(uTable, rows, [
    { key: "id", label: "ID" },
    { key: "username", label: "Username" },
    { key: "full_name", label: "Full Name" },
    { key: "role_id", label: "Role ID" },
    { key: "role_name", label: "Role" }
  ], (r) => editUser(r), (r) => deleteUser(r.id));
}
uForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(uForm));
  data.role_id = parseInt(data.role_id, 10);
  await api("/api/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
  uForm.reset(); loadUsers();
});
async function editUser(row) {
  const full_name = prompt("Full name", row.full_name || ""); if (full_name == null) return;
  const role_id = prompt("Role ID", row.role_id); if (role_id == null) return;
  await api(`/api/users/${row.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ full_name, role_id: parseInt(role_id, 10) }) });
  loadUsers();
}
async function deleteUser(id) {
  if (!confirm("Delete user?")) return;
  await api(`/api/users/${id}`, { method: "DELETE" });
  loadUsers();
}

// ORDERS
const oTable = $("#order-table");
const oForm = $("#order-form");
async function loadOrders() {
  const rows = await api("/api/orders");
  buildTable(oTable, rows, [
    { key: "id", label: "ID" },
    { key: "order_date", label: "Date" },
    { key: "status", label: "Status" },
    { key: "customer_id", label: "Customer ID" },
    { key: "customer_name", label: "Customer Name" },
    { key: "total_amount", label: "Total" },
    { key: "payment_method", label: "Payment" }
  ], (r) => editOrder(r), (r) => deleteOrder(r.id));
}
oForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(oForm));
  data.customer_id = parseInt(data.customer_id, 10);
  data.total_amount = parseFloat(data.total_amount);
  await api("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
  oForm.reset(); loadOrders();
});
async function editOrder(row) {
  const status = prompt("Status (Pending/Paid/Shipped/Canceled)", row.status); if (status == null) return;
  await api(`/api/orders/${row.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
  loadOrders();
}
async function deleteOrder(id) {
  if (!confirm("Delete order?")) return;
  await api(`/api/orders/${id}`, { method: "DELETE" });
  loadOrders();
}

// ROLES
const rTable = $("#role-table");
const rForm = $("#role-form");
async function loadRoles() {
  const rows = await api("/api/roles");
  buildTable(rTable, rows, [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" }
  ], (r) => editRole(r), (r) => deleteRole(r.id));
}
rForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(rForm));
  await api("/api/roles", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
  rForm.reset(); loadRoles();
});
async function editRole(row) {
  const name = prompt("Role name", row.name); if (name == null) return;
  await api(`/api/roles/${row.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
  loadRoles();
}
async function deleteRole(id) {
  if (!confirm("Delete role?")) return;
  await api(`/api/roles/${id}`, { method: "DELETE" });
  loadRoles();
}

// PERMISSIONS
const prTable = $("#perm-table");
const prForm = $("#perm-form");
async function loadPerms() {
  const rows = await api("/api/permissions");
  buildTable(prTable, rows, [
    { key: "id", label: "ID" },
    { key: "role_id", label: "Role ID" },
    { key: "role_name", label: "Role" },
    { key: "permission", label: "Permission" }
  ], null, (r) => deletePerm(r.id));
}
prForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(prForm));
  data.role_id = parseInt(data.role_id, 10);
  await api("/api/permissions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
  prForm.reset(); loadPerms();
});
async function deletePerm(id) {
  if (!confirm("Delete permission?")) return;
  await api(`/api/permissions/${id}`, { method: "DELETE" });
  loadPerms();
}

// CUSTOMER INFO
const cTable = $("#cust-table");
const cForm = $("#cust-form");
async function loadCustomers() {
  const rows = await api("/api/customer-info");
  buildTable(cTable, rows, [
    { key: "id", label: "ID" },
    { key: "user_id", label: "User ID" },
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "address", label: "Address" }
  ], (r) => editCustomer(r), (r) => deleteCustomer(r.id));
}
cForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(cForm));
  data.user_id = parseInt(data.user_id, 10);
  await api("/api/customer-info", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
  cForm.reset(); loadCustomers();
});
async function editCustomer(row) {
  const phone = prompt("Phone", row.phone || ""); if (phone == null) return;
  await api(`/api/customer-info/${row.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone }) });
  loadCustomers();
}
async function deleteCustomer(id) {
  if (!confirm("Delete customer info?")) return;
  await api(`/api/customer-info/${id}`, { method: "DELETE" });
  loadCustomers();
}

// Initial loads
loadProducts(); loadUsers(); loadOrders(); loadRoles(); loadPerms(); loadCustomers();

/**
 * SA CATALOG
 * Initial operational views for Products, Suppliers, and Inventory.
 */

let saCatalogProducts = [];
let saSupplierItems = [];

async function loadSAProducts() {
  const body = document.getElementById("saProductsTableBody");
  if (!body) return;

  body.innerHTML = `<tr><td colspan="7" class="table-empty">Loading products...</td></tr>`;

  try {
    const result = await crmApi("getQuotationProducts", { query: "" });

    if (!result || !result.success) {
      throw new Error(result && result.message ? result.message : "Unable to load products.");
    }

    saCatalogProducts = result.products || [];
    renderSAProducts();
  } catch (error) {
    console.error(error);
    body.innerHTML = `<tr><td colspan="7" class="table-empty">Unable to load products.</td></tr>`;
  }
}

function renderSAProducts() {
  const body = document.getElementById("saProductsTableBody");
  const input = document.getElementById("saProductSearch");
  if (!body) return;

  const q = String(input ? input.value : "").trim().toLowerCase();

  const rows = saCatalogProducts.filter(function(p) {
    return !q || [
      p.productName,
      p.productCode,
      p.category,
      p.description,
      p.compatibility,
      p.brand,
      p.status
    ].join(" ").toLowerCase().includes(q);
  });

  if (!rows.length) {
    body.innerHTML = `<tr><td colspan="7" class="table-empty">No matching products.</td></tr>`;
    return;
  }

  body.innerHTML = rows.map(function(p) {
    return `
      <tr>
        <td><strong>${escapeHtml(p.productName || "—")}</strong></td>
        <td>${escapeHtml(p.productCode || "—")}</td>
        <td>${escapeHtml(p.category || "—")}</td>
        <td>${escapeHtml(p.brand || "—")}</td>
        <td>${escapeHtml(p.compatibility || "—")}</td>
        <td>${formatMoneySA(Number(p.defaultPrice || 0))}</td>
        <td>${escapeHtml(p.status || "Active")}</td>
      </tr>
    `;
  }).join("");
}

async function loadSASuppliers() {
  const body = document.getElementById("saSuppliersTableBody");
  if (!body) return;

  body.innerHTML = `<tr><td colspan="7" class="table-empty">Loading supplier catalog...</td></tr>`;

  try {
    const result = await crmApi("getSupplierCatalog", { query: "" });

    if (!result || !result.success) {
      throw new Error(result && result.message ? result.message : "Unable to load suppliers.");
    }

    saSupplierItems = result.items || [];
    renderSASuppliers();
  } catch (error) {
    console.error(error);
    body.innerHTML = `<tr><td colspan="7" class="table-empty">Unable to load supplier catalog.</td></tr>`;
  }
}

function renderSASuppliers() {
  const body = document.getElementById("saSuppliersTableBody");
  const input = document.getElementById("saSupplierSearch");
  if (!body) return;

  const q = String(input ? input.value : "").trim().toLowerCase();

  const rows = saSupplierItems.filter(function(item) {
    return !q || [
      item.supplierName,
      item.productName,
      item.partNumber,
      item.compatibility,
      item.availability,
      item.notes
    ].join(" ").toLowerCase().includes(q);
  });

  if (!rows.length) {
    body.innerHTML = `<tr><td colspan="7" class="table-empty">No matching supplier items.</td></tr>`;
    return;
  }

  body.innerHTML = rows.map(function(item) {
    return `
      <tr>
        <td><strong>${escapeHtml(item.supplierName || "—")}</strong></td>
        <td>${escapeHtml(item.productName || "—")}</td>
        <td>${escapeHtml(item.partNumber || "—")}</td>
        <td>${escapeHtml(item.compatibility || "—")}</td>
        <td>${formatMoneySA(Number(item.supplierPrice || 0))}</td>
        <td>${escapeHtml(item.availability || "—")}</td>
        <td>${escapeHtml(item.notes || "—")}</td>
      </tr>
    `;
  }).join("");
}

async function loadSAInventory() {
  // Inventory is intentionally tied to the client-facing product catalog for now.
  // Stock-specific fields can be added later without changing this module route.
  if (!saCatalogProducts.length) {
    await loadSAProducts();
  }

  const body = document.getElementById("saInventoryTableBody");
  if (!body) return;

  if (!saCatalogProducts.length) {
    body.innerHTML = `<tr><td colspan="5" class="table-empty">No product records available.</td></tr>`;
    return;
  }

  body.innerHTML = saCatalogProducts.map(function(p) {
    return `
      <tr>
        <td><strong>${escapeHtml(p.productName || "—")}</strong></td>
        <td>${escapeHtml(p.productCode || "—")}</td>
        <td>${escapeHtml(p.category || "—")}</td>
        <td>${escapeHtml(p.compatibility || "—")}</td>
        <td>${escapeHtml(p.status || "Active")}</td>
      </tr>
    `;
  }).join("");
}

/**
 * SA APPOINTMENTS
 * Daily operational appointment list.
 */

let saAppointmentDate = new Date();
let saAppointments = [];

async function loadSAAppointments() {
  if (!currentUser) return;

  const body = document.getElementById("saAppointmentsTableBody");

  if (body) {
    body.innerHTML = `
      <tr>
        <td colspan="10" class="table-empty">Loading appointments...</td>
      </tr>
    `;
  }

  try {
    const result = await crmApi("getAppointmentsData");

    if (!result || !result.success) {
      throw new Error(
        result && result.message
          ? result.message
          : "Unable to load appointments."
      );
    }

    saAppointments = result.appointments || [];
    renderSAAppointments();

  } catch (error) {
    console.error("SA appointments:", error);

    if (body) {
      body.innerHTML = `
        <tr>
          <td colspan="10" class="table-empty">
            Unable to load appointments.
          </td>
        </tr>
      `;
    }
  }
}

function renderSAAppointments() {
  const body = document.getElementById("saAppointmentsTableBody");
  const label = document.getElementById("saAppointmentDateLabel");
  const picker = document.getElementById("saAppointmentDatePicker");

  if (!body || !label) return;

  const dateKey = formatCalendarDateKey(saAppointmentDate);

  label.textContent = saAppointmentDate.toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric"
    }
  );

  if (picker) picker.value = dateKey;

  const role = String(
    currentUser && (currentUser.systemRole || currentUser.role) || ""
  ).trim().toUpperCase();

  const branch = String(
    currentUser && (currentUser.branchId || currentUser.branch) || ""
  ).trim().toUpperCase();

  const items = saAppointments
    .filter(function(item) {
      if (String(item.appointmentDate || "") !== dateKey) return false;

      if (
        role === "SA" &&
        branch &&
        branch !== "ALL" &&
        String(item.branchId || "").trim().toUpperCase() !== branch
      ) {
        return false;
      }

      return true;
    })
    .sort(function(a, b) {
      return String(a.appointmentTime || "").localeCompare(
        String(b.appointmentTime || "")
      );
    });

  updateSAAppointmentCount_(items.length);

  if (!items.length) {
    body.innerHTML = `
      <tr>
        <td colspan="10" class="table-empty">
          No appointments scheduled for this date.
        </td>
      </tr>
    `;
    return;
  }

  body.innerHTML = items.map(function(item) {
    return `
      <tr>
        <td>${escapeHtml(item.appointmentTime || "—")}</td>

        <td>
          <strong>${escapeHtml(item.customerName || "—")}</strong>
          <div class="support-table-meta">
            ${escapeHtml(item.contactNumber || "")}
          </div>
        </td>

        <td>${escapeHtml(item.vehicle || "—")}</td>
        <td>${escapeHtml(item.plateNumber || item.plate || "—")}</td>
        <td>${escapeHtml(item.service || "—")}</td>
        <td>${escapeHtml(item.assignedPm || "—")}</td>
        <td>${escapeHtml(item.bookedBy || "—")}</td>
        <td>${escapeHtml(item.status || "—")}</td>
        <td>${escapeHtml(item.branchId || "—")}</td>

        <td>
          <div class="sa-action-group">
            <button
              class="secondary-action"
              type="button"
              onclick="openAppointmentDetails('${escapeJs(item.appointmentId || "")}')"
            >
              VIEW
            </button>

            <button
              class="primary-action"
              type="button"
              onclick="convertSAAppointment('${escapeJs(item.appointmentId || "")}')"
            >
              CONVERT
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

async function convertSAAppointment(appointmentId) {
  if (!appointmentId) return;

  const confirmed = confirm(
    "Convert this appointment to an Opportunity? It will be assigned to your SA account."
  );

  if (!confirmed) return;

  try {
    const result = await crmApi(
      "convertAppointmentToOpportunity",
      {
        appointmentId: appointmentId
      }
    );

    if (!result || !result.success) {
      // Existing converted appointment returns its Opportunity ID.
      if (result && result.opportunityId) {
        await openConvertedSAOpportunity_(result.opportunityId);
        return;
      }

      throw new Error(
        result && result.message
          ? result.message
          : "Unable to convert appointment."
      );
    }

    alert(result.message || "Appointment converted.");

    await loadSAAppointments();
    await openConvertedSAOpportunity_(result.opportunityId);

  } catch (error) {
    console.error("convertSAAppointment:", error);
    alert(error.message || "Unable to convert appointment.");
  }
}

async function openConvertedSAOpportunity_(opportunityId) {
  if (!opportunityId) return;

  selectDashboardModule("Opportunities");

  if (typeof loadSAOpportunities === "function") {
    await loadSAOpportunities();
  }

  if (typeof openSAOpportunity === "function") {
    openSAOpportunity(opportunityId);
  }
}

function changeSAAppointmentDay(direction) {
  saAppointmentDate = new Date(
    saAppointmentDate.getFullYear(),
    saAppointmentDate.getMonth(),
    saAppointmentDate.getDate() + Number(direction || 0)
  );

  renderSAAppointments();
}

function goToSAAppointmentToday() {
  saAppointmentDate = new Date();
  renderSAAppointments();
}

function setSAAppointmentDate(value) {
  if (!value) return;

  const parts = String(value).split("-");
  if (parts.length !== 3) return;

  saAppointmentDate = new Date(
    Number(parts[0]),
    Number(parts[1]) - 1,
    Number(parts[2])
  );

  renderSAAppointments();
}

function updateSAAppointmentCount_(count) {
  const el = document.getElementById("saAppointmentCount");
  if (el) el.textContent = String(count || 0);
}

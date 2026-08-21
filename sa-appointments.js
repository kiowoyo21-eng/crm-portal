/**
 * SA APPOINTMENTS
 * Daily operational view for Service Advisors.
 */

let saAppointmentDate = new Date();
let saAppointments = [];

async function loadSAAppointments() {
  if (!currentUser) return;

  const tableBody = document.getElementById("saAppointmentsTableBody");

  if (tableBody) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="10" class="table-empty">
          Loading appointments...
        </td>
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
    console.error("Unable to load SA appointments:", error);

    if (tableBody) {
      tableBody.innerHTML = `
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
  const tableBody = document.getElementById("saAppointmentsTableBody");
  const dateLabel = document.getElementById("saAppointmentDateLabel");
  const datePicker = document.getElementById("saAppointmentDatePicker");

  if (!tableBody || !dateLabel) return;

  const dateKey = formatCalendarDateKey(saAppointmentDate);

  dateLabel.textContent = saAppointmentDate.toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric"
    }
  );

  if (datePicker) datePicker.value = dateKey;

  const role = String(
    currentUser &&
    (currentUser.systemRole || currentUser.role) ||
    ""
  ).trim().toUpperCase();

  const branch = String(
    currentUser &&
    (currentUser.branchId || currentUser.branch) ||
    ""
  ).trim();

  const items = saAppointments
    .filter(function(item) {
      if (String(item.appointmentDate || "") !== dateKey) return false;

      if (
        role === "SA" &&
        branch &&
        String(item.branchId || "") !== branch
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

  if (!items.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="10" class="table-empty">
          No appointments scheduled for this date.
        </td>
      </tr>
    `;
    updateSAAppointmentCount_(0);
    return;
  }

  tableBody.innerHTML = items.map(function(item) {
    const convertedOpportunityId = String(
      item.convertedOpportunityId ||
      item.opportunityId ||
      ""
    ).trim();

    let actionHtml = "";

    if (convertedOpportunityId) {
      actionHtml = `
        <button
          type="button"
          class="secondary-action"
          onclick="
            selectDashboardModule('Opportunities');
            setTimeout(function(){
              openSAOpportunity(
                '${escapeJs(convertedOpportunityId)}'
              );
            }, 100);
          "
        >
          VIEW OPPORTUNITY
        </button>
      `;
    } else {
      actionHtml = `
        <button
          type="button"
          class="primary-action"
          onclick="
            convertSAAppointment(
              '${escapeJs(item.appointmentId || "")}'
            )
          "
        >
          CONVERT
        </button>
      `;
    }

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

        <td>
          ${escapeHtml(
            item.plateNumber ||
            item.plate ||
            "—"
          )}
        </td>

        <td>${escapeHtml(item.service || "—")}</td>
        <td>${escapeHtml(item.assignedPm || "—")}</td>
        <td>${escapeHtml(item.bookedBy || "—")}</td>
        <td>${escapeHtml(item.status || "—")}</td>
        <td>${escapeHtml(item.branchId || "—")}</td>

        <td>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
            <button
              type="button"
              class="secondary-action"
              onclick="
                openAppointmentDetails(
                  '${escapeJs(item.appointmentId || "")}'
                )
              "
            >
              VIEW
            </button>

            ${actionHtml}
          </div>
        </td>
      </tr>
    `;
  }).join("");

  updateSAAppointmentCount_(items.length);
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
  const element = document.getElementById("saAppointmentCount");
  if (element) element.textContent = String(count || 0);
}

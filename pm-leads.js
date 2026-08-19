async function loadLeads() {

  if (!currentUser) {
    return;
  }

  const body =
    document.getElementById(
      "leadsTableBody"
    );

  body.innerHTML = `
    <tr>
      <td colspan="10" class="table-empty">
        Loading leads...
      </td>
    </tr>
  `;

  try {

    const result =
      await crmApi(
        "getLeadsData"
      );

    if (
      !result ||
      !result.success
    ) {

      body.innerHTML = `
        <tr>
          <td colspan="10" class="table-empty">
            Unable to load leads.
          </td>
        </tr>
      `;

      return;
    }

    currentLeads =
      result.leads || [];

    filterLeadsTable();

  } catch (error) {

    console.error(
      "Unable to load leads:",
      error
    );

    body.innerHTML = `
      <tr>
        <td colspan="10" class="table-empty">
          Unable to connect to the CRM.
        </td>
      </tr>
    `;

  }

}


function filterLeadsTable() {

  const search =
    document
      .getElementById("leadSearch")
      .value
      .trim()
      .toLowerCase();

  const branch =
    document
      .getElementById("leadBranchFilter")
      .value;

  const status =
    document
      .getElementById("leadStatusFilter")
      .value;

  const service =
    document
      .getElementById("leadServiceFilter")
      .value;


  const filtered =
    currentLeads.filter(function(lead) {

      const searchable = [
        lead.customerName,
        lead.contactNumber,
        lead.vehicle,
        lead.year,
        lead.plateNumber,
        lead.service,
        lead.concern,
        lead.assignedPm
      ]
        .join(" ")
        .toLowerCase();


      const matchesSearch =
        !search ||
        searchable.includes(search);

      const matchesBranch =
        !branch ||
        lead.branchId === branch;

      const matchesStatus =
        !status ||
        lead.status === status;

      const matchesService =
        !service ||
        lead.service === service;


      return (
        matchesSearch &&
        matchesBranch &&
        matchesStatus &&
        matchesService
      );

    });


  renderLeadsTable(filtered);
}
function renderLeadsTable(leads) {

  const body =
    document.getElementById(
      "leadsTableBody"
    );


  if (!leads.length) {

    body.innerHTML = `
      <tr>
        <td colspan="10" class="table-empty">
          No leads found.
        </td>
      </tr>
    `;

    return;
  }


  body.innerHTML =
    leads.map(function(lead) {

      return `
        <tr>

          <td class="customer-cell">
            <strong>
              ${escapeHtml(lead.customerName)}
            </strong>

            <span>
              ${escapeHtml(lead.contactNumber)}
            </span>
          </td>


          <td class="vehicle-cell">
            ${escapeHtml(lead.vehicle)}

            <span>
              ${escapeHtml(
                String(lead.year || "")
              )}
              ${lead.plateNumber
                ? " • " +
                  escapeHtml(lead.plateNumber)
                : ""}
            </span>
          </td>


          <td>
            <span class="branch-chip">
              ${escapeHtml(lead.branchId)}
            </span>
          </td>


          <td>
            ${escapeHtml(lead.inquirySource)}
          </td>

          <td>
            ${escapeHtml(lead.service)}
          </td>


          <td>
            ${escapeHtml(lead.concern)}
          </td>


          <td>

            <select
  class="status-select"
  data-original-status="${escapeHtml(lead.status)}"
  onchange="handleInlineStatusChange(
    '${escapeJs(lead.leadId)}',
    this
  )"
>
  ${buildLeadStatusOptions(lead.status)}
</select>

          </td>


          <td>
            ${escapeHtml(lead.assignedPm)}
          </td>


          <td>
            ${escapeHtml(
              lead.appointmentDate || "—"
            )}
          </td>


          <td>
            ${escapeHtml(lead.createdAt)}
          </td>


          <td>

            <button
              class="table-action"
              onclick="editLead(
                '${escapeJs(lead.leadId)}'
              )"
            >
              EDIT
            </button>

          </td>

        </tr>
      `;

    }).join("");
}



function escapeHtml(value) {

  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildLeadStatusOptions(currentStatus) {

  const statuses = [
    "Interested",
    "Follow Up",
    "Not Interested",
    "Booked",
    "Remind",
    "Cancelled",
    "Rescheduled",
    "No Show"
  ];

  return statuses
    .map(function(status) {

      const selected =
        status === currentStatus
          ? " selected"
          : "";

      return (
        '<option value="' +
        escapeHtml(status) +
        '"' +
        selected +
        ">" +
        escapeHtml(status) +
        "</option>"
      );

    })
    .join("");
}

async function handleInlineStatusChange(
  leadId,
  selectElement
) {

  if (!currentUser) {
    return;
  }

  const newStatus =
    selectElement.value;

  const oldStatus =
    selectElement.dataset.originalStatus;

  if (newStatus === "Booked") {

    selectElement.value =
      oldStatus;

    editLead(leadId);

    return;
  }

  selectElement.disabled = true;

  try {

    const result =
      await crmApi(
        "updateLead",
        {
          leadId: leadId,

          leadData: {
            status: newStatus
          }
        }
      );

    selectElement.disabled = false;

    if (
      !result ||
      !result.success
    ) {

      selectElement.value =
        oldStatus;

      alert(
        result && result.message
          ? result.message
          : "Unable to update status."
      );

      return;
    }

    selectElement.dataset.originalStatus =
      newStatus;

    const lead =
      currentLeads.find(
        function(item) {
          return item.leadId === leadId;
        }
      );

    if (lead) {

      lead.status =
        newStatus;

      if (newStatus !== "Booked") {

        lead.appointmentDate = "";
        lead.bookedBy = "";

      }

    }

  } catch (error) {

    selectElement.disabled = false;

    selectElement.value =
      oldStatus;

    alert(
      "Unable to connect to the CRM."
    );

    console.error(error);

  }

}

function escapeJs(value) {

  return String(value || "")
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'");
}

let vehicleCatalog = [];


// =========================
// LOAD VEHICLE CATALOG
// =========================

async function loadVehicleCatalog() {

  try {

    const result =
      await crmApi(
        "getVehiclesData"
      );

    if (
      !result ||
      !result.success
    ) {

      console.error(
        "Unable to load vehicles.",
        result
      );

      return;
    }

    vehicleCatalog =
      result.vehicles || [];

  } catch (error) {

    console.error(
      "Vehicle catalog error:",
      error
    );

  }

}

// =========================
// SEARCH VEHICLE
// =========================

function searchNewLeadVehicle() {

  const input =
    document.getElementById(
      "newLeadVehicle"
    );

  const container =
    document.getElementById(
      "newLeadVehicleSuggestions"
    );

  if (!input || !container) {
    return;
  }


  const search =
    input.value
      .trim()
      .toLowerCase();


  if (!search) {

    container.style.display =
      "none";

    container.innerHTML = "";

    return;
  }


  const matches =
    vehicleCatalog
      .filter(
        function(vehicle) {

          return vehicle
            .toLowerCase()
            .includes(search);

        }
      )
      .slice(0, 8);


  let html = "";


  matches.forEach(
    function(vehicle) {

      html +=
        '<div class="vehicle-suggestion-item"' +
        ' onclick="selectNewLeadVehicle(' +
        "'" +
        escapeVehicleValue(vehicle) +
        "'" +
        ')">' +
        escapeVehicleHtml(vehicle) +
        "</div>";

    }
  );


  const exactMatch =
    vehicleCatalog.some(
      function(vehicle) {

        return vehicle
          .toLowerCase() === search;

      }
    );


  if (!exactMatch) {

    html +=
      '<div class="vehicle-suggestion-item vehicle-add-item"' +
      ' onclick="addNewLeadVehicle()">' +
      '+ Add "' +
      escapeVehicleHtml(
        input.value.trim()
      ) +
      '"' +
      "</div>";

  }


  container.innerHTML = html;

  container.style.display =
    html
      ? "block"
      : "none";

}


// =========================
// SELECT EXISTING VEHICLE
// =========================

function selectNewLeadVehicle(
  vehicle
) {

  const input =
    document.getElementById(
      "newLeadVehicle"
    );

  const container =
    document.getElementById(
      "newLeadVehicleSuggestions"
    );


  input.value = vehicle;

  container.style.display =
    "none";

  container.innerHTML = "";

}


// =========================
// SEARCH VEHICLE - EDIT LEAD
// =========================

function searchEditLeadVehicle() {

  const input =
    document.getElementById(
      "editLeadVehicle"
    );

  const container =
    document.getElementById(
      "editLeadVehicleSuggestions"
    );

  if (!input || !container) {
    return;
  }


  const search =
    input.value
      .trim()
      .toLowerCase();


  if (!search) {

    container.style.display =
      "none";

    container.innerHTML = "";

    return;
  }


  const matches =
    vehicleCatalog
      .filter(
        function(vehicle) {

          return vehicle
            .toLowerCase()
            .includes(search);

        }
      )
      .slice(0, 8);


  let html = "";


  matches.forEach(
    function(vehicle) {

      html +=
        '<div class="vehicle-suggestion-item"' +
        ' onclick="selectEditLeadVehicle(' +
        "'" +
        escapeVehicleValue(vehicle) +
        "'" +
        ')">' +
        escapeVehicleHtml(vehicle) +
        "</div>";

    }
  );


  const exactMatch =
    vehicleCatalog.some(
      function(vehicle) {

        return vehicle
          .toLowerCase() === search;

      }
    );


  if (!exactMatch) {

    html +=
      '<div class="vehicle-suggestion-item vehicle-add-item"' +
      ' onclick="addEditLeadVehicle()">' +
      '+ Add "' +
      escapeVehicleHtml(
        input.value.trim()
      ) +
      '"' +
      "</div>";

  }


  container.innerHTML = html;

  container.style.display =
    html
      ? "block"
      : "none";

}


// =========================
// SELECT VEHICLE - EDIT LEAD
// =========================

function selectEditLeadVehicle(
  vehicle
) {

  const input =
    document.getElementById(
      "editLeadVehicle"
    );

  const container =
    document.getElementById(
      "editLeadVehicleSuggestions"
    );


  input.value = vehicle;

  container.style.display =
    "none";

  container.innerHTML = "";

}


// =========================
// ADD VEHICLE - EDIT LEAD
// =========================

async function addEditLeadVehicle() {

  const input =
    document.getElementById(
      "editLeadVehicle"
    );

  const container =
    document.getElementById(
      "editLeadVehicleSuggestions"
    );

  const vehicleName =
    input.value.trim();

  if (
    !vehicleName ||
    !currentUser
  ) {
    return;
  }

  container.innerHTML =
    '<div class="vehicle-suggestion-item">' +
    "Adding vehicle..." +
    "</div>";

  try {

    const result =
      await crmApi(
        "addVehicle",
        {
          vehicleName:
            vehicleName
        }
      );

    if (
      !result ||
      !result.success
    ) {

      alert(
        result && result.message
          ? result.message
          : "Unable to add vehicle."
      );

      return;
    }

    const savedVehicle =
      result.vehicleName;

    input.value =
      savedVehicle;

    if (
      !vehicleCatalog.some(
        function(vehicle) {

          return (
            vehicle.toLowerCase() ===
            savedVehicle.toLowerCase()
          );

        }
      )
    ) {

      vehicleCatalog.push(
        savedVehicle
      );

      vehicleCatalog.sort(
        function(a, b) {
          return a.localeCompare(b);
        }
      );

    }

    container.style.display =
      "none";

    container.innerHTML =
      "";

  } catch (error) {

    alert(
      "Unable to add vehicle."
    );

    console.error(error);

  }

}

// =========================
// ADD NEW VEHICLE
// =========================

async function addNewLeadVehicle() {

  const input =
    document.getElementById(
      "newLeadVehicle"
    );

  const container =
    document.getElementById(
      "newLeadVehicleSuggestions"
    );

  const vehicleName =
    input.value.trim();

  if (
    !vehicleName ||
    !currentUser
  ) {
    return;
  }

  container.innerHTML =
    '<div class="vehicle-suggestion-item">' +
    "Adding vehicle..." +
    "</div>";

  try {

    const result =
      await crmApi(
        "addVehicle",
        {
          vehicleName:
            vehicleName
        }
      );

    if (
      !result ||
      !result.success
    ) {

      alert(
        result && result.message
          ? result.message
          : "Unable to add vehicle."
      );

      return;
    }

    const savedVehicle =
      result.vehicleName;

    input.value =
      savedVehicle;

    if (
      !vehicleCatalog.some(
        function(vehicle) {

          return (
            vehicle.toLowerCase() ===
            savedVehicle.toLowerCase()
          );

        }
      )
    ) {

      vehicleCatalog.push(
        savedVehicle
      );

      vehicleCatalog.sort(
        function(a, b) {
          return a.localeCompare(b);
        }
      );

    }

    container.style.display =
      "none";

    container.innerHTML =
      "";

  } catch (error) {

    alert(
      "Unable to add vehicle."
    );

    console.error(error);

  }

}

// =========================
// HELPERS
// =========================

function escapeVehicleHtml(value) {

  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


function escapeVehicleValue(value) {

  return String(value || "")
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'");

}

function openAddLeadModal() {

  const modal =
    document.getElementById("addLeadModal");

  const form =
    document.getElementById("addLeadForm");

  const message =
    document.getElementById("addLeadMessage");

  form.reset();

  message.className = "modal-message";
  message.textContent = "";

  document
    .getElementById("newLeadAppointmentGroup")
    .style.display = "none";

  document
    .getElementById("newLeadAppointmentDate")
    .required = false;

  modal.classList.add("show");

  
}

function closeAddLeadModal() {

  document
    .getElementById("addLeadModal")
    .classList.remove("show");
}

function toggleLeadAppointmentDate() {

  const status =
    document
      .getElementById("newLeadStatus")
      .value;

  const group =
    document.getElementById(
      "newLeadAppointmentGroup"
    );

  const input =
    document.getElementById(
      "newLeadAppointmentDate"
    );

  if (status === "Booked") {

    group.style.display = "block";
    input.required = true;

  } else {

    group.style.display = "none";
    input.required = false;
    input.value = "";
  }
}

document
  .getElementById("addLeadForm")
  .addEventListener(
    "submit",
    async function(event) {

      event.preventDefault();

      if (!currentUser) {
        return;
      }

      const button =
        document.getElementById(
          "saveLeadButton"
        );

      const message =
        document.getElementById(
          "addLeadMessage"
        );

      const leadData = {

        customerName:
          document
            .getElementById(
              "newLeadCustomerName"
            )
            .value
            .trim(),

        contactNumber:
          document
            .getElementById(
              "newLeadContactNumber"
            )
            .value
            .trim(),

        vehicle:
          document
            .getElementById(
              "newLeadVehicle"
            )
            .value
            .trim(),

        year:
          document
            .getElementById(
              "newLeadYear"
            )
            .value
            .trim(),

        plateNumber:
          document
            .getElementById(
              "newLeadPlate"
            )
            .value
            .trim(),

        branchId:
          document
            .getElementById(
              "newLeadBranch"
            )
            .value,

        inquirySource:
          document
            .getElementById(
              "newLeadSource"
            )
            .value,

        service:
          document
            .getElementById(
              "leadService"
            )
            .value,

        status:
          document
            .getElementById(
              "newLeadStatus"
            )
            .value,

        concern:
          document
            .getElementById(
              "newLeadConcern"
            )
            .value
            .trim(),

        appointmentDate:
          document
            .getElementById(
              "newLeadAppointmentDate"
            )
            .value

      };


      message.className =
        "modal-message";

      message.textContent =
        "";

      button.disabled =
        true;

      button.textContent =
        "SAVING...";


      try {

        const result =
          await crmApi(
            "createLead",
            {
              leadData:
                leadData
            }
          );


        if (
          !result ||
          !result.success
        ) {

          message.className =
            "modal-message error";

          message.textContent =
            result && result.message
              ? result.message
              : "Unable to create lead.";

          return;
        }


        message.className =
          "modal-message success";

        message.textContent =
          "Lead created successfully.";


        // Refresh Leads table
        loadLeads();


        // Close modal after short confirmation
        setTimeout(
          function() {

            closeAddLeadModal();

          },
          700
        );


      } catch (error) {

        message.className =
          "modal-message error";

        message.textContent =
          "Unable to connect to the CRM.";

        console.error(error);


      } finally {

        button.disabled =
          false;

        button.textContent =
          "SAVE LEAD";

      }

    }
  );
function editLead(leadId) {

  try {

    const lead =
      currentLeads.find(function(item) {
        return item.leadId === leadId;
      });

    if (!lead) {
      alert("Lead record not found.");
      return;
    }

    document.getElementById("editLeadId").value =
      lead.leadId || "";

    document.getElementById("editLeadIdDisplay").textContent =
      lead.leadId || "—";

    document.getElementById("editLeadCustomerName").value =
      lead.customerName || "";

    document.getElementById("editLeadContactNumber").value =
      lead.contactNumber || "";

    document.getElementById("editLeadVehicle").value =
      lead.vehicle || "";

    document.getElementById("editLeadYear").value =
      lead.year || "";

    document.getElementById("editLeadPlate").value =
      lead.plateNumber || "";

    document.getElementById("editLeadBranch").value =
      lead.branchId || "";

    document.getElementById("editLeadSource").value =
      lead.inquirySource || "";

    document.getElementById("editLeadService").value =
      lead.service || "";

    document.getElementById("editLeadStatus").value =
      lead.status || "Interested";

    document.getElementById("editLeadAssignedPm").value =
      lead.assignedPm || "";

    document.getElementById("editLeadBookedBy").value =
      lead.bookedBy || "";

    document.getElementById("editLeadConcern").value =
      lead.concern || "";

    document.getElementById("editLeadAppointmentDate").value =
      formatDateForInput(
        lead.appointmentDate
      );

    document.getElementById("editLeadAppointmentTime").value =
  lead.appointmentTime || "";

    const message =
      document.getElementById("editLeadMessage");

    message.className = "modal-message";
    message.textContent = "";

    toggleEditLeadAppointmentDate();

    document
      .getElementById("editLeadModal")
      .classList.add("show");

  } catch (error) {

    alert(
      "EDIT ERROR\n\n" +
      error.message
    );

    console.error(error);
  }
}

function closeEditLeadModal() {

  const modal =
    document.getElementById("editLeadModal");

  if (modal) {
    modal.classList.remove("show");
    modal.style.display = "";
  }
}


function toggleEditLeadAppointmentDate() {

  const status =
    document
      .getElementById("editLeadStatus")
      .value;

  const appointmentGroup =
    document.getElementById(
      "editLeadAppointmentGroup"
    );

  const appointmentTimeGroup =
    document.getElementById(
      "editLeadAppointmentTimeGroup"
    );

  const bookedByGroup =
    document.getElementById(
      "editLeadBookedByGroup"
    );

  const appointmentInput =
    document.getElementById(
      "editLeadAppointmentDate"
    );

  const appointmentTimeInput =
    document.getElementById(
      "editLeadAppointmentTime"
    );

  if (
    status === "Booked" ||
    status === "Rescheduled"
  ) {

    appointmentGroup.style.display = "block";
    appointmentTimeGroup.style.display = "block";
    bookedByGroup.style.display = "block";

    appointmentInput.required = true;
    appointmentTimeInput.required = true;

  } else {

    appointmentGroup.style.display = "none";
    appointmentTimeGroup.style.display = "none";
    bookedByGroup.style.display = "none";

    appointmentInput.required = false;
    appointmentTimeInput.required = false;
  }
}

function formatDateForInput(value) {

  if (!value) {
    return "";
  }

  // Already YYYY-MM-DD
  const text = String(value).trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return text;
  }

  const date = new Date(value);

  if (isNaN(date.getTime())) {
    return "";
  }

  const year =
    date.getFullYear();

  const month =
    String(date.getMonth() + 1)
      .padStart(2, "0");

  const day =
    String(date.getDate())
      .padStart(2, "0");

  return year + "-" + month + "-" + day;
}


document
  .getElementById("editLeadForm")
  .addEventListener(
    "submit",
    async function(event) {

      event.preventDefault();

      if (!currentUser) {
        return;
      }

      const leadId =
        document
          .getElementById(
            "editLeadId"
          )
          .value;

      const button =
        document.getElementById(
          "updateLeadButton"
        );

      const message =
        document.getElementById(
          "editLeadMessage"
        );


      const updates = {

        customerName:
          document
            .getElementById(
              "editLeadCustomerName"
            )
            .value
            .trim(),

        contactNumber:
          document
            .getElementById(
              "editLeadContactNumber"
            )
            .value
            .trim(),

        vehicle:
          document
            .getElementById(
              "editLeadVehicle"
            )
            .value
            .trim(),

        year:
          document
            .getElementById(
              "editLeadYear"
            )
            .value
            .trim(),

        plateNumber:
          document
            .getElementById(
              "editLeadPlate"
            )
            .value
            .trim(),

        branchId:
          document
            .getElementById(
              "editLeadBranch"
            )
            .value,

        inquirySource:
          document
            .getElementById(
              "editLeadSource"
            )
            .value,

        service:
          document
            .getElementById(
              "editLeadService"
            )
            .value,

        status:
          document
            .getElementById(
              "editLeadStatus"
            )
            .value,

        assignedPm:
          document
            .getElementById(
              "editLeadAssignedPm"
            )
            .value
            .trim(),

        bookedBy:
          document
            .getElementById(
              "editLeadBookedBy"
            )
            .value
            .trim(),

        appointmentDate:
          document
            .getElementById(
              "editLeadAppointmentDate"
            )
            .value,

        appointmentTime:
          document
            .getElementById(
              "editLeadAppointmentTime"
            )
            .value,

        concern:
          document
            .getElementById(
              "editLeadConcern"
            )
            .value
            .trim()

      };


      // =========================
      // CLIENT VALIDATION
      // =========================

      if (
        (
          updates.status === "Booked" ||
          updates.status === "Rescheduled"
        ) &&
        !updates.appointmentDate
      ) {

        message.className =
          "modal-message error";

        message.textContent =
          "Appointment Date is required.";

        return;

      }


      // =========================
      // SAVING STATE
      // =========================

      message.className =
        "modal-message";

      message.textContent =
        "";

      button.disabled =
        true;

      button.textContent =
        "SAVING...";


      // =========================
      // API
      // =========================

      try {

        const result =
          await crmApi(
            "updateLead",
            {
              leadId:
                leadId,

              leadData:
                updates
            }
          );


        if (
          !result ||
          !result.success
        ) {

          message.className =
            "modal-message error";

          message.textContent =
            result && result.message
              ? result.message
              : "Unable to update lead.";

          return;

        }


        message.className =
          "modal-message success";

        message.textContent =
          "Lead updated successfully.";


        setTimeout(
          function() {

            closeEditLeadModal();

            // Reload updated lead data
            loadLeads();

          },
          500
        );


      } catch (error) {

        message.className =
          "modal-message error";

        message.textContent =
          error && error.message
            ? error.message
            : "Unable to update lead.";

        console.error(error);


      } finally {

        button.disabled =
          false;

        button.textContent =
          "SAVE CHANGES";

      }

    }
  );

  // =========================
// REQUESTS MODULE
// =========================

let currentRequests = [];

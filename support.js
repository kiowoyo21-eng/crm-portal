/* =========================================================
   SHARED SUPPORT MODULE
========================================================= */

let currentSupportTickets = [];
let filteredSupportTickets = [];
let selectedSupportTicketId = null;

const SUPPORT_MODULE_VIEWS = {

  "Dashboard": [
    "Dashboard Overview",
    "KPI Cards",
    "Today's Appointments",
    "Appointment Weekly"
  ],

  "Leads": [
    "Lead List",
    "Add Lead",
    "Edit Lead",
    "Lead Filters",
    "Vehicle Search"
  ],

  "Appointments": [
    "Appointment Calendar",
    "Appointment Date View",
    "Appointment Details",
    "Booking",
    "Rescheduling"
  ],

  "Requests": [
    "Request List",
    "New Request",
    "Request Details"
  ],

  "Reports": [
    "Reports Overview",
    "Report Filters",
    "Appointment Outcomes",
    "Branch Performance",
    "Inquiry Source Performance",
    "PM Performance",
    "Booked By Performance",
    "Commission Report",
    "Follow-Up Report",
    "Vehicle Insights"
  ],

  "Opportunities": [
    "Opportunity List",
    "Opportunity Details",
    "Create Opportunity",
    "Quotation"
  ],

  "Suppliers": [
    "Supplier List",
    "Add Supplier",
    "Edit Supplier"
  ],

  "Products": [
    "Product List",
    "Add Product",
    "Edit Product",
    "Inventory"
  ],

  "Employees / Attendance": [
    "Employee List",
    "Employee Details",
    "Attendance",
    "DTR"
  ],

  "Approvals / Requests": [
    "Approval List",
    "Request Review",
    "Request Details"
  ],

  "Employees": [
    "Employee List",
    "Employee Details",
    "Add Employee",
    "Edit Employee"
  ],

  "Attendance / DTR": [
    "Attendance List",
    "Daily Time Record",
    "Attendance Details"
  ],

  "Payroll": [
    "Payroll List",
    "Payroll Details",
    "Payroll Processing"
  ],

  "Users / Accounts": [
    "User List",
    "Create Account",
    "Edit Account",
    "Login / Authentication"
  ],

  "Roles & Permissions": [
    "Role List",
    "Permissions",
    "Access Control"
  ],

  "Branches": [
    "Branch List",
    "Branch Details",
    "Branch Configuration"
  ],

  "System Configuration": [
    "General Settings",
    "System Configuration"
  ],

  "System Logs": [
    "System Log List",
    "Log Details",
    "Log Filters"
  ],

  "Other": [
    "General CRM",
    "Navigation",
    "Interface / Design",
    "Other"
  ]

};

function populateSupportModuleOptions() {

  const moduleSelect =
    document.getElementById(
      "newSupportModule"
    );

  const viewSelect =
    document.getElementById(
      "newSupportViewName"
    );


  if (
    !moduleSelect ||
    !viewSelect
  ) {
    return;
  }


  moduleSelect.innerHTML = `
    <option value="">
      Select module
    </option>
  `;


  viewSelect.innerHTML = `
    <option value="">
      Select module first
    </option>
  `;


  viewSelect.disabled = true;


  if (
    !currentUser ||
    !currentUser.systemRole
  ) {
    return;
  }


  const role =
    String(
      currentUser.systemRole || ""
    ).trim();


  const modules =
    (
      CRM_ROLE_MENUS[role] || []
    )
      .filter(
        function(moduleName) {

          return (
            moduleName !== "Support" &&
            moduleName !== "Support 🎫"
          );

        }
      );


  modules.forEach(
    function(moduleName) {

      const option =
        document.createElement(
          "option"
        );

      option.value =
        moduleName;

      option.textContent =
        moduleName;

      moduleSelect.appendChild(
        option
      );

    }
  );


  const otherOption =
    document.createElement(
      "option"
    );

  otherOption.value =
    "Other";

  otherOption.textContent =
    "Other";

  moduleSelect.appendChild(
    otherOption
  );

}

function updateSupportViewOptions() {

  const moduleSelect =
    document.getElementById(
      "newSupportModule"
    );

  const viewSelect =
    document.getElementById(
      "newSupportViewName"
    );


  if (
    !moduleSelect ||
    !viewSelect
  ) {
    return;
  }


  const moduleName =
    String(
      moduleSelect.value || ""
    ).trim();


  viewSelect.innerHTML =
    "";


  if (!moduleName) {

    viewSelect.disabled =
      true;

    viewSelect.innerHTML = `
      <option value="">
        Select module first
      </option>
    `;

    return;
  }


  const views =
    SUPPORT_MODULE_VIEWS[
      moduleName
    ] || [
      "General"
    ];


  viewSelect.disabled =
    false;


  const defaultOption =
    document.createElement(
      "option"
    );

  defaultOption.value =
    "";

  defaultOption.textContent =
    "Select view";

  viewSelect.appendChild(
    defaultOption
  );


  views.forEach(
    function(viewName) {

      const option =
        document.createElement(
          "option"
        );

      option.value =
        viewName;

      option.textContent =
        viewName;

      viewSelect.appendChild(
        option
      );

    }
  );

}


/* =========================================================
   LOAD SUPPORT
========================================================= */

async function loadSupportTickets() {

  const tableBody =
    document.getElementById(
      "supportTicketsTableBody"
    );

  if (!tableBody) {
    return;
  }


  if (
    !currentUser ||
    !currentUser.userId
  ) {

    tableBody.innerHTML = `
      <tr>
        <td colspan="8" class="table-empty">
          User session not found.
        </td>
      </tr>
    `;

    return;
  }


  tableBody.innerHTML = `
    <tr>
      <td colspan="8" class="table-empty">
        Loading support tickets...
      </td>
    </tr>
  `;


  try {

    const result =
      await crmApi(
        "getSupportTickets"
      );


    if (
      !result ||
      !result.success
    ) {

      tableBody.innerHTML = `
        <tr>
          <td colspan="8" class="table-empty">
            ${
              escapeHtml(
                result &&
                result.message
                  ? result.message
                  : "Unable to load support tickets."
              )
            }
          </td>
        </tr>
      `;

      return;
    }


    currentSupportTickets =
      result.tickets || [];


    filteredSupportTickets =
      currentSupportTickets.slice();


    renderSupportKPIs();

    filterSupportTickets();


  } catch (error) {

    console.error(
      "Support load error:",
      error
    );


    tableBody.innerHTML = `
      <tr>
        <td colspan="8" class="table-empty">
          Unable to connect to the CRM.
        </td>
      </tr>
    `;

  }

}


/* =========================================================
   KPI
========================================================= */

function renderSupportKPIs() {

  let open = 0;
  let inProgress = 0;
  let resolved = 0;


  currentSupportTickets.forEach(
    function(ticket) {

      const status =
        String(
          ticket.status || ""
        )
          .trim()
          .toLowerCase();


      if (status === "open") {
        open++;
      }


      if (status === "in progress") {
        inProgress++;
      }


      if (status === "resolved") {
        resolved++;
      }

    }
  );


  setSupportText(
    "supportOpenCount",
    open
  );


  setSupportText(
    "supportInProgressCount",
    inProgress
  );


  setSupportText(
    "supportResolvedCount",
    resolved
  );

}


/* =========================================================
   FILTER
========================================================= */

function filterSupportTickets() {

  const searchElement =
    document.getElementById(
      "supportSearch"
    );


  const statusElement =
    document.getElementById(
      "supportStatusFilter"
    );


  const priorityElement =
    document.getElementById(
      "supportPriorityFilter"
    );


  const search =
    searchElement
      ? String(
          searchElement.value || ""
        )
          .trim()
          .toLowerCase()
      : "";


  const status =
    statusElement
      ? String(
          statusElement.value || ""
        ).trim()
      : "";


  const priority =
    priorityElement
      ? String(
          priorityElement.value || ""
        ).trim()
      : "";


  filteredSupportTickets =
    currentSupportTickets.filter(
      function(ticket) {

        const searchable =
          [
            ticket.ticketId,
            ticket.subject,
            ticket.description,
            ticket.branchId,
            ticket.userId,
            ticket.userRole,
            ticket.module,
            ticket.viewName,
            ticket.assignedIT,
            ticket.status,
            ticket.priority
          ]
            .join(" ")
            .toLowerCase();


        const matchesSearch =
          !search ||
          searchable.includes(
            search
          );


        const matchesStatus =
          !status ||
          String(
            ticket.status || ""
          ).trim() === status;


        const matchesPriority =
          !priority ||
          String(
            ticket.priority || ""
          ).trim() === priority;


        return (
          matchesSearch &&
          matchesStatus &&
          matchesPriority
        );

      }
    );


  renderSupportTicketsTable();

}


/* =========================================================
   TABLE
========================================================= */

function renderSupportTicketsTable() {

  const tableBody =
    document.getElementById(
      "supportTicketsTableBody"
    );


  if (!tableBody) {
    return;
  }


  if (
    !filteredSupportTickets.length
  ) {

    tableBody.innerHTML = `
      <tr>

        <td
          colspan="8"
          class="table-empty"
        >
          No support tickets found.
        </td>

      </tr>
    `;

    return;
  }


  tableBody.innerHTML =
    filteredSupportTickets
      .map(
        function(ticket) {

          const ticketId =
            escapeHtml(
              ticket.ticketId || "—"
            );


          const subject =
            escapeHtml(
              ticket.subject || "—"
            );


          const priority =
            escapeHtml(
              ticket.priority || "Normal"
            );


          const status =
            escapeHtml(
              ticket.status || "Open"
            );


          const branch =
            escapeHtml(
              ticket.branchId || "—"
            );


          const assignedIT =
            escapeHtml(
              ticket.assignedIT ||
              "Unassigned"
            );


          const createdAt =
            escapeHtml(
              formatSupportDisplayDate(
                ticket.createdAt
              )
            );


          const safeTicketId =
            escapeJs(
              ticket.ticketId || ""
            );


          return `
            <tr>

              <td>
                <strong class="support-ticket-id">
                  ${ticketId}
                </strong>
              </td>

              <td>
                <div class="support-table-subject">
                  ${subject}
                </div>

                <div class="support-table-meta">
                  ${escapeHtml(
                    ticket.module ||
                    "General"
                  )}
                </div>
              </td>

              <td>
                <span
                  class="
                    support-priority-badge
                    support-priority-${supportClassName(
                      ticket.priority
                    )}
                  "
                >
                  ${priority}
                </span>
              </td>

              <td>
                <span
                  class="
                    support-status-badge
                    support-status-${supportClassName(
                      ticket.status
                    )}
                  "
                >
                  ${status}
                </span>
              </td>

              <td>
                ${branch}
              </td>

              <td>
                ${assignedIT}
              </td>

              <td>
                ${createdAt}
              </td>

              <td>

                <button
                  type="button"
                  class="secondary-action"
                  onclick="openSupportTicketDetails('${safeTicketId}')"
                >
                  VIEW
                </button>

              </td>

            </tr>
          `;

        }
      )
      .join("");

}


/* =========================================================
   NEW TICKET MODAL
========================================================= */

function openNewSupportTicketModal() {

  const modal =
    document.getElementById(
      "newSupportTicketModal"
    );


  const form =
    document.getElementById(
      "newSupportTicketForm"
    );


  const message =
    document.getElementById(
      "newSupportTicketMessage"
    );


  if (!modal) {
    return;
  }


  if (form) {
    form.reset();
  }

   populateSupportModuleOptions();


  const priority =
    document.getElementById(
      "newSupportPriority"
    );


  if (priority) {
    priority.value =
      "Normal";
  }

  if (message) {

    message.className =
      "modal-message";

    message.textContent =
      "";

  }


  modal.classList.add(
    "show"
  );

}


/* =========================================================
   CLOSE NEW TICKET
========================================================= */

function closeNewSupportTicketModal() {

  const modal =
    document.getElementById(
      "newSupportTicketModal"
    );


  if (modal) {

    modal.classList.remove(
      "show"
    );

  }

}


/* =========================================================
   SUBMIT NEW TICKET
========================================================= */

async function submitNewSupportTicket(
  event
) {

  if (event) {
    event.preventDefault();
  }


  if (
    !currentUser ||
    !currentUser.userId
  ) {

    return false;

  }


  const button =
    document.getElementById(
      "saveSupportTicketButton"
    );


  const message =
    document.getElementById(
      "newSupportTicketMessage"
    );


  const ticketData = {

    priority:
      getSupportInputValue(
        "newSupportPriority"
      ),

    module:
      getSupportInputValue(
        "newSupportModule"
      ),

    viewName:
      getSupportInputValue(
        "newSupportViewName"
      ),

    subject:
      getSupportInputValue(
        "newSupportSubject"
      ),

    description:
      getSupportInputValue(
        "newSupportDescription"
      )

  };


  if (!ticketData.subject) {

    showSupportMessage(
      message,
      "Subject is required.",
      "error"
    );

    return false;

  }


  if (!ticketData.description) {

    showSupportMessage(
      message,
      "Description is required.",
      "error"
    );

    return false;

  }


  if (button) {

    button.disabled =
      true;

    button.textContent =
      "SUBMITTING...";

  }


  showSupportMessage(
    message,
    "",
    ""
  );


  try {

    const result =
      await crmApi(
        "createSupportTicket",
        {
          ticketData:
            ticketData
        }
      );


    if (
      !result ||
      !result.success
    ) {

      showSupportMessage(
        message,
        result &&
        result.message
          ? result.message
          : "Unable to submit ticket.",
        "error"
      );


      return false;

    }


    showSupportMessage(
      message,
      "Support ticket " +
      (
        result.ticketId || ""
      ) +
      " created successfully.",
      "success"
    );


    setTimeout(
      function() {

        closeNewSupportTicketModal();

        loadSupportTickets();

      },
      600
    );


  } catch (error) {

    console.error(
      "Create support ticket error:",
      error
    );


    showSupportMessage(
      message,
      "Unable to connect to the CRM.",
      "error"
    );


  } finally {

    if (button) {

      button.disabled =
        false;

      button.textContent =
        "SUBMIT TICKET";

    }

  }


  return false;

}


/* =========================================================
   OPEN DETAILS
========================================================= */

function openSupportTicketDetails(
  ticketId
) {

  const ticket =
    currentSupportTickets.find(
      function(item) {

        return (
          String(
            item.ticketId || ""
          ).trim() ===
          String(
            ticketId || ""
          ).trim()
        );

      }
    );


  if (!ticket) {

    alert(
      "Support ticket not found."
    );

    return;

  }


  selectedSupportTicketId =
    ticket.ticketId;


  setSupportText(
    "supportDetailsTitle",
    ticket.subject || "Ticket Details"
  );


  setSupportText(
    "supportDetailsTicketId",
    ticket.ticketId || "—"
  );


  setSupportText(
    "supportDetailsStatus",
    ticket.status || "—"
  );


  setSupportText(
    "supportDetailsPriority",
    ticket.priority || "—"
  );


  setSupportText(
    "supportDetailsBranch",
    ticket.branchId || "—"
  );


  setSupportText(
    "supportDetailsRole",
    ticket.userRole || "—"
  );


  setSupportText(
    "supportDetailsModule",
    ticket.module || "—"
  );


  setSupportText(
    "supportDetailsView",
    ticket.viewName || "—"
  );


  setSupportText(
    "supportDetailsAssignedIT",
    ticket.assignedIT ||
    "Unassigned"
  );


  setSupportText(
    "supportDetailsCreatedAt",
    formatSupportDisplayDate(
      ticket.createdAt
    )
  );


  setSupportText(
    "supportDetailsDescription",
    ticket.description || "—"
  );


  /* =========================
     RESOLUTION DISPLAY
  ========================= */

  const resolutionDisplay =
    document.getElementById(
      "supportResolutionDisplay"
    );


  if (
    ticket.resolutionNotes ||
    ticket.resolvedBy ||
    ticket.resolvedAt
  ) {

    if (resolutionDisplay) {

      resolutionDisplay.style.display =
        "block";

    }


    setSupportText(
      "supportDetailsResolutionNotes",
      ticket.resolutionNotes || "—"
    );


    setSupportText(
      "supportDetailsResolvedBy",
      ticket.resolvedBy
        ? "Resolved by: " +
          ticket.resolvedBy
        : "Resolved by: —"
    );


    setSupportText(
      "supportDetailsResolvedAt",
      ticket.resolvedAt
        ? formatSupportDisplayDate(
            ticket.resolvedAt
          )
        : "—"
    );


  } else {

    if (resolutionDisplay) {

      resolutionDisplay.style.display =
        "none";

    }

  }


  /* =========================
     IT MANAGEMENT
  ========================= */

  const itManagement =
    document.getElementById(
      "supportITManagement"
    );


  const isIT =
    currentUser &&
    String(
      currentUser.systemRole || ""
    )
      .trim()
      .toUpperCase() ===
    "IT";


  if (
    itManagement &&
    isIT
  ) {

    itManagement.style.display =
      "block";


    setSupportInputValue(
      "supportITStatus",
      ticket.status || "Open"
    );


    setSupportInputValue(
      "supportITPriority",
      ticket.priority || "Normal"
    );


    setSupportInputValue(
      "supportITAssigned",
      ticket.assignedIT || ""
    );


    setSupportInputValue(
      "supportITResolutionNotes",
      ticket.resolutionNotes || ""
    );


    const message =
      document.getElementById(
        "supportITMessage"
      );


    if (message) {

      message.className =
        "modal-message";

      message.textContent =
        "";

    }


  } else if (itManagement) {

    itManagement.style.display =
      "none";

  }


  const modal =
    document.getElementById(
      "supportTicketDetailsModal"
    );


  if (modal) {

    modal.classList.add(
      "show"
    );

  }

}


/* =========================================================
   CLOSE DETAILS
========================================================= */

function closeSupportTicketDetails() {

  const modal =
    document.getElementById(
      "supportTicketDetailsModal"
    );


  if (modal) {

    modal.classList.remove(
      "show"
    );

  }


  selectedSupportTicketId =
    null;

}


/* =========================================================
   IT UPDATE
========================================================= */

async function saveSupportTicketUpdate() {

  if (
    !currentUser ||
    String(
      currentUser.systemRole || ""
    )
      .trim()
      .toUpperCase() !== "IT"
  ) {

    return;

  }


  if (!selectedSupportTicketId) {

    return;

  }


  const button =
    document.getElementById(
      "updateSupportTicketButton"
    );


  const message =
    document.getElementById(
      "supportITMessage"
    );


  const updates = {

    status:
      getSupportInputValue(
        "supportITStatus"
      ),

    priority:
      getSupportInputValue(
        "supportITPriority"
      ),

    assignedIT:
      getSupportInputValue(
        "supportITAssigned"
      ),

    resolutionNotes:
      getSupportInputValue(
        "supportITResolutionNotes"
      )

  };


  if (button) {

    button.disabled =
      true;

    button.textContent =
      "SAVING...";

  }


  showSupportMessage(
    message,
    "",
    ""
  );


  try {

    const result =
      await crmApi(
        "updateSupportTicket",
        {
          ticketId:
            selectedSupportTicketId,

          updates:
            updates
        }
      );


    if (
      !result ||
      !result.success
    ) {

      showSupportMessage(
        message,
        result &&
        result.message
          ? result.message
          : "Unable to update ticket.",
        "error"
      );

      return;

    }


    showSupportMessage(
      message,
      "Support ticket updated successfully.",
      "success"
    );


    const ticketId =
      selectedSupportTicketId;


    await loadSupportTickets();


    setTimeout(
      function() {

        openSupportTicketDetails(
          ticketId
        );

      },
      250
    );


  } catch (error) {

    console.error(
      "Support update error:",
      error
    );


    showSupportMessage(
      message,
      "Unable to connect to the CRM.",
      "error"
    );


  } finally {

    if (button) {

      button.disabled =
        false;

      button.textContent =
        "SAVE UPDATE";

    }

  }

}


/* =========================================================
   HELPERS
========================================================= */

function setSupportText(
  elementId,
  value
) {

  const element =
    document.getElementById(
      elementId
    );


  if (element) {

    element.textContent =
      value === undefined ||
      value === null ||
      value === ""
        ? "—"
        : String(value);

  }

}


function getSupportInputValue(
  elementId
) {

  const element =
    document.getElementById(
      elementId
    );


  if (!element) {
    return "";
  }


  return String(
    element.value || ""
  ).trim();

}


function setSupportInputValue(
  elementId,
  value
) {

  const element =
    document.getElementById(
      elementId
    );


  if (element) {

    element.value =
      value === undefined ||
      value === null
        ? ""
        : String(value);

  }

}


function showSupportMessage(
  element,
  text,
  type
) {

  if (!element) {
    return;
  }


  element.className =
    "modal-message";


  if (type) {

    element.classList.add(
      type
    );

  }


  element.textContent =
    text || "";

}


function supportClassName(
  value
) {

  return String(
    value || ""
  )
    .trim()
    .toLowerCase()
    .replace(
      /[^a-z0-9]+/g,
      "-"
    )
    .replace(
      /^-+|-+$/g,
      ""
    );

}


function formatSupportDisplayDate(
  value
) {

  if (!value) {
    return "—";
  }


  let text =
    String(value).trim();


  /*
   * Backend currently returns:
   * yyyy-MM-dd HH:mm:ss
   */

  if (
    /^\d{4}-\d{2}-\d{2}\s/.test(
      text
    )
  ) {

    text =
      text.replace(
        " ",
        "T"
      );

  }


  const date =
    new Date(text);


  if (
    isNaN(
      date.getTime()
    )
  ) {

    return String(value);

  }


  return date.toLocaleString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit"
    }
  );

}

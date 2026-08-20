let currentRequests =
  [];

let selectedRequestId =
  null;


async function loadRequests() {

  const tableBody =
    document.getElementById(
      "requestsTableBody"
    );

  if (!tableBody) {
    return;
  }

  tableBody.innerHTML = `
    <tr>
      <td
        colspan="8"
        class="table-empty"
      >
        Loading requests...
      </td>
    </tr>
  `;

  try {

    const result =
      await crmApi(
        "getRequestsData"
      );

    if (
      !result ||
      !result.success
    ) {

      tableBody.innerHTML = `
        <tr>
          <td
            colspan="8"
            class="table-empty"
          >
            Unable to load requests.
          </td>
        </tr>
      `;

      return;
    }

    currentRequests =
      result.requests || [];

    renderRequestsKPIs();

    renderRequestsTable();

  } catch (error) {

    console.error(
      "Unable to load requests:",
      error
    );

    tableBody.innerHTML = `
      <tr>
        <td
          colspan="8"
          class="table-empty"
        >
          Unable to load requests.
        </td>
      </tr>
    `;

  }

}
// =========================
// REQUEST KPI
// =========================

function renderRequestsKPIs() {

  let pending = 0;
  let inProgress = 0;
  let resolved = 0;


  currentRequests.forEach(
    function(request) {

      const status =
        String(
          request.status || ""
        )
          .trim()
          .toLowerCase();


      if (status === "pending") {
        pending++;
      }


      if (status === "in progress") {
        inProgress++;
      }


      if (status === "resolved") {
        resolved++;
      }

    }
  );


  document
    .getElementById(
      "requestPendingCount"
    )
    .textContent =
    pending;


  document
    .getElementById(
      "requestInProgressCount"
    )
    .textContent =
    inProgress;


  document
    .getElementById(
      "requestResolvedCount"
    )
    .textContent =
    resolved;

}


// =========================
// REQUEST TABLE
// =========================

function renderRequestsTable() {

  const tableBody =
    document.getElementById(
      "requestsTableBody"
    );


  if (!currentRequests.length) {

    tableBody.innerHTML = `
      <tr>

        <td
          colspan="8"
          class="table-empty"
        >
          No requests submitted yet.
        </td>

      </tr>
    `;

    return;
  }


  tableBody.innerHTML =
    currentRequests
      .map(function(request) {

        const requestId =
          escapeHtml(
            request.requestId || "—"
          );

        const type =
          escapeHtml(
            request.requestType || "—"
          );

        const subject =
          escapeHtml(
            request.subject || "—"
          );

        const priority =
          escapeHtml(
            request.priority || "Normal"
          );

        const status =
          escapeHtml(
            request.status || "Pending"
          );

        const createdAt =
          escapeHtml(
            request.createdAt || "—"
          );

        const updatedBy =
          escapeHtml(
            request.updatedBy || "—"
          );


        return `
          <tr>

            <td>
              ${requestId}
            </td>

            <td>
              ${type}
            </td>

            <td>
              ${subject}
            </td>

            <td>
              <span class="request-priority-badge">
                ${priority}
              </span>
            </td>

            <td>
              <span class="request-status-badge">
                ${status}
              </span>
            </td>

            <td>
              ${createdAt}
            </td>

            <td>
              ${updatedBy}
            </td>

            <td>

              <button
                type="button"
                class="secondary-action"
                onclick="openRequestDetails(
                  '${request.requestId}'
                )"
              >
                VIEW
              </button>

            </td>

          </tr>
        `;

      })
      .join("");

}

function openRequestDetails(
  requestId
) {

  const request =
    currentRequests.find(
      function(item) {

        return String(
          item.requestId || ""
        ) === String(
          requestId || ""
        );

      }
    );


  if (!request) {

    alert(
      "Request details not found."
    );

    return;

  }


  // ========================================
  // SELECTED REQUEST
  // ========================================

  selectedRequestId =
    request.requestId;


  // ========================================
  // BASIC DETAILS
  // ========================================

  document
    .getElementById(
      "requestDetailsTitle"
    )
    .textContent =
    request.subject || "Request";


  document
    .getElementById(
      "requestDetailsId"
    )
    .textContent =
    request.requestId || "—";


  document
    .getElementById(
      "requestDetailsType"
    )
    .textContent =
    request.requestType || "—";


  document
    .getElementById(
      "requestDetailsPriority"
    )
    .textContent =
    request.priority || "—";


  document
    .getElementById(
      "requestDetailsStatus"
    )
    .textContent =
    request.status || "—";


  document
    .getElementById(
      "requestDetailsActionRequired"
    )
    .textContent =
    request.actionRequired || "PROCESS";


  document
    .getElementById(
      "requestDetailsBranch"
    )
    .textContent =
    request.branchId || "—";


  document
    .getElementById(
      "requestDetailsCreated"
    )
    .textContent =
    request.createdAt || "—";


  document
    .getElementById(
      "requestDetailsCreatedBy"
    )
    .textContent =
    request.requestedBy || "—";


  document
    .getElementById(
      "requestDetailsTargetRole"
    )
    .textContent =
    request.targetRole || "—";


  document
    .getElementById(
      "requestDetailsAssignedTo"
    )
    .textContent =
    request.assignedTo || "Unassigned";


  document
    .getElementById(
      "requestDetailsDescription"
    )
    .textContent =
    request.description || "—";


  // ========================================
  // FINAL PROCESSING INFORMATION
  // ========================================

  const resolutionSection =
    document.getElementById(
      "requestResolutionSection"
    );


  const hasProcessingInfo =
    request.resolvedBy ||
    request.resolvedAt ||
    request.processedBy ||
    request.processedAt ||
    request.resolutionRemarks ||
    request.decisionRemarks;


  if (
    resolutionSection
  ) {

    resolutionSection.style.display =
      hasProcessingInfo
        ? "block"
        : "none";

  }


  document
    .getElementById(
      "requestDetailsResolvedBy"
    )
    .textContent =
    request.resolvedBy || "—";


  document
    .getElementById(
      "requestDetailsResolvedAt"
    )
    .textContent =
    request.resolvedAt || "—";


  document
    .getElementById(
      "requestDetailsProcessedBy"
    )
    .textContent =
    request.processedBy || "—";


  document
    .getElementById(
      "requestDetailsProcessedAt"
    )
    .textContent =
    request.processedAt || "—";


  // ========================================
  // RESOLUTION REMARKS
  // ========================================

  const resolutionRemarksGroup =
    document.getElementById(
      "requestDetailsResolutionRemarksGroup"
    );


  const resolutionRemarks =
    document.getElementById(
      "requestDetailsResolutionRemarks"
    );


  if (
    request.resolutionRemarks
  ) {

    resolutionRemarksGroup.style.display =
      "block";

    resolutionRemarks.textContent =
      request.resolutionRemarks;

  } else {

    resolutionRemarksGroup.style.display =
      "none";

    resolutionRemarks.textContent =
      "—";

  }


  // ========================================
  // DECISION REMARKS
  // ========================================

  const decisionRemarksGroup =
    document.getElementById(
      "requestDetailsDecisionRemarksGroup"
    );


  const decisionRemarks =
    document.getElementById(
      "requestDetailsDecisionRemarks"
    );


  if (
    request.decisionRemarks
  ) {

    decisionRemarksGroup.style.display =
      "block";

    decisionRemarks.textContent =
      request.decisionRemarks;

  } else {

    decisionRemarksGroup.style.display =
      "none";

    decisionRemarks.textContent =
      "—";

  }


  // ========================================
  // CURRENT USER / ROLE
  // ========================================

  const currentRole =
    String(
      currentUser &&
      (
        currentUser.systemRole ||
        currentUser.role
      ) ||
      ""
    )
      .trim()
      .toUpperCase();


  const currentBranch =
    String(
      currentUser &&
      (
        currentUser.branchId ||
        currentUser.branch
      ) ||
      ""
    ).trim();


  const targetRole =
    String(
      request.targetRole || ""
    )
      .trim()
      .toUpperCase();


  const targetBranch =
    String(
      request.targetBranchId ||
      request.branchId ||
      ""
    ).trim();


  // ========================================
  // CAN CURRENT USER PROCESS?
  // ========================================

  let canProcess =
    false;


  // Direk = global processor
  if (
    currentRole === "DIREK"
  ) {

    canProcess =
      true;

  }


  // IT-targeted requests
  if (
    currentRole === "IT" &&
    targetRole === "IT"
  ) {

    canProcess =
      true;

  }


  // HR-targeted requests
  if (
    currentRole === "HR" &&
    targetRole === "HR"
  ) {

    canProcess =
      true;

  }


  // BM-targeted requests
  // must belong to same branch
  if (
    currentRole === "BM" &&
    targetRole === "BM" &&
    targetBranch === currentBranch
  ) {

    canProcess =
      true;

  }


  // ========================================
  // PROCESSING CONTROLS
  // ========================================

  const processingSection =
    document.getElementById(
      "requestProcessingSection"
    );


  const processButton =
    document.getElementById(
      "requestProcessButton"
    );


  const statusSelect =
    document.getElementById(
      "requestProcessStatus"
    );


  const assignedInput =
    document.getElementById(
      "requestProcessAssignedTo"
    );


  const resolutionInput =
    document.getElementById(
      "requestProcessResolutionRemarks"
    );


  const decisionInput =
    document.getElementById(
      "requestProcessDecisionRemarks"
    );


  const resolutionInputGroup =
    document.getElementById(
      "requestResolutionRemarksGroup"
    );


  const decisionInputGroup =
    document.getElementById(
      "requestDecisionRemarksGroup"
    );


  const processMessage =
    document.getElementById(
      "requestProcessMessage"
    );


  // Reset message
  if (
    processMessage
  ) {

    processMessage.textContent =
      "";

    processMessage.className =
      "modal-message";

  }


  if (
    canProcess
  ) {

    processingSection.style.display =
      "block";

    processButton.style.display =
      "inline-flex";


    // ======================================
    // BUILD STATUS OPTIONS
    // ======================================

    const actionRequired =
      String(
        request.actionRequired ||
        "PROCESS"
      )
        .trim()
        .toUpperCase();


    let statuses =
      [];


    if (
      actionRequired ===
      "APPROVAL"
    ) {

      statuses = [
        "Pending",
        "Approved",
        "Rejected"
      ];


      resolutionInputGroup.style.display =
        "none";

      decisionInputGroup.style.display =
        "block";


    } else {

      statuses = [
        "Pending",
        "In Progress",
        "Resolved"
      ];


      resolutionInputGroup.style.display =
        "block";

      decisionInputGroup.style.display =
        "none";

    }


    statusSelect.innerHTML =
      "";


    statuses.forEach(
      function(status) {

        const option =
          document.createElement(
            "option"
          );


        option.value =
          status;

        option.textContent =
          status;


        statusSelect.appendChild(
          option
        );

      }
    );


    // Current status
    if (
      statuses.includes(
        request.status
      )
    ) {

      statusSelect.value =
        request.status;

    }


    // Existing assignment
    assignedInput.value =
      request.assignedTo || "";


    // Existing remarks
    resolutionInput.value =
      request.resolutionRemarks || "";


    decisionInput.value =
      request.decisionRemarks || "";


  } else {

    // Requester / unauthorized user:
    // details only.

    processingSection.style.display =
      "none";

    processButton.style.display =
      "none";

  }


  // ========================================
  // OPEN MODAL
  // ========================================

  document
    .getElementById(
      "requestDetailsModal"
    )
    .classList.add(
      "show"
    );

}

function closeRequestDetails() {

  document
    .getElementById(
      "requestDetailsModal"
    )
    .classList.remove("show");

}

function openNewRequestModal() {

  const modal =
    document.getElementById(
      "newRequestModal"
    );

  const form =
    document.getElementById(
      "newRequestForm"
    );

  const message =
    document.getElementById(
      "newRequestMessage"
    );

  form.reset();

  document
    .getElementById(
      "newRequestPriority"
    )
    .value =
    "Normal";

  message.className =
    "modal-message";

  message.textContent =
    "";

  modal.classList.add(
    "show"
  );

}


function closeNewRequestModal() {

  const modal =
    document.getElementById(
      "newRequestModal"
    );

  modal.classList.remove(
    "show"
  );

}

async function submitNewRequest(
  event
) {

  event.preventDefault();

  if (!currentUser) {
    return false;
  }

  const button =
    document.getElementById(
      "saveRequestButton"
    );

  const message =
    document.getElementById(
      "newRequestMessage"
    );

  const requestData = {

    requestType:
      document
        .getElementById(
          "newRequestType"
        )
        .value,

    subject:
      document
        .getElementById(
          "newRequestSubject"
        )
        .value
        .trim(),

    description:
      document
        .getElementById(
          "newRequestDescription"
        )
        .value
        .trim(),

    priority:
      document
        .getElementById(
          "newRequestPriority"
        )
        .value

  };


  button.disabled =
    true;

  button.textContent =
    "SUBMITTING...";

  message.className =
    "modal-message";

  message.textContent =
    "";


  try {

    const result =
      await crmApi(
        "createRequest",
        {
          requestData:
            requestData
        }
      );


    if (
      !result ||
      !result.success
    ) {

      message.className =
        "modal-message error";

      message.textContent =
        result &&
        result.message
          ? result.message
          : "Unable to submit request.";

      return false;
    }


    message.className =
      "modal-message success";

    message.textContent =
      "Request submitted successfully.";


    setTimeout(
      function() {

        closeNewRequestModal();

        loadRequests();

      },
      500
    );


  } catch (error) {

    message.className =
      "modal-message error";

    message.textContent =
      error &&
      error.message
        ? error.message
        : "Unable to submit request.";

    console.error(error);


  } finally {

    button.disabled =
      false;

    button.textContent =
      "SUBMIT REQUEST";

  }


  return false;

}


    /* =========================
       LOGOUT
       ========================= */

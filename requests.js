function loadRequests() {

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


  google.script.run

    .withSuccessHandler(function(result) {

      if (!result || !result.success) {

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

    })

    .withFailureHandler(function(error) {

      console.error(error);

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

    })

    .getRequestsData(
      currentUser.userId
    );

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

function openRequestDetails(requestId) {

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
      "requestDetailsDescription"
    )
    .textContent =
    request.description || "—";


  const resolutionSection =
    document.getElementById(
      "requestResolutionSection"
    );


  if (
    request.resolvedBy ||
    request.resolvedAt
  ) {

    resolutionSection.style.display =
      "block";

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

  } else {

    resolutionSection.style.display =
      "none";

  }


  document
    .getElementById(
      "requestDetailsModal"
    )
    .classList.add("show");

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

function submitNewRequest(event) {

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


  button.disabled = true;

  button.textContent =
    "SUBMITTING...";

  message.className =
    "modal-message";

  message.textContent =
    "";


  google.script.run

    .withSuccessHandler(
      function(result) {

        button.disabled = false;

        button.textContent =
          "SUBMIT REQUEST";


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

          return;
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

      }
    )

    .withFailureHandler(
      function(error) {

        button.disabled = false;

        button.textContent =
          "SUBMIT REQUEST";

        message.className =
          "modal-message error";

        message.textContent =
          error &&
          error.message
            ? error.message
            : "Unable to submit request.";

        console.error(error);

      }
    )

    .createRequest(
      currentUser.userId,
      requestData
    );


  return false;
}


    /* =========================
       LOGOUT
       ========================= */

async function loadAppointmentsCalendar() {

  if (!currentUser) {
    return;
  }


  const grid =
    document.getElementById(
      "appointmentCalendarGrid"
    );


  if (grid) {

    grid.innerHTML = `
      <div
        class="calendar-empty"
        style="grid-column: 1 / -1;"
      >
        Loading appointments...
      </div>
    `;

  }


  try {

    // =========================
    // LOAD THROUGH CRM API
    // =========================

    const result =
      await crmApi(
        "getAppointmentsData"
      );


    if (
      !result ||
      !result.success
    ) {

      console.error(
        "Appointments data failed:",
        result
      );


      if (grid) {

        grid.innerHTML = `
          <div
            class="calendar-empty"
            style="grid-column: 1 / -1;"
          >
            Unable to load appointments.
          </div>
        `;

      }


      // Invalid / expired API session
      if (
        result &&
        (
          result.message ===
            "Invalid session." ||

          result.message ===
            "Session expired." ||

          result.message ===
            "Session token is required."
        )
      ) {

        clearLocalCrmLogin();

      }


      return;

    }


    // =========================
    // SAVE APPOINTMENTS
    // =========================

    currentAppointments =
      result.appointments || [];


    // =========================
    // RENDER CALENDAR
    // =========================

    renderAppointmentsCalendar();


  } catch (error) {

    console.error(
      "Unable to load appointments:",
      error
    );


    if (grid) {

      grid.innerHTML = `
        <div
          class="calendar-empty"
          style="grid-column: 1 / -1;"
        >
          Unable to connect to the CRM.
        </div>
      `;

    }

  }

}


// =========================
// RENDER CALENDAR
// =========================

function renderAppointmentsCalendar() {

  const grid =
    document.getElementById(
      "appointmentCalendarGrid"
    );

  const title =
    document.getElementById(
      "appointmentCalendarTitle"
    );


  if (!grid || !title) {
    return;
  }


  const year =
    appointmentCalendarDate.getFullYear();

  const month =
    appointmentCalendarDate.getMonth();


  title.textContent =
    appointmentCalendarDate
      .toLocaleDateString(
        "en-US",
        {
          month: "long",
          year: "numeric"
        }
      );


  const firstDay =
    new Date(
      year,
      month,
      1
    );


  const lastDay =
    new Date(
      year,
      month + 1,
      0
    );


  const startingDay =
    firstDay.getDay();


  const daysInMonth =
    lastDay.getDate();


  const previousMonthLastDay =
    new Date(
      year,
      month,
      0
    ).getDate();


  const today =
    new Date();


  let html = "";


  // Always render 6 weeks / 42 cells
  for (let cell = 0; cell < 42; cell++) {

    let dayNumber;
    let cellYear = year;
    let cellMonth = month;
    let otherMonth = false;


    // PREVIOUS MONTH
    if (cell < startingDay) {

      dayNumber =
        previousMonthLastDay -
        startingDay +
        cell +
        1;

      cellMonth =
        month - 1;

      otherMonth = true;

    }

    // CURRENT MONTH
    else if (
      cell <
      startingDay + daysInMonth
    ) {

      dayNumber =
        cell -
        startingDay +
        1;

    }

    // NEXT MONTH
    else {

      dayNumber =
        cell -
        startingDay -
        daysInMonth +
        1;

      cellMonth =
        month + 1;

      otherMonth = true;

    }


    const cellDate =
      new Date(
        cellYear,
        cellMonth,
        dayNumber
      );


    cellYear =
      cellDate.getFullYear();

    cellMonth =
      cellDate.getMonth();


    const dateKey =
      formatCalendarDateKey(
        cellDate
      );


    const isToday =
      cellDate.getFullYear() ===
        today.getFullYear() &&

      cellDate.getMonth() ===
        today.getMonth() &&

      cellDate.getDate() ===
        today.getDate();


    const dateAppointments =
      currentAppointments.filter(
        function(item) {

          return (
            item.appointmentDate ===
            dateKey
          );

        }
      );


    const branchCounts =
      getAppointmentBranchCounts(
        dateAppointments
      );


    let branchHtml = "";


    Object.keys(branchCounts)
      .forEach(function(branchId) {

        const count =
          branchCounts[branchId];

        if (count <= 0) {
          return;
        }

        branchHtml += `
          <div class="calendar-branch-count">

            <span>
              ${escapeHtml(branchId)}
            </span>

            <strong>
              ${count}
            </strong>

          </div>
        `;

      });


    html += `
      <div
        class="calendar-day
          ${otherMonth ? "other-month" : ""}
          ${isToday ? "today" : ""}
        "
        onclick="openAppointmentDate(
          '${dateKey}'
        )"
      >

        <div class="calendar-day-number">
          ${dayNumber}
        </div>

        <div class="calendar-branch-counts">
          ${branchHtml}
        </div>

      </div>
    `;

  }


  grid.innerHTML = html;

}


// =========================
// BRANCH COUNTS
// =========================

function getAppointmentBranchCounts(
  appointments
) {

  const counts = {
    "UC-LP": 0,
    "UC-MD": 0,
    "UC-QC": 0,
    "MM-MD": 0
  };


  appointments.forEach(function(item) {

    if (
      Object.prototype
        .hasOwnProperty.call(
          counts,
          item.branchId
        )
    ) {

      counts[item.branchId]++;

    }

  });


  return counts;

}


// =========================
// DATE KEY
// =========================

function formatCalendarDateKey(date) {

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      date.getDate()
    ).padStart(2, "0");


  return (
    year +
    "-" +
    month +
    "-" +
    day
  );

}


// =========================
// MONTH NAVIGATION
// =========================

function changeAppointmentMonth(
  direction
) {

  appointmentCalendarDate =
    new Date(
      appointmentCalendarDate
        .getFullYear(),

      appointmentCalendarDate
        .getMonth() +
        direction,

      1
    );


  renderAppointmentsCalendar();

}


function goToAppointmentToday() {

  appointmentCalendarDate =
    new Date();


  renderAppointmentsCalendar();

}


// =========================
// CLICK DATE
// =========================

function openAppointmentDate(
  dateKey
) {

  const panel =
    document.getElementById(
      "selectedAppointmentDatePanel"
    );

  const title =
    document.getElementById(
      "selectedAppointmentDateTitle"
    );

  const content =
    document.getElementById(
      "selectedAppointmentDateContent"
    );


  if (!panel || !title || !content) {
    return;
  }


  const parts =
    dateKey.split("-");


  const selectedDate =
    new Date(
      Number(parts[0]),
      Number(parts[1]) - 1,
      Number(parts[2])
    );


  title.textContent =
    selectedDate.toLocaleDateString(
      "en-US",
      {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric"
      }
    );


  const appointments =
    currentAppointments.filter(
      function(item) {

        return (
          item.appointmentDate ===
          dateKey
        );

      }
    );


  renderSelectedDateAppointments(
    appointments,
    content
  );


  panel.style.display =
    "flex";

}


// =========================
// RENDER SELECTED DATE
// =========================

function renderSelectedDateAppointments(
  appointments,
  container
) {

  if (
    !appointments ||
    appointments.length === 0
  ) {

    container.innerHTML = `
      <div class="calendar-empty">
        No appointments scheduled
        for this date.
      </div>
    `;

    return;
  }


  const branches = [
    {
      id: "UC-LP",
      name: "UC LAS PIÑAS"
    },
    {
      id: "UC-MD",
      name: "UC MANDALUYONG"
    },
    {
      id: "UC-QC",
      name: "UC QUEZON CITY"
    },
    {
      id: "MM-MD",
      name: "MASTERMIND MANDALUYONG"
    }
  ];


  let html = "";


  branches.forEach(function(branch) {

    const branchAppointments =
      appointments
        .filter(function(item) {

          return (
            item.branchId ===
            branch.id
          );

        })
        .sort(function(a, b) {

          return String(
            a.appointmentTime || ""
          ).localeCompare(
            String(
              b.appointmentTime || ""
            )
          );

        });


    // Don't show empty branches
    if (
      branchAppointments.length === 0
    ) {
      return;
    }


    html += `
      <div class="appointment-branch-section">

        <div class="appointment-branch-title">
          ${branch.name}
          ·
          ${branchAppointments.length}
        </div>
    `;


    branchAppointments.forEach(
      function(item) {

        html += `
          <div
            class="appointment-day-item"
            onclick="openAppointmentDetails(
              '${escapeJs(
                item.appointmentId
              )}'
            )"
          >

            <div class="appointment-day-name">
              ${escapeHtml(
                item.customerName || "—"
              )}
            </div>

            <div class="appointment-day-vehicle">
              ${escapeHtml(
                item.vehicle || "—"
              )}
            </div>

            <div class="appointment-day-service">
              ${escapeHtml(
                item.service ||
                "Service not specified"
              )}
            </div>

          </div>
        `;

      }
    );


    html += `</div>`;

  });


  container.innerHTML =
    html ||
    `
      <div class="calendar-empty">
        No appointments scheduled
        for this date.
      </div>
    `;

}


// =========================
// CLOSE DATE PANEL
// =========================

function closeAppointmentDatePanel() {

  const panel =
    document.getElementById(
      "selectedAppointmentDatePanel"
    );

  if (panel) {
    panel.style.display = "none";
  }

}


// =========================
// APPOINTMENT DETAILS
// =========================

function openAppointmentDetails(
  appointmentId
) {

  const appointment =
    currentAppointments.find(
      function(item) {

        return (
          item.appointmentId ===
          appointmentId
        );

      }
    );

  if (!appointment) {
    return;
  }


  document
    .getElementById(
      "appointmentDetailsId"
    )
    .textContent =
    appointment.appointmentId || "—";


  document
    .getElementById(
      "appointmentDetailsCustomer"
    )
    .textContent =
    appointment.customerName || "—";


  document
    .getElementById(
      "appointmentDetailsContact"
    )
    .textContent =
    appointment.contactNumber || "—";


  document
    .getElementById(
      "appointmentDetailsVehicle"
    )
    .textContent =
    appointment.vehicle || "—";


  document
    .getElementById(
      "appointmentDetailsService"
    )
    .textContent =
    appointment.service ||
    "Service not specified";


  document
    .getElementById(
      "appointmentDetailsBranch"
    )
    .textContent =
    appointment.branchId || "—";


  document
    .getElementById(
      "appointmentDetailsDate"
    )
    .textContent =
    appointment.appointmentDate || "—";


  document
    .getElementById(
      "appointmentDetailsTime"
    )
    .textContent =
    appointment.appointmentTime || "—";


  document
    .getElementById(
      "appointmentDetailsStatus"
    )
    .textContent =
    appointment.status || "—";


  document
    .getElementById(
      "appointmentDetailsAssignedPm"
    )
    .textContent =
    appointment.assignedPm || "—";


  document
    .getElementById(
      "appointmentDetailsBookedBy"
    )
    .textContent =
    appointment.bookedBy || "—";


  document
    .getElementById(
      "appointmentDetailsUpdatedBy"
    )
    .textContent =
    appointment.updatedBy || "—";


  document
    .getElementById(
      "appointmentDetailsModal"
    )
    .style.display =
    "flex";

}


function closeAppointmentDetailsModal() {

  const modal =
    document.getElementById(
      "appointmentDetailsModal"
    );

  if (modal) {
    modal.style.display = "none";
  }

}

function showPortal(user) {

  currentUser = user;

  buildSidebar(
    user.systemRole
  );


  document
    .getElementById("loginPage")
    .style.display =
    "none";


  document
    .getElementById("portalPage")
    .style.display =
    "block";


  document
    .getElementById("userName")
    .textContent =
    user.fullName || "User";


  document
    .getElementById("userRole")
    .textContent =
    user.systemRole || "—";


  document
    .getElementById("userBranch")
    .textContent =
    user.branchId || "—";


  document
    .getElementById("welcomeTitle")
    .textContent =
    "Welcome, " +
    (user.fullName || "User");


  updateDashboardInfo(
    user
  );


  loadDashboardData();

}


// ========================================
// DASHBOARD MODULE NAVIGATION
// ========================================

function selectDashboardModule(
  moduleName
) {

  const menuButtons =
    document.querySelectorAll(
      "#sidebarMenu .nav-item"
    );


  for (
    let i = 0;
    i < menuButtons.length;
    i++
  ) {

    if (
      menuButtons[i]
        .textContent
        .trim() ===
      moduleName.replace(
        " 🎫",
        ""
      )
    ) {

      selectModule(
        menuButtons[i]
          .textContent,
        menuButtons[i]
      );

      return;

    }

  }


  selectModule(
    moduleName,
    null
  );

}


// ========================================
// DASHBOARD USER INFO
// ========================================

function updateDashboardInfo(
  user
) {

  document
    .getElementById(
      "dashboardRole"
    )
    .textContent =
    user.systemRole || "—";


  document
    .getElementById(
      "dashboardBranch"
    )
    .textContent =
    user.branchId || "—";


  const now =
    new Date();


  document
    .getElementById(
      "dashboardDate"
    )
    .textContent =
    now.toLocaleDateString(
      "en-US",
      {
        weekday:
          "long",

        month:
          "long",

        day:
          "numeric",

        year:
          "numeric"
      }
    );

}


// ========================================
// LOAD DASHBOARD DATA
// ========================================

async function loadDashboardData() {

  try {

    const result =
      await crmApi(
        "getDashboardData"
      );


    if (
      !result ||
      !result.success
    ) {

      console.error(
        "Dashboard data failed:",
        result
      );


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
    // KPI
    // =========================

    const kpiInquiries =
      document.getElementById(
        "kpiInquiries"
      );


    if (kpiInquiries) {

      kpiInquiries.textContent =
        result.inquiriesToday || 0;

    }


    const kpiAppointmentsCreated =
      document.getElementById(
        "kpiAppointmentsCreated"
      );


    if (kpiAppointmentsCreated) {

      kpiAppointmentsCreated
        .textContent =
        result
          .appointmentsCreatedToday ||
        0;

    }


    const kpiToFollowUp =
      document.getElementById(
        "kpiToFollowUp"
      );


    if (kpiToFollowUp) {

      kpiToFollowUp.textContent =
        result.toFollowUpCount || 0;

    }


    const kpiToRemind =
      document.getElementById(
        "kpiToRemind"
      );


    if (kpiToRemind) {

      kpiToRemind.textContent =
        result.toRemindCount || 0;

    }


    // =========================
    // TODAY'S APPOINTMENTS
    // =========================

    const todayAppointmentCount =
      document.getElementById(
        "todayAppointmentCount"
      );


    if (todayAppointmentCount) {

      todayAppointmentCount
        .textContent =
        result.appointmentsToday || 0;

    }


    const todayConvertedCount =
      document.getElementById(
        "todayConvertedCount"
      );


    if (todayConvertedCount) {

      todayConvertedCount
        .textContent =
        result.convertedToday || 0;

    }


    const todayConversionRate =
      document.getElementById(
        "todayConversionRate"
      );


    if (todayConversionRate) {

      todayConversionRate
        .textContent =
        (
          result.conversionRate || 0
        ) + "%";

    }


    renderTodayAppointments(
      result.todayAppointments || []
    );


    // =========================
    // WEEKLY
    // =========================

    renderWeeklyAppointments(
      result.weeklyAppointments || [],
      result.weeklyLabels || []
    );


  } catch (error) {

    console.error(
      "Unable to load dashboard data:",
      error
    );

  }

}


// ========================================
// RENDER TODAY'S APPOINTMENTS
// ========================================

function renderTodayAppointments(
  appointments
) {

  const container =
    document.getElementById(
      "todayAppointments"
    );


  if (!container) {
    return;
  }


  if (
    !appointments ||
    appointments.length === 0
  ) {

    container.innerHTML = `
      <div class="empty-icon">
        —
      </div>

      <div class="empty-title">
        No appointments today
      </div>

      <div class="empty-text">
        No appointments are currently
        scheduled for today.
      </div>
    `;

    return;

  }


  let html = `
    <div class="appointment-table">

      <div
        class="
          appointment-row
          appointment-head
        "
      >

        <div>
          Customer
        </div>

        <div>
          Vehicle
        </div>

        <div>
          Branch
        </div>

        <div>
          Status
        </div>

      </div>
  `;


  appointments.forEach(
    function(item) {

      html += `
        <div class="appointment-row">

          <div>
            ${escapeHtml(
              item.customerName || "—"
            )}
          </div>

          <div>
            ${escapeHtml(
              item.vehicle || "—"
            )}
          </div>

          <div>
            ${escapeHtml(
              item.branchId || "—"
            )}
          </div>

          <div>
            ${escapeHtml(
              item.status || "—"
            )}
          </div>

        </div>
      `;

    }
  );


  html += `
    </div>
  `;


  container.innerHTML =
    html;

}


// ========================================
// RENDER WEEKLY APPOINTMENTS
// ========================================

function renderWeeklyAppointments(
  values,
  labels
) {

  const weekBoxes =
    document.querySelectorAll(
      ".weekly-grid .week-day"
    );


  const today =
    new Date();


  for (
    let i = 0;
    i < weekBoxes.length;
    i++
  ) {

    const label =
      weekBoxes[i]
        .querySelector(
          ".week-label"
        );


    const value =
      weekBoxes[i]
        .querySelector(
          "strong"
        );


    if (label) {

      label.textContent =
        labels[i] || "—";

    }


    if (value) {

      value.textContent =
        values[i] || 0;

    }


    // Build actual date
    const date =
      new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + i
      );


    const dateKey =
      formatCalendarDateKey(
        date
      );


    weekBoxes[i]
      .classList
      .add(
        "week-day-clickable"
      );


    weekBoxes[i].onclick =
      function() {

        openDashboardAppointmentPopup(
          dateKey,
          labels[i] || ""
        );

      };

  }

}


// ========================================
// OPEN PM REMINDER QUEUE
// ========================================

function openPMReminderQueue() {

  const menuButtons =
    document.querySelectorAll(
      "#sidebarMenu .nav-item"
    );


  let appointmentsButton =
    null;


  menuButtons.forEach(
    function(button) {

      if (
        String(
          button.textContent || ""
        )
          .trim() ===
        "Appointments"
      ) {

        appointmentsButton =
          button;

      }

    }
  );


  setTimeout(
    function() {

      const tomorrow =
        new Date();


      tomorrow.setDate(
        tomorrow.getDate() + 1
      );


      const tomorrowKey =
        formatCalendarDateKey(
          tomorrow
        );


      appointmentCalendarDate =
        new Date(
          tomorrow.getFullYear(),
          tomorrow.getMonth(),
          1
        );


      renderAppointmentsCalendar();


      openAppointmentDate(
        tomorrowKey
      );

    },
    200
  );

}


// ========================================
// DASHBOARD WEEKLY APPOINTMENT POPUP
// ========================================

async function openDashboardAppointmentPopup(
  dateKey,
  label
) {

  // Remove old popup
  const oldModal =
    document.getElementById(
      "dashboardAppointmentModal"
    );


  if (oldModal) {

    oldModal.remove();

  }


  // =========================
  // CREATE MODAL
  // =========================

  const modal =
    document.createElement(
      "div"
    );


  modal.id =
    "dashboardAppointmentModal";


  modal.style.position =
    "fixed";

  modal.style.inset =
    "0";

  modal.style.zIndex =
    "99999999";

  modal.style.background =
    "rgba(0,0,0,0.8)";

  modal.style.display =
    "flex";

  modal.style.alignItems =
    "center";

  modal.style.justifyContent =
    "center";

  modal.style.padding =
    "24px";


  // =========================
  // MODAL BOX
  // =========================

  const box =
    document.createElement(
      "div"
    );


  box.style.background =
    "#111";

  box.style.color =
    "#fff";

  box.style.padding =
    "24px";

  box.style.borderRadius =
    "16px";

  box.style.width =
    "min(720px, 100%)";

  box.style.maxHeight =
    "80vh";

  box.style.overflow =
    "auto";

  box.style.border =
    "1px solid rgba(212,175,55,.35)";


  const displayDate =
    new Date(
      dateKey + "T00:00:00"
    )
      .toLocaleDateString(
        "en-US",
        {
          weekday:
            "long",

          month:
            "long",

          day:
            "numeric",

          year:
            "numeric"
        }
      );


  box.innerHTML = `

    <div
      style="
        display:flex;
        justify-content:space-between;
        align-items:center;
        gap:20px;
        margin-bottom:20px;
      "
    >

      <div>

        <div
          style="
            font-size:12px;
            opacity:.6;
            margin-bottom:4px;
          "
        >
          APPOINTMENTS
        </div>


        <h3
          style="
            margin:0;
          "
        >
          ${escapeHtml(
            displayDate
          )}
        </h3>

      </div>


      <button
        type="button"
        id="dashboardAppointmentClose"
        class="secondary-action"
      >
        CLOSE
      </button>

    </div>


    <div
      id="dashboardAppointmentModalBody"
    >

      <div
        style="
          padding:30px;
          text-align:center;
          opacity:.7;
        "
      >
        Loading appointments...
      </div>

    </div>
  `;


  modal.appendChild(
    box
  );


  document.body.appendChild(
    modal
  );


  // =========================
  // CLOSE
  // =========================

  document
    .getElementById(
      "dashboardAppointmentClose"
    )
    .onclick =
    function() {

      modal.remove();

    };


  const body =
    document.getElementById(
      "dashboardAppointmentModalBody"
    );


  // =========================
  // SESSION CHECK
  // =========================

  if (!currentUser) {

    body.innerHTML = `
      <div
        style="
          padding:30px;
          text-align:center;
        "
      >
        User session not found.
      </div>
    `;

    return;

  }


  // =========================
  // LOAD THROUGH API
  // =========================

  try {

    const result =
      await crmApi(
        "getAppointmentsData"
      );


    if (
      !result ||
      !result.success
    ) {

      body.innerHTML = `
        <div
          style="
            padding:30px;
            text-align:center;
          "
        >
          Unable to load appointments.
        </div>
      `;


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


    const appointments =
      (
        result.appointments || []
      )
        .filter(
          function(item) {

            return (
              String(
                item.appointmentDate ||
                ""
              )
                .trim() ===
              dateKey
            );

          }
        );


    if (
      appointments.length === 0
    ) {

      body.innerHTML = `
        <div
          style="
            padding:35px;
            text-align:center;
            opacity:.7;
          "
        >
          No appointments scheduled
          for this date.
        </div>
      `;

      return;

    }


    let html = "";


    appointments.forEach(
      function(item) {

        html += `

          <div
            style="
              padding:16px;
              margin-bottom:10px;
              border:
                1px solid
                rgba(255,255,255,.08);
              border-radius:12px;
            "
          >

            <div
              style="
                display:flex;
                justify-content:
                  space-between;
                gap:15px;
                margin-bottom:8px;
              "
            >

              <strong>
                ${escapeHtml(
                  item.customerName ||
                  "—"
                )}
              </strong>


              <span>
                ${escapeHtml(
                  item.appointmentTime ||
                  "—"
                )}
              </span>

            </div>


            <div
              style="
                display:flex;
                flex-wrap:wrap;
                gap:10px;
                font-size:13px;
                opacity:.75;
              "
            >

              <span>
                ${escapeHtml(
                  item.vehicle ||
                  "—"
                )}
              </span>


              <span>
                ${escapeHtml(
                  item.branchId ||
                  "—"
                )}
              </span>


              <span>
                ${escapeHtml(
                  item.status ||
                  "—"
                )}
              </span>

            </div>

          </div>
        `;

      }
    );


    body.innerHTML =
      html;


  } catch (error) {

    console.error(
      "Dashboard weekly popup error:",
      error
    );


    body.innerHTML = `
      <div
        style="
          padding:30px;
          text-align:center;
        "
      >
        Unable to load appointments.
      </div>
    `;

  }

}


// ========================================
// CLOSE DASHBOARD POPUP
// ========================================

function closeDashboardAppointmentPopup() {

  const modal =
    document.getElementById(
      "dashboardAppointmentModal"
    );


  if (modal) {

    modal.remove();

  }

}

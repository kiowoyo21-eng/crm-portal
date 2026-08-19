function showPortal(user) {

      currentUser = user;

      buildSidebar(user.systemRole);

      document
        .getElementById("loginPage")
        .style.display = "none";

      document
        .getElementById("portalPage")
        .style.display = "block";

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

        updateDashboardInfo(user);
        loadDashboardData(user.userId);

    }

function selectDashboardModule(moduleName) {

  const menuButtons =
    document.querySelectorAll("#sidebarMenu .nav-item");

  for (let i = 0; i < menuButtons.length; i++) {

    if (
      menuButtons[i].textContent.trim() ===
      moduleName.replace(" 🎫", "")
    ) {

      selectModule(
        menuButtons[i].textContent,
        menuButtons[i]
      );

      return;
    }
  }

  selectModule(moduleName, null);
}


function updateDashboardInfo(user) {

  document
  .getElementById("dashboardRole").textContent =
    user.systemRole || "—";

  document.getElementById("dashboardBranch").textContent =
    user.branchId || "—";

  const now = new Date();

  document.getElementById("dashboardDate").textContent =
    now.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric"
    });

    
}

function loadDashboardData(userId) {

  google.script.run

    .withSuccessHandler(function(result) {

      

      if (!result || !result.success) {
        console.error(
          "Dashboard data failed:",
          result
        );
        return;
      }


      // =========================
      // KPI
      // =========================

      document
        .getElementById("kpiInquiries")
        .textContent =
        result.inquiriesToday || 0;


      document
        .getElementById("kpiAppointmentsCreated")
        .textContent =
        result.appointmentsCreatedToday || 0;

        document
  .getElementById("kpiToFollowUp")
  .textContent =
  result.toFollowUpCount || 0;


document
  .getElementById("kpiToRemind")
  .textContent =
  result.toRemindCount || 0;


      // =========================
      // TODAY'S APPOINTMENTS
      // =========================

      document
        .getElementById("todayAppointmentCount")
        .textContent =
        result.appointmentsToday || 0;


      document
        .getElementById("todayConvertedCount")
        .textContent =
        result.convertedToday || 0;


      document
        .getElementById("todayConversionRate")
        .textContent =
        (result.conversionRate || 0) + "%";


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

    })


    .withFailureHandler(function(error) {

      console.error(
        "Unable to load dashboard data:",
        error
      );

    })


    .getDashboardData(userId);
}
function renderTodayAppointments(appointments) {

  const container =
    document.getElementById("todayAppointments");

  if (!container) {
    return;
  }

  if (!appointments || appointments.length === 0) {

    container.innerHTML = `
      <div class="empty-icon">—</div>
      <div class="empty-title">
        No appointments today
      </div>
      <div class="empty-text">
        No appointments are currently scheduled
        for today.
      </div>
    `;

    return;
  }

  let html = `
    <div class="appointment-table">
      <div class="appointment-row appointment-head">
        <div>Customer</div>
        <div>Vehicle</div>
        <div>Branch</div>
        <div>Status</div>
      </div>
  `;

  appointments.forEach(function(item) {

    html += `
      <div class="appointment-row">
        <div>${escapeHtml(item.customerName || "—")}</div>
        <div>${escapeHtml(item.vehicle || "—")}</div>
        <div>${escapeHtml(item.branchId || "—")}</div>
        <div>${escapeHtml(item.status || "—")}</div>
      </div>
    `;

  });

  html += `</div>`;

  container.innerHTML = html;
}


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
        .querySelector(".week-label");

    const value =
      weekBoxes[i]
        .querySelector("strong");


    if (label) {
      label.textContent =
        labels[i] || "—";
    }


    if (value) {
      value.textContent =
        values[i] || 0;
    }


    // Build the actual date for this day
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


    weekBoxes[i].classList.add(
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

function openPMReminderQueue() {

  const menuButtons =
    document.querySelectorAll(
      "#sidebarMenu .nav-item"
    );

  let appointmentsButton = null;


  menuButtons.forEach(
    function(button) {

      if (
        String(button.textContent || "")
          .trim() === "Appointments"
      ) {

        appointmentsButton = button;

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


      // Move calendar to tomorrow's month
      appointmentCalendarDate =
        new Date(
          tomorrow.getFullYear(),
          tomorrow.getMonth(),
          1
        );


      renderAppointmentsCalendar();


      // Open the same date popup
      // used when clicking the calendar.
      openAppointmentDate(
        tomorrowKey
      );

    },
    200
  );

}

function openDashboardAppointmentPopup(
  dateKey,
  label
) {

  // REMOVE OLD POPUP
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
    document.createElement("div");

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
  // BOX
  // =========================

  const box =
    document.createElement("div");

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
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric"
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
          ${escapeHtml(displayDate)}
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


  modal.appendChild(box);

  document.body.appendChild(modal);


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


  // =========================
  // USER CHECK
  // =========================

  const body =
    document.getElementById(
      "dashboardAppointmentModalBody"
    );


  if (
    !currentUser ||
    !currentUser.userId
  ) {

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
  // LOAD APPOINTMENTS
  // =========================

  google.script.run

    .withSuccessHandler(
      function(result) {

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
                    item.appointmentDate || ""
                  ).trim() ===
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
                  border:1px solid
                    rgba(255,255,255,.08);
                  border-radius:12px;
                "
              >

                <div
                  style="
                    display:flex;
                    justify-content:space-between;
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

      }
    )

    .withFailureHandler(
      function(error) {

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
    )

    .getAppointmentsData(
      currentUser.userId
    );

}

function closeDashboardAppointmentPopup() {

  const modal =
    document.getElementById(
      "dashboardAppointmentModal"
    );

  if (modal) {
    modal.style.display =
      "none";
  }

}

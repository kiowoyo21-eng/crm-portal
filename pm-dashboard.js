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


function openDashboardQueueModal(
  title,
  subtitle
) {

  const oldModal =
    document.getElementById(
      "pmDashboardQueueModal"
    );

  if (oldModal) {
    oldModal.remove();
  }


  const overlay =
    document.createElement(
      "div"
    );

  overlay.id =
    "pmDashboardQueueModal";

  overlay.className =
    "crm-queue-overlay";


  const modal =
    document.createElement(
      "div"
    );

  modal.className =
    "crm-queue-modal";


  modal.innerHTML = `

    <div class="crm-queue-header">

      <div>

        <div class="crm-queue-eyebrow">
          PAGE MANAGER
        </div>

        <h2 class="crm-queue-title">
          ${escapeHtml(title)}
        </h2>

        <div class="crm-queue-subtitle">
          ${escapeHtml(subtitle)}
        </div>

      </div>

      <button
        type="button"
        class="crm-queue-close"
        id="pmQueueClose"
      >
        ×
      </button>

    </div>

    <div
      class="crm-queue-body"
      id="pmDashboardQueueBody"
    >
      <div class="crm-queue-loading">
        Loading...
      </div>
    </div>
  `;


  overlay.appendChild(
    modal
  );

  document.body.appendChild(
    overlay
  );


  document
    .getElementById(
      "pmQueueClose"
    )
    .onclick =
    function() {

      overlay.remove();

    };


  overlay.onclick =
    function(event) {

      if (
        event.target ===
        overlay
      ) {

        overlay.remove();

      }

    };


  return {
    overlay:
      overlay,

    body:
      document.getElementById(
        "pmDashboardQueueBody"
      )
  };

}

async function openPMFollowUpQueue() {

  const modal =
    openDashboardQueueModal(
      "Follow-Up Queue",
      "Leads that currently need follow-up."
    );


  try {

    const result =
      await crmApi(
        "getLeadsData"
      );


    if (
      !result ||
      !result.success
    ) {

      modal.body.innerHTML = `
        <div class="crm-queue-empty">
          Unable to load follow-up leads.
        </div>
      `;

      return;
    }


    const leads =
      (result.leads || [])
        .filter(function(lead) {

          return (
            String(
              lead.status || ""
            )
              .trim()
              .toLowerCase() ===
            "follow up"
          );

        });


    if (!leads.length) {

      modal.body.innerHTML = `
        <div class="crm-queue-empty">

          <div class="crm-queue-empty-icon">
            ✓
          </div>

          <strong>
            No follow-ups pending
          </strong>

          <span>
            There are currently no leads
            marked for follow-up.
          </span>

        </div>
      `;

      return;
    }


    let html = `
      <div class="crm-queue-list">
    `;


    leads.forEach(function(lead) {

      html += `

        <div class="crm-queue-item">

          <div class="crm-queue-main">

            <div class="crm-queue-name">
              ${escapeHtml(
                lead.customerName || "—"
              )}
            </div>

            <div class="crm-queue-meta">

              <span>
                ${escapeHtml(
                  lead.vehicle || "—"
                )}
              </span>

              <span>
                ${escapeHtml(
                  lead.branchId || "—"
                )}
              </span>

              <span>
                ${escapeHtml(
                  lead.service || "—"
                )}
              </span>

            </div>

            <div class="crm-queue-detail">
              ${escapeHtml(
                lead.concern ||
                "No additional details."
              )}
            </div>

          </div>


          <div class="crm-queue-actions">

            <button
              type="button"
              class="secondary-action"
              onclick="closePMDashboardQueue(); openLeadFromDashboard('${escapeJs(
                lead.leadId
              )}')"
            >
              VIEW LEAD
            </button>

          </div>

        </div>
      `;

    });


    html += `
      </div>

      <div class="crm-queue-footer">

        <span>
          ${leads.length}
          follow-up${leads.length === 1 ? "" : "s"}
        </span>

        <button
          type="button"
          class="primary-action"
          onclick="closePMDashboardQueue(); selectDashboardModule('Leads')"
        >
          OPEN LEADS
        </button>

      </div>
    `;


    modal.body.innerHTML =
      html;


  } catch (error) {

    console.error(
      "Follow-up queue error:",
      error
    );

    modal.body.innerHTML = `
      <div class="crm-queue-empty">
        Unable to connect to the CRM.
      </div>
    `;

  }

}

async function openPMReminderQueue() {

  const modal =
    openDashboardQueueModal(
      "Tomorrow's Reminders",
      "Appointments scheduled for tomorrow."
    );


  try {

    const result =
      await crmApi(
        "getAppointmentsData"
      );


    if (
      !result ||
      !result.success
    ) {

      modal.body.innerHTML = `
        <div class="crm-queue-empty">
          Unable to load appointments.
        </div>
      `;

      return;
    }


    const tomorrow =
      new Date();

    tomorrow.setDate(
      tomorrow.getDate() + 1
    );


    const tomorrowKey =
      formatCalendarDateKey(
        tomorrow
      );


    const appointments =
      (result.appointments || [])
        .filter(function(item) {

          return (
            String(
              item.appointmentDate || ""
            ).trim() ===
            tomorrowKey
          );

        });


    if (!appointments.length) {

      modal.body.innerHTML = `
        <div class="crm-queue-empty">

          <div class="crm-queue-empty-icon">
            ✓
          </div>

          <strong>
            No reminders for tomorrow
          </strong>

          <span>
            No appointments are currently
            scheduled for tomorrow.
          </span>

        </div>
      `;

      return;
    }


    let html = `
      <div class="crm-queue-list">
    `;


    appointments.forEach(
      function(item) {

        html += `

          <div class="crm-queue-item">

            <div class="crm-queue-main">

              <div class="crm-queue-name">
                ${escapeHtml(
                  item.customerName || "—"
                )}
              </div>

              <div class="crm-queue-meta">

                <span>
                  ${escapeHtml(
                    item.appointmentTime || "—"
                  )}
                </span>

                <span>
                  ${escapeHtml(
                    item.vehicle || "—"
                  )}
                </span>

                <span>
                  ${escapeHtml(
                    item.branchId || "—"
                  )}
                </span>

              </div>

              <div class="crm-queue-detail">
                ${escapeHtml(
                  item.service ||
                  "Appointment"
                )}
              </div>

            </div>


            <div class="crm-queue-status">
              ${escapeHtml(
                item.status || "Booked"
              )}
            </div>

          </div>
        `;

      }
    );


    html += `
      </div>

      <div class="crm-queue-footer">

        <span>
          ${appointments.length}
          appointment${appointments.length === 1 ? "" : "s"}
        </span>

        <button
          type="button"
          class="primary-action"
          onclick="closePMDashboardQueue(); selectDashboardModule('Appointments')"
        >
          OPEN APPOINTMENTS
        </button>

      </div>
    `;


    modal.body.innerHTML =
      html;


  } catch (error) {

    console.error(
      "Reminder queue error:",
      error
    );

    modal.body.innerHTML = `
      <div class="crm-queue-empty">
        Unable to connect to the CRM.
      </div>
    `;

  }

}

function closePMDashboardQueue() {

  const modal =
    document.getElementById(
      "pmDashboardQueueModal"
    );

  if (modal) {
    modal.remove();
  }

}


function openLeadFromDashboard(
  leadId
) {

  selectDashboardModule(
    "Leads"
  );


  setTimeout(
    function() {

      const lead =
        currentLeads.find(
          function(item) {

            return (
              item.leadId ===
              leadId
            );

          }
        );


      if (lead) {

        editLead(
          leadId
        );

      }

    },
    300
  );

}


async function openPMTodayInquiriesQueue() {

  const modal =
    openDashboardQueueModal(
      "Today's Inquiries",
      "Customer inquiries created today."
    );

  try {

    const result =
      await crmApi(
        "getLeadsData"
      );

    if (
      !result ||
      !result.success
    ) {

      modal.body.innerHTML = `
        <div class="crm-queue-empty">
          Unable to load today's inquiries.
        </div>
      `;

      return;
    }

    const today =
      new Date();

    const leads =
      (result.leads || [])
        .filter(function(lead) {

          const createdAt =
            new Date(
              lead.createdAt
            );

          return (
            !isNaN(
              createdAt.getTime()
            ) &&
            createdAt.getFullYear() ===
              today.getFullYear() &&
            createdAt.getMonth() ===
              today.getMonth() &&
            createdAt.getDate() ===
              today.getDate()
          );

        });

    if (!leads.length) {

      modal.body.innerHTML = `
        <div class="crm-queue-empty">

          <div class="crm-queue-empty-icon">
            I
          </div>

          <strong>
            No inquiries today
          </strong>

          <span>
            No customer inquiries were
            created today.
          </span>

        </div>
      `;

      return;
    }

    let html = `
      <div class="crm-queue-list">
    `;

    leads.forEach(
      function(lead) {

        html += `

          <div class="crm-queue-item">

            <div class="crm-queue-main">

              <div class="crm-queue-name">
                ${escapeHtml(
                  lead.customerName || "—"
                )}
              </div>

              <div class="crm-queue-meta">

                <span>
                  ${escapeHtml(
                    lead.vehicle || "—"
                  )}
                </span>

                <span>
                  ${escapeHtml(
                    lead.branchId || "—"
                  )}
                </span>

                <span>
                  ${escapeHtml(
                    lead.inquirySource || "—"
                  )}
                </span>

              </div>

              <div class="crm-queue-detail">
                ${escapeHtml(
                  lead.concern ||
                  "No additional details."
                )}
              </div>

            </div>

            <div class="crm-queue-actions">

              <button
                type="button"
                class="secondary-action"
                onclick="closePMDashboardQueue(); openLeadFromDashboard('${escapeJs(
                  lead.leadId
                )}')"
              >
                VIEW LEAD
              </button>

            </div>

          </div>
        `;

      }
    );

    html += `
      </div>

      <div class="crm-queue-footer">

        <span>
          ${leads.length}
          ${leads.length === 1
            ? "inquiry"
            : "inquiries"}
        </span>

        <button
          type="button"
          class="primary-action"
          onclick="closePMDashboardQueue(); selectDashboardModule('Leads')"
        >
          OPEN LEADS
        </button>

      </div>
    `;

    modal.body.innerHTML =
      html;

  } catch (error) {

    console.error(
      "Today's inquiries error:",
      error
    );

    modal.body.innerHTML = `
      <div class="crm-queue-empty">
        Unable to connect to the CRM.
      </div>
    `;

  }

}

async function openPMTodayBookingsQueue() {

  const modal =
    openDashboardQueueModal(
      "Appointments Created Today",
      "Appointments booked into the CRM today."
    );

  try {

    const result =
      await crmApi(
        "getAppointmentsData"
      );

    if (
      !result ||
      !result.success
    ) {

      modal.body.innerHTML = `
        <div class="crm-queue-empty">
          Unable to load today's bookings.
        </div>
      `;

      return;
    }

    const today =
      new Date();

    const appointments =
      (result.appointments || [])
        .filter(function(item) {

          const createdAt =
            new Date(
              item.createdAt
            );

          return (
            !isNaN(
              createdAt.getTime()
            ) &&
            createdAt.getFullYear() ===
              today.getFullYear() &&
            createdAt.getMonth() ===
              today.getMonth() &&
            createdAt.getDate() ===
              today.getDate()
          );

        });

    if (!appointments.length) {

      modal.body.innerHTML = `
        <div class="crm-queue-empty">

          <div class="crm-queue-empty-icon">
            A
          </div>

          <strong>
            No bookings created today
          </strong>

          <span>
            No appointments were created
            today.
          </span>

        </div>
      `;

      return;
    }

    let html = `
      <div class="crm-queue-list">
    `;

    appointments.forEach(
      function(item) {

        html += `

          <div class="crm-queue-item">

            <div class="crm-queue-main">

              <div class="crm-queue-name">
                ${escapeHtml(
                  item.customerName || "—"
                )}
              </div>

              <div class="crm-queue-meta">

                <span>
                  ${escapeHtml(
                    item.appointmentDate || "—"
                  )}
                </span>

                <span>
                  ${escapeHtml(
                    item.appointmentTime || "—"
                  )}
                </span>

                <span>
                  ${escapeHtml(
                    item.vehicle || "—"
                  )}
                </span>

                <span>
                  ${escapeHtml(
                    item.branchId || "—"
                  )}
                </span>

              </div>

              <div class="crm-queue-detail">
                ${escapeHtml(
                  item.service ||
                  "Appointment"
                )}
              </div>

            </div>

            <div class="crm-queue-status">
              ${escapeHtml(
                item.status || "Booked"
              )}
            </div>

          </div>
        `;

      }
    );

    html += `
      </div>

      <div class="crm-queue-footer">

        <span>
          ${appointments.length}
          ${appointments.length === 1
            ? "booking"
            : "bookings"}
        </span>

        <button
          type="button"
          class="primary-action"
          onclick="closePMDashboardQueue(); selectDashboardModule('Appointments')"
        >
          OPEN APPOINTMENTS
        </button>

      </div>
    `;

    modal.body.innerHTML =
      html;

  } catch (error) {

    console.error(
      "Today's bookings error:",
      error
    );

    modal.body.innerHTML = `
      <div class="crm-queue-empty">
        Unable to connect to the CRM.
      </div>
    `;

  }

}

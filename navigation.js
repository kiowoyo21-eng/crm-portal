function buildSidebar(role) {

  const menu =
    document.getElementById(
      "sidebarMenu"
    );

  menu.innerHTML = "";


  const menus = {

    PM: [
      "Dashboard",
      "Leads",
      "Appointments",
      "Requests",
      "Reports"
    ],

    SA: [
      "Dashboard",
      "Appointments",
      "Opportunities",
      "Suppliers",
      "Products",
      "Reports",
      "Requests"
    ],

    BM: [
      "Dashboard",
      "Appointments",
      "Opportunities",
      "Suppliers",
      "Products",
      "Employees / Attendance",
      "Approvals / Requests",
      "Reports",
      "Requests"
    ],

    HR: [
      "Dashboard",
      "Employees",
      "Attendance / DTR",
      "Requests",
      "Payroll",
      "Reports"
    ],

    IT: [
      "Dashboard",
      "Users / Accounts",
      "Roles & Permissions",
      "Branches",
      "System Configuration",
      "Support",
      "System Logs",
      "Reports"
    ],

    Mechanic: [
      "Dashboard",
      "Opportunities",
      "Requests"
    ],

    Direk: [
      "Dashboard",
      "Appointments",
      "Opportunities",
      "Branches",
      "Employees",
      "Products",
      "Suppliers",
      "Reports",
      "Requests"
    ]

  };


  const selectedMenu =
    menus[role] || [
      "Dashboard"
    ];


  selectedMenu.forEach(
    function(
      moduleName,
      index
    ) {

      const button =
        document.createElement(
          "button"
        );

      button.className =
        "nav-item";


      if (index === 0) {

        button.classList.add(
          "active"
        );

      }


      button.textContent =
        moduleName;


      button.onclick =
        function() {

          selectModule(
            moduleName,
            button
          );

        };


      menu.appendChild(
        button
      );

    }
  );

}


// ========================================
// MODULE SELECTION
// ========================================

function selectModule(
  moduleName,
  button
) {

  const pageTitle =
    document.getElementById(
      "pageTitle"
    );


  if (pageTitle) {

    pageTitle.textContent =
      moduleName;

  }


  // =========================
  // SIDEBAR ACTIVE STATE
  // =========================

  document
    .querySelectorAll(
      ".nav-item"
    )
    .forEach(
      function(item) {

        item.classList.remove(
          "active"
        );

      }
    );


  if (button) {

    button.classList.add(
      "active"
    );

  }


  // =========================
  // AVAILABLE VIEWS
  // =========================

  const dashboardView =
    document.getElementById(
      "dashboardView"
    );

  const leadsView =
    document.getElementById(
      "leadsView"
    );

  const appointmentsView =
    document.getElementById(
      "appointmentsView"
    );

  const requestsView =
    document.getElementById(
      "requestsView"
    );

  const reportsView =
    document.getElementById(
      "reportsView"
    );

  const supportView =
  document.getElementById(
    "supportView"
  );


  // =========================
  // HIDE ALL VIEWS
  // =========================

  [
  dashboardView,
  leadsView,
  appointmentsView,
  requestsView,
  reportsView,
  supportView
]
    .forEach(
      function(view) {

        if (view) {

          view.style.display =
            "none";

        }

      }
    );


  // =========================
  // DASHBOARD
  // =========================

  if (
    moduleName ===
    "Dashboard"
  ) {

    if (dashboardView) {

      dashboardView.style.display =
        "block";

    }


    if (
      currentUser &&
      typeof loadDashboardData ===
        "function"
    ) {

      loadDashboardData();

    }


    return;

  }


  // =========================
  // PM LEADS
  // =========================

  if (
    moduleName ===
    "Leads"
  ) {

    if (leadsView) {

      leadsView.style.display =
        "block";

    }


    if (
      typeof loadLeads ===
        "function"
    ) {

      loadLeads();

    }


    return;

  }


  // =========================
  // SHARED APPOINTMENTS
  // =========================

  if (
    moduleName ===
    "Appointments"
  ) {

    if (appointmentsView) {

      appointmentsView.style.display =
        "block";

    }


    if (
      typeof loadAppointmentsCalendar ===
        "function"
    ) {

      loadAppointmentsCalendar();

    }


    return;

  }


  // =========================
  // SHARED REQUESTS
  // =========================

  if (
    moduleName ===
    "Requests"
  ) {

    if (requestsView) {

      requestsView.style.display =
        "block";

    }


    if (
      typeof loadRequests ===
        "function"
    ) {

      loadRequests();

    }


    return;

  }


  // =========================
  // PM REPORTS
  // =========================

  if (
    moduleName ===
    "Reports"
  ) {

    if (reportsView) {

      reportsView.style.display =
        "block";

    }


    if (
      typeof loadPMReports ===
        "function"
    ) {

      loadPMReports();

    }


    return;

  }


  // =========================
// SHARED SUPPORT
// =========================

if (
  moduleName === "Support 🎫" ||
  moduleName === "Support"
) {

  if (supportView) {

    supportView.style.display =
      "block";

  }


  if (
    typeof loadSupportTickets ===
      "function"
  ) {

    loadSupportTickets();

  }


  return;

}


  // =========================
  // MODULE NOT BUILT YET
  // =========================

  console.log(
    "Module view not built yet:",
    moduleName
  );

}


// ========================================
// SHARED APPOINTMENTS STATE
// ========================================

let currentAppointments =
  [];

let appointmentCalendarDate =
  new Date();

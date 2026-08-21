const CRM_ROLE_MENUS = {

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
    "Leads",
    "Opportunities",
    "Suppliers",
    "Products",
    "Inventory",
    "Reports",
    "Requests"
  ],

  BM: [
    "Dashboard",
    "Appointments",
    "Leads",
    "Opportunities",
    "Suppliers",
    "Products",
    "Inventory",
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
    "Leads",
    "Opportunities",
    "Branches",
    "Employees",
    "Products",
    "Suppliers",
    "Inventory",
    "Reports",
    "Requests"
  ]

};


// ========================================
// BUILD SIDEBAR
// ========================================

function buildSidebar(role) {

  const menu =
    document.getElementById(
      "sidebarMenu"
    );


  if (!menu) {
    return;
  }


  menu.innerHTML =
    "";


  const selectedMenu =
    CRM_ROLE_MENUS[role] || [
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


      if (
        index === 0
      ) {

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


  if (
    pageTitle
  ) {

    pageTitle.textContent =
      moduleName;

  }


  // ========================================
  // SIDEBAR ACTIVE STATE
  // ========================================

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


  if (
    button
  ) {

    button.classList.add(
      "active"
    );

  }


  // ========================================
  // CURRENT ROLE
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


  // ========================================
  // AVAILABLE VIEWS
  // ========================================

  const dashboardView =
    document.getElementById(
      "dashboardView"
    );


  const saDashboardView =
    document.getElementById(
      "saDashboardView"
    );


  const leadsView =
    document.getElementById(
      "leadsView"
    );


  const appointmentsView =
    document.getElementById(
      "appointmentsView"
    );


  const saAppointmentsView =
    document.getElementById(
      "saAppointmentsView"
    );


  const saOpportunitiesView =
    document.getElementById(
      "saOpportunitiesView"
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


  // ========================================
  // HIDE ALL BUILT VIEWS
  // ========================================

  [
    dashboardView,
    saDashboardView,
    leadsView,
    appointmentsView,
    saAppointmentsView,
    saOpportunitiesView,
    requestsView,
    reportsView,
    supportView
  ]
    .forEach(
      function(view) {

        if (
          view
        ) {

          view.style.display =
            "none";

        }

      }
    );


  // ========================================
  // DASHBOARD
  // ========================================

  if (
    moduleName ===
    "Dashboard"
  ) {

    // SA gets the new production dashboard.
    if (
      currentRole ===
      "SA"
    ) {

      if (
        saDashboardView
      ) {

        saDashboardView.style.display =
          "block";

      }


      if (
        typeof loadSADashboard ===
        "function"
      ) {

        loadSADashboard();

      }


      return;

    }


    // All other roles keep the existing dashboard for now.
    if (
      dashboardView
    ) {

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


  // ========================================
  // LEADS
  // ========================================

  if (
    moduleName ===
    "Leads"
  ) {

    if (
      leadsView
    ) {

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


  // ========================================
  // APPOINTMENTS
  // ========================================

  if (
    moduleName ===
    "Appointments"
  ) {

    if (
      currentRole ===
      "SA"
    ) {

      if (
        saAppointmentsView
      ) {

        saAppointmentsView.style.display =
          "block";

      }


      if (
        typeof loadSAAppointments ===
        "function"
      ) {

        loadSAAppointments();

      }


      return;

    }


    if (
      appointmentsView
    ) {

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


  // ========================================
  // OPPORTUNITIES
  // ========================================

  if (
    moduleName ===
    "Opportunities"
  ) {

    if (
      saOpportunitiesView
    ) {

      saOpportunitiesView.style.display =
        "block";

    }


    if (
      typeof loadSAOpportunities ===
        "function"
    ) {

      loadSAOpportunities();

    }


    return;

  }


  // ========================================
  // REQUESTS
  // ========================================

  if (
    moduleName ===
    "Requests"
  ) {

    if (
      requestsView
    ) {

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


  // ========================================
  // REPORTS
  // ========================================

  if (
    moduleName ===
    "Reports"
  ) {

    if (
      reportsView
    ) {

      reportsView.style.display =
        "block";

    }


    /*
     * PM reports are still the only built
     * report view right now.
     *
     * Do not call it for SA/BM/Direk.
     */

    if (
      currentRole ===
      "PM" &&
      typeof loadPMReports ===
        "function"
    ) {

      loadPMReports();

    }


    return;

  }


  // ========================================
  // SHARED SUPPORT
  // ========================================

  if (
    moduleName ===
      "Support 🎫" ||
    moduleName ===
      "Support"
  ) {

    if (
      supportView
    ) {

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


  // ========================================
  // MODULE NOT BUILT YET
  // ========================================

  console.log(
    "Module view not built yet:",
    moduleName
  );

}


// ========================================
// DASHBOARD → MODULE SHORTCUT
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
// SHARED APPOINTMENTS STATE
// ========================================

let currentAppointments =
  [];


let appointmentCalendarDate =
  new Date();

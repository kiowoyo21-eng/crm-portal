function buildSidebar(role) {

  const menu = document.getElementById("sidebarMenu");

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
      "Supplier",
      "Products",
      "Employees / Attendance",
      "Approvals / Requests",
      "Reports",
      "Request"
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

  const selectedMenu = menus[role] || [
    "Dashboard"
  ];

  selectedMenu.forEach(function(moduleName, index) {

    const button = document.createElement("button");

    button.className = "nav-item";

    if (index === 0) {
      button.classList.add("active");
    }

    button.textContent = moduleName;

    button.onclick = function() {
      selectModule(moduleName, button);
    };

    menu.appendChild(button);

  });

}


    /* =========================
       MODULE SELECTION
       ========================= */
function selectModule(moduleName, button) {

  document
    .getElementById("pageTitle")
    .textContent = moduleName;

  document
    .querySelectorAll(".nav-item")
    .forEach(function(item) {
      item.classList.remove("active");
    });

  if (button) {
    button.classList.add("active");
  }

  const dashboardView =
    document.getElementById("dashboardView");

  const leadsView =
    document.getElementById("leadsView");

    const appointmentsView =
  document.getElementById("appointmentsView");

  const requestsView =
  document.getElementById("requestsView");

  const reportsView =
  document.getElementById("reportsView");

  // Hide all module views first
  dashboardView.style.display = "none";
  leadsView.style.display = "none";
  appointmentsView.style.display = "none";
  requestsView.style.display = "none";
  reportsView.style.display = "none";

  if (moduleName === "Dashboard") {

    dashboardView.style.display = "block";

    if (currentUser) {
      loadDashboardData(
        currentUser.userId
      );
    }

    return;
  }

  if (moduleName === "Leads") {

    leadsView.style.display = "block";

    loadLeads();

    return;
  }

  if (moduleName === "Appointments") {

  appointmentsView.style.display = "block";

  loadAppointmentsCalendar();

  return;
}

if (moduleName === "Requests") {

  requestsView.style.display = "block";

  loadRequests();

  return;
}

if (moduleName === "Reports") {

  reportsView.style.display = "block";

  loadPMReports();

  return;
}

}


// =========================
// APPOINTMENTS CALENDAR
// =========================

let currentAppointments = [];

let appointmentCalendarDate =
  new Date();


// =========================
// LOAD APPOINTMENTS
// =========================

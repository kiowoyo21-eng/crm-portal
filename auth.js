let currentUser = null;
let currentLeads = [];


const SESSION_KEY =
  "crm_session";

const LAST_ACTIVITY_KEY =
  "crm_last_activity";


const SESSION_TIMEOUT =
  60 * 60 * 1000;
// 1 hour inactivity


// ========================================
// LOGIN
// ========================================

document
  .getElementById("loginForm")
  .addEventListener(
    "submit",
    async function(event) {

      event.preventDefault();


      const username =
        document
          .getElementById("username")
          .value
          .trim();


      const password =
        document
          .getElementById("password")
          .value;


      const button =
        document.getElementById(
          "loginButton"
        );


      const loading =
        document.getElementById(
          "loading"
        );


      const message =
        document.getElementById(
          "message"
        );


      // Reset message
      message.className =
        "message";

      message.textContent =
        "";


      // Loading state
      button.disabled =
        true;

      loading.style.display =
        "block";


      try {

        // ================================
        // LOGIN THROUGH APPS SCRIPT API
        // ================================

        const result =
          await crmApi(
            "login",
            {
              username:
                username,

              password:
                password
            }
          );


        if (
          !result ||
          !result.success
        ) {

          message.className =
            "message error";

          message.textContent =
            result &&
            result.message
              ? result.message
              : "Unable to login.";

          return;

        }


        // ================================
        // SAVE API SESSION
        // ================================

        saveCrmSession(
          result
        );


        // ================================
        // CURRENT USER
        // ================================

        currentUser = {

          userId:
            result.userId || "",

          employeeId:
            result.employeeId || "",

          fullName:
            result.fullName || "",

          systemRole:
            result.systemRole || "",

          branchId:
            result.branchId || "",

          accessStatus:
            result.accessStatus || "",

          expiresAt:
            result.expiresAt || ""

        };


        // ================================
        // SAVE LOCAL UI SESSION
        // ================================

        localStorage.setItem(
          SESSION_KEY,
          JSON.stringify(
            currentUser
          )
        );


        localStorage.setItem(
          LAST_ACTIVITY_KEY,
          Date.now().toString()
        );


        // ================================
        // LOAD VEHICLES
        // ================================

        loadVehicleCatalog();


        // ================================
        // ENTER PORTAL
        // ================================

        showPortal(
          currentUser
        );


      } catch (error) {

        console.error(
          "CRM login error:",
          error
        );


        message.className =
          "message error";


        message.textContent =
          "Unable to connect to the CRM.";

      } finally {

        button.disabled =
          false;

        loading.style.display =
          "none";

      }

    }
  );


// ========================================
// LOGOUT
// ========================================

async function logout() {

  try {

    // Attempt to invalidate
    // server-side API session.
    const token =
      localStorage.getItem(
        "crmSessionToken"
      );


    if (token) {

      await crmApi(
        "logout"
      );

    }


  } catch (error) {

    // Logout locally even if
    // API logout fails.
    console.error(
      "API logout error:",
      error
    );

  } finally {

    clearLocalCrmLogin();

  }

}


// ========================================
// CLEAR LOCAL LOGIN
// ========================================

function clearLocalCrmLogin() {

  currentUser =
    null;


  // New API session storage
  clearCrmSession();


  // Existing CRM UI storage
  localStorage.removeItem(
    SESSION_KEY
  );


  localStorage.removeItem(
    LAST_ACTIVITY_KEY
  );


  const portalPage =
    document.getElementById(
      "portalPage"
    );


  const loginPage =
    document.getElementById(
      "loginPage"
    );


  const loginForm =
    document.getElementById(
      "loginForm"
    );


  const pageTitle =
    document.getElementById(
      "pageTitle"
    );


  if (portalPage) {

    portalPage.style.display =
      "none";

  }


  if (loginPage) {

    loginPage.style.display =
      "flex";

  }


  if (loginForm) {

    loginForm.reset();

  }


  if (pageTitle) {

    pageTitle.textContent =
      "Dashboard";

  }

}


// ========================================
// RESTORE SAVED SESSION
// ========================================

function restoreSession() {

  const savedSession =
    localStorage.getItem(
      SESSION_KEY
    );


  const lastActivity =
    localStorage.getItem(
      LAST_ACTIVITY_KEY
    );


  const apiToken =
    localStorage.getItem(
      "crmSessionToken"
    );


  // We now require BOTH:
  // local user + API token.
  if (
    !savedSession ||
    !lastActivity ||
    !apiToken
  ) {

    clearCrmSession();

    localStorage.removeItem(
      SESSION_KEY
    );

    localStorage.removeItem(
      LAST_ACTIVITY_KEY
    );

    return;

  }


  const inactiveTime =
    Date.now() -
    Number(lastActivity);


  // ================================
  // 1-HOUR INACTIVITY EXPIRATION
  // ================================

  if (
    inactiveTime >=
    SESSION_TIMEOUT
  ) {

    clearCrmSession();

    localStorage.removeItem(
      SESSION_KEY
    );

    localStorage.removeItem(
      LAST_ACTIVITY_KEY
    );

    return;

  }


  try {

    const savedUser =
      JSON.parse(
        savedSession
      );


    if (
      !savedUser ||
      !savedUser.userId
    ) {

      clearLocalCrmLogin();

      return;

    }


    // ================================
    // CHECK API EXPIRATION
    // ================================

    if (
      savedUser.expiresAt
    ) {

      const expiresAt =
        new Date(
          savedUser.expiresAt
        );


      if (
        !isNaN(
          expiresAt.getTime()
        ) &&
        expiresAt.getTime() <=
          Date.now()
      ) {

        clearLocalCrmLogin();

        return;

      }

    }


currentUser = savedUser;

// Reload vehicle suggestions after refresh
// only when pm-leads.js is already available
if (
  typeof loadVehicleCatalog ===
  "function"
) {

  loadVehicleCatalog();

}

if (
  typeof showPortal ===
  "function"
) {

  showPortal(
    savedUser
  );

} else {

  console.error(
    "Unable to restore session: showPortal is not available."
  );

}


  } catch (error) {

    console.error(
      "Unable to restore session:",
      error
    );


    clearLocalCrmLogin();

  }

}


// ========================================
// INACTIVITY SESSION TIMER
// ========================================

function updateLastActivity() {

  if (!currentUser) {
    return;
  }


  localStorage.setItem(
    LAST_ACTIVITY_KEY,
    Date.now().toString()
  );

}


// ========================================
// CHECK SESSION TIMEOUT
// ========================================

function checkSessionTimeout() {

  if (!currentUser) {
    return;
  }


  const lastActivity =
    Number(
      localStorage.getItem(
        LAST_ACTIVITY_KEY
      )
    );


  if (!lastActivity) {
    return;
  }


  const inactiveTime =
    Date.now() -
    lastActivity;


  if (
    inactiveTime >=
    SESSION_TIMEOUT
  ) {

    alert(
      "Your session expired due to 1 hour of inactivity."
    );


    logout();

  }

}


// ========================================
// USER ACTIVITY
// ========================================

[
  "click",
  "keydown",
  "scroll",
  "touchstart"
]
.forEach(
  function(eventName) {

    document.addEventListener(
      eventName,
      updateLastActivity,
      {
        passive: true
      }
    );

  }
);


// ========================================
// CHECK EVERY MINUTE
// ========================================

setInterval(
  checkSessionTimeout,
  60 * 1000
);


// ========================================
// RESTORE SESSION ON LOAD
// ========================================

restoreSession();

let currentUser = null;
    let currentLeads = [];

    const SESSION_KEY = "crm_session";
const LAST_ACTIVITY_KEY = "crm_last_activity";

const SESSION_TIMEOUT =
  60 * 60 * 1000; // 1 hour



    /* =========================
       LOGIN
       ========================= */

    document
      .getElementById("loginForm")
      .addEventListener("submit", function(event) {

        event.preventDefault();

        const username =
          document.getElementById("username")
            .value
            .trim();

        const password =
          document.getElementById("password")
            .value;

        const button =
          document.getElementById("loginButton");

        const loading =
          document.getElementById("loading");

        const message =
          document.getElementById("message");

        message.className = "message";
        message.textContent = "";

        button.disabled = true;
        loading.style.display = "block";

        google.script.run

          .withSuccessHandler(function(result) {

            button.disabled = false;
            loading.style.display = "none";

           if (result.success) {

currentUser = result;

localStorage.setItem(
  SESSION_KEY,
  JSON.stringify(result)
);

localStorage.setItem(
  LAST_ACTIVITY_KEY,
  Date.now().toString()
);

// Load standardized vehicle list
loadVehicleCatalog();

showPortal(result);

} else {

  message.className =
    "message error";

  message.textContent =
    result.message;
}

          })

          .withFailureHandler(function(error) {

            button.disabled = false;
            loading.style.display = "none";

            message.className =
              "message error";

            message.textContent =
              "Unable to connect to the CRM.";

            console.error(error);

          })

          .authenticateUser(
            username,
            password
          );

      });


    /* =========================
       SHOW PORTAL
       ========================= */


function logout() {

  google.script.run

    .withSuccessHandler(function(result) {

      currentUser = null;

      localStorage.removeItem(
        SESSION_KEY
      );

      localStorage.removeItem(
        LAST_ACTIVITY_KEY
      );

      document
        .getElementById("portalPage")
        .style.display = "none";

      document
        .getElementById("loginPage")
        .style.display = "flex";

      document
        .getElementById("loginForm")
        .reset();

      document
        .getElementById("pageTitle")
        .textContent =
        "Dashboard";

    })

    .withFailureHandler(function(error) {

      alert(
        "Unable to logout properly."
      );

      console.error(error);

    })

    .logoutUser();

}


    // =========================
// RESTORE SAVED SESSION
// =========================

function restoreSession() {

  const savedSession =
    localStorage.getItem(SESSION_KEY);

  const lastActivity =
    localStorage.getItem(LAST_ACTIVITY_KEY);

  if (!savedSession || !lastActivity) {
    return;
  }

  const inactiveTime =
    Date.now() - Number(lastActivity);

  // Session expired
  if (inactiveTime >= SESSION_TIMEOUT) {

    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(LAST_ACTIVITY_KEY);

    return;
  }

  try {

    const savedUser =
      JSON.parse(savedSession);

    if (!savedUser || !savedUser.userId) {
      return;
    }
currentUser = savedUser;

// Reload vehicle suggestions after refresh
loadVehicleCatalog();

showPortal(savedUser);

  } catch (error) {

    console.error(
      "Unable to restore session:",
      error
    );

    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(LAST_ACTIVITY_KEY);
  }
}


// =========================
// INACTIVITY SESSION TIMER
// =========================

function updateLastActivity() {

  if (!currentUser) {
    return;
  }

  localStorage.setItem(
    LAST_ACTIVITY_KEY,
    Date.now().toString()
  );
}


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
    Date.now() - lastActivity;

  if (inactiveTime >= SESSION_TIMEOUT) {

    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(LAST_ACTIVITY_KEY);

    alert(
      "Your session expired due to 1 hour of inactivity."
    );

    logout();
  }
}


// User activity
[
  "click",
  "keydown",
  "scroll",
  "touchstart"
].forEach(function(eventName) {

  document.addEventListener(
    eventName,
    updateLastActivity,
    { passive: true }
  );

});


// Check inactivity every minute
setInterval(
  checkSessionTimeout,
  60 * 1000
);
// Restore login when page loads
restoreSession();

window.CRMUtils =
  window.CRMUtils || {};


async function crmApi(
  action,
  data = {}
) {

  const token =
    localStorage.getItem(
      "crmSessionToken"
    );


  const payload = {
    action: action,
    ...data
  };


  if (
    action !== "login" &&
    token
  ) {

    payload.token =
      token;

  }


  const response =
    await fetch(
      CRM_CONFIG.API_URL,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json"
        },

        body:
          JSON.stringify(
            payload
          )
      }
    );


  if (!response.ok) {

    throw new Error(
      "API request failed: " +
      response.status
    );

  }


  const result =
    await response.json();


  return result;

}


// =========================
// SESSION HELPERS
// =========================

function saveCrmSession(
  result
) {

  if (
    !result ||
    !result.token
  ) {
    return;
  }


  localStorage.setItem(
    "crmSessionToken",
    result.token
  );


  localStorage.setItem(
    "crmSessionUser",
    JSON.stringify({
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
    })
  );

}


function getCrmStoredUser() {

  const raw =
    localStorage.getItem(
      "crmSessionUser"
    );


  if (!raw) {
    return null;
  }


  try {

    return JSON.parse(raw);

  } catch (error) {

    return null;

  }

}


function clearCrmSession() {

  localStorage.removeItem(
    "crmSessionToken"
  );

  localStorage.removeItem(
    "crmSessionUser"
  );

}

const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwDmJGpj37YWOvP5gGbw-ARe1WuZG3H1cOYWVByhPnVjFv4dXxRXu8UFR2yQ1xVUIBJ/exec";


module.exports = async function handler(
  req,
  res
) {

  try {

    // =========================
    // GET = HEALTH CHECK
    // =========================

    if (req.method === "GET") {

      const response =
        await fetch(
          APPS_SCRIPT_URL +
          "?action=ping",
          {
            redirect: "follow"
          }
        );


      const text =
        await response.text();


      res
        .status(200)
        .setHeader(
          "Content-Type",
          "application/json"
        )
        .setHeader(
          "Cache-Control",
          "no-store"
        )
        .send(text);


      return;

    }


    // =========================
    // POST = CRM API
    // =========================

    if (req.method === "POST") {

      const response =
        await fetch(
          APPS_SCRIPT_URL,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body:
              JSON.stringify(
                req.body || {}
              ),

            redirect:
              "follow"
          }
        );


      const text =
        await response.text();


      res
        .status(
          response.ok
            ? 200
            : response.status
        )
        .setHeader(
          "Content-Type",
          "application/json"
        )
        .setHeader(
          "Cache-Control",
          "no-store"
        )
        .send(text);


      return;

    }


    // =========================
    // METHOD NOT ALLOWED
    // =========================

    res
      .status(405)
      .json({
        success: false,
        message:
          "Method not allowed."
      });


  } catch (error) {

    console.error(
      "CRM proxy error:",
      error
    );


    res
      .status(500)
      .json({
        success: false,
        message:
          "Unable to reach CRM backend."
      });

  }

};

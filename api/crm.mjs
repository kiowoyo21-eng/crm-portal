const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwDmJGpj37YWOvP5gGbw-ARe1WuZG3H1cOYWVByhPnVjFv4dXxRXu8UFR2yQ1xVUIBJ/exec";


module.exports = async function handler(req, res) {

  try {

    // =========================
    // HEALTH CHECK
    // =========================

    if (req.method === "GET") {

      const response =
        await fetch(
          APPS_SCRIPT_URL,
          {
            method: "GET",
            redirect: "follow"
          }
        );

      const text =
        await response.text();

      res.setHeader(
        "Content-Type",
        "application/json; charset=utf-8"
      );

      res.setHeader(
        "Cache-Control",
        "no-store"
      );

      return res
        .status(response.status)
        .send(text);
    }


    // =========================
    // CRM POST
    // =========================

    if (req.method === "POST") {

      let payload = req.body;


      // Make sure payload is an object
      if (typeof payload === "string") {

        try {
          payload =
            JSON.parse(payload);
        } catch (error) {

          return res
            .status(400)
            .json({
              success: false,
              message:
                "Invalid CRM request body."
            });
        }
      }


      const response =
        await fetch(
          APPS_SCRIPT_URL,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "text/plain;charset=utf-8"
            },

            body:
              JSON.stringify(
                payload || {}
              ),

            redirect:
              "follow"
          }
        );


      const text =
        await response.text();


      // Helpful server-side debugging
      console.log(
        "Apps Script status:",
        response.status
      );

      console.log(
        "Apps Script response:",
        text
      );


      res.setHeader(
        "Content-Type",
        "application/json; charset=utf-8"
      );

      res.setHeader(
        "Cache-Control",
        "no-store"
      );


      return res
        .status(response.status)
        .send(text);
    }


    // =========================
    // METHOD NOT ALLOWED
    // =========================

    return res
      .status(405)
      .json({
        success: false,
        message:
          "Method not allowed."
      });


  } catch (error) {

    console.error(
      "CRM PROXY ERROR:",
      error
    );


    return res
      .status(500)
      .json({
        success: false,

        message:
          "CRM proxy failed.",

        error:
          error instanceof Error
            ? error.message
            : String(error)
      });

  }

};

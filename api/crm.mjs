const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwDmJGpj37YWOvP5gGbw-ARe1WuZG3H1cOYWVByhPnVjFv4dXxRXu8UFR2yQ1xVUIBJ/exec";


export async function GET() {

  try {

    const response =
      await fetch(
        APPS_SCRIPT_URL +
        "?action=ping",
        {
          method: "GET",
          redirect: "follow",
          cache: "no-store"
        }
      );


    const text =
      await response.text();


    return new Response(
      text,
      {
        status:
          response.status,

        headers: {
          "Content-Type":
            "application/json; charset=utf-8",

          "Cache-Control":
            "no-store"
        }
      }
    );


  } catch (error) {

    console.error(
      "CRM GET proxy error:",
      error
    );


    return Response.json(
      {
        success: false,
        message:
          "Unable to reach CRM backend.",
        error:
          error instanceof Error
            ? error.message
            : String(error)
      },
      {
        status: 500
      }
    );

  }

}


export async function POST(
  request
) {

  try {

    // Read the exact JSON body
    const payload =
      await request.json();


    console.log(
      "CRM proxy action:",
      payload &&
      payload.action
        ? payload.action
        : "UNKNOWN"
    );


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
            "follow",

          cache:
            "no-store"
        }
      );


    const text =
      await response.text();


    console.log(
      "Apps Script status:",
      response.status
    );


    console.log(
      "Apps Script body:",
      text
    );


    return new Response(
      text,
      {
        status:
          response.status,

        headers: {
          "Content-Type":
            "application/json; charset=utf-8",

          "Cache-Control":
            "no-store"
        }
      }
    );


  } catch (error) {

    console.error(
      "CRM POST proxy error:",
      error
    );


    return Response.json(
      {
        success: false,

        message:
          "CRM proxy failed.",

        error:
          error instanceof Error
            ? error.message
            : String(error)
      },
      {
        status: 500
      }
    );

  }

}

const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwDmJGpj37YWOvP5gGbw-ARe1WuZG3H1cOYWVByhPnVjFv4dXxRXu8UFR2yQ1xVUIBJ/exec";


export async function POST(request) {

  try {

    const body =
      await request.text();


    const response =
      await fetch(
        APPS_SCRIPT_URL,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: body,

          redirect: "follow"
        }
      );


    const text =
      await response.text();


    return new Response(
      text,
      {
        status:
          response.ok
            ? 200
            : response.status,

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
      "CRM proxy error:",
      error
    );


    return Response.json(
      {
        success: false,

        message:
          "Unable to reach CRM backend."
      },
      {
        status: 500
      }
    );

  }

}


export async function GET() {

  try {

    const response =
      await fetch(
        APPS_SCRIPT_URL +
        "?action=ping",
        {
          redirect:
            "follow",

          cache:
            "no-store"
        }
      );


    const text =
      await response.text();


    return new Response(
      text,
      {
        status: 200,

        headers: {
          "Content-Type":
            "application/json; charset=utf-8",

          "Cache-Control":
            "no-store"
        }
      }
    );


  } catch (error) {

    return Response.json(
      {
        success: false,
        message:
          "CRM backend unavailable."
      },
      {
        status: 500
      }
    );

  }

}

function loadPMReports() {

  if (
    !currentUser ||
    !currentUser.userId
  ) {
    return;
  }


  const startInput =
    document.getElementById(
      "reportStartDate"
    );

  const endInput =
    document.getElementById(
      "reportEndDate"
    );

  const branchInput =
    document.getElementById(
      "reportBranchFilter"
    );


  if (
    !startInput ||
    !endInput ||
    !branchInput
  ) {

    console.error(
      "Report filters not found."
    );

    return;
  }


  // =========================
  // DEFAULT DATE RANGE
  // CURRENT MONTH
  // =========================

  if (
    !startInput.value ||
    !endInput.value
  ) {

    const today =
      new Date();

    const firstDay =
      new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      );

    const lastDay =
      new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        0
      );


    startInput.value =
      formatCalendarDateKey(
        firstDay
      );

    endInput.value =
      formatCalendarDateKey(
        lastDay
      );

  }


  const startDate =
    startInput.value;

  const endDate =
    endInput.value;

  const branch =
    branchInput.value || "ALL";


  // =========================
  // VALIDATION
  // =========================

  if (
    !startDate ||
    !endDate
  ) {

    alert(
      "Please select a report date range."
    );

    return;
  }


  if (
    startDate > endDate
  ) {

    alert(
      "Start date cannot be after end date."
    );

    return;
  }


  // =========================
  // LOAD REPORT
  // =========================

  google.script.run

    .withSuccessHandler(
      function(result) {

        console.log(
          "PM Reports:",
          result
        );


        if (
          !result ||
          !result.success
        ) {

          alert(
            result &&
            result.message
              ? result.message
              : "Unable to load reports."
          );

          return;
        }


        renderPMReports(
          result
        );

      }
    )

    .withFailureHandler(
  function(error) {

    console.error(
      "PM Reports error:",
      error
    );

    alert(
      "REPORT ERROR:\n\n" +
      (
        error && error.message
          ? error.message
          : JSON.stringify(error)
      )
    );

  }
)

    .getPMReportsData(
      currentUser.userId,
      startDate,
      endDate,
      branch
    );

}

function renderPMReports(
  result
) {

  const kpis =
    result.kpis || {};


  // =========================
  // FUNNEL KPI
  // =========================

  setReportText(
    "reportTotalInquiries",
    kpis.totalInquiries || 0
  );

  setReportText(
    "reportTotalBooked",
    kpis.totalBooked || 0
  );

  setReportText(
    "reportInquiryToBook",
    (kpis.inquiryToBook || 0) + "%"
  );

  setReportText(
    "reportTotalConverted",
    kpis.totalConverted || 0
  );

  setReportText(
    "reportBookToConvert",
    (kpis.bookToConvert || 0) + "%"
  );

  setReportText(
    "reportInquiryToConvert",
    (kpis.inquiryToConvert || 0) + "%"
  );


  // =========================
  // COMMISSION SUMMARY
  // =========================

  const commission =
    result.commission || {};


  setReportText(
    "reportCommissionRate",
    formatPeso(
      commission.rate || 0
    )
  );

  setReportText(
    "reportCommissionConversions",
    commission.totalConversions || 0
  );

  setReportText(
    "reportTotalCommission",
    formatPeso(
      commission.totalCommission || 0
    )
  );

  // =========================
// REPORT TABLES
// =========================

renderReportBranchPerformance(
  result.branchPerformance || []
);

renderReportSourcePerformance(
  result.sourcePerformance || []
);

renderReportPMPerformance(
  result.pmPerformance || []
);

renderReportBookedByPerformance(
  result.bookedByPerformance || []
);

renderReportCommissionTable(
  (
    result.commission &&
    result.commission.byBookedBy
  ) || []
);

renderReportFollowUp(
  result.followUp || {}
);

renderReportVehicleInsights(
  result.vehicleInsights || []
);

renderReportAppointmentOutcomes(
  result.appointmentOutcomes || {}
);

}

function toggleReportSection(
  bodyId,
  button
) {

  const body =
    document.getElementById(
      bodyId
    );

  if (!body) {
    return;
  }

  const icon =
    button.querySelector(
      ".report-toggle-icon"
    );

  const isOpen =
    body.style.display !== "none";

  body.style.display =
    isOpen
      ? "none"
      : "block";

  if (icon) {
    icon.textContent =
      isOpen
        ? "▾"
        : "▴";
  }

}

function renderSimpleReportTable(
  containerId,
  columns,
  rows
) {

  const container =
    document.getElementById(
      containerId
    );

  if (!container) {
    return;
  }


  if (!rows || rows.length === 0) {

    container.innerHTML = `
      <div class="report-empty">
        No data available for this period.
      </div>
    `;

    return;
  }


  let html = `
    <div class="report-table-wrap">

      <table class="report-table">

        <thead>
          <tr>
  `;


  columns.forEach(
    function(column) {

      html += `
        <th>
          ${escapeHtml(column.label)}
        </th>
      `;

    }
  );


  html += `
          </tr>
        </thead>

        <tbody>
  `;


  rows.forEach(
    function(row) {

      html += `<tr>`;


      columns.forEach(
        function(column) {

          let value =
            row[column.key];


          if (
            value === undefined ||
            value === null ||
            value === ""
          ) {
            value = "—";
          }


          if (
            column.type === "percent" &&
            value !== "—"
          ) {
            value = value + "%";
          }


          if (
            column.type === "peso" &&
            value !== "—"
          ) {
            value =
              formatPeso(value);
          }


          html += `
            <td>
              ${escapeHtml(
                String(value)
              )}
            </td>
          `;

      });


      html += `</tr>`;

    }
  );


  html += `
        </tbody>

      </table>

    </div>
  `;


  container.innerHTML = html;

}

function renderReportBranchPerformance(
  rows
) {

  renderSimpleReportTable(
    "reportBranchPerformance",
    [
      {
        key: "branchId",
        label: "Branch"
      },
      {
        key: "inquiries",
        label: "Inquiries"
      },
      {
        key: "booked",
        label: "Booked"
      },
      {
        key: "converted",
        label: "Converted"
      },
      {
        key: "inquiryToBook",
        label: "Inquiry → Book",
        type: "percent"
      },
      {
        key: "bookToConvert",
        label: "Book → Convert",
        type: "percent"
      }
    ],
    rows
  );

}


function renderReportSourcePerformance(
  rows
) {

  renderSimpleReportTable(
    "reportSourcePerformance",
    [
      {
        key: "source",
        label: "Source"
      },
      {
        key: "inquiries",
        label: "Inquiries"
      },
      {
        key: "booked",
        label: "Booked"
      },
      {
        key: "converted",
        label: "Converted"
      },
      {
        key: "inquiryToBook",
        label: "Inquiry → Book",
        type: "percent"
      },
      {
        key: "bookToConvert",
        label: "Book → Convert",
        type: "percent"
      }
    ],
    rows
  );

}


function renderReportPMPerformance(
  rows
) {

  renderSimpleReportTable(
    "reportPMPerformance",
    [
      {
        key: "pm",
        label: "Page Manager"
      },
      {
        key: "inquiries",
        label: "Inquiries"
      },
      {
        key: "booked",
        label: "Booked"
      },
      {
        key: "converted",
        label: "Converted"
      },
      {
        key: "inquiryToBook",
        label: "Inquiry → Book",
        type: "percent"
      },
      {
        key: "bookToConvert",
        label: "Book → Convert",
        type: "percent"
      }
    ],
    rows
  );

}


function renderReportBookedByPerformance(
  rows
) {

  renderSimpleReportTable(
    "reportBookedByPerformance",
    [
      {
        key: "bookedBy",
        label: "Booked By"
      },
      {
        key: "appointmentsCreated",
        label: "Bookings"
      },
      {
        key: "converted",
        label: "Converted"
      },
      {
        key: "bookToConvert",
        label: "Conversion",
        type: "percent"
      }
    ],
    rows
  );

}


function renderReportCommissionTable(
  rows
) {

  renderSimpleReportTable(
    "reportCommissionTable",
    [
      {
        key: "bookedBy",
        label: "Page Manager"
      },
      {
        key: "conversions",
        label: "Conversions"
      },
      {
        key: "commission",
        label: "Commission",
        type: "peso"
      }
    ],
    rows
  );

}


function renderReportVehicleInsights(
  rows
) {

  renderSimpleReportTable(
    "reportVehicleInsights",
    [
      {
        key: "vehicle",
        label: "Vehicle"
      },
      {
        key: "inquiries",
        label: "Inquiries"
      },
      {
        key: "booked",
        label: "Booked"
      }
    ],
    rows
  );

}

function renderReportAppointmentOutcomes(
  outcomes
) {

  const rows =
    Object.keys(outcomes)
      .map(
        function(status) {

          return {
            status: status,
            count: outcomes[status]
          };

        }
      );


  renderSimpleReportTable(
    "reportAppointmentOutcomes",
    [
      {
        key: "status",
        label: "Outcome"
      },
      {
        key: "count",
        label: "Appointments"
      }
    ],
    rows
  );

}


function renderReportFollowUp(
  followUp
) {

  const rows = [];

  (
    followUp.byPM || []
  ).forEach(
    function(item) {

      rows.push({
        pm:
          item.pm || "Unassigned",

        count:
          item.count || 0
      });

    }
  );


  renderSimpleReportTable(
    "reportFollowUp",
    [
      {
        key: "pm",
        label: "Page Manager"
      },
      {
        key: "count",
        label: "Follow Ups"
      }
    ],
    rows
  );

}


function setReportText(
  elementId,
  value
) {

  const element =
    document.getElementById(
      elementId
    );

  if (element) {
    element.textContent =
      value;
  }

}


function formatPeso(
  amount
) {

  return (
    "₱" +
    Number(
      amount || 0
    )
      .toLocaleString(
        "en-PH",
        {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2
        }
      )
  );

}

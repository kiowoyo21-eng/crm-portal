/**
 * SA RELEASE
 * CRM Production Frontend
 *
 * Handles:
 * - Release preparation
 * - Payment details
 * - Discounts / waivers
 * - Additional expenses
 * - Unit release
 * - Compliance submission
 * - BM / Direk compliance review
 */


let currentReleaseOpportunityId = null;


// ========================================
// OPEN RELEASE
// ========================================

function openSARelease(opportunityId) {

  currentReleaseOpportunityId =
    String(
      opportunityId || ""
    ).trim();


  if (!currentReleaseOpportunityId) {

    alert(
      "Opportunity not found."
    );

    return;

  }


  const modal =
    document.getElementById(
      "saReleaseModal"
    );


  if (!modal) {

    console.error(
      "saReleaseModal not found."
    );

    return;

  }


  resetSAReleaseForm();


  const opportunity =
    typeof currentSAOpportunities !==
      "undefined"
      ? currentSAOpportunities.find(
          function(item) {

            return String(
              item.opportunityId || ""
            ) ===
            currentReleaseOpportunityId;

          }
        )
      : null;


  if (opportunity) {

    setTextIfExists(
      "saReleaseCustomer",
      opportunity.customerName || "—"
    );


    setTextIfExists(
      "saReleaseVehicle",
      opportunity.vehicle || "—"
    );


    setTextIfExists(
      "saReleasePlate",
      opportunity.plateNumber || "—"
    );


    setTextIfExists(
      "saReleaseOpportunityId",
      opportunity.opportunityId || "—"
    );

  }


  modal.classList.add(
    "show"
  );

}


// ========================================
// CLOSE RELEASE
// ========================================

function closeSARelease() {

  const modal =
    document.getElementById(
      "saReleaseModal"
    );


  if (modal) {

    modal.classList.remove(
      "show"
    );

  }


  currentReleaseOpportunityId =
    null;

}


// ========================================
// RESET RELEASE FORM
// ========================================

function resetSAReleaseForm() {

  const form =
    document.getElementById(
      "saReleaseForm"
    );


  if (form) {

    form.reset();

  }


  [
    "saReleaseFinalTotal",
    "saReleaseDiscount",
    "saReleaseWaiver",
    "saReleaseVat",
    "saReleaseReceived"
  ].forEach(
    function(id) {

      const input =
        document.getElementById(
          id
        );


      if (input) {

        input.value =
          "0";

      }

    }
  );


  updateSAReleaseTotals();

}


// ========================================
// CALCULATE RELEASE TOTALS
// ========================================

function updateSAReleaseTotals() {

  const total =
    getNumberInput(
      "saReleaseFinalTotal"
    );


  const discount =
    getNumberInput(
      "saReleaseDiscount"
    );


  const waiver =
    getNumberInput(
      "saReleaseWaiver"
    );


  const vat =
    getNumberInput(
      "saReleaseVat"
    );


  const received =
    getNumberInput(
      "saReleaseReceived"
    );


  const amountDue =
    Math.max(
      0,
      total -
      discount -
      waiver +
      vat
    );


  const balance =
    Math.max(
      0,
      amountDue -
      received
    );


  setTextIfExists(
    "saReleaseAmountDue",
    formatMoneySA(
      amountDue
    )
  );


  setTextIfExists(
    "saReleaseBalance",
    formatMoneySA(
      balance
    )
  );


  return {

    total:
      total,

    discount:
      discount,

    waiver:
      waiver,

    vat:
      vat,

    amountDue:
      amountDue,

    received:
      received,

    balance:
      balance

  };

}


// ========================================
// PREPARE RELEASE
// ========================================

async function prepareSARelease() {

  if (
    !currentReleaseOpportunityId
  ) {

    alert(
      "No Opportunity selected."
    );

    return;

  }


  const totals =
    updateSAReleaseTotals();


  const paymentMethod =
    getInputValue(
      "saReleasePaymentMethod"
    );


  const paymentReference =
    getInputValue(
      "saReleasePaymentReference"
    );


  const paymentRemarks =
    getInputValue(
      "saReleasePaymentRemarks"
    );


  const button =
    document.getElementById(
      "saPrepareReleaseButton"
    );


  setButtonLoadingSA(
    button,
    true,
    "PREPARING..."
  );


  try {

    const result =
      await apiRequest({
        action:
          "prepareRelease",

        opportunityId:
          currentReleaseOpportunityId,

        releaseData: {

          finalQuotationTotal:
            totals.total,

          discountTotal:
            totals.discount,

          waiverTotal:
            totals.waiver,

          vatTotal:
            totals.vat,

          amountDue:
            totals.amountDue,

          amountReceived:
            totals.received,

          paymentMethod:
            paymentMethod,

          paymentReference:
            paymentReference,

          paymentRemarks:
            paymentRemarks

        }

      });


    if (
      !result ||
      !result.success
    ) {

      throw new Error(
        result &&
        result.message
          ? result.message
          : "Unable to prepare release."
      );

    }


    alert(
      result.message ||
      "Release prepared."
    );


    await refreshSAOpportunitiesAfterRelease();

  } catch (error) {

    console.error(
      "prepareSARelease:",
      error
    );


    alert(
      error.message ||
      "Unable to prepare release."
    );

  } finally {

    setButtonLoadingSA(
      button,
      false,
      "PREPARE RELEASE"
    );

  }

}


// ========================================
// RELEASE UNIT
// ========================================

async function releaseSAUnit() {

  if (
    !currentReleaseOpportunityId
  ) {

    return;

  }


  const confirmed =
    confirm(
      "Confirm that the vehicle is being released to the client?"
    );


  if (!confirmed) {

    return;

  }


  const button =
    document.getElementById(
      "saReleaseUnitButton"
    );


  setButtonLoadingSA(
    button,
    true,
    "RELEASING..."
  );


  try {

    const result =
      await apiRequest({

        action:
          "releaseUnit",

        opportunityId:
          currentReleaseOpportunityId

      });


    if (
      !result ||
      !result.success
    ) {

      throw new Error(
        result &&
        result.message
          ? result.message
          : "Unable to release unit."
      );

    }


    alert(
      result.message ||
      "Unit released."
    );


    closeSARelease();


    await refreshSAOpportunitiesAfterRelease();

  } catch (error) {

    console.error(
      "releaseSAUnit:",
      error
    );


    alert(
      error.message ||
      "Unable to release unit."
    );

  } finally {

    setButtonLoadingSA(
      button,
      false,
      "RELEASE UNIT"
    );

  }

}


// ========================================
// ADD EXPENSE
// ========================================

async function addSAOpportunityExpense() {

  if (
    !currentReleaseOpportunityId
  ) {

    return;

  }


  const subject =
    getInputValue(
      "saExpenseSubject"
    );


  const description =
    getInputValue(
      "saExpenseDescription"
    );


  const amount =
    getNumberInput(
      "saExpenseAmount"
    );


  if (!subject) {

    alert(
      "Expense subject is required."
    );

    return;

  }


  if (
    amount <= 0
  ) {

    alert(
      "Enter a valid expense amount."
    );

    return;

  }


  const result =
    await apiRequest({

      action:
        "addOpportunityExpense",

      opportunityId:
        currentReleaseOpportunityId,

      expenseData: {

        expenseType:
          getInputValue(
            "saExpenseType"
          ) ||
          "Other",

        subject:
          subject,

        description:
          description,

        amount:
          amount,

        paidTo:
          getInputValue(
            "saExpensePaidTo"
          ),

        supplierId:
          getInputValue(
            "saExpenseSupplierId"
          ),

        paymentMethod:
          getInputValue(
            "saExpensePaymentMethod"
          ),

        referenceNo:
          getInputValue(
            "saExpenseReference"
          ),

        chargeableToClient:
          getCheckboxValue(
            "saExpenseChargeable"
          ),

        internalExpense:
          true,

        attachmentId:
          ""

      }

    });


  if (
    !result ||
    !result.success
  ) {

    alert(
      result &&
      result.message
        ? result.message
        : "Unable to add expense."
    );

    return;

  }


  alert(
    "Expense recorded."
  );


  [
    "saExpenseSubject",
    "saExpenseDescription",
    "saExpenseAmount",
    "saExpensePaidTo",
    "saExpenseReference"
  ].forEach(
    function(id) {

      const element =
        document.getElementById(
          id
        );


      if (element) {

        element.value =
          "";

      }

    }
  );

}


// ========================================
// SUBMIT COMPLIANCE
// ========================================

async function submitSAComplianceReview(
  opportunityId
) {

  const id =
    String(
      opportunityId ||
      currentReleaseOpportunityId ||
      ""
    ).trim();


  if (!id) {

    return;

  }


  const confirmed =
    confirm(
      "Submit this released transaction for BM compliance review?"
    );


  if (!confirmed) {

    return;

  }


  const result =
    await apiRequest({

      action:
        "submitComplianceReview",

      opportunityId:
        id

    });


  if (
    !result ||
    !result.success
  ) {

    alert(
      result &&
      result.message
        ? result.message
        : "Unable to submit compliance."
    );

    return;

  }


  alert(
    result.message ||
    "Submitted for review."
  );


  await refreshSAOpportunitiesAfterRelease();

}


// ========================================
// BM / DIREK REVIEW
// ========================================

async function reviewSACompliance(
  opportunityId,
  decision
) {

  const id =
    String(
      opportunityId || ""
    ).trim();


  if (!id) {

    return;

  }


  const normalizedDecision =
    String(
      decision || ""
    )
      .trim()
      .toUpperCase();


  let remarks =
    "";


  if (
    normalizedDecision ===
    "RETURN"
  ) {

    remarks =
      prompt(
        "Reason / compliance requirements to return to SA:"
      ) || "";


    if (
      !remarks.trim()
    ) {

      alert(
        "Remarks are required."
      );

      return;

    }

  } else {

    remarks =
      prompt(
        "Review remarks (optional):"
      ) || "";

  }


  const result =
    await apiRequest({

      action:
        "reviewCompliance",

      opportunityId:
        id,

      decision:
        normalizedDecision,

      remarks:
        remarks

    });


  if (
    !result ||
    !result.success
  ) {

    alert(
      result &&
      result.message
        ? result.message
        : "Unable to complete review."
    );

    return;

  }


  alert(
    result.message ||
    "Compliance review updated."
  );


  await refreshSAOpportunitiesAfterRelease();

}


// ========================================
// HELPERS
// ========================================

function getInputValue(id) {

  const element =
    document.getElementById(
      id
    );


  return element
    ? String(
        element.value || ""
      ).trim()
    : "";

}


function getNumberInput(id) {

  const element =
    document.getElementById(
      id
    );


  if (!element) {

    return 0;

  }


  const value =
    Number(
      element.value ||
      0
    );


  return Number.isFinite(
    value
  )
    ? value
    : 0;

}


function getCheckboxValue(id) {

  const element =
    document.getElementById(
      id
    );


  return element
    ? element.checked === true
    : false;

}


function setTextIfExists(
  id,
  value
) {

  const element =
    document.getElementById(
      id
    );


  if (element) {

    element.textContent =
      value;

  }

}


function formatMoneySA(value) {

  return (
    "₱" +
    Number(
      value ||
      0
    ).toLocaleString(
      "en-PH",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
    )
  );

}


function setButtonLoadingSA(
  button,
  loading,
  text
) {

  if (!button) {

    return;

  }


  button.disabled =
    loading;


  if (
    loading
  ) {

    if (
      !button.dataset.originalText
    ) {

      button.dataset.originalText =
        button.textContent;

    }


    button.textContent =
      text;

  } else {

    button.textContent =
      button.dataset.originalText ||
      text;


    delete button.dataset.originalText;

  }

}


async function refreshSAOpportunitiesAfterRelease() {

  if (
    typeof loadSAOpportunities ===
    "function"
  ) {

    await loadSAOpportunities();

  }

}

import React from "react";
import FormDate from "../../components/FormDate";
import FormText from "../../components/FormText";
import icon from "../../properties/icon";

function EarningDeductionHead() {
  return (
    <div className="card shadow-lg rounded-3">
      <div className="card-body p-4">
        <h5 className="text-center mb-4">Earning and Deduction Head</h5>
        <div className="row g-4">
          {/* Earning Head Table */}
          <div className="col-md-6">
            <div className="table-container">
            <div class="table-header text-center p-2 bg-secondary text-white">Earning Head</div>
              <div className="table-responsive1">
                <table className="table table-bordered table-striped my-1">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Mapping</th>
                      <th>Amount</th>
                      <th>Assignment From</th>
                      <th>Is Manual</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <FormText
                          name="earningDescription"
                          holder="Auto Generated"
                          value=""
                          errorMessage=""
                          icon={icon.user}
                          Maxlength="25"
                        />
                      </td>
                      <td>
                        <FormText
                          name="earningMapping"
                          holder="Auto Generated"
                          value=""
                          errorMessage=""
                          icon={icon.user}
                          Maxlength="25"
                        />
                      </td>
                      <td>
                        <FormText
                          name="earningAmount"
                          holder="Auto Generated"
                          value=""
                          errorMessage=""
                          icon={icon.user}
                          Maxlength="25"
                        />
                      </td>
                      <td>
                        <FormDate
                          name="earningAssignmentFrom"
                          holder="Auto Generated"
                          value=""
                          errorMessage=""
                          icon={icon.user}
                          Maxlength="25"
                        />
                      </td>
                      <td>
                        <label className="form-check-label">
                          <input type="checkbox" />
                          <span className="ms-2">Is Manual</span>
                        </label>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Deduction Head Table */}
          <div className="col-md-6">
            <div className="table-container">
              <div className="table-header text-center p-2  bg-secondary text-white">Deduction Head</div>
              <div className="table-responsive1">
                <table className="table table-bordered table-striped my-1">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Mapping</th>
                      <th>Amount</th>
                      <th>Assignment From</th>
                      <th>Is Manual</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <FormText
                          name="deductionDescription"
                          holder="Auto Generated"
                          value=""
                          errorMessage=""
                          icon={icon.user}
                          Maxlength="25"
                        />
                      </td>
                      <td>
                        <FormText
                          name="deductionMapping"
                          holder="Auto Generated"
                          value=""
                          errorMessage=""
                          icon={icon.user}
                          Maxlength="25"
                        />
                      </td>
                      <td>
                        <FormText
                          name="deductionAmount"
                          holder="Auto Generated"
                          value=""
                          errorMessage=""
                          icon={icon.user}
                          Maxlength="25"
                        />
                      </td>
                      <td>
                        <FormDate
                          name="deductionAssignmentFrom"
                          holder="Auto Generated"
                          value=""
                          errorMessage=""
                          icon={icon.user}
                          Maxlength="25"
                        />
                      </td>
                      <td>
                        <label className="form-check-label">
                          <input type="checkbox" />
                          <span className="ms-2">Is Manual</span>
                        </label>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EarningDeductionHead;

import React from "react";
import icon from "../properties/icon";

import "../styles/DashboardCard.css"; // Import the CSS file

const DashboardCard = () => {
  return (
    <div>
      <div className="row g-6 mb-6">
        <div className="col-xl-3 col-sm-6 col-12">
          <div className="card shadow border-0 mb-2 mb-2">
            <div className="card-body">
              <div className="row">
                <div className="col">
                  <span className="h6 font-semibold text-muted text-sm d-block mb-2">
                    Ongoing Project
                  </span>
                  <span className="h3 font-bold mb-0">14 Projects</span>
                </div>
                <div className="col-auto">
                  <div className="icon icon-shape bg-tertiary text-white text-lg rounded-circle">
                    <i className={icon.default} />
                  </div>
                </div>
              </div>
              <div className="mt-2 mb-0 text-sm">
                <span className="badge badge-pill bg-soft-success text-success me-2">
                  <i className="bi bi-arrow-up me-1"></i>14
                </span>
                <span className="text-nowrap text-xs text-muted">
                  Research Management
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-sm-6 col-12">
          <div className="card shadow border-0 mb-2">
            <div className="card-body">
              <div className="row">
                <div className="col">
                  <span className="h6 font-semibold text-muted text-sm d-block mb-2">
                     Sanctioned Projects
                  </span>
                  <span className="h3 font-bold mb-0">15 Newly Sanctioned</span>
                </div>
                <div className="col-auto">
                  <div className="icon icon-shape bg-primary text-white text-lg rounded-circle">
                    <i className={icon.user} />
                  </div>
                </div>
              </div>
              <div className="mt-2 mb-0 text-sm">
                <span className="badge badge-pill bg-soft-success text-success me-2">
                  <i className="bi bi-arrow-up me-1"></i>15
                </span>
                <span className="text-nowrap text-xs text-muted">
                  Research Management
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-sm-6 col-12">
          <div className="card shadow border-0 mb-2">
            <div className="card-body">
              <div className="row">
                <div className="col">
                  <span className="h6 font-semibold text-muted text-sm d-block mb-2">
                    Proposed Projects
                  </span>
                  <span className="h3 font-bold mb-0">5 Proposed</span>
                </div>
                <div className="col-auto">
                  <div className="icon icon-shape bg-info text-white text-lg rounded-circle">
                    <i className={icon.envelope} />
                  </div>
                </div>
              </div>
              <div className="mt-2 mb-0 text-sm">
                <span className="badge badge-pill bg-soft-danger text-danger me-2">
                  <i className="bi bi-arrow-down me-1"></i>5
                </span>
                <span className="text-nowrap text-xs text-muted">
                  Research Management
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-sm-6 col-12">
          <div className="card shadow border-0 mb-2">
            <div className="card-body">
              <div className="row">
                <div className="col">
                  <span className="h6 font-semibold text-muted text-sm d-block mb-2">
                    Completed Projects
                  </span>
                  <span className="h3 font-bold mb-0">1 Project Completed</span>
                </div>
                <div className="col-auto">
                  <div className="icon icon-shape bg-warning text-white text-lg rounded-circle">
                    <i className={icon.tick} />
                  </div>
                </div>
              </div>
              <div className="mt-2 mb-0 text-sm">
                <span className="badge badge-pill bg-soft-success text-success me-2">
                  <i className="bi bi-arrow-up me-1"></i>1
                </span>
                <span className="text-nowrap text-xs text-muted">
                  Research Management
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;

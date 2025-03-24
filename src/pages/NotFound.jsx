// src/pages/NotFound.jsx
import React from "react";
import "../styles/NotFound.css"; // Import the CSS file for styling
import { NavLink } from 'react-router-dom';
import { config } from "@fortawesome/fontawesome-svg-core";
import {retrieveFromLocalStorage,retrieveFromCookies, storeInLocalStorage} from "../utils/CryptoUtils";
import Cookies from "js-cookie";



const NotFound = () => {

	return (
		<section className="page_404">
			<div className="container">
				<div className="row">
					<div className="col-sm-12">
						<div className="col-sm-12 col-sm-offset-1  text-center">
							<div className="four_zero_four_bg">
								<h1 className="text-center ">404</h1>


							</div>

							<div className="contant_box_404">
								<h3 className="h2">
									Look like you're lost
								</h3>

								<p>the page you are looking for not avaible!</p>


								<NavLink
									onClick={() => {
										// e.preventDefault(); // Prevent the default navigation behavior if needed
										Cookies.remove("menuPath");
										storeInLocalStorage("activeMenuId", "dashboard");
									}}
									className="nav-link sub-link"
									to={config.baseUrl}
									end
								>
									<button
										type="button"
										name="update"
										className="btn btn-success btn-color"
									>
										Go Back to Dashboard
									</button>
								</NavLink>

							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default NotFound;

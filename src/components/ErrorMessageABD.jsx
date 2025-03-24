// import React, { useEffect, useRef } from "react";
// import "../styles/ErrorMessageABD.css"; // Import a CSS file for styling

// const ErrorMessageABD = ({ text, isSuccess, isVisible, setVisible }) => {
//     const textRef = useRef(null);
//     const consoleRef = useRef(null);

//     useEffect(() => {
//         const colors = [isSuccess ? 'green' : 'red']; // Determine colors based on isSuccess

//         let visible = true;
//         let letterCount = 0;
//         let waiting = false;
//         let isRemoving = false;

//         if (isVisible && textRef.current && consoleRef.current) {
//             textRef.current.setAttribute('style', 'color:' + colors[0]);

//             const textInterval = window.setInterval(() => {
//                 if (!isRemoving) {
//                     // Increment letterCount to display text
//                     if (letterCount < text.length && !waiting) {
//                         letterCount++;
//                         textRef.current.innerHTML = text.substring(0, letterCount);
//                     } else if (letterCount === text.length && !waiting) {
//                         waiting = true;
//                         // Wait for 1 second before starting to remove
//                         setTimeout(() => {
//                             isRemoving = true;
//                             waiting = false;
//                         }, 1000);
//                     }
//                 } else {
//                     // Decrement letterCount to remove text
//                     if (letterCount > 0 && !waiting) {
//                         letterCount--;
//                         textRef.current.innerHTML = text.substring(0, letterCount);
//                     } else if (letterCount === 0) {
//                         clearInterval(textInterval); // Stop the interval once text is fully removed
//                         textRef.current.innerHTML = ""; // Clear the message
//                         setVisible(false); // Hide the component
//                     }
//                 }
//             }, 50); // Adjusted interval for faster display

//             const underscoreInterval = window.setInterval(() => {
//                 consoleRef.current.className = visible ? 'console-underscore hidden' : 'console-underscore';
//                 visible = !visible;
//             }, 100);

//             return () => {
//                 clearInterval(textInterval);
//                 clearInterval(underscoreInterval);
//             };
//         }
//     }, [text, isSuccess, isVisible, setVisible]); // Re-run effect when text, isSuccess, or isVisible changes

//     return (
//         isVisible && (
//             <div className='console-container  mt-3'>
//                 <span ref={textRef} id='text'></span>
//                 <div className='console-underscore' ref={consoleRef}></div>
//             </div>
//         )
//     );
// };

// export default ErrorMessageABD;




// adding toast funtionality

// import React, { useEffect } from "react";
// import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS

// const ErrorMessageABD = ({ text, isSuccess, isVisible, setVisible }) => {
//     useEffect(() => {
//         if (isVisible) {
//             // Automatically hide the toast after 3 seconds
//             const timeout = setTimeout(() => {
//                 setVisible(false);
//             }, 3000);

//             return () => clearTimeout(timeout);
//         }
//     }, [isVisible, setVisible]);

//     return (
//         <div
//             className={`toast-container position-fixed bottom-0 start-50 translate-middle-x p-3`}
//             style={{ zIndex: 1055 }}
//         >
//             <div
//                 className={`toast align-items-center text-bg-${
//                     isSuccess ? "success" : "danger"
//                 } ${isVisible ? "show" : ""}`}
//                 role="alert"
//                 aria-live="assertive"
//                 aria-atomic="true"
//             >
//                 <div className="toast-header">
//                     <strong className="me-auto">
//                         {isSuccess ? "Success" : "Error"}
//                     </strong>
//                     <button
//                         type="button"
//                         className="btn-close"
//                         onClick={() => setVisible(false)}
//                         aria-label="Close"
//                     ></button>
//                 </div>
//                 <div className="toast-body">{text}</div>
//             </div>
//         </div>
//     );
// };

// export default ErrorMessageABD;


import React, { useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS

const ErrorMessageABD = ({ text, isSuccess, isVisible, setVisible }) => {
    useEffect(() => {
        if (isVisible) {
            // Automatically hide the toast after 3 seconds
            const timeout = setTimeout(() => {
                setVisible(false);
            }, 3000);

            return () => clearTimeout(timeout);
        }
    }, [isVisible, setVisible]);

    return (
        <div
            className="toast-container position-fixed bottom-0 end-0 p-3"
            style={{ zIndex: 1055 }}
        >
            <div
                className={`toast align-items-center text-bg-${
                    isSuccess ? "success" : "danger"
                } ${isVisible ? "show fade" : "fade"}`}
                role="alert"
                aria-live="assertive"
                aria-atomic="true"
                style={{
                    transition: "opacity 0.5s ease-in-out, transform 0.5s ease-in-out",
                    transform: isVisible ? "translateY(0)" : "translateY(20px)",
                    opacity: isVisible ? 1 : 0,
                }}
            >
                <div className="toast-header">
                    <strong className="me-auto">
                        {isSuccess ? "Success" : "Error"}
                    </strong>
                    <button
                        type="button"
                        className="btn-close"
                        onClick={() => setVisible(false)}
                        aria-label="Close"
                    ></button>
                </div>
                <div className="toast-body">{text}</div>
            </div>
        </div>
    );
};

export default ErrorMessageABD;

import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import "../styles/CalculatorModal.css";
import useKeyboardShortcut from "../hooks/useKeyboardShortcut";

const CalculatorModal = ({ isOpen, closeModal }) => {
  const [input, setInput] = useState("");

  // Handle button clicks
  const handleClick = (value) => {
    setInput((prevInput) => prevInput + value);
  };

  // Evaluate the input expression
  const handleEvaluate = () => {
    try {
      // Remove spaces and sanitize input by replacing multiple consecutive operators
      let sanitizedInput = input.replace(/\s+/g, ""); // Remove spaces
      sanitizedInput = sanitizedInput.replace(/([+\-*/%])\1+/g, "$1"); // Replace consecutive operators with a single one
      sanitizedInput = sanitizedInput.replace(/^[+\-*/%]/, ""); // Remove leading operator
      sanitizedInput = sanitizedInput.replace(/[+\-*/%]$/, ""); // Remove trailing operator

      // Ensure sanitized input is not empty
      if (sanitizedInput === "") {
        setInput("Error");
        return;
      }

      // Evaluate the sanitized expression
      const result = eval(sanitizedInput); // Evaluate expression safely (for demo purposes)
      setInput(result.toString());
    } catch (error) {
      setInput("Error");
    }
  };

  // Clear the input
  const handleClear = () => {
    setInput("");
  };

  // Handle advanced operations
  const handleAdvancedFunction = (func) => {
    try {
      if (func === "sqrt") {
        setInput(Math.sqrt(eval(input)).toString());
      } else if (func === "sin") {
        setInput(Math.sin(eval(input)).toString());
      } else if (func === "cos") {
        setInput(Math.cos(eval(input)).toString());
      } else if (func === "tan") {
        setInput(Math.tan(eval(input)).toString());
      } else if (func === "log") {
        setInput(Math.log(eval(input)).toString());
      } else if (func === "pow") {
        setInput(Math.pow(eval(input), 2).toString()); // Power function
      }
    } catch (error) {
      setInput("Error");
    }
  };

  // Keyboard input handler
  const handleKeyboardInput = (event) => {
    const key = event.key;

    // Handle number keys
    if (/[0-9]/.test(key)) {
      handleClick(key);
    }
    // Handle operator keys
    else if (["+", "-", "*", "/", "%"].includes(key)) {
      handleClick(key);
    }
    // Handle decimal point
    else if (key === ".") {
      handleClick(key);
    }
    // Handle Enter key to evaluate
    else if (key === "Enter") {
      handleEvaluate();
    }
    // Handle Backspace key to clear
    else if (key === "Backspace") {
      setInput((prevInput) => prevInput.slice(0, -1)); // Remove last character
    }
    // Handle advanced function keys
    else if (key === "s") {
      handleAdvancedFunction("sin");
    } else if (key === "c") {
      handleAdvancedFunction("cos");
    } else if (key === "t") {
      handleAdvancedFunction("tan");
    } else if (key === "l") {
      handleAdvancedFunction("log");
    } else if (key === "q") {
      handleAdvancedFunction("sqrt");
    } else if (key === "p") {
      handleAdvancedFunction("pow");
    }
  };

  // Use effect to listen for keyboard events when the modal is open
  useEffect(() => {
    if (isOpen) {
      // Add keyboard event listener when modal is open
      window.addEventListener("keydown", handleKeyboardInput);

      // Cleanup the event listener when the modal is closed
      return () => {
        window.removeEventListener("keydown", handleKeyboardInput);
      };
    }
  }, [isOpen]); // Only add event listener when modal is open

  return (
    <Modal
      show={isOpen}
      onHide={closeModal}
      aria-labelledby="contained-modal-title-vcenter"
      centered
      scrollable
    >
      <Modal.Header closeButton>
        <Modal.Title>Calculator</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="calculator">
          <div className="display">
            <input
              type="text"
              value={input}
              className="display-input"
              readOnly
            />
          </div>
          <div className="buttons">
            {/* buttonrow 1 */}
            <div className="buttonrow">
              <button className="button-cal clear" onClick={handleClear}>
                C
              </button>
              <button
                className="button-cal advanced"
                onClick={() => handleAdvancedFunction("log")}
              >
                log
              </button>
              <button
                className="button-cal advanced"
                onClick={() => handleAdvancedFunction("pow")}
              >
                x²
              </button>
              <button
                className="button-cal advanced"
                onClick={() => handleAdvancedFunction("sqrt")}
              >
                √
              </button>
              <button
                className="button-cal operator"
                onClick={() => handleClick("/")}
              >
                /
              </button>
            </div>

            {/* buttonrow 2 */}
            <div className="buttonrow">
              <button className="button-cal" onClick={() => handleClick("7")}>
                7
              </button>
              <button className="button-cal" onClick={() => handleClick("8")}>
                8
              </button>
              <button className="button-cal" onClick={() => handleClick("9")}>
                9
              </button>
              <button
                className="button-cal operator"
                onClick={() => handleClick("*")}
              >
                *
              </button>
              <button
                className="button-cal advanced"
                onClick={() => handleAdvancedFunction("sin")}
              >
                sin
              </button>
            </div>

            {/* buttonrow 3 */}
            <div className="buttonrow">
              <button className="button-cal" onClick={() => handleClick("4")}>
                4
              </button>
              <button className="button-cal" onClick={() => handleClick("5")}>
                5
              </button>
              <button className="button-cal" onClick={() => handleClick("6")}>
                6
              </button>
              <button
                className="button-cal operator"
                onClick={() => handleClick("-")}
              >
                -
              </button>
              <button
                className="button-cal advanced"
                onClick={() => handleAdvancedFunction("cos")}
              >
                cos
              </button>
            </div>

            {/* buttonrow 4 */}
            <div className="buttonrow">
              <button className="button-cal" onClick={() => handleClick("1")}>
                1
              </button>
              <button className="button-cal" onClick={() => handleClick("2")}>
                2
              </button>
              <button className="button-cal" onClick={() => handleClick("3")}>
                3
              </button>
              <button
                className="button-cal operator"
                onClick={() => handleClick("+")}
              >
                +
              </button>
              <button
                className="button-cal advanced"
                onClick={() => handleAdvancedFunction("tan")}
              >
                tan
              </button>
            </div>

            {/* buttonrow 5 */}
            <div className="buttonrow">
              <button className="button-cal" onClick={() => handleClick("0")}>
                0
              </button>
              <button className="button-cal" onClick={() => handleClick(".")}>
                .
              </button>
              <button className="button-cal equal" onClick={handleEvaluate}>
                =
              </button>
              <button
                className="button-cal operator"
                onClick={() => handleClick("%")}
              >
                %
              </button>
              <button
                className="button-cal advanced"
                onClick={() => handleAdvancedFunction("sqrt")}
              >
                √
              </button>
            </div>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default CalculatorModal;

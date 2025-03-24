/**
 * @author Abhideep Pandey
 * @date  05/12/2024
 */

import React from "react";
import Modal from "react-modal";
import "../styles/CustomModal.css"; // Import custom CSS

const CustomModal = ({
  children,
  width = "50%",
  top = "50%",
  left = "60%",
  right = "auto",
  bottom = "auto",
  marginRight = "-50%",
  header = "Custom Model",
  modalIsOpen, setIsOpen,
  height= '500px'
}) => {
  let subtitle;

  function openModal() {
    setIsOpen(true);
  }

  function afterOpenModal() {
    subtitle.style.color = "#f00";
  }

  function closeModal() {
    setIsOpen(false);
  }

  const customStyles = {
    content: {
      top: top,
      left: left,
      right: right,
      bottom: bottom,
      marginRight: marginRight,
      transform: "translate(-50%, -50%)",
      width: width,
      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
      height:height
    },
  };

  return (
    <>
    

      <Modal
        isOpen={modalIsOpen}
        onAfterOpen={afterOpenModal}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Advanced Search Modal"
      >
        <h5 className="advanceSearchHeader mb-2">
          {header}
        </h5>
        <button className="close-button" onClick={closeModal}>
          x
        </button>
        {children}
      </Modal>
    </>
  );
};

export default CustomModal;

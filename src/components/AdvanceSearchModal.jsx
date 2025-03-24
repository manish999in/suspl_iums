/**
 * @author Abhideep Pandey
 * @date  26/11/2024
 */



import React from 'react';
import Modal from 'react-modal';
import "../styles/AdvanceSearchModal.css"; // Import custom CSS
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons'; // Correct import for FontAwesome icons

const AdvanceSearchModal = ({ children ,modalIsOpen, setIsOpen,setSearchRcds}) => {
  let subtitle;

  function openModal() {
    setSearchRcds("");
    setIsOpen(true);
  }

  function afterOpenModal() {
    // references are now sync'd and can be accessed.
    subtitle.style.color = '#f00';
  }

  function closeModal() {
    setIsOpen(false);
  }


  const customStyles = {
    content: {
      top: '50%',               
      left: '55%',  
      right: 'auto',    
      bottom: 'auto',          
      marginRight: '-50%',        
      transform: 'translate(-50%, -50%)',  
      width: '80%',        
      maxWidth: '600px',         
      height: 'auto',           
      maxHeight: '80vh',     
      padding: '20px',       
      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)', 
      borderRadius: '8px',  
    },
  };
  
  return (
    <>
      <div className="d-flex align-items-center p-2 border rounded-3  search-btn advanceSearch" tabIndex={1} onClick={openModal}
       aria-label="" data-bs-toggle="tooltip" data-bs-placement="auto" 
      >
        <FontAwesomeIcon icon={faSearch} className="me-2 advanceSearch-icon" />
        <span>Advanced Search</span>
      </div>

      <Modal
        isOpen={modalIsOpen}
        onAfterOpen={afterOpenModal}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Advanced Search Modal"
      >
        <h5 className='advanceSearchHeader mb-2'>Searching Criteria...</h5>
        <button className="close-button" onClick={closeModal}>x</button>
        {children}
      </Modal>
      </>
  );
};

export default AdvanceSearchModal;

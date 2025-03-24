import React from "react";
import { Modal, Button } from "react-bootstrap";
import { FaSave, FaFileAlt, FaCopy, FaPaste, FaUndo, FaRedo, FaSearch, FaInfoCircle, FaSyncAlt } from 'react-icons/fa';
import { IoMdArrowForward } from 'react-icons/io'; // For right arrow
import { GrClose } from 'react-icons/gr'; // For close icon (optional)

const getOperatingSystem = () => {
  const userAgent = window.navigator.userAgent;
  if (userAgent.indexOf('Mac') !== -1) {
    return 'mac';
  }
  return 'windows'; // Default to Windows
};

const ShortcutModal = ({ show, onClose }) => {
  const os = getOperatingSystem(); // Detect the OS

  return (
    <Modal
      show={show}
      onHide={onClose}
      size="lg" // Set size to large (lg) to make it larger
      aria-labelledby="contained-modal-title-vcenter"
      centered
      scrollable
    >
      <Modal.Header closeButton>
        <Modal.Title>Keyboard Shortcuts</Modal.Title>
      </Modal.Header>
      <Modal.Body>

        <div className="table-responsive1">
          <table className="table table-striped table-bordered">
            <thead>
              <tr>
                <th>Action</th>
                <th>Shortcut</th>
              </tr>
            </thead>
            <tbody>
              {/* Example with updated keys and icons */}
              <tr>
                <td>Go to Dashboard <FaSyncAlt /></td>
                <td>
                  <kbd>{os === 'mac' ? '⌘' : 'Ctrl'}</kbd> + <kbd>D</kbd>
                </td>
              </tr>
              <tr>
                <td>Go to Search Bar <FaSearch /></td>
                <td>
                  <kbd>{os === 'mac' ? '⌘' : 'Ctrl'}</kbd> + <kbd>K</kbd>
                </td>
              </tr>
              <tr>
                <td>Clear Search Bar History</td>
                <td>
                  <kbd>{os === 'mac' ? '⌘' : 'Ctrl'}</kbd> + <kbd>Shift</kbd> + <kbd>K</kbd>
                </td>
              </tr>
              <tr>
                <td>Clear Data (if not found)</td>
                <td>
                  <kbd>{os === 'mac' ? '⌘' : 'Ctrl'}</kbd> + <kbd>Left Arrow</kbd> <IoMdArrowForward />
                </td>
              </tr>
              <tr>
                <td>Logout <FaInfoCircle /></td>
                <td>
                  <kbd>{os === 'mac' ? '⌘' : 'Ctrl'}</kbd> + <kbd>L</kbd>
                </td>
              </tr>
              <tr>
                <td>Logout (Click)</td>
                <td>
                  <kbd>{os === 'mac' ? '⌘' : 'Ctrl'}</kbd> + <kbd>Shift</kbd> + <kbd>L</kbd>
                </td>
              </tr>
              <tr>
                <td>Focus on Search Bar</td>
                <td>
                  <kbd>{os === 'mac' ? '⌘' : 'Ctrl'}</kbd> + <kbd>Left Arrow</kbd>
                </td>
              </tr>
              <tr>
                <td>Focus on Page Inputs</td>
                <td>
                  <kbd>{os === 'mac' ? '⌘' : 'Ctrl'}</kbd> + <kbd>Right Arrow</kbd>
                </td>
              </tr>
              <tr>
                <td>Tree Menu Toggle</td>
                <td>
                  <kbd>Alt</kbd> + <kbd>T</kbd>
                </td>
              </tr>
              <tr>
                <td>Save Data of Page <FaSave /></td>
                <td>
                  <kbd>{os === 'mac' ? '⌘' : 'Ctrl'}</kbd> + <kbd>S</kbd>
                </td>
              </tr>
              <tr>
                <td>Advanced Search</td>
                <td>
                  <kbd>Alt</kbd> + <kbd>S</kbd>
                </td>
              </tr>
              <tr>
                <td>Refresh AG Grid</td>
                <td>
                  <kbd>Alt</kbd> + <kbd>R</kbd>
                </td>
              </tr>
              <tr>
                <td>Go to Profile</td>
                <td>
                  <kbd>Alt</kbd> + <kbd>P</kbd>
                </td>
              </tr>
              <tr>
                <td>Change Department/Role</td>
                <td>
                  <kbd>{os === 'mac' ? 'alt' : 'alt'}</kbd> + <kbd>Shift</kbd> + <kbd>D</kbd>
                </td>
              </tr>
              <tr>
                <td>Remove Column from Table</td>
                <td>
                  <kbd>Alt</kbd> + <kbd>C</kbd>
                </td>
              </tr>
              <tr>
                <td>Open Calculator</td>
                <td>
                  <kbd>Alt</kbd> + <kbd>X</kbd>
                </td>
              </tr>
              <tr>
                <td>Open Page Details</td>
                <td>
                  <kbd>Alt</kbd> + <kbd>V</kbd>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Modal.Body>
      {/* <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer> */}
    </Modal>
  );
};

export default ShortcutModal;

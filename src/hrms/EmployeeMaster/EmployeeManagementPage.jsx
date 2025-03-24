import React from 'react';
import { Container, Row, Col, Tab, Tabs, Card } from 'react-bootstrap';
import "../../styles/EmployeeManagementPage.css";


const EmployeeManagementPage = () => {
  return (
    <Container className="my-4 container1">
      <h1 className="text-center mb-4c">Create and Manage Employee Details</h1>
      <p className="text-center card1">
        This page allows the creation and management of employee records, including personal, job-related, and financial information. 
        The following tabs categorize the different types of data that will be entered and stored.
      </p>

      <Tabs defaultActiveKey="personal" id="employee-tabs" className='nav-tabs1'>
        <Tab eventKey="personal" title="Personal Details">
          <Card className="mt-3 card1">
            <Card.Body>
              <h5>Personal Information</h5>
              <p>
                This section collects the employee's basic personal information such as name, gender, date of birth, marital status, and contact details.
                Key data includes the employee's mobile number, email address, and state of residence.
              </p>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="other1" title="Other Details 1" className='nav-tabs1'>
          <Card className="mt-3">
            <Card.Body>
              <h5>Job and Department Information</h5>
              <p>
                This tab captures details related to the employee’s department, location, designation, and employment status. 
                It also includes information like date of joining, department head, and probation status.
              </p>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="other2" title="Other Details 2" className='nav-tabs1'>
          <Card className="mt-3">
            <Card.Body>
              <h5>Employment Status and Other Information</h5>
              <p>
                This section includes additional employment-related details such as reporting structure, deputation status, suspension status, and salary-related data.
                It also covers information about the employee's class, PT applicability, and posting DDO.
              </p>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="bank" title="Bank Details" className='nav-tabs1'>
          <Card className="mt-3">
            <Card.Body>
              <h5>Bank Account Information</h5>
              <p>
                This section collects banking details like account number, account type, bank name, IFSC code, and payment mode.
                It helps in managing salary payments and ensuring timely financial transactions.
              </p>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="pf" title="PF Details" className='nav-tabs1'>
          <Card className="mt-3 ">
            <Card.Body>
              <h5>Provident Fund Details</h5>
              <p>
                This section stores provident fund details such as the type of PF (CPF, GPF, NPS), account number, and balance. 
                It is essential for managing employee retirement benefits and related financial matters.
              </p>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="salary" title="Salary Structure" className='nav-tabs1'>
          <Card className="mt-3">
            <Card.Body>
              <h5>Salary and Pay Details</h5>
              <p>
                This section includes the employee’s salary structure, such as basic pay, pay level, and increment type. 
                It helps in managing compensation and determining employee pay and benefits.
              </p>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="profile" title="Profile Picture" className='nav-tabs1'>
          <Card className="mt-3">
            <Card.Body>
              <h5>Profile Picture</h5>
              <p>
                In this section, the employee's profile picture is uploaded to maintain a visual identity for the record. 
                A clear image of the employee helps in official identification and HR processes.
              </p>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </Container>
  );
};

export default EmployeeManagementPage;

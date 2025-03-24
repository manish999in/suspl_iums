import React, { useState } from 'react';
import axios from 'axios';

const CreateUser = () => {
  const jsonObject={
    // data: "Avinash",
        userId: "ADMIN",
        role_id: "RL0001",
    // roleName :'Abh',
    // roleLevel : 'H',
    // IS_ADMIN_ROLE : 'Y',
    // roleName: "Abhideep",
    // isAdmin: "Y",
    // mappedAlias: "NONE",
    // roleLevel: "H",
    // remarks: "Test Json",
  }

  const [text, setText] = useState();
  const [requestBody, setRequestBody] = useState('');
  const [decryptedText, setDecryptedText] = useState('');
  const [responseMessage, setResponseMessage] = useState('');
  const token = localStorage.getItem("token");

  const secretKey = '12345';

  const encryptText = () => {
    const ciphertext = encAESData(secretKey,jsonObject);
    setRequestBody(ciphertext);
  };

  const decryptText = () => {
    const bytes = decAESData(secretKey, decryptedText);
    setDecryptedText(bytes);
  };

  // const data1 = {
  //   encData: requestBody,
  // };

  // const data11 = {
  //   encryptData: decryptedText,
  // };



  
  // const sendDataToBackend = async () => {
  //   try {
  //     const response = await fetch('http://192.168.90.227:8084/test', {
  //       method: 'POST',
        
  //       headers: {
  //         Authorization: `Bearer ${token}`, // Set the Authorization header
  //         "Content-Type": "application/json", // Set the content type
  //       },

  //       body: JSON.stringify({ encData: requestBody }),
       
  //     });
  

  //     if (!response.ok) {
  //       throw new Error('Network response was not ok');
  //     }

  //     const data = await response.json();
  //     setResponseMessage('Data sent successfully: ' + JSON.stringify(data)); // Convert to string here

  //     console.log("dta is::::", data.encryptData);
     
  //     var datadec=JSON.parse(data.encryptData);
  //     console.log( decAESData("12345",datadec));
    
      
  //   } catch (error) {
  //     console.error('Error sending data:', error);
  //     setResponseMessage('Error sending data: ' + error.message);
  //   }
  // };









  
  const sendDataToBackend = async () => {
    try {
      const response = await axios.post('http://192.168.90.227:8084/test', 
        { encData: requestBody }, // Request body
        {
          headers: {
            Authorization: `Bearer ${token}`, // Set the Authorization header
            "Content-Type": "application/json", // Set the content type
          }
        }
      );
  
      // axios automatically handles response data, no need for response.ok or response.json()
      const data = response.data; // Get the data directly from response
  
      setResponseMessage('Data sent successfully: ' + JSON.stringify(data)); // Convert to string here
      console.log("Data is:", data.encryptData);
  
      // Assuming data.encryptData is a string that can be parsed
      const datadec = JSON.parse(data.encryptData);
      console.log(decAESData("12345", datadec));
      
    } catch (error) {
      console.error('Error sending data:', error);
      setResponseMessage('Error sending data: ' + error.message);
    }
  };
  




  return (
    <>
      <div className="rightArea">
        <div className="container-body">
          <h4 className="card-title">Role Master</h4>
          <div>DdoMaster</div>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text to encrypt"
          />
          <button onClick={encryptText}>Encrypt</button>
          <h3>Encrypted Text: {requestBody}</h3>

          {/* <button onClick={decryptText}>Decrypt</button>
          <h3>Decrypted Text: {decryptedText}</h3> */}

          <button onClick={sendDataToBackend} disabled={!requestBody}>
            Send Encrypted Data to Backend
          </button>

          <h2>Decrypted Text: {decryptedText}</h2>
          <h3>Response: {responseMessage}</h3> {/* Make sure this is a string */}
        </div>
      </div>
    </>
  );
};


export default CreateUser;

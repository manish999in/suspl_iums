// Utility function to convert a file to Base64
 export const useConvertFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
  
      reader.onloadend = () => {
        const base64String = reader.result.split(',')[1]; // Extract the Base64 part
        resolve(base64String);  // Resolve the promise with the Base64 string
      };
  
      reader.onerror = (error) => {
        reject(error);  // Reject the promise in case of an error
      };
  
      reader.readAsDataURL(file);  // Start the file reading process
    });
  };
  
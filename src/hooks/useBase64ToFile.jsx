import { useState } from "react";

const getMimeTypeFromExtension = (fileName) => {
  const extension = fileName.split('.').pop().toLowerCase(); // Get the file extension (e.g., "png", "jpg", "pdf")
  const mimeTypes = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    bmp: "image/bmp",
    webp: "image/webp",
    svg: "image/svg+xml",
    mp3: "audio/mpeg",
    pdf: "application/pdf",
    // Add more extensions and MIME types as needed
  };
  
  return mimeTypes[extension] || "application/octet-stream"; // Return "application/octet-stream" as the default MIME type
};

function useBase64ToFile() {
  // Function to convert base64 to a File object
  const base64ToFile = (base64String, fileName) => {
    // Extract the base64 data
    const base64Data = base64String.split(",")[1] || base64String;

    // Decode the base64 string into a binary string (byte characters)
    const byteCharacters = atob(base64Data);

    // Create a byte array to hold the decoded data
    const byteArrays = [];
    for (let i = 0; i < byteCharacters.length; i++) {
      byteArrays.push(byteCharacters.charCodeAt(i));
    }

    // Get the MIME type based on the file extension
    const mimeType = getMimeTypeFromExtension(fileName);

    // Create a Blob object with the byte array and specify the MIME type
    const blob = new Blob([new Uint8Array(byteArrays)], {
      type: mimeType,
    });

    // Create a File object using the Blob and dynamically set MIME type
    const fileObj = new File([blob], fileName, {
      type: mimeType,
    });

    return fileObj; // Return the File object
  };

  return { base64ToFile };
}

export default useBase64ToFile;

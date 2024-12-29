import React, { useState } from "react";
import Image from "next/image";
import styles from "./FileUpload.module.css";

interface FileData {
  file: File;
  name: string;
  type: string;
  size: number;
}

interface Base64File {
  name: string;
  base64: string | ArrayBuffer | null;
}
interface FileUploadProps {
  label?: string;
  name: string;
  onChange?: (event:{[key: string]: any; }) =>void;
  multiple?: boolean
}

const FileUpload: React.FC<FileUploadProps> = ({ label, name, onChange, multiple }) => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [base64Files, setBase64Files] = useState<Base64File[]>([]);

  // Function to handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    const newFiles: FileData[] = selectedFiles.map((file) => ({file, name: file.name, type: file.type, size: file.size }));
    if(multiple) setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    else setFiles(() => [...newFiles]);
    convertToBase64(newFiles);
  };

  React.useEffect(()=>onChange({[name]: JSON.stringify(base64Files)}),[base64Files])

  // Function to convert files to Base64
  const convertToBase64 = (newFiles: FileData[]) => {
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBase64Files((prev) => {
          let updatedBase64Files;
          if (multiple) updatedBase64Files = [...prev, { name: file.name, base64: reader.result }];
          else updatedBase64Files = [{ name: file.name, base64: reader.result }];
          return updatedBase64Files;
        });
      };
      reader.readAsDataURL(file.file);
    });
  };


  const removeFile = (name: string) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file.name !== name));
    setBase64Files((prev) => prev.filter((file) => file.name !== name));
  };

  return (
    <div>
      <label className={styles.fileUploadButton}>
        {label || "Adicionar Arquivo"}
        <input type="file" multiple={multiple} onChange={handleFileChange} />
      </label>
      <div className={styles.preview}>
        {files.map((file) => (
          <span key={file.name} style={{ position: "relative" }}>
            <button
              className={styles.removeButton}
              onClick={() => removeFile(file.name)}
              aria-label="Remove file"
            >
              &times;
            </button>
            {/* Mini Preview for Images */}
            {file.type.startsWith("image/") && (
              <Image
                src={URL.createObjectURL(file.file)} // Create a URL for the image file
                alt={file.name}
                width={100} // Set the desired width
                height={100} // Set the desired height
                style={{ marginTop: "10px" }}
              />
            )}
          </span>
        ))}
      </div>
    </div>
  );
};

export default FileUpload;

/*
      <h3>Base64 Files:</h3>
      <ul>
        {base64Files.map(file => (
          <li key={file.name}>
            {file.name}: {file.base64}
          </li>
        ))}
      </ul>
*/

import React, { useState } from 'react';
import axios from 'axios';
import useAxiosPublic from '../../Hooks/useAxiosPublic';


const FilesAdd = () => {
    const [selectedFiles, setSelectedFiles] = useState([]);

    const axiosPublic = useAxiosPublic();

    const handleFileChange = (e) => {
        const files = e.target.files;
        setSelectedFiles(files);
    };

    const handleFileUpload = async () => {
        try {
            const formData = new FormData();

            for (let i = 0; i < selectedFiles.length; i++) {
                formData.append('files', selectedFiles[i]);
            }

            // console.log(formData,"20");
            // Adjust the backend route accordingly
            const response = await axiosPublic.post('/admin/upload', formData);

            // console.log('File upload success:', response.data);
        } catch (error) {
            console.error('File upload error:', error);
        }
    };

    return (
        <div>
            <input type='file' name='files' multiple onChange={handleFileChange} />
            <button onClick={handleFileUpload}>Upload Files</button>
        </div>
    );
};

export default FilesAdd;

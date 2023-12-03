import React from 'react';

const FileUpload = ({ color, handleFileChange }) => {

    const handleFile = (e) => {
        handleFileChange(e)
    }

    return (
        <div className='flex flex-col gap-3 my-3 '>
            <div className='flex gap-2 items-center'>
                <input type="file"
                    name='filename'
                    className="file-input file-input-bordered file-input-primary "
                    onChange={(e) => handleFile(e)}
                    multiple
                />
            </div>
        </div>
    );
};

export default FileUpload;
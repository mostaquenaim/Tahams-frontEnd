import React from 'react';

const FileUpload = ({ color, handleFileChange, colorIndex }) => {

    const handleFile = (e) => {
        handleFileChange(e, colorIndex)
    }

    return (
        <div className='flex flex-col gap-3 my-3 '>
            <div className='flex gap-2 items-center'>
                <input type="file"
                    name='filename'
                    className="file-input file-input-bordered file-input-primary "
                    onChange={(e) => handleFile(e, colorIndex)}
                    multiple
                />
            </div>
            {/* <div className='flex gap-2 items-center'>
                <input type="file"
                    name='filename2'
                    className="file-input file-input-bordered file-input-primary "
                    onChange={() => handleFile(e)}
                />
            </div>
            <div className='flex gap-2 items-center'>
                <input type="file"
                    name='filename3'
                    className="file-input file-input-bordered file-input-primary "
                    onChange={() => handleFile(e)}
                />
            </div>
            <div className='flex gap-2 items-center'>
                <input type="file"
                    name='filename4'
                    className="file-input file-input-bordered file-input-primary "
                    onChange={() => handleFile(e)}
                />
            </div>
            <div className='flex gap-2 items-center'>
                <input type="file"
                    name='filename5'
                    className="file-input file-input-bordered file-input-primary "
                    onChange={() => handleFile(e)}
                />
            </div> */}
        </div>
    );
};

export default FileUpload;
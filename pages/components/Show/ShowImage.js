import React from 'react';

const ShowImage = (props) => {
    const { image, altImg } = props
    return (
        <>
            <img
                src={`http://localhost:3000/admin/getImage/${image}`}
                alt={altImg}
                onError={(e) => {
                    console.error("Error loading image:", e);
                }}
            />
        </>
    );
};

export default ShowImage;
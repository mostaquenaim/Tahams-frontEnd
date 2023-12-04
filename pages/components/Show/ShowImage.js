import React from 'react';

const ShowImage = (props) => {
    const { image, altImg } = props
    return (
        <>
            <img
                src={`https://tahams-test-production.up.railway.app/admin/getImage/${image}`}
                alt={altImg}
                onError={(e) => {
                    console.error("Error loading image:", e);
                }}
            />
        </>
    );
};

export default ShowImage;
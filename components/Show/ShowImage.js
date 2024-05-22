import React from 'react';

const ShowImage = (props) => {
    const { image, altImg } = props
    return (
        <>
            <img
                src={`https://api.tahamsbd.com/admin/getImage/${image}`}
                alt={altImg}
                onError={(e) => {
                    console.error("Error loading image:", e);
                }}
            />
        </>
    );
};

export default ShowImage;
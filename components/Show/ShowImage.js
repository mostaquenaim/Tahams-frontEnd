import React from 'react';

const ShowImage = (props) => {
    const { image, altImg } = props
    return (
        <>
            <img
                src={`${process.env.NEXT_PUBLIC_API}/admin/getimage/${image}`}
                alt={altImg}
                onError={(e) => {
                    console.error("Error loading image:", e);
                }}
            />
        </>
    );
};

export default ShowImage;
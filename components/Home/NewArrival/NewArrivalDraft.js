import React from 'react';

const NewArrivalDraft = () => {
  const photos = [
    '/customized/rivers-of-bd-og.jpg',
    '/customized/customization-cover.jpg',
    '/customized/just-cant.jpg',
    '/customized/just-cant.jpg',
    '/customized/ctg-banglar-chithi.jpg',
  ];

  return (
    <div className="flex flex-col md:grid md:grid-cols-5 md:grid-rows-2 gap-4 p-4">
      {/* First big image (2 cols, 2 rows) */}
      <img
        src={photos[0]}
        alt="photo 1"
        className="col-span-2 row-span-2 w-full h-full object-cover rounded-xl"
      />

      {/* Second image (3 cols but only 1 row) */}
      <img
        src={photos[1]}
        alt="photo 2"
        className="col-span-3 row-span-1 w-full h-full object-cover rounded-xl"
      />

      {/* Three small stacked images */}
      <div className="grid grid-cols-2 md:flex gap-4">
        <img
          src={photos[2]}
          alt="photo 3"
          className="w-full h-full object-cover rounded-xl"
        />
        <img
          src={photos[3]}
          alt="photo 4"
          className="w-full h-full object-cover rounded-xl"
        />
        <img
          src={photos[4]}
          alt="photo 5"
          className="w-full h-full object-cover rounded-xl"
        />
      </div>
    </div>
  );
};

export default NewArrivalDraft;

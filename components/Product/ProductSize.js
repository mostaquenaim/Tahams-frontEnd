import useLoadSizes from '/Hooks/useLoadSizes';
import React from 'react';

const ProductSize = ({
  selectedCategory,
  product,
  selectedSize,
  handleSizeChange,
  selectedFemaleSize,
  handleFemaleSizeChange,
}) => {
 const filteredSizes = selectedCategory
    ? Array.from(
        new Map(
          product.pscs.map((p) => [
            p.size?.id, // unique key
            { size: p.size, quantity: p.quantity },
          ])
        ).values()
      )
    : [];

  return (
    <div>
      {filteredSizes && filteredSizes.length > 0 && (
        <div className="mb-4">
          <label className="text-gray-600 font-semibold">Select Size:</label>
          {product.pscs[0].category.category.category.name === 'Couples' && (
            <p className="text-gray-600 p-2 text-xl font-semibold">Male:</p>
          )}
          <div className="flex gap-3 flex-wrap">
            {filteredSizes.map(({ size, quantity }) => (
              <button
                key={size?.id}
                className={`btn btn-outline ${
                  selectedSize === size?.name
                    ? 'bg-black text-white'
                    : 'bg-white text-black'
                } border-black text-black ${
                  quantity === 0 ? 'btn-disabled' : ''
                }`}
                onClick={() => quantity > 0 && handleSizeChange(size?.name)}
              >
                {size?.name}
              </button>
            ))}
          </div>

          {product.pscs[0].category.category.category.name === 'Couples' && (
            <div>
              <p className="text-gray-600 p-2 text-xl font-semibold">Female:</p>
              <div className="flex gap-3 flex-wrap">
                {filteredSizes.map(({ size, quantity }) => (
                  <button
                //   data-tip='hello'
                    key={size?.id}
                    className={`btn btn-outline ${
                      selectedFemaleSize === size?.name
                        ? 'bg-black text-white'
                        : 'bg-white text-black'
                    } border-black text-black ${
                      quantity === 0 ? 'btn-disabled' : ''
                    }`}
                    onClick={() =>
                      quantity > 0 && handleFemaleSizeChange(size?.name)
                    }
                  >
                    {size?.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductSize;
import React from 'react';

const sizeButtonClass = (active, soldOut) =>
  `min-w-[3rem] rounded-xl border px-4 py-2.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 ${
    soldOut
      ? 'cursor-not-allowed border-gray-100 bg-gray-50 text-gray-300 line-through'
      : active
      ? 'border-black bg-black text-white'
      : 'border-gray-200 bg-white text-gray-800 hover:border-gray-500'
  }`;

const SizeGroup = ({ label, sizes, selected, onSelect }) => (
  <div role="radiogroup" aria-label={label || 'Size'}>
    {label && (
      <p className="mb-2 text-sm font-medium text-gray-700">{label}</p>
    )}
    <div className="flex flex-wrap gap-2">
      {sizes.map(({ size, quantity }) => {
        const soldOut = !(quantity > 0);
        const active = selected === size?.name;
        return (
          <button
            key={size?.id}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={soldOut}
            className={sizeButtonClass(active, soldOut)}
            onClick={() => !soldOut && onSelect(size?.name)}
          >
            {size?.name}
          </button>
        );
      })}
    </div>
  </div>
);

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
          ]),
        ).values(),
      )
    : [];

  if (filteredSizes.length === 0) return null;

  const isCouples =
    product.pscs[0].category.category.category.name === 'Couples';

  return (
    <div className="space-y-4">
      <SizeGroup
        label={isCouples ? 'Select size - Male' : 'Select size'}
        sizes={filteredSizes}
        selected={selectedSize}
        onSelect={handleSizeChange}
      />
      {isCouples && (
        <SizeGroup
          label="Select size - Female"
          sizes={filteredSizes}
          selected={selectedFemaleSize}
          onSelect={handleFemaleSizeChange}
        />
      )}
    </div>
  );
};

export default ProductSize;

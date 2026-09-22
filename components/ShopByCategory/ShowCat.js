import Link from 'next/link';

const ShowCat = ({ prop }) => {
  const isCustomize = prop.categoryName === 'Customize';

  return (
    <Link
      href={`/categories/${prop.categoryName}`}
      className={`group relative block overflow-hidden rounded-2xl shadow-sm transition duration-300 hover:shadow-lg ${
        isCustomize ? 'row-span-2' : ''
      }`}
    >
      <img
        src={prop.filename}
        alt={prop.categoryName}
        loading="lazy"
        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-4 pt-12">
        <span className="flex items-center justify-between text-lg font-semibold text-white">
          {prop.categoryName}
          <span
            aria-hidden="true"
            className="transition-transform duration-300 group-hover:translate-x-1"
          >
            →
          </span>
        </span>
      </div>
    </Link>
  );
};

export default ShowCat;

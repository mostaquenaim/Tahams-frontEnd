import Link from 'next/link';

const ShowCat = ({ prop }) => {
    return (
        <>
            <Link
            href={`/categories/${prop.categoryName}`}
                className={`relative ${prop.categoryName === 'Customize' && 'row-span-2 scale-105'}`}>
                <figure className='relative'>
                    {/* <img src={`http://api.tahamsbd.com/admin/getimage/${prop.filename}`} className='rounded-lg shadow-md' alt={prop.categoryName} /> */}
                    <img src={prop.filename} className='rounded-lg shadow-md' alt={prop.categoryName} />
                    <div className='absolute inset-0 flex justify-center items-end '>
                        <div className='font-semibold text-white text-xl rounded-lg bg-black p-5 w-2/3 text-center bg-opacity-80'>
                            {prop.categoryName}
                        </div>
                    </div>
                </figure>
            </Link>
        </>
    );
};

export default ShowCat;

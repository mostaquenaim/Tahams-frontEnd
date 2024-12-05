import Link from "next/link";

const ShowNewArrival = ({ prop }) => {
    return (
        <>
            <div className='relative '>
                <Link href={`/categories/${prop.category}`} className='relative '>
                    <img src={prop.image} className='rounded-lg shadow-md hover:scale-105 duration-1000 -z-50' alt={prop.name} />
                </Link>
            </div>
        </>
    );
};

export default ShowNewArrival;

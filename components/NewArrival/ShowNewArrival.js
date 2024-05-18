
const ShowNewArrival = ({ prop }) => {
    return (
        <>
            <div className='relative '>
                <figure className='relative '>
                    <img src={prop.image} className='rounded-lg shadow-md hover:scale-105 duration-1000 -z-50' alt={prop.name} />
                </figure>
            </div>
        </>
    );
};

export default ShowNewArrival;

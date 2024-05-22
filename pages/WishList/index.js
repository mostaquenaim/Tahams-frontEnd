import { useContext } from 'react';
import NavbarCompTwo from '/components/Header/NavbarComp';
import { AuthContext } from '../../Contexts/Auth/AuthProvider';
import axios from 'axios';

const WishList = ({ wishlist }) => {

    return (
        <>
            <NavbarCompTwo />
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4 p-48">Your Wishlist</h1>
                {wishlist && wishlist.length > 0 ? (
                    <ul>
                        {wishlist.map(item => (
                            <li key={item.id} className="mb-2">
                                <div className="p-4 border rounded shadow">
                                    <h2 className="text-xl font-semibold">{item.product.name}</h2>
                                    <p>{item.product.description}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No items in your wishlist.</p>
                )}
            </div>
        </>
    );
};

export async function getServerSideProps(context) {
    const { query } = context;
    const userId = query.userId; // Get the userId from the query parameters
    console.log(userId);

    try {
        const response = await axios.get(`https://api.tahamsbd.com/admin/get-wish-by-user/${userId}`);
        const wishlist = response.data;

        return {
            props: {
                wishlist,
            },
        };
    } catch (error) {
        console.error('Error fetching wishlist:', error);

        return {
            props: {
                wishlist: [],
            },
        };
    }
}

export default WishList;

import useAxiosPublic from "../Hooks/useAxiosPublic";
import { pushToDataLayer } from "./ga4";

const axiosPublic = useAxiosPublic()

export const AddToWish = async (product, customEmail, checkIfWished) => {
    // add to wish process 
    pushToDataLayer('add_to_wish',
        {
            item: product,
            user_email: customEmail
        }
    )

    try {
        // Make a POST request to add the product to the wishlist
        const res = await axiosPublic.post(`/admin/add-Wish`, {
            productId: product?.productId,
            customerEmail: customEmail
        });
        // Add the product to the wishlist
        checkIfWished(product.id, customEmail);
    } catch (error) {
        console.error('Error adding product to wishlist:', error);
        // Handle error if the request fails
    }
}

export const DeleteFromWish = async (product, customEmail, wishId, checkIfWished, refetch) => {
    // Check for guest customer info in localStorage
    pushToDataLayer('remove_from_wish',
        {
            item: product,
            user_email: customEmail
        }
    )

    try {
        const res = await axiosPublic.delete(`/admin/remove-wish/${wishId}`);
        checkIfWished ? checkIfWished(product.id, customEmail)
            :
            refetch
    } catch (error) {
        console.error('Error deleting wishlist:', error);
    }
}

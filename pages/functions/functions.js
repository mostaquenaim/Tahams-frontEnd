import axios from "axios";
import Link from "next/link";

 const loadCategories = async () => {
    try {
        const resp = await axios.get('/categories.json');
        return resp.data;
    } catch (error) {
        console.error('Error loading categories:', error);
        throw error;
    }
};

export default loadCategories
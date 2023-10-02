import axios from "axios";
import Link from "next/link";

export const ListStyle = ({ goto, pageName }) => {
    return (
        <li className='hover:text-zinc-400 md:border-b-2 border-transparent hover:border-rose-500'>
            <Link href={goto}>{pageName}</Link>
        </li>

    );
}

export const loadCategories = async () => {
    try {
        const resp = await axios.get('/categories.json');
        return resp.data;
    } catch (error) {
        console.error('Error loading categories:', error);
        throw error;
    }
};

import axios from "axios";
import Link from "next/link";

export const ListStyle = ({goto, pageName}) => {
    return (
        <li className='hover:text-zinc-500 hover:text-2xl duration-300 '>
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
  
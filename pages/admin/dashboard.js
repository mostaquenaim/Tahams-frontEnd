import { useRouter } from "next/router";
import Drawer from "../components/drawer";
import Products from "./Products";


export default function Dashboard(){
    const router = useRouter();

    router.push('Products')
    
    return(
        <>
        
            
        </>
    )
}
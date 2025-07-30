import useLoadCats from '/Hooks/useLoadCats';
import React, { useEffect, useState } from 'react';

const ComboBuilder = () => {
    const [categories,, isPending] = useLoadCats()
    const [mainCategories, setMainCategories] = useState([])    

    useEffect(()=>{
        const res = categories.filter((cat) => cat.isGenderVaried && cat.isForMen)
        // console.log(res,'sss');
        setMainCategories(res)
    },[])

    return (
        <div>
            
        </div>
    );
};

export default ComboBuilder;
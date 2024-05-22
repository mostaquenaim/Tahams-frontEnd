import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import ListListComponent from './components/ListListComponent';

const ListComponent = ({ cat, ListStyle, isSide = false }) => {
    const [subCategories, setSubCategories] = useState([])

    useEffect(() => {
        axios.get(`https://api.tahamsbd.com/admin/view-product-sub-category/${cat.id}`)
            .then(res => {
                setSubCategories(res.data)
                console.log(res.data, "13");
            })
    }, [])

    const List = ({ children, parentClass, parentName }) => {
        return (
            <li className={parentClass}>
                <span className='flex gap-1 items-center'> {parentName} <MdOutlineKeyboardArrowDown></MdOutlineKeyboardArrowDown> </span>
                <ul
                    className="hidden gap-10 bg-base-100 absolute border-white border-2 rounded-lg p-5">
                    {children}
                </ul>
            </li>
            // hidden hover:inline-block
        );
    }

    return (
        <>
            <List parentClass={isSide ? 'ulDrawerClass' : 'ulClass'} parentName={cat.categoryName}>
                {
                    subCategories.map((cat, index) => (
                        <ul className={` ${isSide ? '' : index + 1 != subCategories.length && 'border-r-2 border-zinc-800 pr-4'}`}>
                            <span className='flex gap-1 items-center pb-3 text-lg font-bold'> {cat.categoryName} </span>
                            <ListListComponent ListStyle={ListStyle} sub={cat}></ListListComponent>
                        </ul>
                    ))
                }
            </List>
        </>
    );
};

export default ListComponent;
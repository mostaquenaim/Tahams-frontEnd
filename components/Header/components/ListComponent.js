import useAxiosPublic from '../../../Hooks/useAxiosPublic';
import React, { useEffect, useState } from 'react';
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import ListListComponent from './components/ListListComponent';

const ListComponent = ({ cat, cats = [], ListStyle, isSide = false }) => {
    console.log(cat, 7);
    const [subCategories, setSubCategories] = useState([])

    const axiosPublic = useAxiosPublic();

    useEffect(() => {
        // if (cat.name != 'Men' && cat.name != 'Women') {
        axiosPublic.get(`/admin/view-product-sub-category/${cat.id}`)
            .then(res => {
                setSubCategories(res.data)
                console.log(res.data, "13");
            })
        // }
    }, [])

    const List = ({ children, parentClass, parentName }) => {
        return (
            <li className={`${parentClass}`}>
                <span className='flex gap-1 items-center'> {parentName} <MdOutlineKeyboardArrowDown></MdOutlineKeyboardArrowDown> </span>
                <ul
                    className="hidden gap-10 p-5 bg-base-100 absolute border-white border-2 rounded-lg">
                        {/*  */}
                        {/* */}
                    {children}
                </ul>
            </li>
            // hidden hover:inline-block
        );
    }

    return (
        <>
            <List parentClass={isSide ? 'ulDrawerClass' : 'ulClass'} parentName={cat.name}>
                {
                    cat.name == 'Men' || cat.name == 'Women' ?
                        cats.map((catItem, index) => (
                            catItem.isGenderVaried &&
                            (
                                cat.name == 'Men' && catItem.isForMen ?
                                    <ul className={` ${isSide ? '' : index + 5 != cats.length && 'border-r-2 border-zinc-800 pr-4'}`}>
                                        {/* <span className='flex gap-1 items-center pb-3 text-lg font-bold'> {catItem.name} </span> */}
                                        <ListComponent isSide={isSide} key={index} cat={catItem} ListStyle={ListStyle}></ListComponent>
                                    </ul>
                                    :
                                    cat.name == 'Women' && catItem.isForWomen &&
                                    <ul className={` ${isSide ? '' : index + 1 != cats.length && 'border-r-2 border-zinc-800 pr-4'}`}>
                                        <ListComponent isSide={isSide} key={index} cat={catItem} ListStyle={ListStyle}></ListComponent>
                                    </ul>
                            )
                        ))
                        :
                        subCategories.map((catItem, index) => (
                            <ul className={` ${isSide ? '' : index + 1 != subCategories.length && 'border-r-2 border-zinc-800 pr-4'}`}>
                                <span className='flex gap-1 items-center pb-3 text-lg font-bold'> {catItem.name} </span>
                                <ListListComponent ListStyle={ListStyle} sub={catItem}></ListListComponent>
                            </ul>
                        ))
                }
            </List>
        </>
    );
};

export default ListComponent;
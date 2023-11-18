import React from 'react';
import { AiOutlineMenu } from "react-icons/ai";
import { RxCross2 } from "react-icons/rx";

const CustomerDrawer = ({ ListStyle, ListComponent, categories }) => {
    const links =
        <>
            <ListStyle goto='/' pageName='Home' />

            {
                categories &&
                categories.map((cat, index) => (
                    <ListComponent isSide={true} key={index} cat={cat} ListStyle={ListStyle}></ListComponent>
                ))
            }
        </>

    return (
        <div className='z-50'>
            <div className="drawer z-50">
                <input id="my-drawer" type="checkbox" className="drawer-toggle" />
                <div className="drawer-content">
                    <label htmlFor="my-drawer" className="drawer-button">
                        <AiOutlineMenu className='text-3xl' />
                    </label>
                </div>
                <div className="drawer-side">
                    <label htmlFor="my-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
                    <ul className="relative menu p-4 w-80 min-h-full bg-base-200 text-base-content">
                        {links}

                    </ul>
                </div>
            </div>
        </div>
    );
};

export default CustomerDrawer;
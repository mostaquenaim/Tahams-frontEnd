import React, { useState } from 'react';
import { AiOutlineMenu } from "react-icons/ai";
import { RxCross2 } from "react-icons/rx";

const Drawer2 = ({ ListStyle, ListComponent, categories }) => {
    const [drawerOpen, setDrawerOpen] = useState(false);

    const toggleDrawer = () => {
        setDrawerOpen(!drawerOpen);
    };

    const links =
        <>
            <ListStyle goto='/' pageName='Home' />

            {
                categories &&
                categories.map((cat, index) => (
                    <ListComponent key={index} cat={cat} ListStyle={ListStyle}></ListComponent>
                ))
            }
        </>

    return (
        <div className={`drawer z-50 relative ${drawerOpen ? 'open' : ''}`}>
            <input
                type="checkbox"
                id="panel-toggle"
                className="relative sr-only peer"
                checked={drawerOpen}
                onChange={toggleDrawer}
            />
            <label
                htmlFor="panel-toggle"
                className="mt-2 fixed top-0 left-0 inline-block p-4 bg-neutral transition-all duration-500 rounded-lg peer-checked:rotate-180 peer-checked:left-64"

            >
                <div className="w-6 h-1 mb-3 -rotate-45 bg-white rounded-lg"></div>
                <div className="w-6 h-1 rotate-45 bg-white rounded-lg"></div>
            </label>
            <div className="drawer-side">
                <label htmlFor="my-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
                <ul className="relative menu p-4 w-80 min-h-full bg-base-200 text-base-content">
                    {links}

                </ul>
            </div>
        </div>
    );
};

export default Drawer2;
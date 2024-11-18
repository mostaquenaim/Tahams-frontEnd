import React, { useEffect } from 'react';
import { AiOutlineMenu } from "react-icons/ai";

const LeftDrawer = ({ ListStyle, ListComponent, categories, genders }) => {
    useEffect(() => {
        // Function to close the drawer upon scrolling
        const handleScroll = () => {
            const drawerCheckbox = document.getElementById('my-drawer');
            if (drawerCheckbox && drawerCheckbox.checked) {
                drawerCheckbox.checked = false;
            }
        };

        // Attach the scroll event listener
        window.addEventListener('scroll', handleScroll);

        // Cleanup the event listener on component unmount
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []); // Empty dependency array ensures that the effect runs only once on mount

    const links = (
        <>
            <ListStyle goto='/' pageName='Home' />

            {
                genders &&
                genders.map((gender, index) => (
                    <ListComponent isSide={true} key={index} cat={gender} cats={categories} ListStyle={ListStyle}></ListComponent>
                ))
            }
            {
                categories &&
                categories.map((cat, index) => (
                    !cat.isGenderVaried ?
                        <ListComponent isSide={true} key={index} cat={cat} ListStyle={ListStyle}></ListComponent>
                        :
                        ''
                ))
            }
        </>
    );

    return (
        <div className='z-40'>
            <div className="drawer z-40">
                <input id="my-drawer" type="checkbox" className="drawer-toggle" />
                <div className="drawer-content">
                    <label htmlFor="my-drawer" className="drawer-button">
                        <AiOutlineMenu className='text-3xl' />
                    </label>
                </div>
                <div className="drawer-side">
                    <label htmlFor="my-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
                    <ul className="relative menu p-4 w-96 min-h-full bg-base-200 text-base-content">
                        {links}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default LeftDrawer;

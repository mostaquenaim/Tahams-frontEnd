import Link from 'next/link';
import { useState } from 'react';

const Drawer = ({ ListStyle, ListComponent, categories }) => {
    const [drawerOpen, setDrawerOpen] = useState(false);

    const liClass = `text-black bg-white hover:bg-primary border-red-100 border-2 ${!drawerOpen && 'opacity-0'}`
    const parentLiClass = `text-black bg-white rounded-lg relative group`
    const ulClass = `ml-4 absolute z-50 top-4 left-12 lg:top-7 left-0 mt-2 hidden hover:block group-hover:block`

    const toggleDrawer = () => {
        setDrawerOpen(!drawerOpen);
    };

    const handleLinkClick = () => {
        // Close the drawer when any link is clicked
        setDrawerOpen(false);
    };

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
        <div>
            <div className={`drawer z-50 relative ${drawerOpen ? 'open' : ''}`}>
                {/* drawer open close  */}
                <input
                    type="checkbox"
                    id="panel-toggle"
                    className="relative sr-only peer"
                    checked={drawerOpen}
                    onChange={toggleDrawer}
                // defaultChecked
                />
                {/* drawer icon  */}
                <label
                    htmlFor="panel-toggle"
                    className="mt-2 fixed top-0 left-0 inline-block p-4 bg-neutral transition-all duration-500 rounded-lg peer-checked:rotate-180 peer-checked:left-64"

                >
                    <div className="w-6 h-1 mb-3 -rotate-45 bg-white rounded-lg"></div>
                    <div className="w-6 h-1 rotate-45 bg-white rounded-lg"></div>
                </label>
                <div
                    className="overflow-y-auto fixed top-0 left-0 z-20 w-64 h-full transition-all duration-500 transform -translate-x-full bg-base-200 shadow-lg peer-checked:translate-x-0"
                >
                    <div className="px-6 py-4">
                        <ul className={`menu p-4 min-h-full bg-base-200 text-base-content`} >
                            {links}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Drawer;
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { DrawerLinks } from '/utils/DrawerFunctions';

const CustomerDrawer = ({ ListStyle, ListComponent, categories, genders }) => {
    const [drawerOpen, setDrawerOpen] = useState(false);

    const toggleDrawer = () => {
        setDrawerOpen(!drawerOpen);
    };

    const links = DrawerLinks(ListStyle, ListComponent, categories, genders)

    return (
        <div>
            <div className={`drawer z-40 relative ${drawerOpen ? 'open' : ''}`}>
                {/* drawer open close  */}
                <input
                    type="checkbox"
                    id="panel-toggle"
                    className="relative sr-only peer"
                    checked={drawerOpen}
                    onChange={toggleDrawer}
                />
                {/* drawer icon  */}
                <label
                    htmlFor="panel-toggle"
                    className="mt-2 fixed top-0 left-0 inline-block p-4 bg-black transition-all duration-500 rounded-lg peer-checked:rotate-180 peer-checked:left-64"
                >
                    {/* Change icon based on drawer state */}
                    <FontAwesomeIcon
                        icon={drawerOpen ? faTimes : faBars}
                        className="text-white w-6 h-6"
                    />
                </label>
                <div
                    className="overflow-y-auto fixed top-0 left-0 z-20 w-64 h-full transition-all duration-500 transform -translate-x-full bg-base-200 shadow-lg peer-checked:translate-x-0"
                >
                    <div className="py-4">
                        <ul className={`p-5 space-y-5 flex flex-col min-h-full bg-base-200 text-base-content`} >
                            {links}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};
// px-6 
// p-4 
export default CustomerDrawer;

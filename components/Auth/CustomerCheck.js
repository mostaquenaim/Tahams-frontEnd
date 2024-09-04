import NavbarCompTwo from '../Header/NavbarComp';
import Footer from '../Footer/Footer';

const CustomerCheck = ({ children }) => {

    return (
        <div className="customer-container">
            <NavbarCompTwo />
            <div className="customer-content">
                {children}
            </div>
            <Footer />
        </div>
    );

};

export default CustomerCheck;

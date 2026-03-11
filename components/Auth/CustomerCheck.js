import Footer from '../Footer/Footer';
import NavBarCompRe from '../Header/NavBarCompRe';
import DrawerProvider from '/Contexts/DrawerProvider';

const CustomerCheck = ({ children }) => {
  return (
    <DrawerProvider>
      <div className="customer-container">
        <NavBarCompRe />
        <div className="customer-content">{children}</div>
        <Footer />
      </div>
    </DrawerProvider>
  );
};

export default CustomerCheck;

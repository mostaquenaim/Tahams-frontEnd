import useAxiosPublic from "/Hooks/useAxiosPublic";
import PaymentInfo from "/components/Cart/PaymentInfo";
import Footer from "/components/Footer/Footer";
import NavbarCompTwo from "/components/Header/NavbarComp";

const PaymentProcess = ({ buyingHistory }) => {
    // Display buying history data or implement your payment logic
    return (
        <div className="min-h-screen">
            <NavbarCompTwo />
            <div className="pt-48 min-h-screen">
                <PaymentInfo />
            </div>
            {/* {buyingHistory ? (
                <div>
                    <h3>Order Details</h3>
                    <p>Tracking Token: {buyingHistory.trackingToken}</p>
                    <p>Address: {buyingHistory.Address}</p>
                    <p>Phone Number: {buyingHistory.phone_no}</p> */}
            {/* Display other relevant details from buyingHistory */}
            {/* </div>
            ) : (
                <p>Error fetching buying history. Please try again later.</p>
            )} */}
            <Footer />
        </div>
    );
};

export default PaymentProcess;

export async function getServerSideProps(context) {
    const { params } = context;
    const { token } = params;
    const axios = useAxiosPublic()

    try {
        // Make a GET request to your backend API to fetch buying history
        const response = await axios.get(`/admin/get-buying-history-by-token/${token}`);
        const buyingHistory = response.data;

        return {
            props: {
                buyingHistory,
            },
        };
    } catch (error) {
        console.error('Error fetching buying history:', error);
        return {
            props: {
                buyingHistory: null,
            },
        };
    }
}

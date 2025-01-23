import useAxiosPublic from "/Hooks/useAxiosPublic";
import PaymentInfo from "/components/Cart/PaymentInfo";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../Contexts/Auth/AuthProvider";
import { useRouter } from "next/router";

const PaymentProcess = () => {
    const { user, loading } = useContext(AuthContext)
    const axiosPublic = useAxiosPublic()
    const [buyingHistory, setBuyingHistory] = useState()
    const router = useRouter()
    const {token} = router.query

    useEffect(() => {
        const fetchHistory = async () => {
            const email = user?.email || JSON.parse(localStorage.getItem('guestCustomerInfo'))?.email;

            if (!email) {
                throw new Error('No email found for the user or guest');
            }

            const result = await axiosPublic.get(`/admin/get-buying-history-by-token/${token}?email=${email}`)
            // console.log(result.data,'result');
            setBuyingHistory(result.data)
        }
        fetchHistory()
    }, [user?.email, router.query])

    // Display buying history data or implement your payment logic
    return (
        <div className="min-h-screen">
            {/* <NavbarCompTwo /> */}
            <div className="pt-20 lg:pt-48 min-h-screen">
                {
                    loading ?
                        <span className="loading loading-spinner loading-md"></span>
                        :
                        <PaymentInfo history={buyingHistory}/>
                }
            </div>
          {/* <Footer /> */} 
        </div>
    );
};

export default PaymentProcess;

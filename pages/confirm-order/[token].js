import axios from "axios";
import useAxiosPublic from "/Hooks/useAxiosPublic";
import PaymentInfo from "/components/Cart/PaymentInfo";
import Footer from "/components/Footer/Footer";
import NavbarCompTwo from "/components/Header/NavbarComp";
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
            const result = await axiosPublic.get(`/admin/get-buying-history-by-token/${token}?email=${user?.email}`)
            setBuyingHistory(result.data)
        }
        fetchHistory()
    }, [user?.email, router.query])

    // Display buying history data or implement your payment logic
    return (
        <div className="min-h-screen">
            {/* <NavbarCompTwo /> */}
            <div className="pt-48 min-h-screen">
                {
                    loading ?
                        <span className="loading loading-spinner loading-md"></span>
                        :
                        <PaymentInfo history={buyingHistory}/>
                }
            </div>
            <Footer />
        </div>
    );
};

export default PaymentProcess;

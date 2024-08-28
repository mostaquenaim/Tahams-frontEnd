import { createContext, useState } from "react";

export const DeliveryContext = createContext(null);

const DeliveryFeeProvider = ({ children }) => {
    const [deliveryFee, setDeliveryFee] = useState(80);
    
    const info ={
        deliveryFee,
        setDeliveryFee
    }

    return (
        <DeliveryContext.Provider value={info}>
            {children}
        </DeliveryContext.Provider>
    );
};

export default DeliveryFeeProvider;
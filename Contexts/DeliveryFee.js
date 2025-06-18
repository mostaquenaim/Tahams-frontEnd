import { createContext, useState } from "react";

export const DeliveryContext = createContext(null);

// Utility to check if today is Wednesday
const isWednesday = () => {
    return new Date().getDay() === 3;
};

const DeliveryFeeProvider = ({ children }) => {
    // Set initial fee: 0 if Wednesday, else 80
    const [deliveryFee, setDeliveryFee] = useState(() => isWednesday() ? 0 : 80);

    const info = {
        deliveryFee,
        setDeliveryFee
    };

    return (
        <DeliveryContext.Provider value={info}>
            {children}
        </DeliveryContext.Provider>
    );
};

export default DeliveryFeeProvider;

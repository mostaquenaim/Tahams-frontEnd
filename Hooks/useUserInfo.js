import { useEffect } from "react";

const useUserInfo = () => {

    useEffect(() => {
        const storedData = JSON.parse(localStorage.getItem('userInfo'))
        if (storedData) {
            return storedData
        }
        return null
    }, []);
}

export default useUserInfo;

import { useEffect } from "react";

const useUserInfo = () => {

    useEffect(() => {
        const storedData = JSON.parse(sessionStorage.getItem('userInfo'))
        if (storedData) {
            return storedData
        }
        return null
    }, []);
}

export default useUserInfo;

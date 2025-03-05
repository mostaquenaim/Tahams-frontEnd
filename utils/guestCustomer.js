export const getGuestCustomerInfo = () => {
     // Check for guest customer info in localStorage
     let guestCustomerInfo = JSON.parse(localStorage.getItem('guestCustomerInfo'));

    if (!guestCustomerInfo) {
        const randomNumber = Math.floor(Math.random() * 1000);

        guestCustomerInfo = {
            username: `guest${Date.now()}${randomNumber}`,
            email: `guest${Date.now()}${randomNumber}@tahamsbd.com`,
        };

        localStorage.setItem('guestCustomerInfo', JSON.stringify(guestCustomerInfo));
    }
    
    localStorage.setItem('userInfo', JSON.stringify(guestCustomerInfo));

    return guestCustomerInfo;
}

export const getGuestCustomerInfo = (user) => {
    // console.log(user,'usersss');
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

// Remembers a tracking token this guest's browser has earned by placing an
// order, so /my-orders can list them later without a login. This is the
// same proof-of-ownership the per-order lookup already relies on (token +
// matching email) - it never introduces a plain email-only lookup, which
// would be an IDOR (see admin.service.ts's getAllBuyingHistories comments).
export const addGuestOrderToken = (token) => {
    if (!token) return;

    const tokens = JSON.parse(localStorage.getItem('guestOrderTokens')) || [];
    if (!tokens.includes(token)) {
        tokens.push(token);
        localStorage.setItem('guestOrderTokens', JSON.stringify(tokens));
    }
};

export const getGuestOrderTokens = () => {
    return JSON.parse(localStorage.getItem('guestOrderTokens')) || [];
};

// Reassigns whatever cart items/orders this browser's guest identity had
// (still just this synthetic localStorage email, never anything the
// account actually owns) over to the real account that just logged in or
// registered - otherwise items added before signing in silently disappear
// from the account's cart, since they stayed tied to the guest email.
// Clears guestCustomerInfo afterward so a later logged-out guest session on
// this browser starts a fresh identity instead of reusing an already-merged
// one.
export const mergeGuestCartIntoAccount = async (axiosClient, realEmail) => {
    if (typeof window === 'undefined' || !realEmail) return;

    const guestInfo = JSON.parse(localStorage.getItem('guestCustomerInfo') || 'null');
    const guestEmail = guestInfo?.email;

    if (!guestEmail || guestEmail === realEmail) return;

    try {
        await axiosClient.post('/admin/merge-guest-cart', { guestEmail, realEmail });
        localStorage.removeItem('guestCustomerInfo');
    } catch (error) {
        console.error('Failed to merge guest cart:', error.message);
    }
};

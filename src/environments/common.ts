export const apiNames = {
    auth: {
        login: 'login',
        register: 'register',
        status: 'status',
        token: 'users/oauth/token',
        userInfo: 'loginUser'
    },
    userService: {
        createAccount: 'consumer',
        forgotPassword: 'forgotPassword',
        resetPassword: 'resetPassword',
        validateToken: 'validateToken',
        resendVerification: 'resendVerification'
    },
    profileInterest: {
        saveProfile: '',
        getCatalogue: 'consumerInterests',
        saveInterest: 'profile/addConsumerCatalogs',
        myAccountProfileImage: 'profilePic',
        myAccountEmailId: 'email',
        myAccountPassword: 'password',
        myAccountLocation: 'address',
        myAccountDOB: 'dateOfBirth',
        myAccountInterest: 'consumerInterst',
        review: 'review',
        getProductReviews: 'productReview',
        emailNotification: 'emailNotification',
        alertNotification: 'alertNotification',
        closeAccount: 'closeAccount',
        consumerOffer: 'consumerOffer',
        userReviewList: 'userReviewList',
        updateOffer: 'updateOffer',
        updateReview: 'reviewRead',
        updateOrderShipped: 'shipmentRead',
        updatePostReviewRead: 'reviewRead',
        addressList: 'addressList',
        productReviewSummary: 'productReviewSummary',
        deleteAddress: 'address',
        postReviewAlert: 'reviewAlert',
        getAllAlerts: 'alerts',
        checkAlertSubscription: 'alertActive',
        checkReviewStatus: 'checkReviewStatus',
        userDataOnLoad :'user'
    },
    products: {
        getPlaces: 'places',
        getCategories: 'categories',
        getSubCategories: 'subCategories',
        getTypes: 'types',
        getProduct: 'productDetails',
        search: 'textSearch',
        typeAhead: 'typeAhead',
        dynamicAttributes: 'dynamicAttributes',
        productDetails: 'productDetails',
        comingSoon: 'comingsoon',
        searchCommingSoon: 'searchCommingSoon',
        getTaxonomies:'menuTaxonomies',
        makeAnOffer:'makeAnOffer',
        priceRange:'priceRange',
        getpromotionalBannerProduts:'promotionalBannerProduts',
    },
    getOffers: {
        confirmOffer: 'getOffersRequest',
        partial: 'partial'
    },
    geoCode: {
        key: '&key=AIzaSyDPSk91ksjR47kqdFbElVwL7eM8FgIZEHw'
    },
    consumerCheckout: {
        addCard: 'addCustomer',
        orderPayment: 'orderPayment',
        getCards: 'customerCards',
        updateCard: 'addMultipleCards',
        deleteCard: 'deleteCard',
        productQuantity: 'productQuantity',
        cancelOrder: 'cancelOrder',
        trackOrderShipment: 'trackOrderShipment',
        support: 'support/saveSupportRequest',
        shippedItems: 'shippedItems',
        saveCartItems: 'saveCart',
        getCartItems: 'myCart',
        deleteCart: 'deleteCart',
        deleteAllCartItems: 'deleteAllCartItems',
        guestOrderPayment: 'public/guestOrderPayment'
    },
    shippingMethod: {
        method: 'retailer/v1',
        getTax: 'retailer/tax/v1/productsTax',
        getStates: 'retailer/v1/states/name',
        retailerPolicy: 'shippingReturns',
        latestShipMethodName: 'latestShipMethodName',
        validateAddress:'retailer/v1/public/validateAddress',
        guestShipMethod:'retailer/v1/public/guest',
        getGuestStates: 'retailer/v1/public/states/name',
    },
    mailChimp:{
        mailChimpLightbox:'mailChimpVipContacts'
    }
};

export const commonMessages = {
    error404: 'Server is not available',
};

export const regexPatterns = {
    numberRegex: new RegExp('^[0-9_.-]*$'),
    textRegex: new RegExp('^[a-zA-Z 0-9_.-]*$'),
    emailRegex: new RegExp('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+[\.]+[a-zA-Z0-9]{2,4}$'),
};

export const promotionalBanner = {
    'Home': 'Home & Garden_Furniture,Travel_Backpacks & Duffel Bags',
    'Home & Garden':'Lighting Fixtures',
    'Travel' : 'Duffel Bags',
    'Fashion & Apparel':'Watches',
    'Electronics':'Electronics',
    'Pets' :'Dogs',
    'Tools & Hardware':'Air Drills',
    'Sports & Fitness':'Camping & Hiking',
    'Kids':'Nightlights',
    'Health & Beauty':'',
    'Automotive':''
};
export const promotionalBannerIds = {
    'Home & Garden_Furniture':'5ba0c2755a51565e545ec8c7',
    'Travel_Backpacks & Duffel Bags':'5ba0c9c45a51565e545ececd|5ba0c9c75a51565e545eced0',
    'Lighting Fixtures':'5ba0c7965a51565e545ecd3e',
    'Watches':'5d2f322f0b8e533cf2cc7c5f|5d2f33090b8e533cf2cc7d02',
    'Electronics':'5b9fc3355a515639d42be989',
    'Dogs':'5b9fae5e5a515639d42be72e',
    'Air Drills':'5cbaa9361af3220424ab64a0',
    'Duffel Bags':'5ba0c9c75a51565e545eced0',
    'Camping & Hiking':'5ba0cd3d5a51565e545ed06a',
    'Nightlights':'5ba0c7b65a51565e545ecd59'
    };
import { Dimensions, Platform, StatusBar, PixelRatio } from 'react-native';

var window = Dimensions.get("window");
export const WindowDimensions = {
    height: window.height,
    width: window.width
};

export const widthPercentageToDP = (percentage) => {
    return PixelRatio.roundToNearestPixel(WindowDimensions.width * percentage / 100);
}

export const heightPercentageToDP = (percentage) => {
    return PixelRatio.roundToNearestPixel(WindowDimensions.height * percentage / 100);
}

export const IS_ANDROID = Platform.OS === 'android';

// const APP_HEADER_HEIGHT = heightPercentageToDP(10);
const APP_HEADER_HEIGHT = 64;

export const DEVICE_LOCATION_STATE = { ON: 'on', OFF: 'off' };

export const THUMBNAIL_TAIL_TAG = '_thumb';
export const MEDIUM_TAIL_TAG = '_medium';
export const PORTRAIT_TAIL_TAG = '_potrait';
export const RIDE_TAIL_TAG = '_ride';

const BASE_URL = 'http://104.43.254.82';
const RIDES_URL = 'http://104.43.208.200';
const GRAPH_URL = 'http://40.113.216.90';
const EVENT_URL = 'http://104.43.208.200';
const NOTIFICATION_URL = 'http://168.61.214.135';
export const USER_BASE_URL = BASE_URL + ':5051/';
export const RIDE_BASE_URL = RIDES_URL + ':5052/';
export const FRIENDS_BASE_URL = BASE_URL + ':5053/';
export const NOTIFICATIONS_BASE_URL = NOTIFICATION_URL + ':5054/';
export const CHAT_BASE_URL = NOTIFICATION_URL + ':5056/';
export const GRAPH_BASE_URL = GRAPH_URL + ':5057/';
// export const EVENTS_BASE_URL = GRAPH_URL + ':5055/';
export const EVENTS_BASE_URL = EVENT_URL + ':5055/';
export const POST_TYPE_BASE_URL = NOTIFICATION_URL + ':6062/';

export const PageKeys = {
    EDIT_PROFILE: 'editProfile',
    VISIT_GARAGE: 'visitGarage',
    PASSENGERS: 'passengers',
    PASSENGER_FORM: 'passengerForm',
    PASSENGER_PROFILE: 'passengerProfile',
    LOGIN: 'login',
    SIGNUP: 'signup',
    FRIENDS: 'friends',
    GROUP: 'group',
    GROUP_FORM: 'groupForm',
    SPLASH_SCREEN: 'splashScreen',
    FORGOT_PASSWORD: 'forgotPassword',
    TABS: 'tabs',
    PROFILE: 'profile',
    SETTINGS: 'settings',
    EDIT_PROFILE_FORM: 'editProfileForm',
    ADD_BIKE_FORM: 'addBikeForm',
    GALLERY: 'gallery',
    NOTIFICATIONS: 'notifications',
    CONTACTS_SECTION: 'contactsSection',
    FRIENDS_PROFILE: 'friendsProfile',
    CHAT_LIST: 'chatList',
    CHAT: 'chat',
    APP_NAVIGATION_MENU: 'appNavigation',
    RIDES: 'rides',
    MAP: 'map',
    WAYPOINTLIST: 'waypointList',
    COMMENT_SECTION: 'commentSection',
    CREATE_RIDE: 'createRide',
    OFFERS: 'offers',
    MY_WALLET_FORM: 'myWalletForm',
    ALBUM: 'album',
    BIKE_DETAILS: 'bikeDetails',
    POST_FORM: 'postForm',
    BUDDY_FRIENDS: 'buddyFriends',
    BUDDY_PASSENGERS: 'buddyPassengers'
};

export const POST_TYPE = { WISH_LIST: 'wishList', JOURNAL: 'journal', STORIES_FROM_ROAD: 'storiesFromRoad', CUSTOMIZATION: 'customization', ALBUM: 'album' };

export const MAP_ACCESS_TOKEN = 'pk.eyJ1IjoibWFkaGF2YW4tcmVhY3RpdmV3b3JrcyIsImEiOiJjam9qbXJybzQwNmE4M3BvODY4dXhhdGUyIn0.oPQRig3knqF_oYXrRSca7w';
export const JS_SDK_ACCESS_TOKEN = 'sk.eyJ1IjoibWFkaGF2YW4tcmVhY3RpdmV3b3JrcyIsImEiOiJjam90eWlsN2wwbG1rM2tzM3pvaDlmYzh0In0.QMn07ObbKIQT_JOVprV5Dg';

export const TAB_CONTAINER_HEIGHT = 50;
export const BULLSEYE_SIZE = 40;

export const ShortMonthNames = { 'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12' };
export const USER_AUTH_TOKEN = 'userAuthToken';
export const DEVICE_TOKEN = 'deviceToken';
export const UNSYNCED_RIDE = 'unsyncedRide';

export const RECORD_RIDE_STATUS = { RUNNING: 'running', COMPLETED: 'completed', PAUSED: 'paused' };

export const RIDE_TYPE = { RECORD_RIDE: 'recordRide', BUILD_RIDE: 'buildRide', SHARED_RIDE: 'sharedRide' };

export const FRIEND_TYPE = { ALL_FRIENDS: 'allFriends', ONLINE_FRIENDS: 'onlineFriends' };

export const APP_EVENT_TYPE = { ACTIVE: 'active', INACTIVE: 'inactive' };

export const APP_EVENT_NAME = { USER_EVENT: 'userEvent' };

export const HEADER_KEYS = { FRIENDS_LENGTH: 'friends-length', RECIEVED_REQUEST_LENGTH: 'received-request-length', SENT_REQUEST_LENGTH: 'sent-request-length' };

export const RELATIONSHIP = { FRIEND: 'friend', RECIEVED_REQUEST: 'receivedRequest', SENT_REQUEST: 'sentRequest', UNKNOWN: 'unknown' };

export const ICON_NAMES = {
    SOURCE_DEFAULT: 'sourceDefault', SOURCE_SELECTED: 'sourceSelected',
    DESTINATION_DEFAULT: 'destinationDefault', DESTINATION_SELECTED: 'destinationSelected',
    WAYPOINT_DEFAULT: 'waypointDefault', WAYPOINT_SELECTED: 'waypointSelected'
}
export const RIDE_POINT = { SOURCE: 'source', DESTINATION: 'destination', WAYPOINT: 'waypoint' }

const HEADER_COLOR = '#2B77B4';
const STATUS_BAR_COLOR = '#006297';

export const CUSTOM_FONTS = {
    roboto: 'Roboto',
    robotoBold: 'Roboto-Bold',
    robotoSlab: 'RobotoSlab-Regular_Light',
    robotoSlabBold: 'RobotoSlab-Regular_Bold',
    gothamLight: 'Gotham-Light',
    gothamBold: 'Gotham-Bold',
    dinCondensed: 'D-DINCondensed',
    dinCondensedBold: 'D-DINCondensed-Bold',
};

export const APP_COMMON_STYLES = {
    infoColor: '#EB861E',
    headerColor: '#2B77B4',
    headerHeight: APP_HEADER_HEIGHT,
    statusBarColor: '#006297',
    statusBarColorDark: '#000',
    testingBorder: { borderWidth: 2, borderColor: 'red' },
    statusBar: {
        height: IS_ANDROID ? StatusBar.currentHeight : heightPercentageToDP(4),
        backgroundColor: STATUS_BAR_COLOR,
    },
    appBar: {
        backgroundColor: HEADER_COLOR,
        height: IS_ANDROID ? 56 : 44,
    },
    menuOptContainer: {
        alignSelf: 'flex-end',
        width: '50%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingTop: '10%',
    },
    menuOptHeaderImage: {
        width: '90%',
        resizeMode: 'contain'
    },
    menuOptHeaderTitle: {

    },
    menuOptHighlight: {
        width: '100%',
        height: '12%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuOpt: {
        paddingHorizontal: 0,
    },
    menuOptTxt: {
        color: '#fff',
        fontSize: widthPercentageToDP(4),
        paddingVertical: '12%',
    },
    leftDominantCont: {
        alignSelf: 'flex-start'
    },
    txtAlignRight: {
        textAlign: 'right'
    },
    tabContainer: {
        height: 43
    }
};
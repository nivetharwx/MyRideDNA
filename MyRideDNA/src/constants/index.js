import { Dimensions, Platform, StatusBar } from 'react-native';

var window = Dimensions.get("window");
export const WindowDimensions = {
    height: window.height,
    width: window.width
};

export const widthPercentageToDP = (percentage) => {
    return WindowDimensions.width * percentage / 100;
}

export const heightPercentageToDP = (percentage) => {
    return WindowDimensions.height * percentage / 100;
}

export const IS_ANDROID = Platform.OS === 'android';

const APP_HEADER_HEIGHT = IS_ANDROID ? heightPercentageToDP(8.5) : heightPercentageToDP(10);

export const DEVICE_LOCATION_STATE = { ON: 'on', OFF: 'off' };

export const THUMBNAIL_TAIL_TAG = '_thumb';

const BASE_URL = 'http://104.43.254.82';
const GRAPH_URL = 'http://40.113.216.90';
const NOTIFICATION_URL = 'http://168.61.214.135';
export const USER_BASE_URL = BASE_URL + ':5051/';
export const RIDE_BASE_URL = BASE_URL + ':5052/';
export const FRIENDS_BASE_URL = BASE_URL + ':5053/';
export const NOTIFICATIONS_OR_EVENT_BASE_URL = NOTIFICATION_URL + ':5054/';
export const CHAT_BASE_URL = BASE_URL + ':5056/';
export const GRAPH_BASE_URL = GRAPH_URL + ':5057/';

export const PageKeys = {
    EDIT_PROFILE: 'editProfile',
    VISIT_GARAGE: 'visitGarage',
    PASSENGERS: 'passengers',
    PASSENGER_FORM: 'passengerForm',
    LOGIN: 'login',
    SIGNUP: 'signup',
    FRIENDS: 'friends',
    GROUP: 'group',
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
    APP_NAVIGATION_MENU: 'appNavigation',
    RIDES: 'rides',
    MAP: 'map',
    CREATE_RIDE: 'createRide'
};

export const MAP_ACCESS_TOKEN = 'pk.eyJ1IjoibWFkaGF2YW4tcmVhY3RpdmV3b3JrcyIsImEiOiJjam9qbXJybzQwNmE4M3BvODY4dXhhdGUyIn0.oPQRig3knqF_oYXrRSca7w';
export const JS_SDK_ACCESS_TOKEN = 'sk.eyJ1IjoibWFkaGF2YW4tcmVhY3RpdmV3b3JrcyIsImEiOiJjam90eWlsN2wwbG1rM2tzM3pvaDlmYzh0In0.QMn07ObbKIQT_JOVprV5Dg';

export const TAB_CONTAINER_HEIGHT = 50;
export const BULLSEYE_SIZE = 40;

export const ShortMonthNames = { 'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12' };
export const USER_AUTH_TOKEN = 'userAuthToken';

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

const HEADER_COLOR = '#0076B5';
const STATUS_BAR_COLOR = '#006297';

export const APP_COMMON_STYLES = {
    infoColor: '#EB861E',
    headerColor: HEADER_COLOR,
    headerHeight: APP_HEADER_HEIGHT,
    statusBarColor: STATUS_BAR_COLOR,
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
    }
};
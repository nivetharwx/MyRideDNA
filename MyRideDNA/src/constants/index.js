import { Dimensions, Platform, StatusBar, PixelRatio } from 'react-native';

// DOC: Changed window to screen as it is not including soft navbar height in acndroid
const window = Dimensions.get("screen");
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
export const HAS_IOS_ABOVE_10 = parseInt(Platform.Version) > 10;

export const MESSAGE_STATUS = { ERROR: 'error', SENDING: 'sending', SENT: 'sent', SEEN: 'seen' };

// const APP_HEADER_HEIGHT = heightPercentageToDP(10);
const APP_HEADER_HEIGHT = 64;

export const DEVICE_LOCATION_STATE = { ON: 'on', OFF: 'off' };

export const THUMBNAIL_TAIL_TAG = '_thumb';
export const MEDIUM_TAIL_TAG = '_medium';
export const PORTRAIT_TAIL_TAG = '_potrait';
export const RIDE_TAIL_TAG = '_ride';

const BASE_URL = 'https://beta.api.myridedna.com/';
const RIDES_URL = 'http://23.100.80.42';
const GRAPH_URL = 'http://40.113.216.90';
const EVENT_URL = 'http://104.43.208.200';
const NOTIFICATION_URL = 'http://168.61.214.135';
const NEW_MACHINE = 'http://13.67.131.39';
export const USER_BASE_URL = BASE_URL + 'users/';
export const RIDE_BASE_URL = BASE_URL + 'rides/';
export const FRIENDS_BASE_URL = BASE_URL + 'friends/'; //BASE_URL + ':5053/';
export const CHAT_BASE_URL = BASE_URL + 'chats/'; //NOTIFICATION_URL + ':5056/';
export const NOTIFICATIONS_BASE_URL = BASE_URL + 'notifications/';
export const GRAPH_BASE_URL = BASE_URL + 'graphs/';
// export const EVENTS_BASE_URL = GRAPH_URL + ':5055/';
export const EVENTS_BASE_URL = BASE_URL + 'events/';
export const POSTS_BASE_URL = BASE_URL + 'posts/';
export const GET_PICTURE_BY_ID = `${USER_BASE_URL}getPictureById/`;

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
    SELECTED_MEDIA_VIEW: 'selectedMediaView',
    APP_NAVIGATION_MENU: 'appNavigation',
    RIDES: 'rides',
    MAP: 'map',
    WAYPOINTLIST: 'waypointList',
    ITINERARY_SECTION: 'waypointList',
    COMMENT_SECTION: 'commentSection',
    CREATE_RIDE: 'createRide',
    OFFERS: 'offers',
    MY_WALLET_FORM: 'myWalletForm',
    ALBUM: 'album',
    JOURNAL: 'journal',
    BIKE_DETAILS: 'bikeDetails',
    POST_FORM: 'postForm',
    BUDDY_FRIENDS: 'buddyFriends',
    BUDDY_PASSENGERS: 'buddyPassengers',
    BUDDY_ALBUM: 'buddyAlbum',
    BIKE_ALBUM: 'bikeAlbum',
    BIKE_SPEC_LIST: 'bikeSpecList',
    BIKE_SPEC: 'bikeSpec',
    LOGGED_RIDE: 'loggedRide',
    RIDE_DETAILS: 'rideDetails',
    POST_DETAIL: 'postDetail',
    VEST: 'vest',
    NEWS_FEED: 'newsFeed',
    CHAT_SEARCH: 'chatSearch',
    FIND_RIDE: 'findRide',
    SEARCH_RESULT: 'searchResult',
    LIKES: 'likes',
    COMMENTS: 'comments',
    LOGGED_RIDE_DETAIL: 'loggedRideDetail',
    DIRECTION: 'direction',
};

export const POST_TYPE = { WISH_LIST: 'wishList', JOURNAL: 'journal', STORIES_FROM_ROAD: 'storiesFromRoad', MY_RIDE: 'customization', ALBUM: 'album', LOGGED_RIDES: 'loggedRides' };

export const MAP_ACCESS_TOKEN = 'pk.eyJ1IjoibWFkaGF2YW4tcmVhY3RpdmV3b3JrcyIsImEiOiJjam9qbXJybzQwNmE4M3BvODY4dXhhdGUyIn0.oPQRig3knqF_oYXrRSca7w';
export const JS_SDK_ACCESS_TOKEN = 'sk.eyJ1IjoibWFkaGF2YW4tcmVhY3RpdmV3b3JrcyIsImEiOiJjam90eWlsN2wwbG1rM2tzM3pvaDlmYzh0In0.QMn07ObbKIQT_JOVprV5Dg';

export const TAB_CONTAINER_HEIGHT = 50;
export const BULLSEYE_SIZE = 40;

// export const ShortMonthNames = { 'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12' };
export const ShortMonthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const USER_AUTH_TOKEN = 'userAuthToken';
export const DEVICE_TOKEN = 'deviceToken';
export const UNSYNCED_RIDE = 'unsyncedRide';

export const RECORD_RIDE_STATUS = { RUNNING: 'running', COMPLETED: 'completed', PAUSED: 'paused' };

export const RIDE_TYPE = { RECORD_RIDE: 'recordRide', BUILD_RIDE: 'buildRide', SHARED_RIDE: 'sharedRide' };

export const FRIEND_TYPE = { ALL_FRIENDS: 'allFriends', ONLINE_FRIENDS: 'onlineFriends' };

export const APP_EVENT_TYPE = { ACTIVE: 'active', INACTIVE: 'inactive' };

export const APP_EVENT_NAME = { USER_EVENT: 'userEvent' };

export const HEADER_KEYS = { FRIENDS_LENGTH: 'friends-length', RECIEVED_REQUEST_LENGTH: 'received-request-length', SENT_REQUEST_LENGTH: 'sent-request-length' };

export const RELATIONSHIP = { INVITED: 'invited', FRIEND: 'friend', RECIEVED_REQUEST: 'receivedRequest', SENT_REQUEST: 'sentRequest', ACCEPT_REQUEST: 'acceptRequest', UNKNOWN: 'unknown' };

export const NOTIFICATION_TYPE = { RECIEVED_REQUEST: RELATIONSHIP.RECIEVED_REQUEST, SENT_REQUEST: RELATIONSHIP.SENT_REQUEST, ACCEPT_REQUEST: RELATIONSHIP.ACCEPT_REQUEST, GROUP: 'group', LIKE: 'like', COMMENT: 'comment' };

export const ICON_NAMES = {
    SOURCE_DEFAULT: 'sourceDefault', SOURCE_SELECTED: 'sourceSelected',
    DESTINATION_DEFAULT: 'destinationDefault', DESTINATION_SELECTED: 'destinationSelected',
    WAYPOINT_DEFAULT: 'waypointDefault', WAYPOINT_SELECTED: 'waypointSelected'
}
export const RIDE_POINT = { SOURCE: 'source', DESTINATION: 'destination', WAYPOINT: 'waypoint' }

export const RIDE_SORT_OPTIONS = { DATE: 'lastModifiedDate', TIME: 'totalTime', DISTANCE: 'totalDistance', AUTHOR: 'author' }

const HEADER_COLOR = '#2B77B4';
const STATUS_BAR_COLOR = '#006297';

export const CHAT_CONTENT_TYPE = { IMAGE: 'image', TEXT: 'text', VIDEO: 'video', RIDE: 'ride' };

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
        height: IS_ANDROID ? StatusBar.currentHeight : 20,
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
    },
    optionsModal: { justifyContent: 'flex-end' },
    optionsContainer: {
        marginHorizontal: 15,
        backgroundColor: '#fff',
        borderColor: '#D8D8D8',
        borderWidth: 1,
        borderRadius: 15,
        overflow: 'hidden',
        marginBottom: IS_ANDROID ? 20 : 80,
    },
    optionBtn: {
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#D8D8D8',
    },
    optionBtnTxt: {
        color: '#585756',
        fontSize: 16,
        letterSpacing: 0.8,
        textAlign: 'center',
    }
};
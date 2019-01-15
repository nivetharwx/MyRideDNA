import { Dimensions, Platform } from 'react-native';

var window = Dimensions.get("window");
export const WindowDimensions = {
    height: window.height,
    width: window.width
};

export const IS_ANDROID = Platform.OS === 'android';

export const DEVICE_LOCATION_STATE = { ON: 'on', OFF: 'off' };

const BASE_URL = 'http://104.43.254.82';
const GRAPH_URL = 'http://40.113.216.90';
export const USER_BASE_URL = BASE_URL + ':5051/';
export const RIDE_BASE_URL = BASE_URL + ':5052/';
export const FRIENDS_BASE_URL = BASE_URL + ':5053/';
export const NOTIFICATIONS_BASE_URL = BASE_URL + ':5054/';
export const CHAT_BASE_URL = BASE_URL + ':5056/';
export const GRAPH_BASE_URL = GRAPH_URL + ':5057/';

export const PageKeys = {
    EDIT_PROFILE: 'editProfile',
    VISIT_GARAGE: 'visitGarage',
    PASSENGERS: 'passengers',
    LOGIN: 'login',
    SIGNUP: 'signup',
    TABS: 'tabs',
    PROFILE: 'profile',
    GALLERY: 'gallery',
    NOTIFICATIONS: 'notifications',
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
export const ACCESS_TOKEN = 'accessToken';

export const RECORD_RIDE_STATUS = { RUNNING: 'running', COMPLETED: 'completed', PAUSED: 'paused' };

export const ICON_NAMES = {
    SOURCE_DEFAULT: 'sourceDefault', SOURCE_SELECTED: 'sourceSelected',
    DESTINATION_DEFAULT: 'destinationDefault', DESTINATION_SELECTED: 'destinationSelected',
    WAYPOINT_DEFAULT: 'waypointDefault', WAYPOINT_SELECTED: 'waypointSelected'
}
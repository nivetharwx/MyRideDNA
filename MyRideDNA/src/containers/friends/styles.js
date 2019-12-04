import { WindowDimensions, widthPercentageToDP, IS_ANDROID, heightPercentageToDP, CUSTOM_FONTS } from "../../constants";


const THUMBNAIL_SIZE = IS_ANDROID ? heightPercentageToDP(6.5) : heightPercentageToDP(8);
const styles = {
    fill: {
        flex: 1
    },
    tabContentCont: {
        paddingHorizontal: 0
    },
    bottomTabContainer: {
        position: 'absolute',
        zIndex: 900,
        bottom: 0,
        // paddingBottom: IS_ANDROID ? 0 : 20,
        height: '100%',
        width: '100%',
    },
    bottomTab: {
        alignItems: 'center',
        justifyContent: 'center',
        width: widthPercentageToDP(33.3),
    },
    thumbnail: {
        height: THUMBNAIL_SIZE,
        width: THUMBNAIL_SIZE,
        borderRadius: THUMBNAIL_SIZE / 2,
        alignSelf: 'center'
    },
    activeTab: {
        backgroundColor: '#000000'
    },
    inActiveTab: {
        backgroundColor: '#81BA41'
    },
    borderRightWhite: {
        borderRightWidth: 1,
        borderColor: '#fff'
    },
    borderLeftWhite: {
        borderLeftWidth: 1,
        borderColor: '#fff'
    },
    tabText: {
        fontSize: 13,
        fontFamily: CUSTOM_FONTS.robotoBold,
        letterSpacing: 0.6
    }
};

export default styles;
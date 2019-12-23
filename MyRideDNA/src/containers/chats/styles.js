import { StyleSheet } from 'react-native';
import { APP_COMMON_STYLES, widthPercentageToDP, heightPercentageToDP, IS_ANDROID, CUSTOM_FONTS } from '../../constants';
import { App } from 'react-native-firebase';

const THUMBNAIL_SIZE = IS_ANDROID ? heightPercentageToDP(6.5) : heightPercentageToDP(8);
export const FOOTER_HEIGHT = 75;
const styles = StyleSheet.create({
    fill: {
        flex: 1
    },
    chatHeader: {
        height: APP_COMMON_STYLES.headerHeight,
        backgroundColor: APP_COMMON_STYLES.headerColor,
        flexDirection: 'row',
        elevation: 30,
        shadowOffset: { width: 0, height: 8 },
        shadowColor: '#000000',
        shadowOpacity: 0.9,
        shadowRadius: 5,
        zIndex: 999,
        paddingHorizontal: 15
    },
    deleteButtonChatHeader: {
        flexDirection: 'row',
        position: 'absolute',
        zIndex: 100,
        width: '100%',
        height: APP_COMMON_STYLES.headerHeight,
        padding: widthPercentageToDP(3),
        flex: 1,
    },
    chatHeaderName: {
        color: '#fff',
        fontSize: 20,
        letterSpacing: 0.2,
        marginLeft: 15,
        marginRight: 5,
        fontFamily: CUSTOM_FONTS.gothamBold
    },
    chatHeaderNickname: {
        color: APP_COMMON_STYLES.infoColor,
        fontFamily: CUSTOM_FONTS.gothamBold,
        marginLeft: widthPercentageToDP(2)
    },
    chatArea: {
        paddingHorizontal: 13,
        paddingTop: 10
    },
    friendMsgBubble: {
        backgroundColor: '#81c341',
        // backgroundColor: '#81BA41',
    },
    myMsgBubble: {
        backgroundColor: '#00AEEF',
        alignSelf: 'flex-end',
    },
    friendName: {
        color: '#fff'
    },
    footer: {
        backgroundColor: '#3E3E3E',
        height: FOOTER_HEIGHT,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10
    },
    footerRtIcnCont: {
        backgroundColor: '#00AEEF',
        width: 20,
        height: 20,
        borderRadius: 18,
        alignSelf: 'center',
        marginLeft: 10,
    },
    footerRightIcon: {
        fontSize: 18,
        color: '#000000',
        paddingTop: 1,
        transform: [{ rotate: '90deg' }]
    },
    inputCont: {
        flex: 1,
        height: 57,
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 13,
        overflow: 'hidden',
    },
    inputBox: {
        flex: 1,
        paddingHorizontal: 15,
        paddingTop: 10,
        fontSize: 15,
        fontFamily: CUSTOM_FONTS.roboto
    },
    thumbnail: {
        height: widthPercentageToDP(8.5),
        width: widthPercentageToDP(8.5),
        borderRadius: 17,
        alignSelf: 'flex-end'
        // marginBottom: 17,
    },
    iconPadding: {
        padding: 5,
        backgroundColor: 'white',
        borderRadius: 19,
        height: 38,
        width: 38,
        alignItems: 'center',
        alignSelf: 'center',
    },
    groupIconStyle: {
        height: THUMBNAIL_SIZE,
        width: THUMBNAIL_SIZE,
        borderRadius: THUMBNAIL_SIZE / 2,
        backgroundColor: '#6C6C6B',
    },
    scrollToLastIcnCont: {
        backgroundColor: '#acacac',
        position: 'absolute',
        bottom: 90,
        right: 15,
        height: 30,
        width: 30,
        borderRadius: 15
    },
    time: {
        // color: '#8D8D8D', 
        color: '#adacac',
        alignSelf: 'center',
        marginVertical: 4,
        paddingHorizontal: 5,
        paddingVertical: 4,
        letterSpacing: 0.8,
        fontSize: 12,
        // height: 24,
        // width: 74,
        // borderRadius: 20,
        // backgroundColor: 'rgba(255,255,255, 0.9)'

    },
    picker: {
        position: 'absolute',
        zIndex: 500,
        overflow: 'hidden',
        bottom: 0,
        width: widthPercentageToDP(100),
    },
    pickerBackdrop: {
        flex: 1,
        justifyContent: 'flex-end',
        paddingBottom: FOOTER_HEIGHT
    },
    noBorder: {
        borderBottomWidth: 0,
        borderBottomColor: 'transparent'
    },
    imagesContainer: {
        flex: 1,
        backgroundColor: '#fff',
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 10,
        paddingVertical: 10,
    },
    thumbnailContainer: {
        width: ((widthPercentageToDP(100) - 20) / 3) - 10,
        height: ((widthPercentageToDP(100) - 20) / 3) - 10,
        marginHorizontal: 5,
        marginVertical: 5,
    },
    squareThumbnail: {
        flex: 1,
        width: null,
        height: null,
        alignItems: 'flex-end'
    },
    closeIconContainer: {
        height: 18,
        width: 18,
        borderRadius: 18,
        backgroundColor: '#F5891F',
        top: -5,
        right: -5
    },
    closeIcon: {
        fontSize: 19,
        color: '#fff'
    },
});
export default styles;
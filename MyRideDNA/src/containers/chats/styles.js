import { StyleSheet } from 'react-native';
import { APP_COMMON_STYLES, widthPercentageToDP, heightPercentageToDP, IS_ANDROID, CUSTOM_FONTS } from '../../constants';

const THUMBNAIL_SIZE = IS_ANDROID ? heightPercentageToDP(6.5) : heightPercentageToDP(8);
export const FOOTER_HEIGHT = 75;
const styles = StyleSheet.create({
    fill: {
        flex: 1,
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
        fontFamily: CUSTOM_FONTS.gothamBold,
        marginRight: 10
    },
    chatHeaderNickname: {
        color: APP_COMMON_STYLES.infoColor,
        fontFamily: CUSTOM_FONTS.gothamBold,
        marginLeft: widthPercentageToDP(2)
    },
    chatArea: {
        paddingHorizontal: 10,
        paddingTop: 10
    },
    friendMsgBubble: {
        backgroundColor: '#81c341',
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
    footerLtIcnCont: {
        marginRight: 5,
        backgroundColor: '#FFFFFF',
        width: 25,
        height: 25,
        borderRadius: 18,
        alignSelf: 'center',
    },
    footerLtIcon: {
        fontSize: 18,
        color: '#000000',
    },
    footerRtIcnCont: {
        backgroundColor: '#00AEEF',
        width: 25,
        height: 25,
        borderRadius: 18,
        alignSelf: 'center',
        marginLeft: 10,
    },
    footerRtIcon: {
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
        color: '#ACACAC',
        alignSelf: 'center',
        marginVertical: 4,
        paddingHorizontal: 5,
        paddingVertical: 4,
        letterSpacing: 0.8,
        fontSize: 12,
    },
    picker: {
        position: 'absolute',
        zIndex: 999,
        overflow: 'hidden',
        bottom: 0,
        width: widthPercentageToDP(100),
        elevation: 10,
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
        alignItems: 'flex-end',
        backgroundColor: '#A9A9A9'
    },
    closeIconContainer: {
        position: 'absolute',
        height: 18,
        width: 18,
        borderRadius: 9,
        backgroundColor: '#F5891F',
        top: -7,
        right: -7,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'flex-end'
    },
    closeIcon: {
        fontSize: 19,
        color: '#fff'
    },
    mediaMsgContainer: {
        padding: 5,
        paddingBottom: 2,
        borderRadius: 9,
        alignItems: 'center',
        overflow: 'hidden'
    },
    imgMsgContainer: {
        justifyContent: 'center',
        flexWrap: 'wrap',
        flexDirection: 'row'
    },
    imgMsgStyle: {
        margin: 2,
        borderColor: '#fff'
    },
    imgMoreContainer: {
        position: 'absolute',
        backgroundColor: 'rgba(0,0,0,0.6)',
        alignItems: 'center',
        justifyContent: 'center'
    },
    imgMoreTxt: {
        color: '#fff',
        fontSize: 20,
        fontFamily: CUSTOM_FONTS.roboto
    },
    msgTime: {
        alignSelf: 'flex-end',
        fontSize: 10,
        letterSpacing: 0.8,
        fontFamily: CUSTOM_FONTS.robotoBold
    },
    txtWithImg: {
        fontFamily: CUSTOM_FONTS.roboto,
        paddingTop: 10,
        paddingBottom: 3
    },
    headingView: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center'
    },
    unseenMsgCountView: {
        backgroundColor: APP_COMMON_STYLES.infoColor,
        position: 'absolute',
        bottom: 110,
        right: 10,
        height: widthPercentageToDP(5),
        minWidth: widthPercentageToDP(5),
        borderRadius: widthPercentageToDP(2.5),
        textAlign: 'center',
        justifyContent: 'center'
    },
    unseenMsgCountTxt: {
        color: '#fff',
        textAlign: 'center',
        fontSize: heightPercentageToDP(1.7)
    },
    imgLoaderView: {
        top: '50%',
        alignSelf: 'center',
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center'
    },
    modalRoot: {
        backgroundColor: 'rgba(0,0,0,0.3)',
        flex: 1,
        flexDirection: 'row',
        elevation: 20
    },
    modalContainer: {
        width: widthPercentageToDP(100),
        height: '100%',
        backgroundColor: '#fff'
    },
    modalHeader: {
        backgroundColor: APP_COMMON_STYLES.headerColor,
        height: APP_COMMON_STYLES.headerHeight,
        position: 'absolute',
        zIndex: 100,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    modalBodyContent: {
        flex: 1,
    },
    imgTimeStatusContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end'
    },
    msgStatusIcon: {
        fontSize: 12,
        width: 17,
        left: 5
    },
    columnWrapper: {
        justifyContent: 'space-between',
        marginBottom: heightPercentageToDP(4),
        marginHorizontal: 25
    },
    rideImgStyle: {
        height: widthPercentageToDP(40),
        width: widthPercentageToDP(40)
    },
    bubbleName: {
        color: '#C4C4C4',
        fontSize: 10,
        letterSpacing: 0.8,
        fontFamily: CUSTOM_FONTS.robotoBold
    },
    mediaCloseIconContainer: {
        position: 'absolute',
        height: widthPercentageToDP(8),
        width: widthPercentageToDP(8),
        borderRadius: widthPercentageToDP(4),
        backgroundColor: '#F5891F',
        marginLeft: widthPercentageToDP(16),
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'flex-end',
        top: heightPercentageToDP(-1.5),
        right: widthPercentageToDP(-1.5)
    },
    mediaCloseIcon: {
        fontSize: widthPercentageToDP(5),
        color: '#fff'
    },
    mediaModalContent: {
        backgroundColor: '#fff',
        height: heightPercentageToDP(70),
        width: widthPercentageToDP(92),
        alignItems: 'center',
        justifyContent: 'center'
    },
    enlargedMediaContainer: {
        paddingHorizontal: 20,
        width: widthPercentageToDP(92),
        height: heightPercentageToDP(50)
    },
    enlargedMedia: {
        height: '100%',
        width: null,
    },
    mediaAdvanceBtn: {
        position: 'absolute',
        height: 120,
        width: 22,
        backgroundColor: '#C4C6C8'
    },
    prevBtn: {
        alignSelf: 'flex-start',
        left: 5,
    },
    nextBtn: {
        alignSelf: 'flex-end',
        right: 5,
    },
    prevBtnIcon: {
        right: 4
    },
    nextBtnIcon: {
        left: 4,
        transform: [{ rotate: '180deg' }]
    },
    mediaDescription: {
        letterSpacing: 0.38,
        fontSize: 15,
        marginVertical: 20,
        color: '#fff'
    },
    circle: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginLeft: 7,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center'
    },
    deleteBoxCont: {
        height: 263,
        width: 327,
        backgroundColor: '#F4F4F4',
        borderRadius: 20,
        padding: 31,
        paddingRight: 40
    },
    deleteTitle: {
        color: '#585756',
        fontFamily: CUSTOM_FONTS.robotoBold,
        fontSize: 20
    },
    deleteText: {
        color: '#585756',
        fontFamily: CUSTOM_FONTS.roboto,
        fontSize: 17,
        letterSpacing: 0.17,
        marginTop: 30
    },
    btnContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20
    },
    actionBtn: {
        height: 35,
        backgroundColor: '#2B77B4',
        width: 125,
        alignSelf: 'center',
        borderRadius: 20,
        marginTop: 20
    },
    actionBtnTxt: {
        letterSpacing: 1.4,
        fontSize: 14,
        fontFamily: CUSTOM_FONTS.robotoBold
    },
});
export default styles;
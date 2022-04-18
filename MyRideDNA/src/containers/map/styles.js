import { StyleSheet } from 'react-native';
import { BULLSEYE_SIZE, WindowDimensions, APP_COMMON_STYLES, widthPercentageToDP, heightPercentageToDP, CUSTOM_FONTS } from '../../constants';

const styles = StyleSheet.create({
    hiddenMapStyles: {
        position: 'absolute',
        zIndex: 0,
        // height: heightPercentageToDP(100),
        width: widthPercentageToDP(100),
        top: heightPercentageToDP(26),
        bottom: heightPercentageToDP(26),
        // display: 'none'
    },
    fillParent: {
        flex: 1,
    },
    absoluteLayer: {
        position: 'absolute',
        width: '100%',
        height: WindowDimensions.height,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100
    },
    annotationContainer: {
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        borderRadius: 15,
    },
    annotationFill: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: 'orange',
        transform: [{ scale: 0.6 }],
    },
    bullseye: {
        position: 'absolute',
        zIndex: 100,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        // marginTop: (WindowDimensions.height / 2) - (BULLSEYE_SIZE / 2),
    },
    controlsContainerTopLeft: {
        position: 'absolute',
        width: '30%',
        top: 70,
        left: 5
    },
    controlsWrapperTopLeft: {
        backgroundColor: '#fff',
        elevation: 8,
        paddingVertical: 5
    },
    controlsContainerLeft: {
        position: 'absolute',
        width: '15%',
        top: (WindowDimensions.height / 2 - 150),
        left: 5
    },
    controlsContainerRight: {
        position: 'absolute',
        width: '15%',
        top: (WindowDimensions.height / 2 - 150),
        right: 5
    },
    controlContainerBottomRight: {
        position: 'absolute',
        // width: '100%',
        bottom: 0,
        right: 0,
        elevation: 8
    },
    controlContainerBottomLeft: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        elevation: 8
    },
    mapHeader: {
        height: APP_COMMON_STYLES.headerHeight,
        backgroundColor: APP_COMMON_STYLES.headerColor,
        flexDirection: 'row',
        elevation: 9,
        shadowOffset: { width: 0, height: 8 },
        shadowColor: '#000000',
        shadowOpacity: 0.9,
        shadowRadius: 5,
        zIndex: 500,
    },
    mapSubHeader: {
        height: APP_COMMON_STYLES.headerHeight,
        backgroundColor: '#fff',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionButtonIcon: {
        fontSize: 20,
        height: 22,
        color: 'white',
    },
    mapControlButton: {
        elevation: 30,
        backgroundColor: '#fff',
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    whiteColor: {
        color: '#fff'
    },
    buttonGap: {
        marginVertical: 5
    },
    topBorder: {
        borderTopWidth: 1,
        borderTopColor: '#000'
    },
    logoutIcon: {
        marginRight: widthPercentageToDP(2),
        width: widthPercentageToDP(9),
        height: widthPercentageToDP(9),
        borderRadius: widthPercentageToDP(4.5),
        alignSelf: 'center',
        backgroundColor: 'transparent',
    },
    headerIconCont: {
        paddingHorizontal: 0,
        width: widthPercentageToDP(9),
        height: widthPercentageToDP(9),
        borderRadius: widthPercentageToDP(9) / 2,
        backgroundColor: '#fff',
        alignSelf: 'center',
        marginLeft: 17
    },
    mapOptionContainer: {
        marginHorizontal: 35,
        backgroundColor: '#fff',
        borderColor: '#D8D8D8',
        borderWidth: 1,
        borderRadius: 30,
        overflow: 'hidden',
        padding: 30,
    },
    footerIcon: {
        height: 23,
        width: 20
    },
    footerText: {
        color: '#EAEAEA',
        fontSize: 15,
        fontFamily: CUSTOM_FONTS.robotoBold,
        marginLeft: 5,
    },
    startRecordRide: {
        height: 41,
        width: 140,
        backgroundColor: '#81BA41',
        borderRadius: 15,
        marginHorizontal: 10
        // marginTop: heightPercentageToDP(3)
    },
    submitRecordRide: {
        height: 41,
        width: 80,
        backgroundColor: '#F5891F',
        borderRadius: 15
    },
    pauseOrContinue: {
        paddingHorizontal: 0,
        width: 41,
        height: 41,
        borderRadius: 10,
        alignSelf: 'center',
        marginLeft: 17,
        marginRight: 10
    },
    pauseBoxCont: {
        height: 263,
        width: 327,
        backgroundColor: '#F4F4F4',
        borderRadius: 20,
        padding: 31,
        paddingRight: 40
    },
    pauseTitle: {
        color: '#585756',
        fontFamily: CUSTOM_FONTS.robotoBold,
        fontSize: 20
    },
    pauseText: {
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
    pauseBtn: {
        height: 35,
        backgroundColor: '#81BA41',
        width: 125,
        alignSelf: 'center',
        borderRadius: 20,
        marginTop: 20
    },
    pauseBtnTxt: {
        letterSpacing: 1.4,
        fontSize: 14,
        fontFamily: CUSTOM_FONTS.robotoBold
    },
    submitBtn: {
        height: 35,
        backgroundColor: '#2B77B4',
        width: 119,
        alignSelf: 'center',
        borderRadius: 20,
        position: 'absolute',
        zIndex: 100,
        bottom: 43,
    },


    locationInputContainer: {
        borderWidth: 1,
        borderColor:'#707070',
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderRadius: 13,
        height: 37,
        zIndex: 999,
        backgroundColor: '#ffffff',
        alignSelf: 'center',
    },

    linkButtonCont: {
        flex: 2.89,
        backgroundColor: '#fff',
        marginLeft: 10,
        height: 20,
        marginTop: 6,
    },
    locationLabel: {
        borderBottomWidth: 0,
        fontSize: 15,
        backgroundColor: '#fff', color: APP_COMMON_STYLES.headerColor
    },
    searchIconContainer: {
        flex: 1,
        backgroundColor: '#C4C6C8',
        borderTopRightRadius: 13,
        borderBottomRightRadius: 13,
        justifyContent: 'center'
    },
    dottedLine: {
        marginLeft:28,
        marginTop: 2,
        width: 2,
        alignSelf: 'flex-start',
        borderColor: '#DBDBDB',
        borderWidth: 1,
        borderStyle: 'dashed',
        borderRadius: 1,
        height:20,

    },

});

export default styles;
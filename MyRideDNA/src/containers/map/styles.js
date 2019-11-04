import { StyleSheet } from 'react-native';
import { BULLSEYE_SIZE, WindowDimensions, APP_COMMON_STYLES, widthPercentageToDP, heightPercentageToDP } from '../../constants';

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
        height: 60,
        backgroundColor: APP_COMMON_STYLES.headerColor,
        flexDirection: 'row',
        elevation: 30,
        shadowOffset: { width: 0, height: 8 },
        shadowColor: '#000000',
        shadowOpacity: 0.9,
        shadowRadius: 5,
        zIndex: 999
    },
    mapSubHeader: {
        height: 70,
        backgroundColor: '#fff',
        flexDirection: 'row',
        justifyContent: 'space-between'
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
});

export default styles;
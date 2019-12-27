import { heightPercentageToDP, widthPercentageToDP, CUSTOM_FONTS, APP_COMMON_STYLES } from '../../constants'

const LOGIN_BUTTON_HEIGHT = 100;

export const LoginStyles = {
    loginBackground: {
        height: '100%',
        width: '100%'
    },
    loginScreen: {
        flex: 1,
        flexDirection: 'column',
        marginHorizontal: '10%',
        justifyContent: 'flex-end',
        marginVertical: 60
    },
    loginForm: {
        backgroundColor: 'white',
        height: heightPercentageToDP(30),
        justifyContent: 'space-around',
        paddingBottom: heightPercentageToDP(7)
    },
    loginButtonContainer: {
        marginTop: -(LOGIN_BUTTON_HEIGHT / 2),
        position: 'absolute',
        zIndex: 10,
        alignSelf: 'center'
    },
    loginButtoninnerContainer: {
        borderRadius: 100,
        padding: 10,
        backgroundColor: '#fff',
        alignSelf: 'center'
    },
    loginButton: {
        flexDirection: 'row',
        paddingHorizontal: 0,
        backgroundColor: '#EB861E',
        alignSelf: 'center',
        width: 70,
        height: 70,
        borderRadius: 70,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loginButtonText: {
        flex: 1,
        fontFamily: CUSTOM_FONTS.robotoSlabBold,
        letterSpacing: 4,
        color: '#fff',
        textAlign: 'center'
    },
    linkPairContainer: {
        flexDirection: 'row',
        position: 'absolute',
        zIndex: 8,
        width: widthPercentageToDP(100),
        backgroundColor: 'rgba(182,86,26,0.7)',
        height: heightPercentageToDP(13.5),
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    linkPairText: {
        color: 'white',
        fontSize: 14,
        fontFamily: CUSTOM_FONTS.robotoBold
    },
    socialSiteIconContainer: {
        // backgroundColor: 'rgba(23, 30, 70, 0.5)',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        paddingTop: 70,
        height: '100%',
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center'
    },
    socialSiteIcon: {
        backgroundColor: '#fff',
        fontSize: 60,
        borderRadius: 5
    },
    itemContainer: {
        marginLeft: widthPercentageToDP(5),
        marginRight: widthPercentageToDP(5)
    },
    item: {
        flex: 1,
        fontFamily: CUSTOM_FONTS.robotoSlab
    },
    visibileIconCont: {
        backgroundColor: '#0083CA',
        alignItems: 'center',
        justifyContent: 'center',
        width: widthPercentageToDP(6),
        height: widthPercentageToDP(6),
        borderRadius: widthPercentageToDP(4)
    },
    visibleIcon: {
        fontSize: widthPercentageToDP(4),
        paddingRight: 0,
        color: 'white'
    },
    bottomContainer: {
        width: widthPercentageToDP(100),
        height: heightPercentageToDP(47)
    }
}
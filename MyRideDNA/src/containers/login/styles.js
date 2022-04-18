import { heightPercentageToDP, widthPercentageToDP, CUSTOM_FONTS, APP_COMMON_STYLES, IS_ANDROID } from '../../constants'

const LOGIN_BUTTON_HEIGHT = 120;
const LOGO_HEIGHT = heightPercentageToDP(27);
const FORM_HEIGHT = heightPercentageToDP(27);

export const LoginStyles = {
    logo: {
        height: LOGO_HEIGHT
    },
    loginForm: {
        backgroundColor: 'white',
        height: FORM_HEIGHT,
        justifyContent: 'space-around',
        paddingBottom: heightPercentageToDP(7)
    },
    loginButtonContainer: {
        marginTop: -(LOGIN_BUTTON_HEIGHT / 2),
        position: 'absolute',
        zIndex: 10,
        alignSelf: 'center',
    },
    loginButtoninnerContainer: {
        borderRadius: 100,
        padding: 10,
        backgroundColor: '#fff',
        alignSelf: 'center',
    },
    loginButton: {
        flexDirection: 'row',
        paddingHorizontal: 0,
        backgroundColor: '#EB861E',
        alignSelf: 'center',
        width: 90,
        height: 90,
        borderRadius: 90,
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
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    linkPairText: {
        color: 'white',
        fontSize: 14,
        fontFamily: CUSTOM_FONTS.robotoBold
    },
    socialSiteIconContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    
    },
    itemContainer: {
        marginLeft: widthPercentageToDP(12),
        marginRight: widthPercentageToDP(12),
    },
    item: {
        flex: 1,
        fontFamily: CUSTOM_FONTS.robotoSlab,
        color:'#000000'
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
        height: heightPercentageToDP(100) - LOGO_HEIGHT - FORM_HEIGHT,
        width: widthPercentageToDP(100),
        marginTop: 15,
    },
    alertBoxCont: {
        height: 263,
        width: 327,
        backgroundColor: '#F4F4F4',
        borderRadius: 20,
        padding: 31,
        paddingRight: 40
    },
    alertBoxTitle: {
        color: '#585756',
        fontFamily: CUSTOM_FONTS.robotoBold,
        fontSize: 20
    },
    alertBoxText: {
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
    optionsView: {
        marginLeft: 32,
        marginTop: 32
    },
    baseModalContainerStyle: {
        justifyContent: 'center'
    },
    optionsContainer: {
        marginHorizontal: 15,
        backgroundColor: '#F4F4F4',
        borderColor: '#D8D8D8',
        borderWidth: 1,
        height: 400,
        overflow: 'hidden',
        borderRadius: 10,
        elevation: 40
    },
    footerText: {
        position:'absolute',
        color:'white',
        width:'75%',
        textAlign:'center',
        bottom:IS_ANDROID? 70:45, 
        fontFamily:CUSTOM_FONTS.robotoBold, 
        fontWeight:'200',
        fontSize:12
    }
    
}
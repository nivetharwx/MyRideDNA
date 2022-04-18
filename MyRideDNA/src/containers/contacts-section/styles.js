import { StyleSheet } from 'react-native';
import { widthPercentageToDP, heightPercentageToDP, APP_COMMON_STYLES, CUSTOM_FONTS } from '../../constants';

const styles = StyleSheet.create({
    header: {
        height: APP_COMMON_STYLES.headerHeight,
        backgroundColor: APP_COMMON_STYLES.headerColor,
        flexDirection: 'row',
        elevation: 30,
        shadowOffset: { width: 0, height: 8 },
        shadowColor: '#000000',
        shadowOpacity: 0.9,
        shadowRadius: 5,
        zIndex: 999
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
    titleContainer: {
        flex: 1,
        flexDirection: 'row',
        marginLeft: 17,
        justifyContent: 'space-between',
        alignSelf: 'center'
    },
    title: {
        fontSize: 20,
        color: '#FFFFFF',
        backgroundColor: 'transparent',
        letterSpacing: 0.8,
        fontFamily: CUSTOM_FONTS.gothamBold,
        alignSelf: 'center'
    },
    doneBtn: {
        fontSize: 15,
        color: '#F4F4F4',
        fontFamily: CUSTOM_FONTS.robotoBold,
        alignSelf: 'center'
    },
    title: {
        fontSize: 20,
        color: '#FFFFFF',
        backgroundColor: 'transparent',
        letterSpacing: 0.2,
        fontFamily: CUSTOM_FONTS.robotoBold,
        alignSelf: 'center'
    },
    tabContentCont: {
        paddingHorizontal: 0
    },
    horizontalCardOuterStyle: {
        marginBottom: heightPercentageToDP(4)
    },
    containerStyle: {
        marginBottom: 0,
        flex: 1,
        width: widthPercentageToDP(47),
    },
    rootContainer: {
        flex: 1,
        backgroundColor: '#fff',
        paddingBottom: 30
    },
    fill: {
        flex: 1,
        backgroundColor: '#fff'
    },
    tabHeaderContent: {
        paddingHorizontal: 0
    },
    tabContent: {
        flex: 1,
        // paddingTop: heightPercentageToDP(2),
        paddingHorizontal: widthPercentageToDP(2),
        justifyContent: 'space-around'
    },
    itemField: {
        borderBottomColor: '#6B7663',
        paddingBottom: 10
    },
    sectionDeviderText: {
        color: '#000',
        fontFamily: CUSTOM_FONTS.robotoBold,
        fontSize: widthPercentageToDP(5),
        marginVertical: heightPercentageToDP(5),
        alignSelf: 'center'
    },
    textareaItem: {
        marginTop: heightPercentageToDP(3)
    },
    submitBtn: {
        alignSelf: 'center',
        width: widthPercentageToDP(20),
        height: widthPercentageToDP(20),
        borderWidth: 3,
        borderColor: APP_COMMON_STYLES.infoColor,
        borderRadius: widthPercentageToDP(10),
    },
    enabledStyle: {
        color: APP_COMMON_STYLES.infoColor,
        borderColor: APP_COMMON_STYLES.infoColor
    },
    searchMemberModal: {
        position: 'absolute',
        top: APP_COMMON_STYLES.headerHeight,
        zIndex: 100,
        width: '100%',
        height: heightPercentageToDP(100) - APP_COMMON_STYLES.headerHeight,
        // flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)'
    },
    formContent: {
        paddingTop: 20,
        backgroundColor: '#fff'
        // justifyContent: 'space-between'
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
    },
    plainTextContainer: {
        borderBottomWidth: 3,
        borderBottomColor: '#F5891F',
        marginTop: 25
    },
    plainText: {
        marginLeft: widthPercentageToDP(3),
        fontFamily: CUSTOM_FONTS.robotoBold,
        letterSpacing: 0.6,
        marginBottom: 2
    },
    friendList: {
        paddingTop: 16,
    },
    InviteTextContainer: {
        height:100,
        width: widthPercentageToDP(100),
        backgroundColor: '#F4F4F4',
    },
    confirmationTitle: {
        color: '#585756',
        fontFamily: CUSTOM_FONTS.robotoBold,
        fontSize: 20
    },
    confirmationText: {
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
    labelStyle: {
        fontSize: 11,
        letterSpacing: 1.1,
        fontFamily: CUSTOM_FONTS.robotoSlabBold
    },
    cancelButton:{
        height:50, 
        backgroundColor:'#F4F4F4', 
        marginTop:30, 
        borderRadius:10, 
        justifyContent:'center', 
        alignItems:'center', 
        width:200, 
        marginLeft:105
    }
});
export default styles;
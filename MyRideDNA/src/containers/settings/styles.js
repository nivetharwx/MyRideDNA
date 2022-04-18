import { StyleSheet } from 'react-native';
import { heightPercentageToDP, widthPercentageToDP, CUSTOM_FONTS } from '../../constants';

const styles = StyleSheet.create({
    fill: {
        flex: 1,
        backgroundColor: '#fff'
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
    optionsView: {
        marginLeft: 32,
        marginTop: 32
    },
    labelStyle: {
        fontSize: 11,
        fontFamily: CUSTOM_FONTS.robotoSlabBold,
        letterSpacing: 1.1
    },
    changePasswdFrom: {
        backgroundColor: '#fff',
        height: heightPercentageToDP(30),
        justifyContent: 'space-around',
    },
    passwdFormField: {
        marginLeft: widthPercentageToDP(4),
    },
    infoLink: {
        color: '#8D8D8D',
        fontFamily: CUSTOM_FONTS.robotoBold,
        letterSpacing: 1.2
    },
    linkItem: {
        paddingHorizontal: 0,
        alignSelf: 'center',
        marginTop: 32,
    },
    fieldContainer: {
        justifyContent: 'space-between',
        flexDirection: 'row',
        marginHorizontal: 33,
        marginTop: 15,
    },
    labelText: {
        fontSize: 15,
        fontFamily: CUSTOM_FONTS.roboto,
        alignSelf: 'center',
    },
    borderStyle: {
        borderWidth: 2,
        borderRadius: 30,
        borderColor: '#C4C6C8',
        borderBottomWidth: 2,
        borderBottomColor: '#C4C6C8'
    },
    submitBtn: {
        height: 35,
        backgroundColor: '#f69039',
        width: 213,
        alignSelf: 'center',
        marginTop: 32,
        borderRadius: 20
    },
    submitBtnTxt: {
        letterSpacing: 1.4,
        fontSize: 14,
        fontFamily: CUSTOM_FONTS.robotoBold
    },
    activeSwitchBtn: {
        alignSelf: 'flex-start',
        fontSize: 10,
        color: '#fff',
        fontFamily: CUSTOM_FONTS.robotoBold,
        marginLeft: 2
    },
    inActiveSwitchBTn: {
        alignSelf: 'flex-end',
        fontSize: 10,
        color: '#00000029',
        fontFamily: CUSTOM_FONTS.robotoBold,
        marginRight: 1
    },
    deleteSubText: {
        color: '#585756',
        fontSize: 17,
        fontFamily: CUSTOM_FONTS.roboto,
    },
    versionText:{
        paddingHorizontal: 0,
        alignSelf: 'center',
        marginTop: 32,
        fontWeight:'bold',
        color: '#8D8D8D', 
    },
});

export default styles;
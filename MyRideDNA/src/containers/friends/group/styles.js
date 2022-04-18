import { StyleSheet } from 'react-native';
import { widthPercentageToDP, heightPercentageToDP, WindowDimensions, CUSTOM_FONTS } from '../../../constants';

const styles = StyleSheet.create({
    fill: {
        flex: 1,
        backgroundColor: '#fff'
    },
    HorizontalCardOuterStyle: {
        marginBottom: heightPercentageToDP(4),
    },
    friendList: {
        paddingTop: 16
    },
    profilePic: {
        height: heightPercentageToDP(42),
        width: WindowDimensions.width,
        borderWidth: 1,
    },
    profilePicture: {
        height: null,
        width: null,
        flex: 1,
        borderRadius: 5
    },
    container: {
        flex: 1,
        marginHorizontal: widthPercentageToDP(9)
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
import { StyleSheet } from 'react-native';
import { CUSTOM_FONTS, widthPercentageToDP, APP_COMMON_STYLES, heightPercentageToDP } from '../../constants';

const CONTAINER_H_SPACE = widthPercentageToDP(6);
const styles = StyleSheet.create({
    formFieldIcon: {
        color: '#999999'
    },
    labelStyle: {
        fontSize: 11,
        fontFamily: CUSTOM_FONTS.robotoSlabBold,
        letterSpacing: 1.1,
    },
    dropdownContainer: {
        marginTop: 20,
        marginHorizontal: 28,
        borderRadius: 50,
        borderWidth: 1,
        borderColor: '#B2B2B2',
    },
    dropdownIcon: {
        color: APP_COMMON_STYLES.infoColor,
        height: 26,
        marginRight: 25
    },
    dropdownPlaceholderTxt: {
        fontFamily: CUSTOM_FONTS.robotoSlabBold,
        fontSize: 12,
        top: 3,
    },
    dropdownTxt: {
        top: 3,
        fontFamily: CUSTOM_FONTS.robotoSlabBold,
        color: '#585756',
        fontSize: 12,

    },
    dropdownStyle: {
        height: 26,
        width: widthPercentageToDP(100) - CONTAINER_H_SPACE * 2,
        borderBottomWidth: 0,

    },
    hDivider: {
        backgroundColor: '#C4C6C8',
        marginTop: 30,
        height: 1.5
    },
    switchBtnContainer: {
        flexDirection: 'row',
        marginHorizontal: CONTAINER_H_SPACE,
        marginTop: 20,
        marginBottom: 0
    },
    grayBorderBtn: {
        borderWidth: 1,
        borderColor: '#9A9A9A',
        alignItems: 'center',
        width: 90,
        paddingVertical: 5,
        borderRadius: 22
    },
    grayBorderBtnText: {
        fontFamily: CUSTOM_FONTS.robotoSlabBold,
        letterSpacing: 0.5
    },
    greenLinkBtn: {
        backgroundColor: '#2EB959',
        borderColor: '#2EB959'
    },
    redLinkBtn: {
        backgroundColor: '#B92E2E',
        borderColor: '#B92E2E'
    },
    closeIconCont: {
        paddingHorizontal: 0,
        width: widthPercentageToDP(4),
        height: widthPercentageToDP(4),
        borderRadius: widthPercentageToDP(4) / 2,
        backgroundColor: '#fff',
        alignSelf: 'center',
        marginLeft: 5
    },
    btmContainer: {
        marginTop: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 28,
        paddingVertical: 30
    },
    btmLabelTxt: {
        alignSelf: 'center',
        fontFamily: CUSTOM_FONTS.robotoSlabBold,
        fontSize: 11,
        letterSpacing: 1.1
    },
    currentLctnCont: {
        flexDirection: 'row',
        borderWidth: 1,
        paddingVertical: 3,
        paddingHorizontal: 10,
        borderRadius: 20,
        width: 160
    },
    submitBtn: {
        height: 64,
        backgroundColor: '#f69039',
    },
});

export default styles;
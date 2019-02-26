import { StyleSheet } from 'react-native';
import { APP_COMMON_STYLES, heightPercentageToDP, widthPercentageToDP } from '../../constants';

const styles = StyleSheet.create({
    fill: {
        flex: 1,
        backgroundColor: '#fff'
    },
    iosBottomMargin: {
        marginBottom: 20,
    },
    pageContent: {
        flex: 1,
        marginTop: APP_COMMON_STYLES.headerHeight,
    },
    containerItem: {
        paddingBottom: heightPercentageToDP(2), 
        marginLeft: widthPercentageToDP(4), 
        marginRight: widthPercentageToDP(4),
        marginTop: heightPercentageToDP(2)
    },
    changePasswdFrom: {
        backgroundColor: '#fff',
        height: heightPercentageToDP(20),
        justifyContent: 'space-around'
    },
    infoLink: {
        color: APP_COMMON_STYLES.infoColor,
        fontWeight: 'bold',
    },
    linkItem: {
        paddingHorizontal: 0,
        marginLeft: widthPercentageToDP(4), 
    },
    submitSec: {
        height: heightPercentageToDP(20),
        backgroundColor: APP_COMMON_STYLES.infoColor,
        paddingTop: heightPercentageToDP(2),
        paddingLeft: widthPercentageToDP(8)
    },
    submitButton: {
        position: 'absolute',
        top: heightPercentageToDP(2),
        left: widthPercentageToDP(8),
        width: widthPercentageToDP(15),
        height: widthPercentageToDP(15),
        borderWidth: 4,
        borderColor: '#fff',
        borderRadius: widthPercentageToDP(7.5),
    },
    submitBtnIcon: {
        position: 'absolute',
        top: -10,
        left: 15,
        color: '#fff',
        fontSize: heightPercentageToDP(7),
    }
});

export default styles;
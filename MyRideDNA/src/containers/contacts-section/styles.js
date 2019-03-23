import { StyleSheet } from 'react-native';
import { widthPercentageToDP, heightPercentageToDP, APP_COMMON_STYLES } from '../../constants';

const styles = StyleSheet.create({
    rootContainer: {
        flex: 1,
        backgroundColor: '#fff',
        paddingBottom: 30
    },
    fill: {
        flex: 1
    },
    tabHeaderContent: {
        paddingHorizontal: 0
    },
    tabContent: {
        flex: 1,
        paddingTop: heightPercentageToDP(2),
        paddingHorizontal: widthPercentageToDP(2),
        justifyContent: 'space-around'
    },
    itemField: {
        borderBottomColor: '#6B7663',
        paddingBottom: 10
    },
    sectionDeviderText: {
        color: '#000',
        fontWeight: 'bold',
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
    }
});
export default styles;
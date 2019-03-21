import { StyleSheet } from 'react-native';
import { widthPercentageToDP, heightPercentageToDP, IS_ANDROID, APP_COMMON_STYLES } from '../../constants';

const styles = StyleSheet.create({
    fill: {
        flex: 1,
        backgroundColor: '#fff'
    },
    bottomTabContainer: {
        position: 'absolute',
        bottom: 0,
        height: '100%',
        width: '100%',
        paddingTop: APP_COMMON_STYLES.headerHeight,
    },
    bottomTab: {
        alignItems: 'center',
        justifyContent: 'center',
        width: widthPercentageToDP(25),
    },
    profileBG: {
        width: '100%',
        height: heightPercentageToDP(45),
        alignItems: 'center',
        justifyContent: 'center'
    },
    profilePic: {
        height: widthPercentageToDP(60),
        width: widthPercentageToDP(60),
        alignSelf: 'center',
        borderWidth: 1,
    },
    scrollBottomContent: {
        flex: 1
    },
    accordionHeader: {
        backgroundColor: 'transparent',
        marginHorizontal: widthPercentageToDP(10),
        borderBottomWidth: 1,
        borderBottomColor: '#000'
    },
    rowContent: {
        padding: heightPercentageToDP(5),
        flexDirection: 'row',
        justifyContent: 'space-around'
    }
});
export default styles;
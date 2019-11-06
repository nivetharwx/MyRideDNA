import { StyleSheet } from 'react-native';
import { APP_COMMON_STYLES, widthPercentageToDP, heightPercentageToDP, IS_ANDROID } from '../../constants';
import { App } from 'react-native-firebase';

const THUMBNAIL_SIZE = IS_ANDROID ? heightPercentageToDP(6.5) : heightPercentageToDP(8);
const styles = StyleSheet.create({
    fill: {
        flex: 1
    },
    chatHeader: {
        height: APP_COMMON_STYLES.headerHeight,
        backgroundColor: APP_COMMON_STYLES.headerColor,
        flexDirection: 'row',
        elevation: 30,
        shadowOffset: { width: 0, height: 8 },
        shadowColor: '#000000',
        shadowOpacity: 0.9,
        shadowRadius: 5,
        zIndex: 999,
        paddingHorizontal: 15
    },
    deleteButtonChatHeader: {
        flexDirection: 'row',
        position: 'absolute',
        zIndex: 100,
        width: '100%',
        height: APP_COMMON_STYLES.headerHeight,
        padding: widthPercentageToDP(3),
        flex: 1,
    },
    chatHeaderName: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 20,
        letterSpacing: 0.2,
        marginLeft: 15,
    },
    chatHeaderNickname: {
        color: APP_COMMON_STYLES.infoColor,
        fontWeight: 'bold',
        marginLeft: widthPercentageToDP(2)
    },
    chatArea: {
        paddingHorizontal: 15,
        paddingTop: 10
    },
    friendChatBubble: {
        backgroundColor: '#7AB242',
        alignSelf: 'flex-end',
    },
    friendName: {
        color: '#fff'
    },
    footer: {
        backgroundColor: '#3E3E3E',
        height: 75,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10
    },
    footerRtIcnCont: {
        backgroundColor: '#ffffff',
        width: 36,
        height: 36,
        borderRadius: 18,
        alignSelf: 'center',
        marginLeft: 10,
    },
    footerRightIcon: {
        fontSize: 25, 
        color: APP_COMMON_STYLES.headerColor, 
        paddingLeft: 6, 
        paddingTop: 3
    },
    inputCont: {
        flex: 1, 
        height: 57, 
        justifyContent: 'center', 
        backgroundColor: '#ffffff', 
        borderRadius: 13, 
        overflow: 'hidden',
    },
    inputBox: {
        flex: 1, 
        paddingHorizontal: 15, 
        paddingTop: 10, 
        fontSize: 15
    },
    thumbnail: {
        height: THUMBNAIL_SIZE,
        width: THUMBNAIL_SIZE,
        borderRadius: THUMBNAIL_SIZE / 2,
        alignSelf: 'center'
    },
    iconPadding: {
        padding: 5,
        backgroundColor: 'white',
        borderRadius: 19,
        height: 38,
        width: 38,
        alignItems: 'center',
        alignSelf: 'center',
    },
    groupIconStyle: {
        height: THUMBNAIL_SIZE,
        width: THUMBNAIL_SIZE,
        borderRadius: THUMBNAIL_SIZE / 2,
        backgroundColor: '#6C6C6B',
    },
    scrollToLastIcnCont: {
        backgroundColor: '#acacac', 
        position: 'absolute', 
        bottom: 90, 
        right: 15, 
        height: 30, 
        width: 30, 
        borderRadius: 15
    }
});
export default styles;
import { StyleSheet } from 'react-native';
import { APP_COMMON_STYLES, widthPercentageToDP, heightPercentageToDP, IS_ANDROID } from '../../constants';

const THUMBNAIL_SIZE = IS_ANDROID ? heightPercentageToDP(6.5) : heightPercentageToDP(8);
const styles = StyleSheet.create({
    rootContainer: {
        flex: 1,
        padding: widthPercentageToDP(3),
    },
    fill: {
        flex: 1
    },
    chatBackgroundImage: {
        width: '100%',
        height: '100%'
    },
    chatHeader: {
        flexDirection: 'row',
        position: 'absolute',
        zIndex: 100,
        width: '100%',
        height: APP_COMMON_STYLES.headerHeight,
        padding: widthPercentageToDP(3)
    },
    chatHeaderText: {
        color: '#fff',
        fontWeight: 'bold',
        alignSelf: 'center',
        fontSize: widthPercentageToDP(4),
        marginLeft: widthPercentageToDP(2),
        flex: 1,
    },
    chatArea: {
        marginTop: APP_COMMON_STYLES.headerHeight,
    },
    friendChatBubble: {
        backgroundColor: '#7AB242',
        alignSelf: 'flex-end',
    },
    friendName: {
        color: '#fff'
    },
    msgInputBoxContainer: {
        borderColor: 'transparent',
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        height: heightPercentageToDP(8),
        borderRadius: heightPercentageToDP(4),
    },
    shifterContainer: {
        bottom: heightPercentageToDP(8),
    },
    noBorder: {
        borderWidth: 0,
        borderBottomWidth: 0,
        borderTopWidth: 0,
        borderLeftWidth: 0,
        borderRightWidth: 0,
    },
    footerLeftIcon: {
        marginLeft: 10
    },
    thumbnail: {
        height: THUMBNAIL_SIZE,
        width: THUMBNAIL_SIZE,
        borderRadius: THUMBNAIL_SIZE / 2,
        alignSelf: 'center'
    }
});
export default styles;
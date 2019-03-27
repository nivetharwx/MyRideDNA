import { StyleSheet } from 'react-native';
import { APP_COMMON_STYLES, widthPercentageToDP, heightPercentageToDP } from '../../constants';

const styles = StyleSheet.create({
    rootContainer: {
        flex: 1,
        padding: '3%',
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
        padding: '3%'
    },
    chatHeaderText: {
        color: '#fff',
        fontWeight: 'bold',
        alignSelf: 'center',
        fontSize: widthPercentageToDP(4),
        marginLeft: '3%',
        flex: 1,
    },
    chatArea: {
        marginTop: APP_COMMON_STYLES.headerHeight + heightPercentageToDP(5),
    },
    friendChatBubble: {
        backgroundColor: '#7AB242',
        alignSelf: 'flex-end',
    },
    friendName: {
        color: '#fff'
    }
});
export default styles;
import { StyleSheet } from 'react-native';
import { widthPercentageToDP, APP_COMMON_STYLES, heightPercentageToDP } from '../../../constants';

export const CREATE_GROUP_WIDTH = widthPercentageToDP(9);
const styles = StyleSheet.create({
    fill: {
        flex: 1,
        backgroundColor: '#fff'
    },
    floatSecContainer: {
        position: 'absolute',
        marginRight: widthPercentageToDP(20),
        marginLeft: widthPercentageToDP(12.5),
        width: 0,
        zIndex: 200,
    },
    floatContnetAlign: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    floatInputIcon: {
        marginLeft: -CREATE_GROUP_WIDTH / 2,
        backgroundColor: '#81BB41',
        justifyContent: 'center',
        alignItems: 'center',
        width: CREATE_GROUP_WIDTH,
        height: CREATE_GROUP_WIDTH,
        borderRadius: CREATE_GROUP_WIDTH / 2,
    },
    createGrpChildSize: {
        width: CREATE_GROUP_WIDTH,
        height: CREATE_GROUP_WIDTH,
        borderRadius: CREATE_GROUP_WIDTH / 2,
    },
    memberList: {
        marginTop: APP_COMMON_STYLES.headerHeight
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
    HorizontalCardOuterStyle: {
        marginHorizontal: widthPercentageToDP(4),
        marginBottom: heightPercentageToDP(4),
    },
    friendList: {
        marginHorizontal: widthPercentageToDP(5),
        paddingTop: 16
    },
    searchCont: {
        marginBottom: 0,
        flex: 1,
        width: widthPercentageToDP(47),
    },
});

export default styles;
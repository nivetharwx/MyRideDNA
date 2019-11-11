import { StyleSheet } from 'react-native';
import { APP_COMMON_STYLES } from '../../constants';

const styles = StyleSheet.create({
    loginButtonText: {
        paddingTop: 10,
        paddingBottom: 10,
        color: '#fff',
        textAlign: 'center',
        borderRadius: 5
    },
    controlPairLeft: {
        width: '100%',
        backgroundColor: '#fff',
        elevation: 8,
        alignItems: 'center'
    },
    iconControlLeft: {
        paddingVertical: 20,
        flex: 1,
        fontSize: 25
    },
    bottomSeparator: {
        borderBottomColor: '#acacac',
        borderBottomWidth: 1
    },
    topSeparator: {
        borderTopColor: '#acacac',
        borderTopWidth: 1
    },
    shiterButtonContainer: {
        position: 'absolute',
        zIndex: 900,
        elevation: 10,
        bottom: 0,
        right: 0,
        maxHeight: 65, 
        maxWidth: 75,

    },
    shiterImgContainer: {
        height: 60, 
        width: 60,
        backgroundColor: 'rgba(235, 128, 20, 0.8)',
        borderWidth: 1,
        borderColor: 'rgba(235, 128, 20, 0.8)'
    },
    alignLeft: {
        left: 0,
    },
    leftImage: {
        left: 0,
        transform: [{ rotateY: '180deg' }]
    }
});

export default styles;
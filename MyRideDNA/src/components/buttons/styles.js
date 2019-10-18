import { StyleSheet } from 'react-native';

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
    },
    shiterImgContainer: {
        flex: 1,
        backgroundColor: 'rgba(235, 134, 30, 0.6)',
        overflow: 'hidden'
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
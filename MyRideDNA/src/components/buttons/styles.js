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
    }
});

export default styles;
import { StyleSheet } from 'react-native';
import { TAB_CONTAINER_HEIGHT } from '../../constants';

const styles = StyleSheet.create({
    absoluteContainer: {
        position: 'absolute',
        zIndex: 200,
        bottom: 0,
        height: TAB_CONTAINER_HEIGHT,
        width: '100%',
    },
    tabContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: 'red',
    }
});

export default styles;
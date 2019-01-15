import { StyleSheet } from 'react-native';
import { TAB_CONTAINER_HEIGHT } from '../../constants';

const styles = StyleSheet.create({
    tabContainer: {
        position: 'absolute',
        zIndex: 200,
        bottom: 0,
        height: TAB_CONTAINER_HEIGHT,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#fff',
    }
});

export default styles;
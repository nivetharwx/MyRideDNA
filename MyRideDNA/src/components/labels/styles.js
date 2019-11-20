import { StyleSheet } from 'react-native';
import { CUSTOM_FONTS } from '../../constants';

const styles = StyleSheet.create({
    containerBox: {
        flexDirection: 'row',
        paddingHorizontal: 5
    },
    textStyle: {
        paddingLeft: 5,
        alignSelf: 'center',
        fontSize: 15,
        fontWeight: 'bold'
    },
    defaultText: {
        fontFamily: CUSTOM_FONTS.roboto,
        fontSize: 12,
        color: '#000000'
    } 
});

export default styles;
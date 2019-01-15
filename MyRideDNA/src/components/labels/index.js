import React from 'react';
import {
    View,
    Text
} from 'react-native';
import { Icon as NBIcon } from 'native-base';

import styles from './styles';

export const IconLabelPair = ({ iconProps, text, textStyle }) => {
    return (
        <View style={styles.containerBox}>
            <NBIcon {...iconProps} />
            <Text style={[styles.textStyle, textStyle]}>{text}</Text>
        </View>
    )
}

// export class IconLabelPair extends React.Component {

//     render() {
//         console.log("qweqweqwe");
//         const { iconProps, text } = this.props;
//         return (
//             <View style={styles.controlPairWrapperTopLeft}>
//                 <NBIcon name={iconProps.name} type={iconProps.type} />
//                 <Text style={styles.textControlTopLeft}>{text}</Text>
//             </View>
//         );
//     }
// }
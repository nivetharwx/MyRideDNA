import React from 'react';
import {
    View,
    Text
} from 'react-native';
import { Icon as NBIcon } from 'native-base';

import styles from './styles';

export const IconLabelPair = ({ containerStyle, iconProps, text, textStyle }) => {
    return (
        <View style={[styles.containerBox, containerStyle]}>
            <NBIcon {...iconProps} />
            <DefaultText style={[styles.textStyle, textStyle]}>{text}</DefaultText>
        </View>
    )
}

export const DefaultText = ({ fontFamily, numberOfLines, style, onTextLayout = null, ...otherProps }) => <Text numberOfLines={numberOfLines} onTextLayout={onTextLayout} style={[styles.defaultText, style, fontFamily ? { fontFamily } : null]}>{otherProps.children || null}</Text>

// export class IconLabelPair extends React.Component {

//     render() {
//         console.log("qweqweqwe");
//         const { iconProps, text } = this.props;
//         return (
//             <View style={styles.controlPairWrapperTopLeft}>
//                 <NBIcon name={iconProps.name} type={iconProps.type} />
//                 <DefaultText  style={styles.textControlTopLeft}>{text}</DefaultText>
//             </View>
//         );
//     }
// }
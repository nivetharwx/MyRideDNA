import React from 'react';
import { View, Image, Text, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import { widthPercentageToDP, APP_COMMON_STYLES } from '../../constants';
import { DefaultText } from '../labels';

const THUMBNAIL_MAX_WIDTH = widthPercentageToDP(50);
export const Thumbnail = (props) => {
    return (
        <TouchableWithoutFeedback onLongPress={props.onLongPress} style={{ flex: 1 }}>
            <View style={[props.horizontal ? styles.flexRow : styles.flexColumn, {
                borderColor: props.selected ? '#EB861E' : props.active ? APP_COMMON_STYLES.infoColor : 'transparent',
                borderWidth: props.selected ? 4 : props.active ? 4 : 2
            }, props.containerStyle]}>
                {props.horizontal ? <DefaultText  style={{ alignSelf: 'center', color: 'black', fontSize: 16, fontWeight: 'bold', marginRight: 8 }}>{props.title}</DefaultText> : null}
                <View style={{
                    alignSelf: 'center',
                    height: props.height,
                    width: props.width,
                    borderRadius: props.round ? props.width / 2 : 5,
                    overflow: 'hidden',
                }}>
                    <Image source={props.imagePath} style={{
                        flex: 1,
                        width: null,
                        height: null,
                        borderColor: 'white',
                        borderWidth: 1
                    }} />
                    {
                        props.hideOverlay
                            ? null
                            : !props.active
                                ? <View style={{ position: 'absolute', width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0)' }} />
                                : null
                    }
                </View>
                {props.horizontal ? null : <DefaultText  style={{ alignSelf: 'center', color: 'black', fontSize: 16, fontWeight: 'bold' }}>{props.title && props.title.length > 12 ? `${props.title.substring(0, 12)}...` : props.title}</DefaultText>}
            </View>
        </TouchableWithoutFeedback>
    );
}

export const ProgressiveImage = ({ thumbnailSource, source, imageBGColor, imageStyle }) => (
    <View style={[styles.container, backgroundColor ? { backgroundColor: imageBGColor } : null]}>
        <Image
            source={thumbnailSource}
            style={imageStyle}
        />
        <Image
            source={source}
            style={[styles.imageOverlay, imageStyle]}
        />
    </View>
);

const styles = StyleSheet.create({
    flexRow: {
        flexDirection: 'row',
        marginHorizontal: 5,
        width: THUMBNAIL_MAX_WIDTH,
        maxWidth: THUMBNAIL_MAX_WIDTH,

    },
    flexColumn: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 10,
        width: 130,
        maxWidth: 130,
    },
    container: {
        backgroundColor: '#e1e4e8',
    },
    imageOverlay: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        top: 0,
    },
});
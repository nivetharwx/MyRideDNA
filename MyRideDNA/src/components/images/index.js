import React from 'react';
import { View, Image, Text, TouchableWithoutFeedback, StyleSheet } from 'react-native';

const THUMBNAIL_MAX_WIDTH = 234;
export const Thumbnail = (props) => {
    return (
        <TouchableWithoutFeedback onLongPress={props.onLongPress} style={{ flex: 1  }}>
            <View style={[props.horizontal ? styles.flexRow : styles.flexColumn, {
                    borderColor: props.selected ? '#EB861E' : props.active ? 'rgba(0,118,181,0.7)' : 'white',
                    borderWidth: props.selected ? 4 : props.active ? 4 : 2}]}>
                {props.horizontal ? <Text style={{ alignSelf: 'center', color: 'black', fontSize: 16, fontWeight: 'bold', marginRight: 8 }}>{props.title}</Text> : null}
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
                    }}
                    />
                </View>
                {props.horizontal ? null : <Text style={{ alignSelf: 'center', color: 'black', fontSize: 16, fontWeight: 'bold' }}>{props.title}</Text>}
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    flexRow: {
        flexDirection: 'row',
        marginHorizontal: 5,
        width: THUMBNAIL_MAX_WIDTH,
        maxWidth: THUMBNAIL_MAX_WIDTH
    },
    flexColumn: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 10,
        width: 130,
        maxWidth: 130,
    }
});
import React from 'react';
import { StyleSheet, SafeAreaView, View, ScrollView, FlatList, TouchableOpacity, Text } from 'react-native';
import { Icon as NBIcon, List, ListItem, Left, Body } from 'native-base';
import { WindowDimensions, APP_COMMON_STYLES, heightPercentageToDP, widthPercentageToDP } from '../../constants';


const styles = StyleSheet.create({
    searchResults: {
        // backgroundColor: '#fff',
        // opacity: 0.9
    },
    primaryText: {
        marginLeft: 5,
        fontWeight: 'bold',
        color: '#FFF'
    },
    secondaryText: {
        fontStyle: 'italic',
        color: '#FFF'
    },
    leftContainer: {
        borderLeftColor: '#FFF',
        height: '100%',
    },
    leftIcon: {
        fontSize: 20,
        color: '#FFF',
    },
    distance: {
        fontSize: 12
    },
    searchResultsContainer: {
        position: 'absolute',
        top: APP_COMMON_STYLES.headerHeight,
        marginTop: 62,
        zIndex: 100,
        width: '100%',
        height: heightPercentageToDP(50),
        backgroundColor: 'rgba(0,0,0,0.8)',
    },
    closeIcon: {
        alignSelf: 'flex-end',
        marginRight: 10
    }
});
const CATEGORY_ICONS = {
    default: { name: 'location-on', type: 'MaterialIcons', style: styles.leftIcon },

};
export const SearchResults = ({ data, onPressClose, onSelectItem, style }) => (
    <View style={[styles.searchResultsContainer, style]}>
        <TouchableOpacity style={styles.closeIcon} onPress={onPressClose}>
            <NBIcon name='close' style={{ color: '#fff' }} />
        </TouchableOpacity>
        <View style={styles.searchResults}>
            <FlatList
                keyboardShouldPersistTaps={'handled'}
                style={{ marginTop: widthPercentageToDP(4) }}
                contentContainerStyle={{ paddingBottom: data.length > 0 ? heightPercentageToDP(8) : 0 }}
                data={data}
                keyExtractor={item => item.id}
                renderItem={({ item }) => {
                    return (
                        <ListItem button avatar style={{ marginTop: 10, height: heightPercentageToDP(8) }} onPress={() => onSelectItem(item)}>
                            <Left style={styles.leftContainer}>
                                <NBIcon {...CATEGORY_ICONS.default} />
                            </Left>
                            <Body style={{ height: '100%' }}>
                                <Text style={styles.primaryText}>{item.place_name}</Text>
                                {/* <Text style={styles.secondaryText}>{item.properties.category || ''}</Text> */}
                            </Body>
                        </ListItem>
                    );
                }}
            />
        </View>
    </View>
);
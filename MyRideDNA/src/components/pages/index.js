import React from 'react';
import { StyleSheet, SafeAreaView, View, ScrollView, TouchableOpacity, Text } from 'react-native';
import { Icon as NBIcon, List, ListItem, Left, Body } from 'native-base';
import { WindowDimensions } from '../../constants';

export const SearchResults = ({ data, onPressClose, onSelectItem, style }) => (
    <View style={[styles.searchResultsContainer, style]}>
        <TouchableOpacity style={styles.closeIcon} onPress={onPressClose}>
            <NBIcon name='close' />
        </TouchableOpacity>
        <View style={styles.searchResults}>
            <ScrollView>
                <List style={{ paddingBottom: 100 }}
                    dataArray={data}
                    renderRow={(item) => {
                        return (
                            <View>
                                <ListItem button avatar style={{ marginTop: 10, height: 80 }} onPress={() => onSelectItem(item)}>
                                    <Left style={styles.leftContainer}>
                                        <NBIcon style={styles.leftIcon} name='location-on' type='MaterialIcons' />
                                    </Left>
                                    <Body style={{ height: '100%' }}>
                                        <Text style={styles.primaryText}>{item.place_name}</Text>
                                        <Text style={styles.secondaryText}>{item.properties.category || ''}</Text>
                                    </Body>
                                </ListItem>
                            </View>
                        );
                    }}
                />
            </ScrollView>
        </View>
    </View>
);

const styles = StyleSheet.create({
    searchResults: {
        backgroundColor: '#fff',
        opacity: 0.9
    },
    primaryText: {
        marginLeft: 5,
        fontWeight: 'bold',
        color: '#373737'
    },
    secondaryText: {
        fontStyle: 'italic',
        color: '#7D7D7D'
    },
    leftContainer: {
        borderLeftColor: '#7D7D7D',
        height: '100%',
    },
    leftIcon: {
        fontSize: 20,
        color: '#7D7D7D',
    },
    distance: {
        fontSize: 12
    },
    searchResultsContainer: {
        // marginTop: 62,
        height: WindowDimensions.height,
        position: 'absolute',
        zIndex: 900,
        width: WindowDimensions.width,
        elevation: 10,
    },
    closeIcon: {
        alignSelf: 'flex-end',
        marginRight: 10
    }
});
import React, { useState, useCallback } from 'react';
import { View, FlatList, KeyboardAvoidingView, StyleSheet } from 'react-native';
import { ListItem, Left } from 'native-base';
import { Actions } from 'react-native-router-flux';
import { IS_ANDROID, JS_SDK_ACCESS_TOKEN, CUSTOM_FONTS, widthPercentageToDP, APP_COMMON_STYLES, heightPercentageToDP } from '../../constants';
import { SearchBoxFilter } from '../../components/inputs';
import { DefaultText } from '../../components/labels';
import { BasePage } from '../../components/pages';
import axios from 'axios';
import { LinkButton, IconButton } from '../../components/buttons';
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocodingClient = mbxGeocoding({ accessToken: JS_SDK_ACCESS_TOKEN });
const CURRENT_LOCATION_ID = 'CURRENT_LOCATION';

// const SEARCH_CATEGORIES = [
//     { label: 'Parking', value: 'parking', icon: { name: 'local-parking', type: 'MaterialIcons' } },
//     { label: 'Gas Stations', value: 'fuel', icon: { name: 'local-gas-station', type: 'MaterialIcons' } },
//     { label: 'Restaurants', value: 'restaurant', icon: { name: 'restaurant', type: 'MaterialIcons' } },
// ];
const SearchResult = ({ hasNetwork = true, currentLocation = null, onPressSearchResult = null, searchQuery = '' }) => {
    const [placeList, setPlaceList] = useState(currentLocation ? [{ ...currentLocation, id: CURRENT_LOCATION_ID, place_name: 'Current location' }] : []);
    const [searchText, setSearchText] = useState(searchQuery);
    // const [category, setCategory] = useState({ value: 'all' });
    const onSelectPlace = useCallback(item => {
        onPressSearchResult(item); Actions.pop();
    });
    // const onSelectCategory = useCallback(index => setCategory(SEARCH_CATEGORIES[index] === category ? { value: 'all' } : SEARCH_CATEGORIES[index]));
    const onChangeSearchText = useCallback((placeQuery) => {
        setSearchText(placeQuery);
        if (placeQuery === '' || placeQuery.length < 2) {
            setPlaceList(currentLocation ? [{ ...currentLocation, id: CURRENT_LOCATION_ID, place_name: 'Current location' }] : [])
            return;
        }
        let coords = [];
        const lastCharacter = placeQuery.slice(-1);
        if (lastCharacter === ' ') return;
        if (currentLocation === null) {
            coords = [-77.019913, 38.892059]
        }
        else {
            coords = [currentLocation.geometry.coordinates[0], currentLocation.geometry.coordinates[1]]
        }
        axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${placeQuery}.json?proximity=${coords[0]},${coords[1]}&limit=10&access_token=${JS_SDK_ACCESS_TOKEN}`).then(res => {
            console.log('\n\n\n searchingLOcation : ', res.data)
            setPlaceList(res.data.features);
        }).catch(er => {
            console.log('\n\n\n place search error  : ', er)
        })
    });
    return <BasePage rootContainerSafePadding={20}>
        <KeyboardAvoidingView behavior={IS_ANDROID ? null : 'padding'} style={styles.fill}>
            <SearchBoxFilter onPressClear={() => onChangeSearchText('')} autoFocus={true} searchQuery={searchText} placeholder='Search Location' placeholderTextColor={'#505050'}
                onChangeSearchValue={onChangeSearchText} LabeledInputPlaceholderCont={{ width: 250 }}
                outerContainer={{ marginHorizontal: 28 }}
            />
            <View style={{ flex: 1 }}>
                <FlatList
                    keyboardShouldPersistTaps={'handled'}
                    data={placeList}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => <ListItem noIndent style={styles.itemCont} onPress={() => onSelectPlace(item)}>
                        <Left style={styles.leftCont}>
                            <DefaultText style={{
                                fontSize: 14, color: '#1D527C',
                                fontFamily: CUSTOM_FONTS.robotoBold,
                                alignSelf: 'center'
                            }}>{item.place_name || 'Unknown location'}</DefaultText>
                        </Left>
                    </ListItem>}
                />
                {
                    hasNetwork === false && placeList.length === 0 && <View style={{ flexDirection: 'column', justifyContent: 'space-between', position: 'absolute', top: heightPercentageToDP(20), left: widthPercentageToDP(27), height: 100, }}>
                        <IconButton iconProps={{ name: 'broadcast-tower', type: 'FontAwesome5', style: { fontSize: 60, color: '#505050' } }} />
                        <DefaultText style={{ alignSelf: 'center', fontSize: 14 }}>Please Connect To Internet</DefaultText>
                    </View>
                }
            </View>
        </KeyboardAvoidingView>
    </BasePage>
}
export default SearchResult;

const styles = StyleSheet.create({
    fill: {
        flex: 1,
        backgroundColor: '#fff'
    },
    itemCont: {
        marginTop: 10,
    },
    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#E6E6E6',
        borderBottomRightRadius: 10,
        borderBottomLeftRadius: 10,
        position: 'absolute',
        top: 20,
        paddingVertical: 20,
        paddingBottom: 10,
        width: widthPercentageToDP(100),
        height: 65
    },
    filterIcon: {
        color: '#000000',
        fontSize: 12,
        fontFamily: CUSTOM_FONTS.robotoBold
    },
    categoryIcon: {
        fontSize: 19
    },
    selectedCategory: {
        color: APP_COMMON_STYLES.headerColor
    },
})
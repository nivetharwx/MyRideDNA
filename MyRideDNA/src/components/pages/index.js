import React from 'react';
import { StyleSheet, SafeAreaView, View, ScrollView, FlatList, TouchableOpacity, Text, StatusBar } from 'react-native';
import { Icon as NBIcon, List, ListItem, Left, Body } from 'native-base';
import { WindowDimensions, APP_COMMON_STYLES, heightPercentageToDP, widthPercentageToDP, CUSTOM_FONTS, IS_ANDROID } from '../../constants';
import { DefaultText } from '../labels';
import { Actions } from 'react-native-router-flux';
import { BasicHeader } from '../headers';
import { Loader } from '../loader';
import { ShifterButton } from '../buttons';
import { useSelector, useDispatch } from 'react-redux';
import { appNavMenuVisibilityAction } from '../../actions';

const leftIcon = {
    fontSize: 20,
    color: '#FFF',
};
const CATEGORY_ICONS = {
    default: { name: 'location-on', type: 'MaterialIcons', style: leftIcon },
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
                                <DefaultText style={styles.primaryText}>{item.place_name}</DefaultText>
                                {/* <DefaultText  style={styles.secondaryText}>{item.properties.category || ''}</DefaultText> */}
                            </Body>
                        </ListItem>
                    );
                }}
            />
        </View>
    </View>
);

export const BasePage = ({ defaultHeader = true, numberOfHeaderLines = 1, rootContainerStyle = null, HeaderComponent = null, headerLeftIconProps = null, headerRightIconProps = null, headerRightComponent = null, rootContainerSafePadding = 0, heading = '', onBackButtonPress = null, showLoader = false, loaderText = 'Loading...', showShifter = true, shifterBottomOffset = 0,notificationCount, ...otherProps }) => {
    const alignLeft = useSelector(({ UserAuth: { user } }) => user && user.handDominance === 'left');
    const showMenu = useSelector(({ PageState: { showMenu } }) => showMenu);
    const hasNetwork = useSelector(({ PageState: { hasNetwork } }) => hasNetwork);
    const dispatch = useDispatch();
    return <View style={styles.fill}>
        <SafeAreaView style={styles.safePaddingSection} />
        {IS_ANDROID && <View style={APP_COMMON_STYLES.statusBar}>
            <StatusBar translucent backgroundColor={APP_COMMON_STYLES.statusBarColor} barStyle="light-content" />
        </View>}
        <View style={[styles.rootPage, defaultHeader ? { paddingTop: APP_COMMON_STYLES.headerHeight + rootContainerSafePadding } : { paddingTop: rootContainerSafePadding }, rootContainerStyle]}>
            {
                HeaderComponent
                    ? HeaderComponent
                    : defaultHeader && <BasicHeader
                        titleNumberOfLines={numberOfHeaderLines}
                        title={heading}
                        leftIconProps={headerLeftIconProps || { reverse: true, name: 'md-arrow-round-back', type: 'Ionicons', onPress: () => onBackButtonPress ? onBackButtonPress() : Actions.pop() }}
                        rightIconProps={headerRightIconProps}
                        rightComponent={headerRightComponent}
                        notificationCount={notificationCount}
                    />
            }
            {
                otherProps.children
            }
        </View>
        <Loader title={loaderText} isVisible={showLoader} />
        {showShifter && <ShifterButton onPress={() => dispatch(appNavMenuVisibilityAction(!showMenu))} containerStyles={{ bottom: hasNetwork ? shifterBottomOffset : IS_ANDROID ? APP_COMMON_STYLES.headerHeight : shifterBottomOffset }} alignLeft={alignLeft} />}
    </View>
}

const styles = StyleSheet.create({
    fill: { flex: 1 },
    safePaddingSection: { backgroundColor: APP_COMMON_STYLES.statusBarColor },
    headerContainer: { position: 'absolute', zIndex: 900, elevation: 10, minHeight: APP_COMMON_STYLES.headerHeight, width: widthPercentageToDP(100) },
    rootPage: { flex: 1, backgroundColor: '#FFFFFF' },
    rootPageSafePadding: { paddingTop: APP_COMMON_STYLES.headerHeight },
    primaryText: {
        marginLeft: 5,
        fontFamily: CUSTOM_FONTS.roboto,
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
    distance: {
        fontSize: 12
    },
    searchResultsContainer: {
        position: 'absolute',
        top: 130,
        marginTop: 62,
        zIndex: 100,
        width: '100%',
        height: heightPercentageToDP(100) - 130,
        backgroundColor: 'transparent',
        backgroundColor: 'rgba(0,0,0,0.8)',
    },
    closeIcon: {
        alignSelf: 'flex-end',
        marginRight: 10
    },
});
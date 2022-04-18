import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { GET_PICTURE_BY_ID, heightPercentageToDP, widthPercentageToDP, CUSTOM_FONTS } from '../../constants/index';
import { DefaultText } from '../../components/labels';
import { HorizontalCard } from '../../components/cards';
import { SearchBoxFilter } from '../../components/inputs';

export const SearchMember = ({ searchName, searchInCommunity, extraData, searchResults, searchResultsKeyExtractor, getRightIconProps, onPressRightIconProps, hasRemainingList, renderFooter, loadMoreData, openMemberDetail }) => (
    <View style={{ flex: 1, marginHorizontal: widthPercentageToDP(8) }}>
        <SearchBoxFilter
            searchQuery={searchName} onChangeSearchValue={searchInCommunity}
            placeholder='Name' outerContainer={{ marginTop: 30 }}
        />
        <View style={styles.plainTextContainer}>
            <DefaultText style={styles.plainText}>SEARCH RESULTS</DefaultText>
        </View>
        <FlatList
            keyboardShouldPersistTaps={'handled'}
            contentContainerStyle={[{ paddingBottom: hasRemainingList ? 40 : 0 }, styles.friendList]}
            showsVerticalScrollIndicator={false}
            data={searchResults}
            extraData={extraData}
            keyExtractor={searchResultsKeyExtractor}
            renderItem={({ item, index }) => (
                <HorizontalCard
                    item={item}
                    onPressLeft={() => openMemberDetail(item, index)}
                    thumbnail={item.profilePictureId ? `${GET_PICTURE_BY_ID}${item.profilePictureId}` : null}
                    horizontalCardPlaceholder={require('../../assets/img/profile-pic-placeholder.png')}
                    cardOuterStyle={styles.horizontalCardOuterStyle}
                    rightProps={getRightIconProps(item)}
                    onPress={() => onPressRightIconProps(item, index)}
                />
            )}
            ListFooterComponent={renderFooter}
            onEndReached={loadMoreData}
            onEndReachedThreshold={0.1}
        />
    </View>
);

const styles = StyleSheet.create({
    plainTextContainer: {
        borderBottomWidth: 3,
        borderBottomColor: '#F5891F',
        marginTop: 25
    },
    horizontalCardOuterStyle: {
        marginBottom: 5
    },
    friendList: {
        paddingTop: 16,
    },
    plainText: {
        marginLeft: widthPercentageToDP(3),
        fontFamily: CUSTOM_FONTS.robotoBold,
        letterSpacing: 0.6,
        marginBottom: 2
    },
});
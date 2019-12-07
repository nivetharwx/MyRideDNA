import React from 'react';
import { FlatList } from 'react-native';

export const BasicList = ({ containerStyle, contentContainerStyle, data, renderItem, renderFooter, onEndReached }) => {
    return <FlatList
        style={containerStyle}
        contentContainerStyle={contentContainerStyle}
        data={data}
        renderItem={renderItem}
        ListFooterComponent={renderFooter}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.1}
    />
}
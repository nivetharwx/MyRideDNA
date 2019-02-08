import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, ScrollView, Text, FlatList, View } from 'react-native';
import { getAllFriends, searchForFriend } from '../../../api';
import { FRIEND_TYPE } from '../../../constants';


class AllFriendsTab extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isRefreshing: false,
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.allFriends !== this.props.allFriends) {
            if (prevState.isRefreshing === true) {
                this.setState({ isRefreshing: false });
            }
        }
        if (this.props.refreshContent === true && prevProps.refreshContent === false) {
            this.props.getAllFriends(FRIEND_TYPE.ALL_FRIENDS, this.props.user.userId, 0);
        }
        if (prevProps.searchQuery !== this.props.searchQuery && this.props.searchQuery.slice(-1) !== '') {
            this.props.searchForFriend(this.props.searchQuery, this.props.user.userId, 0);
        }
    }

    onPullRefresh = () => {
        this.setState({ isRefreshing: true });
        this.props.getAllFriends(FRIEND_TYPE.ALL_FRIENDS, this.props.user.userId, this.props.paginationNum)
    }

    render() {
        const { isRefreshing } = this.state;
        const { allFriends, searchQuery, searchFriendList } = this.props;
        if (searchQuery === '') {
            return allFriends.length === 0
                ? <View style={styles.fill}>
                    <ImageBackground source={require('../../../assets/img/profile-bg.png')} style={styles.backgroundImage} />
                </View>
                : <ScrollView style={{ flex: 1 }}>
                    <FlatList data={allFriends} refreshing={isRefreshing} onRefresh={this.onPullRefresh} renderItem={({ item }) => (
                        null
                    )} />
                </ScrollView>
        } else {
            return searchFriendList.length === 0
                ? <View style={styles.fill}>
                    <ImageBackground source={require('../../../assets/img/profile-bg.png')} style={styles.backgroundImage} />
                </View>
                : <ScrollView style={{ flex: 1 }}>
                    <FlatList data={searchFriendList} refreshing={isRefreshing} onRefresh={this.onPullRefresh} renderItem={({ item }) => (
                        null
                    )} />
                </ScrollView>
        }
    }
}

const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    const { allFriends, paginationNum, searchFriendList } = state.FriendList;
    return { user, allFriends, paginationNum, searchFriendList };
};
const mapDispatchToProps = (dispatch) => {
    return {
        getAllFriends: (friendType, userId, pageNumber) => dispatch(getAllFriends(friendType, userId, pageNumber)),
        searchForFriend: (searchParam, userId, pageNumber) => dispatch(searchForFriend(searchParam, userId, pageNumber))
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(AllFriendsTab);

const styles = StyleSheet.create({
    fill: {
        flex: 1
    },
    backgroundImage: {
        height: null,
        width: null,
        flex: 1
    }
});
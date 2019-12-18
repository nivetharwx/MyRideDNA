import React, { Component } from 'react';
import { View, ImageBackground, StatusBar, FlatList, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { connect } from 'react-redux';
import { IconButton } from '../../../../../components/buttons';
import { APP_COMMON_STYLES, widthPercentageToDP, heightPercentageToDP, PageKeys, THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG, POST_TYPE, PORTRAIT_TAIL_TAG, GET_PICTURE_BY_ID } from '../../../../../constants';
import { BaseModal } from '../../../../../components/modal';
import { Actions } from 'react-native-router-flux';
import { BasicHeader } from '../../../../../components/headers';
import { SquareCard } from '../../../../../components/cards';
import { DefaultText } from '../../../../../components/labels';
import { appNavMenuVisibilityAction, updateBikeWishListAction, updateBikeCustomizationsAction, getCurrentBikeSpecAction } from '../../../../../actions';
import { getPosts } from '../../../../../api';

class BikeSpecList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            pageNumber: 0,
        };
    }

    componentDidMount() {
        this.props.getPosts(this.props.user.userId, this.props.postType, this.props.postTypes[this.props.postType].id, this.props.bike.spaceId, 0, this.fetchSuccessCallback, this.fetchErrorCallback);
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.updatePageContent && (!prevProps.updatePageContent || prevProps.updatePageContent !== this.props.updatePageContent)) {
            this.props.getPosts(this.props.user.userId, this.props.postType, this.props.postTypes[this.props.postType].id, this.props.bike.spaceId, 0, this.fetchSuccessCallback, this.fetchErrorCallback);
        }
    }

    showAppNavMenu = () => this.props.showAppNavMenu();

    onPressBackButton = () => Actions.pop();

    openPostForm = () => Actions.push(PageKeys.POST_FORM, { comingFrom: Actions.currentScene, postType: this.props.postType, currentBikeId: this.props.bike.spaceId });

    openBikeSpecPage = (postId) => {
        this.props.getCurrentBikeSpec(this.props.postType, postId);
        Actions.push(PageKeys.BIKE_SPEC, { comingFrom: Actions.currentScene, postType: this.props.postType, postId });
    }

    renderHeader = () => {
        let title = '';
        switch (this.props.postType) {
            case POST_TYPE.WISH_LIST:
                title = 'Wish List';
                break;
            case POST_TYPE.MY_RIDE:
                title = 'My Ride';
        }
        return <BasicHeader title={title}
            leftIconProps={{ reverse: true, name: 'md-arrow-round-back', type: 'Ionicons', onPress: this.onPressBackButton }}
            rightIconProps={{ reverse: true, name: 'md-add', type: 'Ionicons', containerStyle: styles.rightIconPropsStyle, style: { color: '#fff', fontSize: 19 }, onPress: this.openPostForm }}
        />
    }

    renderList = (data) => {
        if (!data) return null;
        return <FlatList
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 40 + APP_COMMON_STYLES.headerHeight }}
            style={{ flexDirection: 'column' }}
            columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: heightPercentageToDP(4), marginHorizontal: 25 }}
            numColumns={2}
            data={data}
            keyExtractor={this.postKeyExtractor}
            renderItem={this.renderSquareCard}
            ListFooterComponent={this.renderFooter}
            onEndReached={this.loadMoreData}
            onEndReachedThreshold={0.1}
        />
    }

    renderSquareCard = ({ item }) => {
        return <SquareCard
            image={item.pictureIds && item.pictureIds[0] ? `${GET_PICTURE_BY_ID}${item.pictureIds[0].id.replace(THUMBNAIL_TAIL_TAG, PORTRAIT_TAIL_TAG)}` : null}
            title={item.title}
            onPress={() => this.openBikeSpecPage(item.id)}
            imageStyle={styles.squareImg}
        />
    }

    renderFooter = () => {
        if (this.state.isLoading) {
            return (
                <View
                    style={{
                        paddingVertical: 20,
                        borderTopWidth: 1,
                        borderColor: "#CED0CE"
                    }}
                >
                    <ActivityIndicator animating size="large" />
                </View>
            );
        }
        return null
    }

    loadMoreData = ({ distanceFromEnd }) => {
        if (this.state.isLoading === true || distanceFromEnd < 0) return;
        this.setState({ isLoading: true }, () => {
            this.props.getPosts(this.props.user.userId, this.props.postType, this.props.postTypes[this.props.postType].id, this.props.bike.spaceId, this.state.pageNumber, this.fetchSuccessCallback, this.fetchErrorCallback);
        });
    }

    fetchSuccessCallback = (res) => {
        this.setState(prevState => ({ isLoading: false, pageNumber: res.length > 0 ? prevState.pageNumber + 1 : prevState.pageNumber }));
    }

    fetchErrorCallback = (er) => {
        this.setState({ isLoading: false });
    }

    postKeyExtractor = item => item.id;

    getCurrentPosts() {
        switch (this.props.postType) {
            case POST_TYPE.WISH_LIST:
                return this.props.bike.wishList;
            case POST_TYPE.MY_RIDE:
                return this.props.bike.customizations;
        }
    }

    render() {
        return <View style={styles.fill}>
            <View style={APP_COMMON_STYLES.statusBar}>
                <StatusBar translucent backgroundColor={APP_COMMON_STYLES.statusBarColor} barStyle="light-content" />
            </View>
            <View style={styles.fill}>
                {this.renderHeader()}
                <View style={styles.pageContent}>
                    {
                        this.renderList(this.getCurrentPosts())
                    }
                </View>
            </View>
        </View>
    }
}

const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    const { hasNetwork, postTypes, updatePageContent } = state.PageState;
    const { currentBike: bike, activeBikeIndex } = state.GarageInfo;
    return { user, hasNetwork, bike, activeBikeIndex, postTypes, updatePageContent };
}
const mapDispatchToProps = (dispatch) => {
    return {
        showAppNavMenu: () => dispatch(appNavMenuVisibilityAction(true)),
        getPosts: (userId, postType, postTypeId, spaceId, pageNumber, successCallback, errorCallback) => getPosts(userId, postTypeId, spaceId, pageNumber)
            .then(({ data }) => {
                if (typeof successCallback === 'function') successCallback(data);
                switch (postType) {
                    case POST_TYPE.WISH_LIST:
                        dispatch(updateBikeWishListAction({ updates: data, reset: !pageNumber }))
                        break;
                    case POST_TYPE.MY_RIDE:
                        dispatch(updateBikeCustomizationsAction({ updates: data, reset: !pageNumber }));
                        break;
                    case POST_TYPE.STORIES_FROM_ROAD:
                        break;
                }
            }).catch(err => typeof errorCallback === 'function' && errorCallback(err)),
        getCurrentBikeSpec: (postType, postId) => dispatch(getCurrentBikeSpecAction({ postType, postId })),
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(BikeSpecList);

const styles = StyleSheet.create({
    fill: {
        flex: 1,
    },
    pageContent: {
        flex: 1,
        backgroundColor: '#fff',
    },
    rightIconPropsStyle: {
        height: 27,
        width: 27,
        borderRadius: 13.5,
        backgroundColor: '#F5891F',
    },
    squareImg: {
        height: widthPercentageToDP(40),
        width: widthPercentageToDP(40)
    }
});
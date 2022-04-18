import React, { Component } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { connect } from 'react-redux';
import { APP_COMMON_STYLES, widthPercentageToDP, heightPercentageToDP, PageKeys, THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG, POST_TYPE, PORTRAIT_TAIL_TAG, GET_PICTURE_BY_ID } from '../../../../../constants';
import { Actions } from 'react-native-router-flux';
import { BasicHeader } from '../../../../../components/headers';
import { SquareCard } from '../../../../../components/cards';
import { updateBikeWishListAction, updateBikeCustomizationsAction, getCurrentBikeSpecAction, resetErrorHandlingAction } from '../../../../../actions';
import { getPosts, getFriendsPosts, handleServiceErrors } from '../../../../../api';
import { BasePage } from '../../../../../components/pages';
import { IconButton } from '../../../../../components/buttons';
import { DefaultText } from '../../../../../components/labels';

class BikeSpecList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            pageNumber: 0,
            postData: [],
            hasRemainingList: false,
        };
    }

    componentDidMount() {
        if (this.props.isEditable === true) {
            if (this.props.isLoadedPostType) {
                this.props.getPosts(this.props.user.userId, this.props.postType, this.props.postTypes[this.props.postType].id, this.props.spaceId, this.state.pageNumber, this.fetchSuccessCallback, this.fetchErrorCallback);
            }
        } else {
            if (this.props.isLoadedPostType) {
                this.getFriendsPosts(this.props.user.userId, this.props.postType, this.props.postTypes[this.props.postType].id, this.props.friendId, this.props.spaceId, 0);
            }
        }

    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.updatePageContent && (!prevProps.updatePageContent || prevProps.updatePageContent !== this.props.updatePageContent)) {
            if (this.props.isLoadedPostType) {
                this.props.getPosts(this.props.user.userId, this.props.postType, this.props.postTypes[this.props.postType].id, this.props.spaceId, 0, this.fetchSuccessCallback, this.fetchErrorCallback);
            }
        }
        if (prevProps.hasNetwork === false && this.props.hasNetwork === true) {
            this.retryApiFunc();
        }

        if (prevProps.isRetryApi === false && this.props.isRetryApi === true) {
            if (Actions.currentScene === this.props.lastApi.currentScene) {
                Alert.alert(
                    'Something went wrong ',
                    '',
                    [
                        {
                            text: 'Retry ', onPress: () => {
                                this.retryApiFunc();
                                this.props.resetErrorHandling(false)
                            }
                        },
                        { text: 'Cancel', onPress: () => { this.props.resetErrorHandling(false) }, style: 'cancel' },
                    ],
                    { cancelable: false }
                )
            }
        }
    }

    retryApiFunc = () => {
        if (this.props.lastApi && this.props.lastApi.currentScene === Actions.currentScene) {
            this.props[`${this.props.lastApi.api}`](...this.props.lastApi.params)
        }
    }

    async getFriendsPosts(userId, postType, postTypeId, friendId, spaceId, pageNumber) {
        this.props.getFriendsPosts(userId, postTypeId, friendId, spaceId, pageNumber, (data) => {
            if (pageNumber === 0) {
                this.setState((prevState) => ({ postData: data.posts, pageNumber: data.posts.length > 0 ? prevState.pageNumber + 1 : prevState.pageNumber, hasRemainingList: data.remainingList > 0 }))
            }
            else {
                this.setState((prevState) => ({ postData: [...prevState.postData, ...data.posts], pageNumber: data.posts.length > 0 ? prevState.pageNumber + 1 : prevState.pageNumber, hasRemainingList: data.remainingList > 0 }))
            }
        }, (er) => { })
    }


    onPressBackButton = () => Actions.pop();

    openPostForm = () => Actions.push(PageKeys.POST_FORM, { comingFrom: Actions.currentScene, postType: this.props.postType, currentBikeId: this.props.spaceId });

    openBikeSpecPage = (item) => {
        if (this.props.isEditable) {
            this.props.getCurrentBikeSpec(this.props.postType, item.id);
            Actions.push(PageKeys.BIKE_SPEC, { comingFrom: Actions.currentScene, postType: this.props.postType, postId: item.id, isEditable: this.props.isEditable });
        }
        else {
            Actions.push(PageKeys.BIKE_SPEC, { comingFrom: Actions.currentScene, postType: this.props.postType, bikeDetail: item, isEditable: this.props.isEditable });
        }
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
            rightIconProps={this.props.isEditable ? { reverse: true, name: 'md-add', type: 'Ionicons', containerStyle: styles.rightIconPropsStyle, style: { color: '#fff', fontSize: 19 }, onPress: this.openPostForm } : null}
        />
    }

    renderList = (data) => {
        if (!data) return null;
        return <FlatList
            contentContainerStyle={{ paddingBottom: this.state.hasRemainingList ? 40 : 0, paddingTop: 40 + APP_COMMON_STYLES.headerHeight }}
            showsVerticalScrollIndicator={false}
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
            numberOfPicUploading={item.numberOfPicUploading || null}
            showLoader={this.props.apiCallsInProgress[item.id]}
            image={item.pictureIds && item.pictureIds[0] ? `${GET_PICTURE_BY_ID}${item.pictureIds[0].id.replace(THUMBNAIL_TAIL_TAG, PORTRAIT_TAIL_TAG)}` : null}
            placeholderImage={this.props.postType === POST_TYPE.MY_RIDE ? require('../../../../../assets/img/my-ride.png') : this.props.postType === POST_TYPE.WISH_LIST ? require('../../../../../assets/img/wishlist.png') : null}
            title={item.title}
            onPress={() => this.openBikeSpecPage(item)}
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
            if (this.props.isEditable) {
                if (this.props.isLoadedPostType) {
                    this.props.getPosts(this.props.user.userId, this.props.postType, this.props.postTypes[this.props.postType].id, this.props.spaceId, this.state.pageNumber, this.fetchSuccessCallback, this.fetchErrorCallback);
                }
            }
            else {
                if (this.props.isLoadedPostType) {
                    this.getFriendsPosts(this.props.user.userId, this.props.postType, this.props.postTypes[this.props.postType].id, this.props.friendId, this.props.spaceId, this.state.pageNumber);
                }
            }
        });
    }

    fetchSuccessCallback = (res) => {
        this.setState(prevState => ({ isLoading: false, pageNumber: res.posts.length > 0 ? prevState.pageNumber + 1 : prevState.pageNumber, hasRemainingList: res.remainingList > 0 }));
    }

    fetchErrorCallback = (er) => {
        this.setState({ isLoading: false });
    }

    postKeyExtractor = item => item.id;

    getCurrentPosts() {
        switch (this.props.postType) {
            case POST_TYPE.WISH_LIST:
                return this.props.isEditable ? this.props.bike && this.props.bike.wishList : this.state.postData;
            case POST_TYPE.MY_RIDE:
                return this.props.isEditable ? this.props.bike && this.props.bike.customizations : this.state.postData;
        }
    }

    render() {
        return <BasePage defaultHeader={false} >
            <View style={styles.fill}>
                {this.renderHeader()}
                <View style={styles.pageContent}>
                    {
                        this.renderList(this.getCurrentPosts())
                    }
                    {
                        this.props.hasNetwork === false && this.getCurrentPosts().length === 0 && <View style={{ flexDirection: 'column', justifyContent: 'space-between', position: 'absolute', top: heightPercentageToDP(20), left: widthPercentageToDP(27), height: 100, }}>
                            <IconButton iconProps={{ name: 'broadcast-tower', type: 'FontAwesome5', style: { fontSize: 60, color: '#505050' } }} />
                            <DefaultText style={{ alignSelf: 'center', fontSize: 14 }}>Please Connect To Internet</DefaultText>
                        </View>
                    }
                </View>
            </View>
        </BasePage>
    }
}

const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    const { hasNetwork, lastApi, isRetryApi, postTypes, updatePageContent, apiCallsInProgress } = state.PageState;
    const { currentBike: bike, activeBikeIndex } = state.GarageInfo;
    return { user, hasNetwork, lastApi, isRetryApi, bike, activeBikeIndex, postTypes, updatePageContent, apiCallsInProgress, isLoadedPostType: Object.keys(postTypes).length > 0 };
}
const mapDispatchToProps = (dispatch) => {
    return {
        getPosts: (userId, postType, postTypeId, spaceId, pageNumber, successCallback, errorCallback) => getPosts(userId, postTypeId, spaceId, pageNumber)
            .then(({ data }) => {
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }));
                if (typeof successCallback === 'function') successCallback(data);
                switch (postType) {
                    case POST_TYPE.WISH_LIST:
                        dispatch(updateBikeWishListAction({ updates: data.posts, reset: !pageNumber }))
                        break;
                    case POST_TYPE.MY_RIDE:
                        dispatch(updateBikeCustomizationsAction({ updates: data.posts, reset: !pageNumber }));
                        break;
                    case POST_TYPE.STORIES_FROM_ROAD:
                        break;
                }
            }).catch(err => {
                typeof errorCallback === 'function' && errorCallback(err)
                handleServiceErrors(er, [userId, postType, postTypeId, spaceId, pageNumber, successCallback, errorCallback], 'getPosts', false, true);
            }),
        getCurrentBikeSpec: (postType, postId) => dispatch(getCurrentBikeSpecAction({ postType, postId })),
        getFriendsPosts: (userId, postTypeId, friendId, spaceId, pageNumber, successCallback, errorCallback) => getFriendsPosts(userId, postTypeId, friendId, spaceId, pageNumber).then(res => {
            if (res.status === 200) {
                console.log('getFriendsPosts : ', res.data);
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                successCallback(res.data)
            }
        }).catch(er => {
            console.log('getFriendsPosts error : ', er.response);
            errorCallback(er)
            handleServiceErrors(er, [userId, postTypeId, friendId, spaceId, pageNumber, successCallback, errorCallback], 'getFriendsPosts', true, true);
            dispatch(apiLoaderActions(false));
        }),
        resetErrorHandling: (state) => dispatch(resetErrorHandlingAction({ comingFrom: 'bike_specs', isRetryApi: state })),
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
import React, { Component } from 'react';
import { View, ImageBackground, StatusBar, FlatList, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { connect } from 'react-redux';
import { appNavMenuVisibilityAction, updateAlbumListAction, clearAlbumAction } from '../../actions';
import { IconButton } from '../../components/buttons';
import { APP_COMMON_STYLES, widthPercentageToDP, heightPercentageToDP, PageKeys, THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG, POST_TYPE, GET_PICTURE_BY_ID, PORTRAIT_TAIL_TAG } from '../../constants';
import { BaseModal } from '../../components/modal';
import { Actions } from 'react-native-router-flux';
import { BasicHeader } from '../../components/headers';
import { SquareCard } from '../../components/cards';
import { getAlbum, getPictureList } from '../../api';

class Album extends Component {

    isLoadingData = false;
    constructor(props) {
        super(props);
        this.state = {
            selectedPicture: null,
            isLoading: false,
            // isLoadingData: false,
            spinValue: new Animated.Value(0),
        };
    }
    componentDidMount() {
        this.props.getAlbum(this.props.user.userId, 0, 15, (res) => {
        },
            (er) => {
            });
    }
    componentDidUpdate(prevProps, prevState) {
        // if (prevProps.albumList !== this.props.albumList) {
        //     const pictureIdList = [];
        //     this.props.albumList.forEach((album) => {
        //         if (!album.profilePicture && album.profilePictureId) {
        //             pictureIdList.push(album.profilePictureId.replace(THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG));
        //         }
        //     })
        //     if (pictureIdList.length > 0) {
        //         this.props.getPictureList(pictureIdList);
        //     }
        // }
    }
    onPressBackButton = () => Actions.pop();

    openPicture = (item) => {
        this.setState({ selectedPicture: item });
    }

    onCancelVisiblePicture = () => {
        this.setState({ selectedPicture: null });
    }

    albumKeyExtractor = (item) => item.profilePictureId;

    loadMoreData = ({ distanceFromEnd }) => {
        if (this.state.isLoading === true || distanceFromEnd < 0) return;
        this.setState((prevState) => ({ isLoading: true }), () => {
            this.props.getAlbum(this.props.user.userId, this.props.pageNumber, 15, (res) => {
                this.setState({ isLoading: false })
            }, (er) => {
                this.setState({ isLoading: false })
            });
        });
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

    openPostForm = () => Actions.push(PageKeys.POST_FORM, { comingFrom: Actions.currentScene, postType: POST_TYPE.ALBUM });

    onScrollBegin = () => {
        // this.setState(prevState => ({ isLoadingData: true }), () => console.log('onMomemntum : ', { ...this.state }))
        this.isLoadingData = true;
    }

    componentWillUnmount() {
        this.props.clearAlbum();
    }

    render() {
        const { user, albumList } = this.props;
        const { selectedPicture } = this.state;
        const spin = this.state.spinValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg']
        });
        return <View style={styles.fill}>
            <BaseModal alignCenter={true} isVisible={selectedPicture !== null} onCancel={this.onCancelVisiblePicture} onPressOutside={this.onCancelVisiblePicture}>
                {
                    selectedPicture
                        ? <View style={{ backgroundColor: '#fff', height: heightPercentageToDP(70), width: widthPercentageToDP(92), padding: 20, paddingBottom: 0, alignItems: 'center' }}>
                            <IconButton style={styles.closeIconContainer} iconProps={{ name: 'close', type: 'Ionicons', style: { fontSize: widthPercentageToDP(5), color: '#fff' } }} onPress={this.onCancelVisiblePicture} />
                            <View style={{ width: widthPercentageToDP(92) - 40, height: heightPercentageToDP(70) - 20 }}>
                                <ImageBackground source={{ uri: `${GET_PICTURE_BY_ID}${selectedPicture.profilePictureId.replace(THUMBNAIL_TAIL_TAG, PORTRAIT_TAIL_TAG)}` }} style={{ height: null, width: null, flex: 1, borderRadius: 0, backgroundColor: '#A9A9A9' }} />
                                {selectedPicture.description ? <DefaultText numberOfLines={1} style={{ letterSpacing: 0.38, fontSize: 15, marginVertical: 20 }}>{selectedPicture.description}</DefaultText> : <View style={{ height: 20 }} />}
                            </View>
                        </View>
                        : null
                }
            </BaseModal>
            <View style={APP_COMMON_STYLES.statusBar}>
                <StatusBar translucent backgroundColor={APP_COMMON_STYLES.statusBarColor} barStyle="light-content" />
            </View>
            <View style={styles.fill}>
                <BasicHeader title='My Photos'
                    leftIconProps={{ reverse: true, name: 'md-arrow-round-back', type: 'Ionicons', onPress: this.onPressBackButton }}
                    rightIconProps={{ reverse: true, name: 'md-add', type: 'Ionicons', rightIconPropsStyle: styles.rightIconPropsStyle, style: { color: '#fff', fontSize: 19 }, onPress: this.openPostForm }} />
                <View style={{ marginTop: heightPercentageToDP(9.6), flex: 1 }}>
                    <FlatList
                        showsVerticalScrollIndicator={false}
                        numColumns={3}
                        data={albumList}
                        columnWrapperStyle={{ justifyContent: 'flex-start', marginBottom: widthPercentageToDP(1) }}
                        keyExtractor={this.albumKeyExtractor}
                        renderItem={({ item, index }) => (
                            <SquareCard
                                image={item.profilePictureId ? `${GET_PICTURE_BY_ID}${item.profilePictureId.replace(THUMBNAIL_TAIL_TAG, PORTRAIT_TAIL_TAG)}` : null}
                                imageStyle={[styles.imageStyle, index % 3 === 1 ? { marginHorizontal: widthPercentageToDP(1) } : null]}
                                onPress={() => this.openPicture(item)}
                            />
                        )}
                        ListFooterComponent={this.renderFooter}
                        onEndReached={this.loadMoreData}
                        onEndReachedThreshold={0.1}
                    />

                </View>
            </View >
        </View>
    }
}
const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    const { hasNetwork, pageNumber } = state.PageState
    const { albumList } = state.Album
    return { user, hasNetwork, albumList, pageNumber };
}
const mapDispatchToProps = (dispatch) => {
    return {
        showAppNavMenu: () => dispatch(appNavMenuVisibilityAction(true)),
        getAlbum: (userId, pageNumber, preference, successCallback, errorCallback) => dispatch(getAlbum(userId, pageNumber, preference, successCallback, errorCallback)),
        // getPictureList: (pictureIdList) => getPictureList(pictureIdList, (pictureObj) => {
        //     dispatch(updateAlbumListAction({ pictureObj }))
        // }, (error) => {
        //     console.log('getPictureList album error : ', error)
        //     // dispatch(updateFriendInListAction({ userId: friendId }))
        // }),
        clearAlbum: () => dispatch(clearAlbumAction())
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(Album);

const styles = StyleSheet.create({
    fill: {
        flex: 1,
        backgroundColor: '#fff',
    },
    rightIconPropsStyle: {
        height: 27,
        width: 27,
        borderRadius: 13.5,
        backgroundColor: '#F5891F'
    },
    imageStyle: {
        height: widthPercentageToDP(98 / 3),
        width: widthPercentageToDP(98 / 3)
    },
    closeIconContainer: {
        position: 'absolute',
        height: widthPercentageToDP(8),
        width: widthPercentageToDP(8),
        borderRadius: widthPercentageToDP(4),
        backgroundColor: '#F5891F',
        marginLeft: widthPercentageToDP(16),
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'flex-end',
        top: heightPercentageToDP(-1.5),
        right: widthPercentageToDP(-1.5)
    }
});
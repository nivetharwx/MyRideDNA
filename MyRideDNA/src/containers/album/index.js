import React, { Component } from 'react';
import { View, ImageBackground, StatusBar, FlatList, StyleSheet, ActivityIndicator, Animated, Easing } from 'react-native';
import { connect } from 'react-redux';
import { appNavMenuVisibilityAction, updateAlbumListAction, clearAlbumAction } from '../../actions';
import { IconButton, ImageButton } from '../../components/buttons';
import { APP_COMMON_STYLES, widthPercentageToDP, heightPercentageToDP, PageKeys, THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG, POST_TYPE, GET_PICTURE_BY_ID, PORTRAIT_TAIL_TAG } from '../../constants';
import { BaseModal } from '../../components/modal';
import { Actions } from 'react-native-router-flux';
import { BasicHeader } from '../../components/headers';
import { SquareCard } from '../../components/cards';
import { getAlbum, getPictureList } from '../../api';
import { DefaultText } from '../../components/labels';
import { ConnectionLostLoader } from '../../components/loader';

class Album extends Component {

    isLoadingData = false;
    constructor(props) {
        super(props);
        this.state = {
            selectedIndex: -1,
            isLoading: false,
            // isLoadingData: false,
            spinValue: new Animated.Value(0),
        };
    }
    componentDidMount() {
        this.props.getAlbum(this.props.user.userId, 0, 15, (res) => {
        }, (er) => {
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

    retryApiFunction = () => {
        this.state.spinValue.setValue(0);
        Animated.timing(this.state.spinValue, {
            toValue: 1,
            duration: 300,
            easing: Easing.linear,
            useNativeDriver: true
        }).start(() => {
            if (this.props.hasNetwork === true) {
                this.props.getAlbum(this.props.user.userId, 0, 15, (res) => {
                }, (er) => {
                });
            }
        });
    }

    openPicture = (index) => {
        this.setState({ selectedIndex: index });
    }

    onCancelVisiblePicture = () => {
        this.setState({ selectedIndex: -1 });
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

    onPressAdvanceRight = () => {
        this.setState({ selectedIndex: this.state.selectedIndex + 1 });
    }
    onPressAdvanceLeft = () => {
        this.setState({ selectedIndex: this.state.selectedIndex - 1 });
    }

    componentWillUnmount() {
        this.props.clearAlbum();
    }

    render() {
        const { user, albumList } = this.props;
        const { selectedIndex } = this.state;
        const spin = this.state.spinValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg']
        });
        return <View style={styles.fill}>
            <BaseModal alignCenter={true} isVisible={selectedIndex !== -1} onCancel={this.onCancelVisiblePicture} >
                {
                    selectedIndex > -1
                        ? <View style={styles.imgModalContent}>
                            <IconButton style={styles.closeIconContainer} iconProps={{ name: 'close', type: 'Ionicons', style: styles.closeIcon }} onPress={this.onCancelVisiblePicture} />
                            <View style={styles.enlargedImgContainer}>
                                <ImageBackground source={{ uri: `${GET_PICTURE_BY_ID}${albumList[selectedIndex].profilePictureId.replace(THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG)}` }} style={styles.enlargedImg} />
                                {albumList[selectedIndex].description ? <DefaultText numberOfLines={1} style={styles.imgDescription}>{albumList[selectedIndex].description}</DefaultText> : <View style={{ height: 20 }} />}
                            </View>
                            {selectedIndex > 0 ? <IconButton activeOpacity={0.8} style={[styles.imgAdvanceBtn, styles.prevBtn]} iconProps={{ name: 'triangle-left', type: 'Entypo', style: styles.prevBtnIcon }} onPress={this.onPressAdvanceLeft} /> : <View />}
                            {selectedIndex < albumList.length - 1 ? <IconButton activeOpacity={0.8} style={[styles.imgAdvanceBtn, styles.nextBtn]} iconProps={{ name: 'triangle-left', type: 'Entypo', style: styles.nextBtnIcon }} onPress={this.onPressAdvanceRight} /> : <View />}
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
                    rightIconProps={{ reverse: true, name: 'md-add', type: 'Ionicons', containerStyle: styles.rightIconPropsStyle, style: { color: '#fff', fontSize: 19 }, onPress: this.openPostForm }} />
                <View style={{ marginTop: heightPercentageToDP(10.7) }}>
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
                                onPress={() => this.openPicture(index)}
                            />
                        )}
                        ListFooterComponent={this.renderFooter}
                        onEndReached={this.loadMoreData}
                        onEndReachedThreshold={0.1}
                    />
                    {
                        // this.props.hasNetwork === false && albumList.length === 0 && <View style={{ height: heightPercentageToDP(30), justifyContent:'center' }}>
                        //     <Animated.View style={{ transform: [{ rotate: spin }] }}>
                        //         <IconButton iconProps={{ name: 'reload', type: 'MaterialCommunityIcons', style: { color: 'black', fontSize: heightPercentageToDP(15) } }} onPress={this.retryApiFunction} />
                        //     </Animated.View>
                        //     <DefaultText style={{ alignSelf:'center', fontSize: heightPercentageToDP(4.5) }}>No Internet Connection</DefaultText>
                        //     <DefaultText style={{ alignSelf: 'center' }}>Please connect to internet</DefaultText>
                        // </View>
                        this.props.hasNetwork === false && albumList.length === 0 && <View style={{ marginTop: heightPercentageToDP(25), flexDirection: 'column', justifyContent: 'space-between', height: 100 }}>
                            <IconButton iconProps={{ name: 'broadcast-tower', type: 'FontAwesome5', style: { fontSize: 60, color: '#505050' } }} />
                            <DefaultText style={{ alignSelf: 'center', fontSize: 14 }}>Please Connect To Internet</DefaultText>
                        </View>
                    }
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
    },
    closeIcon: {
        fontSize: widthPercentageToDP(5),
        color: '#fff'
    },
    imgModalContent: {
        backgroundColor: '#fff',
        height: heightPercentageToDP(70),
        width: widthPercentageToDP(92),
        alignItems: 'center',
        justifyContent: 'center'
    },
    enlargedImgContainer: {
        padding: 20,
        paddingBottom: 0,
        width: widthPercentageToDP(92),
        height: heightPercentageToDP(70)
    },
    enlargedImg: {
        height: null,
        width: null,
        flex: 1,
        borderRadius: 0,
        backgroundColor: '#A9A9A9'
    },
    imgAdvanceBtn: {
        position: 'absolute',
        height: 120,
        width: 22,
        backgroundColor: '#C4C6C8'
    },
    prevBtn: {
        alignSelf: 'flex-start',
        left: -10,
    },
    nextBtn: {
        alignSelf: 'flex-end',
        right: -10,
    },
    prevBtnIcon: {
        right: 4
    },
    nextBtnIcon: {
        left: 4,
        transform: [{ rotate: '180deg' }]
    },
    imgDescription: {
        letterSpacing: 0.38,
        fontSize: 15,
        marginVertical: 20
    }
});
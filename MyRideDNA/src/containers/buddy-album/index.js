import React, { Component } from 'react';
import { View, ImageBackground, StatusBar, FlatList, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';
import { BaseModal } from '../../components/modal';
import { IconButton, ImageButton } from '../../components/buttons';
import { widthPercentageToDP, APP_COMMON_STYLES, heightPercentageToDP, GET_PICTURE_BY_ID, THUMBNAIL_TAIL_TAG, PORTRAIT_TAIL_TAG } from '../../constants';
import { BasicHeader } from '../../components/headers';
import { SquareCard } from '../../components/cards';
import { getBuddyAlbum, getPictureList } from '../../api';
import { clearAlbumAction, updatePicturesAction } from '../../actions';
import { DefaultText } from '../../components/labels';

class BuddyAlbum extends Component {

    isLoadingData = false;
    isLoadingBuddyAlbum = false;
    constructor(props) {
        super(props);
        this.state = {
            selectedIndex: -1,
            isVisiblePicture: false,
            isLoading: false,
            // isLoadingData: false,
            spinValue: new Animated.Value(0),
            pageNumber: 0
        };
    }
    componentDidMount() {
        this.props.getBuddyAlbum(this.props.user.userId, this.props.person.userId, this.state.pageNumber, 15, undefined, (res) => {
            if (res.pictures.length > 0) {
                this.setState({ pageNumber: this.state.pageNumber + 1 })
            }
        }, (error) => {
        })
    }
    componentDidUpdate(prevProps, prevState) {
        // if (prevProps.person.pictures !== this.props.person.pictures) {
        //     if (!this.isLoadingBuddyAlbum) {
        //         const buddyAlbumPicIdList = [];
        //         this.props.person.pictures.forEach((pic) => {
        //             if (!pic.data && pic.id) {
        //                 buddyAlbumPicIdList.push(pic.id);
        //             }
        //         })
        //         if (buddyAlbumPicIdList.length > 0) {
        //             this.isLoadingBuddyAlbum = true;
        //             this.props.getBuddyPictureList(buddyAlbumPicIdList, 'album', () => this.isLoadingBuddyAlbum = false);
        //         }
        //     }
        // }
    }
    onPressBackButton = () => {
        Actions.pop()
    }

    openPicture = (index) => {
        this.setState({ selectedIndex: index });
    }

    onCancelVisiblePicture = () => {
        this.setState({ selectedIndex: -1 })
    }

    albumKeyExtractor = (item) => item.id

    loadMoreData = ({ distanceFromEnd }) => {
        // this.setState({ isLoading: true, isLoadingData: false })
        if (this.state.isLoading === true || distanceFromEnd < 0) return;
        this.setState((prevState) => ({ isLoading: true }),
            () => {
                this.props.getBuddyAlbum(this.props.user.userId, this.props.person.userId, this.state.pageNumber, 15, this.props.person.pictures, (res) => {
                    if (res.pictures.length > 0) {
                        this.setState({ pageNumber: this.state.pageNumber + 1 })
                    }
                    this.setState({ isLoading: false })
                },
                    (er) => {
                        this.setState({ isLoading: false })
                    });
            })
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

    // openPostForm = () => Actions.push(PageKeys.POST_FORM, { comingFrom: Actions.currentScene, postType: POST_TYPE.ALBUM });

    onScrollBegin = () => {
        // this.setState(prevState => ({ isLoadingData: true }), () => console.log('onMomemntum : ', { ...this.state }))
        this.isLoadingData = true;
    }
    onPressSwipeRight = () => {
        this.setState({ selectedIndex: this.state.selectedIndex + 1 });
    }
    onPressSwipeLeft = () => {
        this.setState({ selectedIndex: this.state.selectedIndex - 1 });
    }

    componentWillUnmount() {
        this.props.clearAlbum();
    }

    render() {
        const { user, person } = this.props;
        const { selectedIndex } = this.state;
        const spin = this.state.spinValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg']
        });
        return <View style={styles.fill}>
            <BaseModal alignCenter={true} isVisible={selectedIndex !== -1} onCancel={this.onCancelVisiblePicture} >
                <View style={{ backgroundColor: '#fff' }}>
                    <IconButton style={styles.closeIconContainer} iconProps={{ name: 'close', type: 'Ionicons', style: { fontSize: widthPercentageToDP(5), color: '#fff' } }} onPress={this.onCancelVisiblePicture} />
                    <View style={{ height: heightPercentageToDP(70), width: widthPercentageToDP(92), justifyContent: 'center', alignItems: 'center', paddingBottom: heightPercentageToDP(6) }}>
                        {
                            selectedIndex > -1 ?
                                <View style={{ height: heightPercentageToDP(58), width: widthPercentageToDP(82), justifyContent: 'center' }}>
                                    <View style={{ width: widthPercentageToDP(92) - 40, height: heightPercentageToDP(70) - 20 }}>
                                        <ImageBackground source={{ uri: `${GET_PICTURE_BY_ID}${person.pictures[selectedIndex].id.replace(THUMBNAIL_TAIL_TAG, PORTRAIT_TAIL_TAG)}` }} style={{ height: null, width: null, flex: 1, borderRadius: 0, backgroundColor: '#A9A9A9' }} />
                                        {person.pictures[selectedIndex].description ? <DefaultText numberOfLines={1} style={{ letterSpacing: 0.38, fontSize: 15, marginVertical: 20 }}>{person.pictures[selectedIndex].description}</DefaultText> : <View style={{ height: 20 }} />}
                                    </View>
                                    {selectedIndex < person.pictures.length - 1 ? <ImageButton imageSrc={require('../../assets/img/photo-advance-right.png')} imgStyles={{ width: 18, height: 120 }} containerStyles={{ position: 'absolute', left: 300 }} onPress={this.onPressSwipeRight} /> : null}
                                    {selectedIndex > 0 ? <ImageButton imageSrc={require('../../assets/img/photo-advance-left.png')} imgStyles={{ width: 18, height: 120 }} containerStyles={{ position: 'absolute', right: 304 }} onPress={this.onPressSwipeLeft} /> : null}
                                </View>
                                : null
                        }

                    </View>
                </View>
            </BaseModal>
            <View style={APP_COMMON_STYLES.statusBar}>
                <StatusBar translucent backgroundColor={APP_COMMON_STYLES.statusBarColor} barStyle="light-content" />
            </View>
            <View style={styles.fill}>
                <BasicHeader title='Buddy Photos'
                    leftIconProps={{ reverse: true, name: 'md-arrow-round-back', type: 'Ionicons', onPress: this.onPressBackButton }}
                    rightIconProps={{ reverse: true, name: 'md-add', type: 'Ionicons', rightIconPropsStyle: styles.rightIconPropsStyle, style: { color: '#fff', fontSize: 19 }, onPress: this.openPostForm }} />
                <View style={{ marginTop: heightPercentageToDP(9.6), flex: 1 }}>
                    <FlatList
                        showsVerticalScrollIndicator={false}
                        numColumns={3}
                        data={person.pictures}
                        columnWrapperStyle={{ justifyContent: 'flex-start', marginBottom: widthPercentageToDP(1) }}
                        keyExtractor={this.albumKeyExtractor}
                        renderItem={({ item, index }) => (
                            <SquareCard
                                image={item.id ? `${GET_PICTURE_BY_ID}${item.id}` : null}
                                imageStyle={[styles.imageStyle, index % 3 === 1 ? { marginHorizontal: widthPercentageToDP(1) } : null]}
                                onPress={() => this.openPicture(index)}
                            />
                        )}
                        initialNumToRender={15}
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
    const { person } = state.CurrentProfile;
    return { user, hasNetwork, albumList, pageNumber, person };
}
const mapDispatchToProps = (dispatch) => {
    return {
        // showAppNavMenu: () => dispatch(appNavMenuVisibilityAction(true)),
        // getAlbum: (userId, pageNumber, preference, successCallback, errorCallback) => dispatch(getAlbum(userId, pageNumber, preference, successCallback, errorCallback)),
        getBuddyAlbum: (userId, friendId, pageNumber, preference, buddyAlbum = [], successCallback, errorCallback) => dispatch(getBuddyAlbum(userId, friendId, pageNumber, preference, buddyAlbum, successCallback, errorCallback)),
        // getBuddyPictureList: (pictureIdList, callingFrom) => getPictureList(pictureIdList, (pictureObj) => {
        //     console.log('getBuddyPictureList : ', pictureObj)
        //     dispatch(updatePicturesAction({ pictureObj, type: callingFrom }))
        // }, (error) => {
        //     console.log('getPictureList error : ', error)
        // }),
        clearAlbum: () => dispatch(clearAlbumAction()),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(BuddyAlbum);

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
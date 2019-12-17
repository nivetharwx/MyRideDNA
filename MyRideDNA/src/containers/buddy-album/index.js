import React, { Component } from 'react';
import { View, ImageBackground, StatusBar, FlatList, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';
import { BaseModal } from '../../components/modal';
import { IconButton } from '../../components/buttons';
import { widthPercentageToDP, APP_COMMON_STYLES, heightPercentageToDP, GET_PICTURE_BY_ID } from '../../constants';
import { BasicHeader } from '../../components/headers';
import { SquareCard } from '../../components/cards';
import { getBuddyAlbum, getPictureList } from '../../api';
import { clearAlbumAction, updatePicturesAction } from '../../actions';

class BuddyAlbum extends Component {

    isLoadingData = false;
    isLoadingBuddyAlbum = false;
    constructor(props) {
        super(props);
        this.state = {
            isVisiblePicture: false,
            selectedPicture: null,
            isLoading: false,
            // isLoadingData: false,
            spinValue: new Animated.Value(0),
            pageNumber: 0
        };
    }
    componentDidMount() {
        this.props.getBuddyAlbum(this.props.user.userId, this.props.person.userId, this.state.pageNumber, 15, (res) => {
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

    openPicture = (item) => {
        this.setState({ selectedPicture: item, isVisiblePicture: true });
    }

    onCancelVisiblePicture = () => {
        this.setState({ selectedPicture: null, isVisiblePicture: false })
    }

    albumKeyExtractor = (item) => item.profilePictureId

    loadMoreData = ({ distanceFromEnd }) => {
        // this.setState({ isLoading: true, isLoadingData: false })
        if (this.state.isLoading === true || distanceFromEnd < 0) return;
            this.setState((prevState) => ({ isLoading: true }),
                () => {
                    this.props.getBuddyAlbum(this.props.user.userId, this.props.person.userId, this.state.pageNumber, 15, (res) => {
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

    componentWillUnmount() {
        this.props.clearAlbum();
    }

    render() {
        const { user, person } = this.props;
        const { isVisiblePicture, selectedPicture } = this.state;
        console.log('this.state/isLoading : ', this.state.isLoading);
        const spin = this.state.spinValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg']
        });
        return <View style={styles.fill}>
            <BaseModal alignCenter={true} isVisible={isVisiblePicture} onCancel={this.onCancelVisiblePicture} onPressOutside={this.onCancelVisiblePicture}>
                <View style={{ backgroundColor: '#fff' }}>
                    <IconButton style={styles.closeIconContainer} iconProps={{ name: 'close', type: 'Ionicons', style: { fontSize: widthPercentageToDP(5), color: '#fff' } }} onPress={() => this.setState({ isVisiblePicture: false, selectedPicture: null })} />
                    <View style={{ height: heightPercentageToDP(70), width: widthPercentageToDP(92), justifyContent: 'center', alignItems: 'center', paddingBottom: heightPercentageToDP(6) }}>
                        <View style={{ height: heightPercentageToDP(58), width: widthPercentageToDP(82) }}>
                            {
                                selectedPicture === null ?
                                    null :
                                    <ImageBackground source={selectedPicture.profilePicture ? { uri: selectedPicture.profilePicture } : require('../../assets/img/profile-pic.png')} style={{ height: null, width: null, flex: 1, borderRadius: 0 }} />
                            }
                        </View>
                    </View>
                </View>
            </BaseModal>
            <View style={APP_COMMON_STYLES.statusBar}>
                <StatusBar translucent backgroundColor={APP_COMMON_STYLES.statusBarColor} barStyle="light-content" />
            </View>
            <View style={styles.fill}>
                <BasicHeader title='Buddy Photos'
                    leftIconProps={{ reverse: true, name: 'md-arrow-round-back', type: 'Ionicons', onPress: this.onPressBackButton }}
                    rightIconProps={{ reverse: true, name: 'md-add', type: 'Ionicons', containerStyle: styles.rightIconPropsStyle, style: { color: '#fff', fontSize: 19 }, onPress: this.openPostForm }} />
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
                                onPress={() => this.openPicture(item)}
                            />
                        )}
                        initialNumToRender={15}
                        ListFooterComponent={this.renderFooter}
                        onEndReached={this.loadMoreData}
                        onEndReachedThreshold={0.5}
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
        getBuddyAlbum: (userId, friendId, pageNumber, preference, successCallback, errorCallback) => dispatch(getBuddyAlbum(userId, friendId, pageNumber, preference, successCallback, errorCallback)),
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
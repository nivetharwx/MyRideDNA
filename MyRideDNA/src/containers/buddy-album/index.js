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

    onPressAdvanceRight = () => {
        this.setState((prevState) => ({ selectedIndex: prevState.selectedIndex + 1 }));
    }
    onPressAdvanceLeft = () => {
        this.setState((prevState) => ({ selectedIndex: prevState.selectedIndex - 1 }));
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
                {
                    selectedIndex > -1 ?
                        <View style={styles.imgModalContent}>
                            <IconButton style={styles.closeIconContainer} iconProps={{ name: 'close', type: 'Ionicons', style: styles.closeIcon }} onPress={this.onCancelVisiblePicture} />
                            <View style={styles.enlargedImgContainer}>
                                <ImageBackground source={{ uri: `${GET_PICTURE_BY_ID}${person.pictures[selectedIndex].id.replace(THUMBNAIL_TAIL_TAG, PORTRAIT_TAIL_TAG)}` }} style={styles.enlargedImg} />
                                {person.pictures[selectedIndex].description ? <DefaultText numberOfLines={1} style={styles.imgDescription}>{person.pictures[selectedIndex].description}</DefaultText> : <View style={{ height: 20 }} />}
                            </View>
                            {selectedIndex > 0 ? <IconButton activeOpacity={0.8} style={[styles.imgAdvanceBtn, styles.prevBtn]} iconProps={{ name: 'triangle-left', type: 'Entypo', style: styles.prevBtnIcon }} onPress={this.onPressAdvanceLeft} /> : <View />}
                            {selectedIndex < person.pictures.length - 1 ? <IconButton activeOpacity={0.8} style={[styles.imgAdvanceBtn, styles.nextBtn]} iconProps={{ name: 'triangle-left', type: 'Entypo', style: styles.nextBtnIcon }} onPress={this.onPressAdvanceRight} /> : <View />}
                        </View>
                        : null
                }
            </BaseModal>
            <View style={APP_COMMON_STYLES.statusBar}>
                <StatusBar translucent backgroundColor={APP_COMMON_STYLES.statusBarColor} barStyle="light-content" />
            </View>
            <View style={styles.fill}>
                <BasicHeader title='Buddy Photos'
                    leftIconProps={{ reverse: true, name: 'md-arrow-round-back', type: 'Ionicons', onPress: this.onPressBackButton }} />
                <View style={styles.container}>
                    <FlatList
                        showsVerticalScrollIndicator={false}
                        numColumns={3}
                        data={person.pictures}
                        columnWrapperStyle={styles.columnWrapper}
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
    container: {
        marginTop: heightPercentageToDP(9.6),
        flex: 1
    },
    columnWrapper: {
        justifyContent: 'flex-start',
        marginBottom: widthPercentageToDP(1)
    },
    imageStyle: {
        height: widthPercentageToDP(98 / 3),
        width: widthPercentageToDP(98 / 3)
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
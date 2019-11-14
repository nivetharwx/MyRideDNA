import React, { Component } from 'react';
import { View, ImageBackground, Text, Alert, StatusBar, ScrollView, FlatList, TextInput, KeyboardAvoidingView, TouchableOpacity, StyleSheet, ActivityIndicator, Easing, Animated } from 'react-native';
import { connect } from 'react-redux';
import { appNavMenuVisibilityAction, updateAlbumListAction } from '../../actions';
import { ShifterButton, IconButton, LinkButton } from '../../components/buttons';
import { Thumbnail, Item, List, Icon as NBIcon } from 'native-base';
import { APP_COMMON_STYLES, widthPercentageToDP, WindowDimensions, heightPercentageToDP, PageKeys, THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG } from '../../constants';
import { ChatBubble } from '../../components/bubble';
import { getFormattedDateFromISO } from '../../util';
import { BaseModal } from '../../components/modal';
import { ActionConst, Actions } from 'react-native-router-flux';
import { BasicHeader } from '../../components/headers';
import { SquareCard } from '../../components/cards';
import { getAlbum, getPictureList } from '../../api';

const roadbuddiesDummyData = [{ name1: 'person1', id: '1' }, { name1: 'person2', id: '2' }, { name1: 'person3', id: '3' }, { name1: 'person4', id: '4' }, { name1: 'person5', id: '6' }, { name1: 'person6', id: '6' }, { name1: 'person7', id: '7' }, { name1: 'person8', id: '8' }, { name1: 'person9', id: '9' }]


class Album extends Component {

    isLoadingData = false;
    constructor(props) {
        super(props);
        this.state = {
            isVisiblePicture: false,
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
        if (prevProps.albumList !== this.props.albumList) {
            const pictureIdList = [];
            this.props.albumList.forEach((album) => {
                if (!album.profilePicture && album.profilePictureId) {
                    pictureIdList.push(album.profilePictureId.replace(THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG));
                }
            })
            if (pictureIdList.length > 0) {
                this.props.getPictureList(pictureIdList);
            }
        }
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

    loadMoreData = () => {
        // this.setState({ isLoading: true, isLoadingData: false })
        this.setState((prevState) => ({ isLoading: true }),
            () => {
                this.props.getAlbum(this.props.user.userId, this.props.pageNumber, 15, (res) => {
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

    onScrollBegin = () => {
        // this.setState(prevState => ({ isLoadingData: true }), () => console.log('onMomemntum : ', { ...this.state }))
        this.isLoadingData = true;
    }

    render() {
        const { user, albumList } = this.props;
        const { isVisiblePicture, selectedPicture } = this.state;
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
                <BasicHeader title='My Photos'
                    leftIconProps={{ reverse: true, name: 'md-arrow-round-back', type: 'Ionicons', onPress: this.onPressBackButton }}
                    rightIconProps={{ reverse: true, name: 'md-add', type: 'Ionicons', rightIconPropsStyle: styles.rightIconPropsStyle, style: { color: '#fff', fontSize: 19 } }} />
                <View style={{ marginTop: heightPercentageToDP(9.6), flex: 1 }}>
                    <FlatList
                        numColumns={3}
                        data={albumList}
                        columnWrapperStyle={{ justifyContent: 'flex-start', marginBottom: widthPercentageToDP(1) }}
                        keyExtractor={this.albumKeyExtractor}
                        renderItem={({ item, index }) => (
                            <SquareCard
                                item={item}
                                imageStyle={[styles.imageStyle, index % 3 === 1 ? { marginHorizontal: widthPercentageToDP(1) } : null]}
                                onPress={() => this.openPicture(item)}
                            />
                        )}
                        initialNumToRender={15}
                        // sonMomentumScrollBegin={this.onScrollBegin}
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
        getPictureList: (pictureIdList) => getPictureList(pictureIdList, (pictureObj) => {
            dispatch(updateAlbumListAction({ pictureObj }))
        }, (error) => {
            console.log('getPictureList album error : ', error)
            // dispatch(updateFriendInListAction({ userId: friendId }))
        }),
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
        height: widthPercentageToDP(98/3),
        width: widthPercentageToDP(98/3)
    },
    closeIconContainer: {
        height: heightPercentageToDP(5),
        width: widthPercentageToDP(8),
        borderRadius: 22,
        backgroundColor: '#F5891F',
        marginLeft: widthPercentageToDP(16),
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        top: heightPercentageToDP(-1.5),
        right: widthPercentageToDP(-1.5)
    }
});
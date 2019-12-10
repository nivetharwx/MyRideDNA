import React, { Component } from 'react';
import { View, ImageBackground, StatusBar, FlatList, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { connect } from 'react-redux';
import { appNavMenuVisibilityAction, updateBikeAlbumAction, clearBikeAlbumAction } from '../../../../../actions';
import { IconButton } from '../../../../../components/buttons';
import { APP_COMMON_STYLES, widthPercentageToDP, heightPercentageToDP, PageKeys, THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG, POST_TYPE, PORTRAIT_TAIL_TAG, GET_PICTURE_BY_ID } from '../../../../../constants';
import { BaseModal } from '../../../../../components/modal';
import { Actions } from 'react-native-router-flux';
import { BasicHeader } from '../../../../../components/headers';
import { SquareCard } from '../../../../../components/cards';
import { getBikeAlbum, getPictureList } from '../../../../../api';
import { DefaultText } from '../../../../../components/labels';

class BikeAlbum extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedPicture: null,
            isLoading: false,
            spinValue: new Animated.Value(0),
            pageNumber: 0,
        };
    }
    componentDidMount() {
        this.props.getBikeAlbum(this.props.user.userId, this.props.bike.spaceId, 0);
        this.setState({ pageNumber: 1 });
    }
    componentDidUpdate(prevProps, prevState) {
        // if (prevProps.bike.pictures !== this.props.bike.pictures) {
        //     const pictureIdList = this.props.bike.pictures.reduce((list, pic) => {
        //         if (!pic.data) list.push(pic.id.replace(THUMBNAIL_TAIL_TAG, PORTRAIT_TAIL_TAG));
        //         return list;
        //     }, []);
        //     if (pictureIdList.length > 0) this.props.getPictureList(pictureIdList);
        // }
    }
    onPressBackButton = () => Actions.pop();

    showEnlargedPhoto = (item) => this.setState({ selectedPicture: item });

    onCancelEnlargedPhoto = () => this.setState({ selectedPicture: null });

    albumKeyExtractor = (item) => item.id;

    loadMoreData = ({ distanceFromEnd }) => {
        if (this.state.isLoading === true || distanceFromEnd < 0) return;
        this.setState({ isLoading: true }, () => {
            this.props.getBikeAlbum(this.props.user.userId, this.props.bike.spaceId, this.state.pageNumber,
                (res) => this.setState(prevState => ({ isLoading: false, pageNumber: prevState.pageNumber + 1 })),
                (er) => this.setState({ isLoading: false })
            );
        });
    }

    renderFooter = () => {
        if (this.state.isLoading) {
            return (
                <View style={{
                    paddingVertical: 20,
                    borderTopWidth: 1,
                    borderColor: "#CED0CE"
                }}>
                    <ActivityIndicator animating size="large" />
                </View>
            );
        }
        return null;
    }

    openPostForm = () => Actions.push(PageKeys.POST_FORM, { comingFrom: Actions.currentScene, postType: POST_TYPE.ALBUM, currentBikeId: this.props.bike.spaceId });

    componentWillUnmount() {
        this.props.clearBikeAlbum();
    }

    render() {
        const { user, bike } = this.props;
        const { selectedPicture } = this.state;
        const spin = this.state.spinValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg']
        });
        if (!bike) return <View style={styles.fill} />
        return <View style={styles.fill}>
            <BaseModal alignCenter={true} isVisible={selectedPicture !== null} onCancel={this.onCancelEnlargedPhoto} onPressOutside={this.onCancelEnlargedPhoto}>
                {
                    selectedPicture
                        ? <View style={{ backgroundColor: '#fff', height: heightPercentageToDP(70), width: widthPercentageToDP(92), padding: 20, paddingBottom: 0, alignItems: 'center' }}>
                            <IconButton style={styles.closeIconContainer} iconProps={{ name: 'close', type: 'Ionicons', style: { fontSize: widthPercentageToDP(5), color: '#fff' } }} onPress={this.onCancelEnlargedPhoto} />
                            <View style={{ width: widthPercentageToDP(92) - 40, height: heightPercentageToDP(70) - 20 }}>
                                <ImageBackground source={selectedPicture.data ? { uri: selectedPicture.data } : require('../../../../../assets/img/profile-pic.png')} style={{ height: null, width: null, flex: 1, borderRadius: 0 }} />
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
                <BasicHeader title='Photos'
                    leftIconProps={{ reverse: true, name: 'md-arrow-round-back', type: 'Ionicons', onPress: this.onPressBackButton }}
                    rightIconProps={{ reverse: true, name: 'md-add', type: 'Ionicons', rightIconPropsStyle: styles.rightIconPropsStyle, style: { color: '#fff', fontSize: 19 }, onPress: this.openPostForm }} />
                <View style={{ marginTop: heightPercentageToDP(9.6), flex: 1 }}>
                    <FlatList
                        showsVerticalScrollIndicator={false}
                        numColumns={3}
                        data={bike.pictures}
                        columnWrapperStyle={{ justifyContent: 'flex-start', marginBottom: widthPercentageToDP(1) }}
                        keyExtractor={this.albumKeyExtractor}
                        renderItem={({ item, index }) => (
                            <SquareCard
                                image={`${GET_PICTURE_BY_ID}${item.id.replace(THUMBNAIL_TAIL_TAG, PORTRAIT_TAIL_TAG)}`}
                                imageStyle={[styles.imageStyle, index % 3 === 1 ? { marginHorizontal: widthPercentageToDP(1) } : null]}
                                onPress={() => item.data && this.showEnlargedPhoto(item)}
                            />
                        )}
                        initialNumToRender={15}
                        ListFooterComponent={this.renderFooter}
                        onEndReached={this.loadMoreData}
                        onEndReachedThreshold={0.1}
                    />
                </View>
            </View>
        </View>
    }
}
const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    const { hasNetwork } = state.PageState;
    const { currentBikeId } = state.GarageInfo;
    const currentBikeIndex = state.GarageInfo.spaceList.findIndex(({ spaceId }) => spaceId === currentBikeId);
    const bike = currentBikeIndex === -1 ? null : state.GarageInfo.spaceList[currentBikeIndex];
    return { user, hasNetwork, bike };
}
const mapDispatchToProps = (dispatch) => {
    return {
        showAppNavMenu: () => dispatch(appNavMenuVisibilityAction(true)),
        getBikeAlbum: (userId, spaceId, pageNumber, successCallback, errorCallback) => dispatch(getBikeAlbum(userId, spaceId, pageNumber, successCallback, errorCallback)),
        // getPictureList: (pictureIdList) => getPictureList(pictureIdList, (pictureObj) => {
        //     dispatch(updateBikeAlbumAction({ pictureObj }))
        // }, (error) => console.log('getPictureList album error : ', error)),
        clearBikeAlbum: () => dispatch(clearBikeAlbumAction()),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(BikeAlbum);

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
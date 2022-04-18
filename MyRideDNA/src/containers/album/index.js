import React, { Component, createRef, useState } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Animated, Easing, Alert, Text } from 'react-native';
import { connect } from 'react-redux';
import { appNavMenuVisibilityAction, clearAlbumAction, resetErrorHandlingAction, deletePictureFromAlbumAction, deleteUserProfilePictureAction, apiLoaderActions } from '../../actions';
import { IconButton, LinkButton, BasicButton } from '../../components/buttons';
import { APP_COMMON_STYLES, widthPercentageToDP, heightPercentageToDP, PageKeys, THUMBNAIL_TAIL_TAG, POST_TYPE, GET_PICTURE_BY_ID, PORTRAIT_TAIL_TAG, IS_ANDROID, CHAT_CONTENT_TYPE, CUSTOM_FONTS, MEDIUM_TAIL_TAG } from '../../constants';
import { GesturedCarouselModal } from '../../components/modal';
import { Actions } from 'react-native-router-flux';
import { BasicHeader } from '../../components/headers';
import { SquareCard } from '../../components/cards';
import { getAlbum, getUser, makeProfilePicture, handleServiceErrors, sendMessage, deletePictures } from '../../api';
import { DefaultText } from '../../components/labels';
import RNFetchBlob from 'rn-fetch-blob';
import Permissions from 'react-native-permissions';
import CameraRoll from '@react-native-community/cameraroll';
import { Toast } from 'native-base';
import { BasePage } from '../../components/pages';
import { BaseModal } from '../../components/modal';
import ImageViewer from 'react-native-image-viewing'
import { Icon as NBIcon } from 'native-base';
import { Modal } from 'react-native';

const PHOTO_DIMENSION = widthPercentageToDP(98 / 3);
class Album extends Component {
    isLoadingData = false;
    _preference = 15;
    selectedIndex= createRef(0);
    constructor(props) {
        super(props);
        this.state = {
            
            isLoading: false,
            spinValue: new Animated.Value(0),
            pageNumber: 0,
            hasRemainingList: false,
            showPictureModal: false,
            showOptionsModal: false,
            showSwipingPictureModal: false,
            isSelectMode: props.isSelectMode || false,
            isMultiSelect: props.isMultiSelect || false,
            selectedPhotos: [],
            showDeletePhotoModal: false,
            albumList:[]
        };
    }
    componentDidMount() {
        this._preference = parseInt((heightPercentageToDP(100) / PHOTO_DIMENSION) * 3);
        this._preference += 3 - (this._preference % 3);
        this.fetchAlbum();

    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.hasNetwork === false && this.props.hasNetwork === true) {
            // this.retryApiFunc();
            this.retryApiFunction();
        }

        if (prevProps.isRetryApi === false && this.props.isRetryApi === true) {
            if (Actions.currentScene === this.props.lastApi.currentScene) {
                Alert.alert(
                    'Something went wrong ',
                    '',
                    [
                        {
                            text: 'Retry ', onPress: () => {
                                // this.retryApiFunc();
                                this.retryApiFunction();
                                // this._preference = parseInt((heightPercentageToDP(100) / PHOTO_DIMENSION) * 3);
                                // this._preference += 3 - (this._preference % 3);
                                // this.fetchAlbum();
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

console.log("COmment bt NIVE____________________________________________________________",this.props.lastApi);

        if (this.props.lastApi && this.props.lastApi.currentScene === Actions.currentScene) {
            this.props[`${this.props.lastApi.api}`](...this.props.lastApi.params)
        }
    }

    fetchAlbum() {
        this.props.getAlbum(this.props.user.userId, 0, this._preference, (res) => {
            if (res.pictures.length > 0) {
                this.setState({ pageNumber: this.state.pageNumber + 1, hasRemainingList: res.remainingList > 0, })
            }
        }, (er) => { });
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
                this.props.getAlbum(this.props.user.userId, 0, this._preference, (res) => {
                    this.setState({ hasRemainingList: res.remainingList > 0 });
                }, (er) => {
                });
            }
        });
    }

    openPicture = (index) => {
        this.selectedIndex.current=index
        this.setState({ showSwipingPictureModal: true });
    }

    onCancelVisiblePicture = () => { 
        this.setState({ showSwipingPictureModal: false });
        this.selectedIndex.current=null
       }

    albumKeyExtractor = (item) => item.id;

    loadMoreData = ({ distanceFromEnd }) => {
        if (this.state.isLoading === true || distanceFromEnd < 0 || this.state.hasRemainingList === false) return;
        this.setState((prevState) => ({ isLoading: true }), () => {
            this.props.getAlbum(this.props.user.userId, this.state.pageNumber, this._preference, (res) => {
                if (res.pictures.length > 0) {
                    this.setState({ pageNumber: this.state.pageNumber + 1, hasRemainingList: res.remainingList > 0 })
                }
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

    openPostForm = () => {
        console.log(this.selectedIndex.current)
        if (this.selectedIndex.current !==null) {
            console.log('entered')
            const selectedPost = { ...this.props.albumList[this.selectedIndex.current], pictureIds: [{ id: this.props.albumList[this.selectedIndex.current].id }] }
            Actions.push(PageKeys.POST_FORM, { comingFrom: PageKeys.ALBUM, postType: POST_TYPE.ALBUM,currentBikeId: this.props.albumList[this.selectedIndex.current].spaceId?this.props.albumList[this.selectedIndex.current].spaceId:null, selectedPost, isEditablePicture: false });
            this.onCancelVisiblePicture();
            this.selectedIndex.current=null
            // this.hideOptionsModal();
        } else {
            Actions.push(PageKeys.POST_FORM, {
                comingFrom: PageKeys.ALBUM, postType: POST_TYPE.ALBUM, isEditablePicture: true,
            });
        }
    }

    shareMedias = (mediaIds, ids, groupIds, textContent) => {
        if (!mediaIds || (!ids && !groupIds)) return;
        const data = {
            userId: this.props.user.userId, name: this.props.user.name, nickname: this.props.user.nickname,
            senderPictureId: this.props.user.profilePictureId,
            content: textContent,
        };
        if (ids) {
            data.userIds = ids
        }
        if (groupIds) {
            data.groupIds = groupIds
        }
        data.type = CHAT_CONTENT_TYPE.IMAGE;
        data.mediaIds = mediaIds;
        this.props.shareMedias(data);
    }

    // onPressAdvanceRight = () => {
    //     this.setState((prevState) => ({ selectedIndex: prevState.selectedIndex + 1 }));
    // }

    // onPressAdvanceLeft = () => {
    //     this.setState((prevState) => ({ selectedIndex: prevState.selectedIndex - 1 }));
    // }

    componentWillUnmount() {
        this.props.clearAlbum();
    }

    // showOptionsModal = () => this.setState({ showOptionsModal: true });

    // hideOptionsModal = () => this.setState({ showOptionsModal: false });

    checkForWritePermission = async () => {
        try {
            const granted = await Permissions.request(
                IS_ANDROID
                    ? Permissions.PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE
                    : Permissions.PERMISSIONS.IOS.PHOTO_LIBRARY,
                {
                    title: "Storage Permission",
                    message: "App needs access to memory to download the file "
                }
            );
            if (granted === Permissions.RESULTS.GRANTED) {
                this.downloadFile();
            } else {
                Alert.alert(
                    "Permission Denied!",
                    "You need to give storage permission to download the file"
                );
            }
        } catch (err) {
            console.warn(err);
        }
    }

    downloadFile = async () => {
        const photoSelected = this.props.albumList[this.selectedIndex.current];
        const IMG_ID = `${photoSelected.id.replace(THUMBNAIL_TAIL_TAG, '')}`;
        this.onCancelVisiblePicture()
        // this.hideOptionsModal()
        Toast.show({ text: `Downloading the image...` });
        if (IS_ANDROID) {
            try {
                const { dirs } = RNFetchBlob.fs;
                await RNFetchBlob.config({ path: `${dirs.PictureDir}/${IMG_ID}.png` }).fetch('GET', `${GET_PICTURE_BY_ID}${IMG_ID}`);
                await RNFetchBlob.fs.scanFile([{ path: `${dirs.PictureDir}/${IMG_ID}.png`, mime: 'image/png' }]);
                Toast.show({ text: `Image has been saved to the gallery` });
                // RNFetchBlob.android.actionViewIntent(`${dirs.PictureDir}/${IMG_ID}.png`, 'image/png');
            } catch (error) {
                console.log("Error occured: ", error);
            }
        } else {
            try {
                await CameraRoll.saveToCameraRoll(`${GET_PICTURE_BY_ID}${IMG_ID}`, 'photo');
                Toast.show({ text: `Image has been saved to the gallery` });
            } catch (error) {
                console.log("Error occured: ", error);
            }
        }
    }

    makeProfilePicture = () => {
        this.props.makeProfilePicture(this.props.user.userId, this.props.albumList[this.selectedIndex.current].id, (res) => {
            Toast.show({ text: `Profile picture updated successfully` });
            this.props.getUser(this.props.user.userId, (res) => { }, (er) => { })
            this.onCancelVisiblePicture()
            // this.hideOptionsModal()
        }, (er) => { })
    }

    togglePhotoSelection(id) {
        this.setState(prevState => {
            if (prevState.selectedPhotos && prevState.selectedPhotos[id]) {
                const { [id]: deleted, ...otherPhotos } = prevState.selectedPhotos;
                return { selectedPhotos: Object.keys(otherPhotos).length === 0 ? null : otherPhotos };
            } else {
                return prevState.isMultiSelect
                    ? { selectedPhotos: { ...(prevState.selectedPhotos || {}), [id]: true } }
                    : { selectedPhotos: { [id]: true } };
            }
        });
    }

    onPressDoneBtn = () => {
        if (typeof this.props.getSelectedPhotos === 'function') {
            console.log(this.state.selectedPhotos, '  /// selected photos')
            this.props.getSelectedPhotos(Object.keys(this.state.selectedPhotos));
            this.onPressBackButton();
        } else {
            // DOC: Add here code for photo selection handling from the component itself, in case of share photos
        }
    }

    goToChatList = () => {
        // this.hideOptionsModal();
        Actions.push(PageKeys.CHAT_LIST, { isShareMode: true, mediaIds: [{ id: this.props.albumList[this.selectedIndex.current].id }], callbackFn: this.shareMedias })
        this.onCancelVisiblePicture();
    }

    // openDeletePhotoModal = () => this.setState({ showOptionsModal:false,showDeletePhotoModal:true });

    hideDeletePhotoModal = () => {
        this.selectedIndex.current=null
       return this.setState({ showOptionsModal: false, showSwipingPictureModal: false })
    
    };

    deletePicture = () => {
        let pictureList = [];
        const selectedPicture = this.props.albumList[this.selectedIndex.current]
        pictureList.push({ pictureName: selectedPicture.id, data: selectedPicture.date })
        this.props.deletePictures(this.props.user.userId, pictureList, (res) => {
            if (selectedPicture.id === this.props.user.profilePictureId) {
                this.props.deleteUserProfilePicture();
            }
            this.hideDeletePhotoModal()
        }, (er) => { })
    }

    render() {
console.log("*******************************CHECKING FOR PROPS BY NIVE********************************",this.props)

        const {albumList, user, showLoader } = this.props;
        const { selectedIndex, showOptionsModal, showSwipingPictureModal, isSelectMode, selectedPhotos, isMultiSelect, showDeletePhotoModal } = this.state;
        const spin = this.state.spinValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg']
        });
        return <BasePage defaultHeader={false} showLoader={showLoader} rootContainerSafePadding={APP_COMMON_STYLES.headerHeight + (IS_ANDROID ? 0 : 5)}>
            {
            <ImageViewer   HeaderComponent={()=>{
                const [showDeleteModel,setshowDeleteModel]=useState(false)
                const [showOptionModel,setshowOptionModel]=useState(false)

                let showOptionModal = () => setshowOptionModel(true);

                let hideOptionModal = () => setshowOptionModel(false); 
                        let changeDeleteModelState=()=>{
                            setshowDeleteModel(true)
                        }
                        let hideDeletePhotoModal=()=>{
                            setshowDeleteModel(false)
                            this.hideDeletePhotoModal()
                        }
                return <View style={{height:IS_ANDROID?heightPercentageToDP(6):heightPercentageToDP(10),display:'flex',flexDirection:'row',justifyContent:'flex-end',alignItems:'flex-end',backgroundColor:'rgba(0, 0, 0, 0.37)'}}>
                    <View style={{width:100,height:50,display:'flex',flexDirection:'row',justifyContent:'space-evenly',alignItems:'center'}}>
                     <IconButton style={styles.showOptionModal} iconProps={{ name: 'options', type: 'SimpleLineIcons', style: { color: '#fff', fontSize: 20 } }} onPress={showOptionModal} />
                    <NBIcon name='close' fontSize={30} style={{ color: '#fff' }} onPress={this.onCancelVisiblePicture} />
                    </View>
                    {showOptionModel && 
                                <BaseModal containerStyle={APP_COMMON_STYLES.optionsModal} isVisible={showOptionModel} onCancel={hideOptionModal} onPressOutside={hideOptionModal}>
                                    <View style={APP_COMMON_STYLES.optionsContainer}>
                                    <LinkButton style={APP_COMMON_STYLES.optionBtn} title='EDIT PHOTO' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={this.openPostForm} />
                                    <LinkButton style={APP_COMMON_STYLES.optionBtn} title='DELETE PHOTO' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={changeDeleteModelState} />
                                    <LinkButton style={APP_COMMON_STYLES.optionBtn} title='MAKE COVER PHOTO' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={this.makeProfilePicture} />
                                    <LinkButton style={APP_COMMON_STYLES.optionBtn} title='SAVE PHOTO' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={this.checkForWritePermission} />
                                    <LinkButton style={APP_COMMON_STYLES.optionBtn} title='SHARE PHOTO' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={this.goToChatList} />
                                <BaseModal containerStyle={{ justifyContent: 'center', alignItems: 'center' }} isVisible={showDeleteModel} onCancel={hideDeletePhotoModal} >
                             <View style={styles.deleteBoxCont}>
                                 <DefaultText style={styles.deleteTitle}>Delete Photo</DefaultText>
                             <DefaultText numberOfLines={3} style={styles.deleteText}>Are you sure You Want to delete this photo? You will not be able to undo this action</DefaultText>
                                 <View style={styles.btnContainer}>
                                     <BasicButton title='CANCEL' style={[styles.actionBtn, { backgroundColor: '#8D8D8D' }]} titleStyle={styles.actionBtnTxt} onPress={hideDeletePhotoModal} />
                                     <BasicButton title='CONFIRM' style={styles.actionBtn} titleStyle={styles.actionBtnTxt} onPress={this.deletePicture} />
                                 </View>
                             </View>
                         </BaseModal>
                     </View>
                          </BaseModal>
                }
                </View>
            }}   images={albumList.map(image=>{
                        return {
                            ...image,uri: `${GET_PICTURE_BY_ID}${image.id.replace(THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG)}`
                        }
                    })}  visible={showSwipingPictureModal}  FooterComponent={(img)=>{
                        return   ( <View style={{ height: 100,display:'flex',flexDirection:'column',justifyContent:'flex-end',backgroundColor:'rgba(0, 0, 0, 0.37)'}}>
                                <DefaultText style={{ fontSize: 16, color: 'white',marginLeft:20 }} text={albumList[img.imageIndex].description} numberOfLines={2}/>
                                <Text style={{ fontSize: 16, color: 'white',textAlign:'center',marginBottom:19, }} >{(img.imageIndex+1)+' / '+albumList.length}</Text>
                                
                                </View>)
                    }} imageIndex={this.selectedIndex.current} onRequestClose={this.onCancelVisiblePicture} onImageIndexChange={(index)=>{
                        this.selectedIndex.current=index
                        console.log(this.selectedIndex.current,'///current')
                    }} />
            // <GesturedCarouselModal isVisible={showSwipingPictureModal} onCancel={this.onCancelVisiblePicture}
            //     pictureIds={albumList}
            //     isGestureEnable={true}
            //     isZoomEnable={true}
            //     initialCarouselIndex={selectedIndex}
            //     headerChildren={
            //         <IconButton style={styles.showOptionModal} iconProps={{ name: 'options', type: 'SimpleLineIcons', style: { color: '#fff', fontSize: 20 } }} onPress={this.showOptionsModal} />
                }
                    
                {/* {this.state.showOptionsModal && <BaseModal containerStyle={APP_COMMON_STYLES.optionsModal} isVisible={showOptionsModal} onCancel={this.hideOptionsModal} onPressOutside={this.hideOptionsModal}>
                    <View style={APP_COMMON_STYLES.optionsContainer}>
                        <LinkButton style={APP_COMMON_STYLES.optionBtn} title='EDIT PHOTO' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={this.openPostForm} />
                        <LinkButton style={APP_COMMON_STYLES.optionBtn} title='DELETE PHOTO' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={this.openDeletePhotoModal} />
                        <LinkButton style={APP_COMMON_STYLES.optionBtn} title='MAKE COVER PHOTO' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={this.makeProfilePicture} />
                        <LinkButton style={APP_COMMON_STYLES.optionBtn} title='SAVE PHOTO' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={this.checkForWritePermission} />
                        <LinkButton style={APP_COMMON_STYLES.optionBtn} title='SHARE PHOTO' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={this.goToChatList} />
                        <BaseModal containerStyle={{ justifyContent: 'center', alignItems: 'center' }} isVisible={showDeletePhotoModal} onCancel={this.hideDeletePhotoModal} >
                            <View style={styles.deleteBoxCont}>
                                <DefaultText style={styles.deleteTitle}>Delete Photo</DefaultText>
                                <DefaultText numberOfLines={3} style={styles.deleteText}>Are you sure You Want to delete this photo? You will not be able to undo this action</DefaultText>
                                <View style={styles.btnContainer}>
                                    <BasicButton title='CANCEL' style={[styles.actionBtn, { backgroundColor: '#8D8D8D' }]} titleStyle={styles.actionBtnTxt} onPress={this.hideDeletePhotoModal} />
                                    <BasicButton title='CONFIRM' style={styles.actionBtn} titleStyle={styles.actionBtnTxt} onPress={this.deletePicture} />
                                </View>
                            </View>
                        </BaseModal>
                    </View>
                </BaseModal>} */}
            {/* </GesturedCarouselModal> */}
            
            <BasicHeader
                leftIconProps={{ reverse: true, name: 'md-arrow-round-back', type: 'Ionicons', onPress: this.onPressBackButton }}
                title={isSelectMode ? selectedPhotos ? `${Object.keys(selectedPhotos).length} selected` : 'Select a photo' : 'My Photos'}
                rightIconProps={isSelectMode ? null : { reverse: true, name: 'md-add', type: 'Ionicons', containerStyle: styles.rightIconPropsStyle, style: { color: '#fff', fontSize: 19 }, onPress: this.openPostForm }}
                rightComponent={isSelectMode
                    ? selectedPhotos
                        ? <LinkButton style={{ borderRadius: 30, width: 85, justifyContent: 'center', alignItems: 'center', paddingVertical: 3, paddingHorizontal: 15, backgroundColor: APP_COMMON_STYLES.infoColor }} title={'DONE'} titleStyle={{ color: '#FFFFFF', fontFamily: CUSTOM_FONTS.robotoBold }}
                            onPress={this.onPressDoneBtn} />
                        : <LinkButton style={{ borderRadius: 30, width: 85, justifyContent: 'center', alignItems: 'center', borderColor: '#FFFFFF', borderWidth: 1, paddingVertical: 3, paddingHorizontal: 15 }} title={'CANCEL'} titleStyle={{ color: '#FFFFFF', fontFamily: CUSTOM_FONTS.robotoBold }}
                            onPress={this.onPressBackButton} />
                    : null} />
            <View style={{ flex: 1 }}>
                <FlatList

                    keyboardShouldPersistTaps='always'
                    showsVerticalScrollIndicator={false}
                    numColumns={3}
                    data={albumList}
                    extraData={this.state.selectedPhotos}
                    columnWrapperStyle={styles.columnWrapper}
                    keyExtractor={this.albumKeyExtractor}
                    renderItem={({ item, index }) => {
                        // console.log(item)
                        return (
                        <View>
                            <SquareCard
                                image={item.id ? `${GET_PICTURE_BY_ID}${item.id.replace(THUMBNAIL_TAIL_TAG, PORTRAIT_TAIL_TAG)}` : null}
                                imageStyle={[styles.imageStyle, index % 3 === 1 ? { marginHorizontal: widthPercentageToDP(1) } : null]}
                                onPress={isSelectMode ? () => this.togglePhotoSelection(item.id) : () => this.openPicture(index)}
                            />
                            {
                                isSelectMode
                                    ? selectedPhotos && selectedPhotos[item.id]
                                        ? <IconButton style={{ backgroundColor: APP_COMMON_STYLES.infoColor, position: 'absolute', bottom: 10, right: 10, width: 30, height: 30, borderRadius: 15 }} iconProps={{ name: 'check', type: 'Entypo', style: { color: '#FFFFFF' } }} />
                                        : isMultiSelect ? <View style={{ position: 'absolute', bottom: 10, right: 10, backgroundColor: 'rgba(255,255,255, 0.4)', width: 30, height: 30, borderRadius: 15 }} /> : null
                                    : null
                            }
                        </View>
                    )}}
                    ListFooterComponent={this.renderFooter}
                    onEndReached={this.loadMoreData}
                    onEndReachedThreshold={0.3}
                />
                {
                    this.props.hasNetwork === false && albumList.length === 0 && <View style={{ flexDirection: 'column', justifyContent: 'space-between', position: 'absolute', top: heightPercentageToDP(20), left: widthPercentageToDP(27), height: 100, }}>
                        <IconButton iconProps={{ name: 'broadcast-tower', type: 'FontAwesome5', style: { fontSize: 60, color: '#505050' } }} />
                        <DefaultText style={{ alignSelf: 'center', fontSize: 14 }}>Please Connect To Internet</DefaultText>
                    </View>
                }
            </View>
        </BasePage>
    }
}
const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    const { hasNetwork, lastApi, isRetryApi, pageNumber, showLoader } = state.PageState
    const { albumList } = state.Album
    return { user, hasNetwork, albumList, pageNumber, showLoader, lastApi, isRetryApi };
}
const mapDispatchToProps = (dispatch) => {
    return {
        shareMedias: (requestBody) => dispatch(sendMessage(requestBody)),
        showAppNavMenu: () => dispatch(appNavMenuVisibilityAction(true)),
        getAlbum: (userId, pageNumber, preference, successCallback, errorCallback) => dispatch(getAlbum(userId, pageNumber, preference, successCallback, errorCallback)),
        makeProfilePicture: (userId, pictureId, successCallback) => makeProfilePicture(userId, pictureId)
            .then(res => {
                console.log("makeProfilePicture success: ", res);
                typeof successCallback === 'function' && successCallback(res);
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }));
            })
            .catch(er => {
                console.log("makeProfilePicture error: ", er);
                handleServiceErrors(er, [userId, pictureId, successCallback], 'makeProfilePicture', false, true);
            }),
        getUser: (userId, successCallback, errorCallback) => dispatch(getUser(userId, successCallback, errorCallback)),
        clearAlbum: () => dispatch(clearAlbumAction()),
        deletePictures: (userId, pictureList, successCallback, errorCallback) => {
            dispatch(apiLoaderActions(true));
            deletePictures(userId, pictureList)
                .then(res => {
                    console.log('deletePictures sucess : ', res.data)
                    dispatch(apiLoaderActions(false));
                    dispatch(deletePictureFromAlbumAction(pictureList))
                    dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }));
                    typeof successCallback === 'function' && successCallback(res)
                })
                .catch(er => {
                    dispatch(apiLoaderActions(false));
                    console.log('deletePictures error : ', er)
                    handleServiceErrors(er, [userId, pictureList, successCallback, errorCallback], 'deletePictures', false, true);
                })
        },
        deleteUserProfilePicture: () => dispatch(deleteUserProfilePictureAction()),
        resetErrorHandling: (state) => dispatch(resetErrorHandlingAction({ comingFrom: 'album', isRetryApi: state })),
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
        height: PHOTO_DIMENSION,
        width: PHOTO_DIMENSION
    },
    columnWrapper: {
        justifyContent: 'flex-start',
        marginBottom: widthPercentageToDP(1)
    },
    topIconContainer: {
        position: 'absolute',
        top: heightPercentageToDP(2.5),
        right: widthPercentageToDP(8),
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: 80
    },
    closeIcon: {
        fontSize: widthPercentageToDP(9),
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
    },
    deleteBoxCont: {
        height: 263,
        width: 327,
        backgroundColor: '#F4F4F4',
        borderRadius: 20,
        padding: 31,
        paddingRight: 40
    },
    deleteTitle: {
        color: '#585756',
        fontFamily: CUSTOM_FONTS.robotoBold,
        fontSize: 20
    },
    deleteText: {
        color: '#585756',
        fontFamily: CUSTOM_FONTS.roboto,
        fontSize: 17,
        letterSpacing: 0.17,
        marginTop: 30
    },
    btnContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20
    },
    actionBtn: {
        height: 35,
        backgroundColor: '#2B77B4',
        width: 125,
        alignSelf: 'center',
        borderRadius: 20,
        marginTop: 20
    },
    actionBtnTxt: {
        letterSpacing: 1.4,
        fontSize: 14,
        fontFamily: CUSTOM_FONTS.robotoBold
    },
});
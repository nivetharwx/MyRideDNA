import React, { Component, createRef, useState } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Alert, Text } from 'react-native';
import { connect } from 'react-redux';
import { clearBikeAlbumAction, updatePageContentStatusAction, deletePictureFromBikeAlbumAction, resetErrorHandlingAction, updateBikeListAction } from '../../../../../actions';
import { IconButton, LinkButton,BasicButton } from '../../../../../components/buttons';
import { APP_COMMON_STYLES, widthPercentageToDP, PageKeys, THUMBNAIL_TAIL_TAG, POST_TYPE, PORTRAIT_TAIL_TAG, GET_PICTURE_BY_ID, IS_ANDROID, CHAT_CONTENT_TYPE, heightPercentageToDP ,CUSTOM_FONTS, MEDIUM_TAIL_TAG} from '../../../../../constants';
import { BaseModal, GesturedCarouselModal } from '../../../../../components/modal';
import { Actions } from 'react-native-router-flux';
import { SquareCard } from '../../../../../components/cards';
import { getBikeAlbum, getFriendsPicturesBySpaceId, deletePictures, handleServiceErrors, getUser, sendMessage, makeBikeProfilePicture } from '../../../../../api';
import RNFetchBlob from 'rn-fetch-blob';
import Permissions from 'react-native-permissions';
import CameraRoll from '@react-native-community/cameraroll';
import { Toast } from 'native-base';
import { BasePage } from '../../../../../components/pages';
import { DefaultText } from '../../../../../components/labels';
import ImageViewer from 'react-native-image-viewing'
import { Icon as NBIcon } from 'native-base';

const PHOTO_DIMENSION = widthPercentageToDP(98 / 3);
class BikeAlbum extends Component {
    _preference = 15;
    selectedIndex= createRef();
    constructor(props) {
        super(props);
        this.state = {
            
            isLoading: false,
            pageNumber: 0,
            friendsAlbum: [],
            
            showSwipingPictureModal: false,
            hasRemainingList: false,
            showDeletePhotoModal: false,
        };
    }

    componentDidMount() {
        this._preference = parseInt((heightPercentageToDP(100) / PHOTO_DIMENSION) * 3);
        this._preference += 3 - (this._preference % 3);
        
        if (this.props.isEditable) {
            this.fetchAlbum();
        }
        else {
            this.getFriendsPicturesBySpaceId(this.props.friendId, this.props.spaceId, this.state.pageNumber, this._preference)
        }
    }

    fetchAlbum() {
        if (this.props.bike) {
            this.props.getBikeAlbum(this.props.user.userId, this.props.bike.spaceId, 0, this._preference, (res) => {
                if (res.pictures.length > 0) {
                    this.setState({ pageNumber: 1, hasRemainingList: res.remainingList > 0 })
                }
            }, (er) => { });
        }
    }
    componentDidUpdate(prevProps, prevState) {
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

    getFriendsPicturesBySpaceId(friendId, spaceId, pageNumber, preference) {
        this.props.getFriendsPicturesBySpaceId(friendId, spaceId, pageNumber, preference, (res) => {
            if (pageNumber === 0) {
                this.setState((prevState) => ({ friendsAlbum: res.pictures, pageNumber: res.pictures.length > 0 ? prevState.pageNumber + 1 : prevState.pageNumber, isLoading: false }))
            }
            else {
                this.setState((prevState) => ({ friendsAlbum: [...prevState.friendsAlbum, ...res.pictures], pageNumber: res.pictures.length > 0 ? prevState.pageNumber + 1 : prevState.pageNumber, isLoading: false }))
            }
        }, (er) => { })
    }

    onPressBackButton = () => Actions.pop();

    albumKeyExtractor = (item) => item.id;

    loadMoreData = ({ distanceFromEnd }) => {
        if (this.state.hasRemainingList === false || this.state.isLoading === true || distanceFromEnd < 0) return;
        this.setState({ isLoading: true }, () => {
            if (this.props.isEditable) {
                this.props.getBikeAlbum(this.props.user.userId, this.props.bike.spaceId, this.state.pageNumber, this._preference,
                    (res) => {
                        if (res.pictures.length > 0) {
                            this.setState(prevState => ({ pageNumber: prevState.pageNumber + 1, hasRemainingList: res.remainingList > 0, isLoading: false }))
                        }
                        else {
                            this.setState({ isLoading: false })
                        }
                    }, (er) => {
                        this.setState({ isLoading: false })
                    });
            }
            else {
                this.getFriendsPicturesBySpaceId(this.props.friendId, this.props.spaceId, this.state.pageNumber, this._preference)
            }
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

    openPostForm = () => {
        if (this.selectedIndex.current !==null) {
            const selectedPost = { ...this.props.bike.pictures[this.selectedIndex.current], pictureIds: [{ id: this.props.bike.pictures[this.selectedIndex.current].id }] }
            Actions.push(PageKeys.POST_FORM, { comingFrom: Actions.currentScene, postType: POST_TYPE.ALBUM, currentBikeId: this.props.bike.spaceId, selectedPost, isEditablePicture: false });
            this.onCancelVisiblePicture();
          
        } else {
            Actions.push(PageKeys.POST_FORM, { comingFrom: Actions.currentScene, postType: POST_TYPE.ALBUM, currentBikeId: this.props.bike.spaceId, isEditablePicture: true });
        }
    }

    openPicture = (index) => {
        this.selectedIndex.current=index
        this.setState({ showSwipingPictureModal: true });
    }

    onCancelVisiblePicture = () => {
        this.setState({  showSwipingPictureModal: false ,showDeletePhotoModal:false});
        this.selectedIndex.current=null
    }

    // showOptionsModal = () => this.setState({ showOptionsModal: true });

    // hideOptionsModal = () => this.setState({ showOptionsModal: false });

    // hideDeletePhotoModal = () => this.setState({ showDeletePhotoModal: false,  showSwipingPictureModal: false });

    // openDeletePhotoModal = () => this.setState({ showDeletePhotoModal: true });
    // {
    //     Alert.alert(
    //         `Do you want to Delete this picture ?`,
    //         '',
    //         [
    //             {
                    // text: 'Accept ', onPress: () => {
                    //     let pictureList = [];
                    //     pictureList.push({ pictureName: this.props.bike.pictures[this.state.selectedIndex].id, data: this.props.bike.pictures[this.state.selectedIndex].date })
                    //     this.props.deletePictures(this.props.user.userId, pictureList)
                    //     this.hideOptionsModal()
                    //     this.onCancelVisiblePicture()
                    // }
    //             },
    //             { text: 'cancel', onPress: this.hideOptionsModal, style: 'cancel' },
    //         ],
    //         { cancelable: false }
    //     )

    // }
    deletePicture = () => {
            let pictureList = [];
            
            pictureList.push({ pictureName: this.props.bike.pictures[this.selectedIndex.current].id, data: this.props.bike.pictures[this.selectedIndex.current].date })
            this.props.deletePictures(this.props.user.userId, pictureList)
            this.onCancelVisiblePicture()
        }

    makeBikeProfilePicture = () => {
        this.props.makeBikeProfilePicture(this.props.user.userId,this.props.bike.spaceId, this.props.bike.pictures[this.selectedIndex.current].id, (res) => {
            Toast.show({ text: `Bike Profile picture updated successfully` });
            this.props.updateBikeList({spaceId:this.props.bike.spaceId, picture:{id:this.props.bike.pictures[this.selectedIndex.current].id, "isPrivate": false, "date":new Date()}})
            this.onCancelVisiblePicture()
           
        }, (er) => { })
    }

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
        const photoSelected = this.props.bike.pictures[this.selectedIndex.current];
        const IMG_ID = `${photoSelected.id.replace(THUMBNAIL_TAIL_TAG, '')}`;
        this.onCancelVisiblePicture()
        Toast.show({ text: `Downloading the image...` });
        if (IS_ANDROID) {
            try {
                const { dirs } = RNFetchBlob.fs;
                await RNFetchBlob.config({ path: `${dirs.PictureDir}/${IMG_ID}.png` }).fetch('GET', `${GET_PICTURE_BY_ID}${IMG_ID}`);
                await RNFetchBlob.fs.scanFile([{ path: `${dirs.PictureDir}/${IMG_ID}.png`, mime: 'image/png' }]);
                Toast.show({ text: `Image has been saved to the gallery` });
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

    shareMedias = (mediaIds, ids, groupIds, textContent) => {
        if (!mediaIds || (!ids && !groupIds)) return;
        const data = {
            userId: this.props.user.userId, name: this.props.user.name, nickname: this.props.user.nickname,
            senderPictureId: this.props.user.profilePictureId,
            content: textContent
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

    goToChatList = () => {
        Actions.push(PageKeys.CHAT_LIST, { isShareMode: true, mediaIds: [{ id: this.props.bike.pictures[this.selectedIndex.current].id }], callbackFn: this.shareMedias })
        this.onCancelVisiblePicture();
    }

    componentWillUnmount() {
        this.props.clearBikeAlbum();
    }

    render() {
        const { bike, isEditable } = this.props;
        const {  friendsAlbum, showSwipingPictureModal,showDeletePhotoModal } = this.state;
        console.log(isEditable , bike, friendsAlbum)
        if (isEditable && !bike) return <View style={styles.fill} />
        return <BasePage
            heading={'Photos'}
            headerRightIconProps={this.props.isEditable ? { reverse: true, name: 'md-add', type: 'Ionicons', containerStyle: styles.rightIconPropsStyle, style: { color: '#fff', fontSize: 19 }, onPress: this.openPostForm } : null}>
            {/* {selectedIndex > -1 && <GesturedCarouselModal isVisible={showSwipingPictureModal} onCancel={this.onCancelVisiblePicture}
                pictureIds={isEditable ? bike.pictures : friendsAlbum}
                isGestureEnable={true}
                isZoomEnable={true}
                initialCarouselIndex={selectedIndex}
                headerChildren={
                    isEditable ?
                        <IconButton style={styles.showOptionModal} iconProps={{ name: 'options', type: 'SimpleLineIcons', style: { color: '#fff', fontSize: 20 } }} onPress={this.showOptionsModal} />
                        : null
                }
            >
                {isEditable && this.state.showOptionsModal && <BaseModal containerStyle={APP_COMMON_STYLES.optionsModal} isVisible={showOptionsModal} onCancel={this.hideOptionsModal} onPressOutside={this.hideOptionsModal}>
                    <View style={APP_COMMON_STYLES.optionsContainer}>
                        <LinkButton style={APP_COMMON_STYLES.optionBtn} title='EDIT PHOTO' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={this.openPostForm} />
                        <LinkButton style={APP_COMMON_STYLES.optionBtn} title='DELETE PHOTO' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={this.openDeletePhotoModal} />
                        <LinkButton style={APP_COMMON_STYLES.optionBtn} title='MAKE BIKE’s PROFILE PHOTO' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={this.makeBikeProfilePicture} />
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
                </BaseModal>}
            </GesturedCarouselModal>} */}
            {this.selectedIndex.current !== -1 ? 
            <ImageViewer onImageIndexChange={(index)=>{
                this.selectedIndex.current=index
                console.log(this.selectedIndex.current,'///current')
            }} HeaderComponent={()=>{
                        
                        const [showDeleteModel,setshowDeleteModel]=useState(false)
                        const [showOptionModel,setshowOptionModel]=useState(false)

                        let showOptionModal = () => setshowOptionModel(true);
        
                        let hideOptionModal = () => setshowOptionModel(false);
                        let changeDeleteModelState=()=>{
                            setshowDeleteModel(true)
                        }
                        let hideDeletePhotoModal=()=>{
                            setshowDeleteModel(false)
                            this.onCancelVisiblePicture()
                        }
                return <View style={{height:IS_ANDROID?heightPercentageToDP(6):heightPercentageToDP(10),backgroundColor:'rgba(0, 0, 0, 0.37)',display:'flex',flexDirection:'row',justifyContent:'flex-end',alignItems:'flex-end'}}>
                    <View style={{width:100,height:50,display:'flex',flexDirection:'row',justifyContent:isEditable?'space-evenly':'center',alignItems:'center'}}>
                    {isEditable ?<IconButton style={styles.showOptionModal} iconProps={{ name: 'options', type: 'SimpleLineIcons', style: { color: '#fff', fontSize: 20 } }} onPress={showOptionModal} />:null}
                    <NBIcon name='close' fontSize={30} style={{ color: '#fff' }} onPress={this.onCancelVisiblePicture} />
                    {isEditable && showOptionModel && 
                                <BaseModal containerStyle={APP_COMMON_STYLES.optionsModal} isVisible={showOptionModel} onCancel={hideOptionModal} onPressOutside={hideOptionModal}>
                                    <View style={APP_COMMON_STYLES.optionsContainer}>
                                    <LinkButton style={APP_COMMON_STYLES.optionBtn} title='EDIT PHOTO' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={this.openPostForm} />
                                    <LinkButton style={APP_COMMON_STYLES.optionBtn} title='DELETE PHOTO' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={changeDeleteModelState} />
                                    <LinkButton style={APP_COMMON_STYLES.optionBtn} title='MAKE BIKE’s PROFILE PHOTO' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={this.makeBikeProfilePicture} />
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
                </View>
            }}   images={(isEditable ? (bike.pictures?bike.pictures:[]) : friendsAlbum).map(image=>{
                
                        return {
                            ...image,uri: `${GET_PICTURE_BY_ID}${image.id.replace(THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG)}`
                        }
                    })} keyExtractor={(imgaeSrc,index)=>{
                        return index+''
                    }} visible={showSwipingPictureModal} onRequestClose={this.onCancelVisiblePicture} FooterComponent={(img)=>{
                        
                        console.log(isEditable , bike , friendsAlbum)
                        return (<View style={{ height: 100,backgroundColor:'rgba(0, 0, 0, 0.37)',display:'flex',flexDirection:'column',justifyContent:'space-between'}}>
                                <DefaultText style={{ fontSize: 16, color: 'white',marginLeft:20 }} text={(isEditable ? (bike?bike.pictures: [] ) : friendsAlbum)[img.imageIndex].description} numberOfLines={2}/>
                                <Text style={{ fontSize: 16, color: 'white',textAlign:'center',marginBottom:19, }} >{(img.imageIndex+1)+' / '+(isEditable ?  (bike.pictures?bike.pictures: [] ) : friendsAlbum).length}</Text>
                                </View>)
                    }} imageIndex={this.selectedIndex.current} />:null}
            <View style={{ flex: 1 }}>
                <FlatList
                    keyboardShouldPersistTaps='always'
                    contentContainerStyle={{ paddingBottom: this.state.hasRemainingList ? 40 : 0 }}
                    showsVerticalScrollIndicator={false}
                    numColumns={3}
                    data={this.props.isEditable ? bike.pictures : friendsAlbum}
                    columnWrapperStyle={{ justifyContent: 'flex-start', marginBottom: widthPercentageToDP(1) }}
                    keyExtractor={this.albumKeyExtractor}
                    renderItem={({ item, index }) => (
                        <SquareCard
                            image={`${GET_PICTURE_BY_ID}${item.id.replace(THUMBNAIL_TAIL_TAG, PORTRAIT_TAIL_TAG)}`}
                            imageStyle={[styles.imageStyle, index % 3 === 1 ? { marginHorizontal: widthPercentageToDP(1) } : null]}
                            onPress={() => this.openPicture(index)}
                        />
                    )}
                    ListFooterComponent={this.renderFooter}
                    onEndReached={this.loadMoreData}
                    onEndReachedThreshold={0.1}
                />
                {
                    this.props.hasNetwork === false && (this.props.isEditable ? ((bike.pictures && bike.pictures.length === 0) || !bike.pictures) : ((friendsAlbum && friendsAlbum.length === 0) || !friendsAlbum)) && <View style={{ flexDirection: 'column', justifyContent: 'space-between', position: 'absolute', top: heightPercentageToDP(20), left: widthPercentageToDP(27), height: 100, }}>
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
    const { hasNetwork, lastApi, isRetryApi, updatePageContent } = state.PageState;
    const { currentBike: bike } = state.GarageInfo;
    return { user, hasNetwork, lastApi, isRetryApi, bike, updatePageContent };
}
const mapDispatchToProps = (dispatch) => {
    return {
        getBikeAlbum: (userId, spaceId, pageNumber, preference, successCallback, errorCallback) => dispatch(getBikeAlbum(userId, spaceId, pageNumber, preference, successCallback, errorCallback)),
        clearBikeAlbum: () => dispatch(clearBikeAlbumAction()),
        updatePageContentStatus: (status) => dispatch(updatePageContentStatusAction(status)),
        deletePictures: (userId, pictureList) => deletePictures(userId, pictureList)
            .then(res => {
                console.log('deletePictures sucess : ', res.data)
                dispatch(deletePictureFromBikeAlbumAction(pictureList))
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }));
            })
            .catch(er => {
                console.log('deletePictures error : ', er)
                handleServiceErrors(er, [userId, pictureList], 'deletePictures', false, true);
            }),
            makeBikeProfilePicture: (userId, spaceId, pictureId, successCallback) => makeBikeProfilePicture(userId, spaceId, pictureId)
            .then(res => {
                console.log("makeBikeProfilePicture success: ", res.data);
                typeof successCallback === 'function' && successCallback(res);
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }));
            })
            .catch(er => {
                console.log("makeBikeProfilePicture error: ", er);
                handleServiceErrors(er, [userId, spaceId, pictureId, successCallback], 'makeBikeProfilePicture', false, true);
            }),
            updateBikeList:(bike)=> dispatch(updateBikeListAction(bike)),
        getUser: (userId, successCallback, errorCallback) => dispatch(getUser(userId, successCallback, errorCallback)),
        shareMedias: (requestBody) => dispatch(sendMessage(requestBody)),
        getFriendsPicturesBySpaceId: (friendId, spaceId, pageNumber, preference, successCallback, errorCallback) => getFriendsPicturesBySpaceId(friendId, spaceId, pageNumber, preference).then(res => {
            console.log('getFriendsPicturesBySpaceId success : ', res)
            dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }));
            successCallback(res.data)
        }).catch(er => {
            console.log('getFriendsPicturesBySpaceId error : ', er)
            errorCallback(er)
            handleServiceErrors(er, [friendId, spaceId, pageNumber, preference, successCallback, errorCallback], 'getFriendsPicturesBySpaceId', true, true);
        }),
        resetErrorHandling: (state) => dispatch(resetErrorHandlingAction({ comingFrom: 'bike_album', isRetryApi: state })),
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
        height: PHOTO_DIMENSION,
        width: PHOTO_DIMENSION
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
    btnContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20
    },

});
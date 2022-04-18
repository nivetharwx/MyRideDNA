import React, { Component, createRef, useState } from 'react';
import { Text,View, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';
import { GesturedCarouselModal, BaseModal } from '../../components/modal';
import { widthPercentageToDP, APP_COMMON_STYLES, heightPercentageToDP, GET_PICTURE_BY_ID, IS_ANDROID, THUMBNAIL_TAIL_TAG, PORTRAIT_TAIL_TAG, MEDIUM_TAIL_TAG } from '../../constants';
import { SquareCard } from '../../components/cards';
import { getBuddyAlbum } from '../../api';
import { clearAlbumAction } from '../../actions';
import { BasePage } from '../../components/pages';
import { LinkButton, IconButton } from '../../components/buttons';
import RNFetchBlob from 'rn-fetch-blob';
import Permissions from 'react-native-permissions';
import CameraRoll from '@react-native-community/cameraroll';
import {  Toast } from 'native-base';
import { getCurrentProfileState } from '../../selectors';
import { DefaultText } from '../../components/labels';
import ImageViewer from 'react-native-image-viewing';
import { Icon as NBIcon } from 'native-base';

const PHOTO_DIMENSION = widthPercentageToDP(98 / 3);
class BuddyAlbum extends Component {
    isLoadingData = false;
    isLoadingBuddyAlbum = false;
    _preference = 15;
    selectedIndex= createRef(-1);
    constructor(props) {
        super(props);
        this.state = {
            
            isVisiblePicture: false,
            isLoading: false,
            pageNumber: 0,
            hasRemainingList: false,
            showSwipingPictureModal: false,
            isVisibleOptionsModal: false,
        };
    }

    componentDidMount() {
        this._preference = parseInt((heightPercentageToDP(100) / PHOTO_DIMENSION) * 3);
        this._preference += 3 - (this._preference % 3);
        this.props.getBuddyAlbum(this.props.user.userId, this.props.person.userId, this.state.pageNumber, this._preference, undefined, (res) => {
            if (res.pictures.length > 0) {
                this.setState({ pageNumber: this.state.pageNumber + 1, hasRemainingList: res.remainingList > 0 })
            }
        }, (er) => { });
    }

    onPressBackButton = () => Actions.pop();

    openPicture = (index) => {
        this.selectedIndex.current=index
        this.setState({ showSwipingPictureModal: true });
    }


    albumKeyExtractor = (item) => item.id;

    loadMoreData = ({ distanceFromEnd }) => {
        if (this.state.isLoading === true || distanceFromEnd < 0 || this.state.hasRemainingList === false) return;
        this.setState((prevState) => ({ isLoading: true }), () => {
            this.props.getBuddyAlbum(this.props.user.userId, this.props.person.userId, this.state.pageNumber, this._preference, this.props.person.pictures, (res) => {
                if (res.pictures.length > 0) {
                    this.setState({ pageNumber: this.state.pageNumber + 1, hasRemainingList: res.remainingList > 0 })
                }
                this.setState({ isLoading: false });
            }, (er) => this.setState({ isLoading: false }));
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

    componentWillUnmount() {
        this.props.clearAlbum();
    }

    onCancelVisiblePicture = () => this.setState({ showSwipingPictureModal: false });

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
        const photoSelected = this.props.person.pictures[this.selectedIndex.current];
        const IMG_ID = `${photoSelected.id.replace(THUMBNAIL_TAIL_TAG, '')}`;
        this.onCancelVisiblePicture()
        this.hideOptionsModal()
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

    showOptionsModal = () => this.setState({ isVisibleOptionsModal: true });

    hideOptionsModal = () => this.setState({ isVisibleOptionsModal: false });

    render() {
        const { person } = this.props;
        const {  showSwipingPictureModal, isVisibleOptionsModal } = this.state;
        console.log('person:', person)
        return <BasePage heading={'Buddy Photos'} rootContainerSafePadding={IS_ANDROID ? 0 : 5}>
            {this.selectedIndex.current > -1 && <ImageViewer HeaderComponent={()=>{
                  const [showOptionModel,setshowOptionModel]=useState(false)

                  let showOptionModal = () => setshowOptionModel(true);
  
                  let hideOptionModal = () => setshowOptionModel(false); 
                return <View style={{height:IS_ANDROID?heightPercentageToDP(6):heightPercentageToDP(10),display:'flex',flexDirection:'row',backgroundColor:'rgba(0, 0, 0, 0.37)',justifyContent:'flex-end',alignItems:'flex-end'}}>
                    <View style={{width:100,height:50,display:'flex',flexDirection:'row',justifyContent:'space-evenly',alignItems:'center'}}>
                     <IconButton style={styles.showOptionModal} iconProps={{ name: 'options', type: 'SimpleLineIcons', style: { color: '#fff', fontSize: 20 } }} onPress={showOptionModal} />
                    <NBIcon name='close' fontSize={30} style={{ color: '#fff' }} onPress={this.onCancelVisiblePicture} />
                    {showOptionModel && <BaseModal containerStyle={APP_COMMON_STYLES.optionsModal} isVisible={showOptionModel} onCancel={hideOptionModal} onPressOutside={hideOptionModal} >
                                    <View style={APP_COMMON_STYLES.optionsContainer}>
                                        <LinkButton style={APP_COMMON_STYLES.optionBtn} title='SAVE PHOTO' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={this.checkForWritePermission} />
                                    </View>
                                </BaseModal>}
                    </View>
                </View>
            }}   images={(person.pictures?person.pictures:[]).map(image=>{
                        return {
                            ...image,uri: `${GET_PICTURE_BY_ID}${image.id.replace(THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG)}`
                        }
                    })} keyExtractor={(imgaeSrc,index)=>{
                        return index
                    }} visible={showSwipingPictureModal} onRequestClose={this.onCancelVisiblePicture} FooterComponent={(img)=>{
                        return   ( <View style={{ height: 100,display:'flex',flexDirection:'column',justifyContent:'flex-end',backgroundColor:'rgba(0, 0, 0, 0.37)'}}>
                                <DefaultText style={{ fontSize: 16, color: 'white',marginLeft:20 }} text={person.pictures[img.imageIndex].description} numberOfLines={2}/>
                                <Text style={{ fontSize: 16, color: 'white',textAlign:'center',marginBottom:19, }} >{(img.imageIndex+1)+' / '+person.pictures.length}</Text>
                               
                                </View>)
                    }} onImageIndexChange={(index)=>{
                        this.selectedIndex.current=index
                        console.log(this.selectedIndex.current,'///current')
                    }} imageIndex={this.selectedIndex.current} />}
            {/* {selectedIndex > -1 && <GesturedCarouselModal isVisible={showSwipingPictureModal} onCancel={this.onCancelVisiblePicture}
                pictureIds={person.pictures}
                isGestureEnable={true}
                isZoomEnable={true}
                initialCarouselIndex={selectedIndex}
                headerChildren={
                    <IconButton style={styles.showOptionModal} iconProps={{ name: 'options', type: 'SimpleLineIcons', style: { color: '#fff', fontSize: 20 } }} onPress={this.showOptionsModal} />
                }>
                {this.state.isVisibleOptionsModal && <BaseModal containerStyle={APP_COMMON_STYLES.optionsModal} isVisible={isVisibleOptionsModal} onCancel={this.hideOptionsModal} onPressOutside={this.hideOptionsModal}>
                    <View style={APP_COMMON_STYLES.optionsContainer}>
                        <LinkButton style={APP_COMMON_STYLES.optionBtn} title='SAVE PHOTO' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={this.checkForWritePermission} />
                    </View>
                </BaseModal>}
            </GesturedCarouselModal>} */}
            <View style={{ flex: 1 }}>
                <FlatList
                    contentContainerStyle={{ paddingBottom: this.state.hasRemainingList ? 40 : 0 }}
                    showsVerticalScrollIndicator={false}
                    numColumns={3}
                    data={person.pictures}
                    columnWrapperStyle={styles.columnWrapper}
                    keyExtractor={this.albumKeyExtractor}
                    renderItem={({ item, index }) => (
                        <SquareCard
                            image={item.id ? `${GET_PICTURE_BY_ID}${item.id.replace(THUMBNAIL_TAIL_TAG, PORTRAIT_TAIL_TAG)}` : null}
                            imageStyle={[styles.imageStyle, index % 3 === 1 ? { marginHorizontal: widthPercentageToDP(1) } : null]}
                            onPress={() => this.openPicture(index)}
                        />
                    )}
                    initialNumToRender={this._preference}
                    ListFooterComponent={this.renderFooter}
                    onEndReached={this.loadMoreData}
                    onEndReachedThreshold={0.1}
                />
                {
                    this.props.hasNetwork === false && ((person.pictures && person.pictures.length === 0) || !person.pictures) && <View style={{ flexDirection: 'column', justifyContent: 'space-between', height: 100, position: 'absolute', top: heightPercentageToDP(20), left: widthPercentageToDP(27) }}>
                        <IconButton iconProps={{ name: 'broadcast-tower', type: 'FontAwesome5', style: { fontSize: 60, color: '#505050' } }} />
                        <DefaultText style={{ alignSelf: 'center', fontSize: 14 }}>Please Connect To Internet</DefaultText>
                    </View>
                }
            </View>
        </BasePage>
    }
}
const mapStateToProps = (state, props) => {
    const { user } = state.UserAuth;
    const { pageNumber, hasNetwork } = state.PageState
    const { albumList } = state.Album
    return { user, albumList, pageNumber, hasNetwork, person: getCurrentProfileState(state, props) };
}
const mapDispatchToProps = (dispatch) => {
    return {
        getBuddyAlbum: (userId, friendId, pageNumber, preference, buddyAlbum = [], successCallback, errorCallback) => dispatch(getBuddyAlbum(userId, friendId, pageNumber, preference, buddyAlbum, successCallback, errorCallback)),
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
        height: PHOTO_DIMENSION,
        width: PHOTO_DIMENSION
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
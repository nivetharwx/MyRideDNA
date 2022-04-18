import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, ScrollView, View, ImageBackground, Alert, TextInput, FlatList, TouchableOpacity, TouchableWithoutFeedbackBase, TouchableHighlight, TouchableWithoutFeedback } from 'react-native';
import { Actions } from 'react-native-router-flux';
import ImagePicker from 'react-native-image-crop-picker';
import { DefaultText } from '../../components/labels';
import { APP_COMMON_STYLES, PageKeys, CUSTOM_FONTS, heightPercentageToDP, widthPercentageToDP, POST_TYPE, IS_ANDROID, GET_PICTURE_BY_ID, THUMBNAIL_TAIL_TAG, PORTRAIT_TAIL_TAG, RIDE_POINT } from '../../constants';
import { ImageButton, IconButton, LinkButton, BasicButton } from '../../components/buttons';
import { updateJournalAction, replaceJournalAction, updateBikeSpecsAction, editBikeListAction, updateAlbumListAction, resetErrorHandlingAction, replaceAlbumListAction, updateBikeAlbumAction, updateDescInBikeAlbumAction } from '../../actions';
import { IconicList, LabeledInputPlaceholder } from '../../components/inputs';
import { Toast } from 'native-base';
import { createPost, getSpaces, updatePost, updateSource, updateWaypoint, updateDestination, updatePictureDetails, addPictureInAlbum, handleServiceErrors } from '../../api';
import { SelectedImage } from '../../components/images';
import { BasePage } from '../../components/pages';
import RNFetchBlob from 'rn-fetch-blob';
import CameraIcon from '../../assets/img/Camera-Gray.svg'
const CONTAINER_H_SPACE = widthPercentageToDP(6);
const MAX_FILES_SELECTABLE = 6;
const parentWidth = widthPercentageToDP(100)
const childrenWidth = widthPercentageToDP(70 / 3);
const childrenHeight = childrenWidth;
const childrenMargin = (parentWidth - (3 * 94)) / 3;

class PostForm extends Component {
    fieldRefs = [];
    constructor(props) {
        super(props);
        this.state = {
            selectedBikeId: props.currentBikeId || null,
            isPrivate: this.props.selectedPost ? this.props.selectedPost.isPrivate : (props.postType === POST_TYPE.WISH_LIST || props.postType === POST_TYPE.MY_RIDE) ? false : true,
            selectedImgs: this.props.selectedPost && this.props.selectedPost.pictureIds ? this.props.selectedPost.pictureIds.length === 6 ? this.props.selectedPost.pictureIds : [...this.props.selectedPost.pictureIds, { isAddIcon: true, id: 'addIcon' }] : [{ isAddIcon: true, id: 'addIcon' }],
            title: this.props.selectedPost ? this.props.selectedPost.title : '',
            description: this.props.selectedPost ? this.props.selectedPost.description : '',
            bikeList: [],
            isLoadingImage: false,
            scrollEnabled: true,
            deletedIds: [],
            isVisibleAddPicture: false,
            waypointName: this.props.selectedPost && this.props.selectedPost.name ? this.props.selectedPost.name : '',
            waypointDescription: this.props.selectedPost && this.props.selectedPost.description ? this.props.selectedPost.description : '',
            isUploading: false,
        };
    }

    componentDidMount() {
        if (this.props.bike === null) {
            getSpaces(this.props.user.userId, (bikeList) => this.setState({ bikeList }), (er) => console.log(er));
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


    // componentWillUnmount() { this.props.onDismiss && this.props.onDismiss().then((res) => { }); }

    gotoPreviousPage = () => Actions.pop();

    onPressCameraIcon = async () => {
        this.setState({ isLoadingImage: true });
        const currentImages = this.state.selectedImgs.slice(0, this.state.selectedImgs.length - 1);
        try {
            const img = await ImagePicker.openCamera({ mediaType: 'photo', maxFiles: MAX_FILES_SELECTABLE, cropping: false, includeExif: true });
            ImagePicker.openCropper({ height: img.height, width: img.width, path: img.path, hideBottomControls: true, compressImageQuality: img.size > 600000 ? IS_ANDROID ? 0.4 : 0.2 : 1, }).then(image => {
                this.setState({
                    isLoadingImage: false, isVisibleAddPicture: false,
                    selectedImgs: currentImages.length + 1 === MAX_FILES_SELECTABLE
                        ? [...currentImages, { mimeType: image.mime, path: image.path }]
                        : [...currentImages, { mimeType: image.mime, path: image.path }, { isAddIcon: true, id: 'addIcon' }]
                });
            })
        } catch (er) {
            this.setState({ isLoadingImage: false });
            console.log("Error occurd: ", er);
        }
    }

    onPressGalleryIcon = async () => {
        this.setState({ isLoadingImage: true });
        const currentImages = this.state.selectedImgs.slice(0, this.state.selectedImgs.length - 1);
        const remainingLength = MAX_FILES_SELECTABLE - currentImages.length;
        let cancelledImage = 0;
        try {
            const imgs = (await ImagePicker.openPicker({ mediaType: 'photo', cropping: false, multiple: true, maxFiles: remainingLength, }))
                .slice(0, remainingLength).map(({ mime, path, size, height, width }) => ({ mimeType: mime, path: path, size: size, height, width }));
            const compressedImages = imgs.map(item => {
                if (item.path) {
                    return () => ImagePicker.openCropper({ height: item.height, width: item.width, path: item.path, hideBottomControls: true, compressImageQuality: item.size > 600000 ? IS_ANDROID ? 0.4 : 0.2 : 1 }).catch(er => {
                        cancelledImage = cancelledImage + 1;
                    })
                }
            })
            const isLastImage = currentImages.length + imgs.length === MAX_FILES_SELECTABLE;
            var noOfPictureAdded = compressedImages.length - 1;
            this.setState({ selectedImgs: currentImages, isLoadingImage: false, isVisibleAddPicture: false, });
            compressedImages.reduce(async (prevPromise, nextPromise) => {
                await prevPromise;
                const result = await nextPromise();
                console.log('\n\n\ result : ', result);
                if (result) {
                    this.setState(prevState => ({
                        selectedImgs: isLastImage === false && noOfPictureAdded === 0
                            ? [...prevState.selectedImgs, { mimeType: result.mime, path: result.path }, { isAddIcon: true, id: 'addIcon' }]
                            : [...prevState.selectedImgs, { mimeType: result.mime, path: result.path }],

                    }));
                }
                else {
                    this.setState(prevState => ({
                        selectedImgs: cancelledImage > 0 && noOfPictureAdded === 0
                            ? [...prevState.selectedImgs, { isAddIcon: true, id: 'addIcon' }]
                            : [...prevState.selectedImgs]

                    }));
                }
                noOfPictureAdded = noOfPictureAdded - 1;
                return result;
            }, Promise.resolve());
        } catch (er) {
            this.setState({ isLoadingImage: false });
            console.log("Error occurd: ", er);
        }
    }

    getSelectedPhotos = (photoIds) => {
        const { selectedImgs } = this.state;
        const currentImages = selectedImgs.slice(0, selectedImgs.length - 1);
        console.log(currentImages,'  ///// current images ')
        const remainingLength = MAX_FILES_SELECTABLE - currentImages.length;
        const imgs = photoIds.slice(0, remainingLength).map(item => ({ myPhotosId: item }));
        if (currentImages.length + imgs.length === MAX_FILES_SELECTABLE) {
            this.setState({ isVisibleAddPicture: false, selectedImgs: [...currentImages, ...imgs] });
        } else {
            this.setState({ isVisibleAddPicture: false, selectedImgs: [...currentImages, ...imgs, { isAddIcon: true, id: 'addIcon' }] });
        }
    }

    onPressSelectFromAlbum = () => Actions.push(PageKeys.ALBUM, { isSelectMode: true, isMultiSelect: true, getSelectedPhotos: (photoIds) => this.getSelectedPhotos(photoIds) });

    onChangeBike = (val) => this.setState({ selectedBikeId: val });

    onChangePrivacyMode = (val) => this.setState({ isPrivate: val });

    onChangeTitle = (val) => this.setState({ title: val });

    onChangeDescription = (val) => this.setState({ description: val });

    onChangeWaypointName = (val) => this.setState({ waypointName: val });

    onChangeWaypointDescription = (val) => this.setState({ waypointDescription: val });

    imgKeyExtractor = (item) => item.path ? item.path.substring(item.path.lastIndexOf('/') + 1) : item.id;

    unselectImg = (item) => {
        if (item.id) {
            const filteredImgs = this.state.selectedImgs.filter(img => img.id !== item.id);
            this.setState(prevState => ({ selectedImgs: filteredImgs[filteredImgs.length - 1].isAddIcon ? filteredImgs : [...filteredImgs, { isAddIcon: true, id: 'addIcon' }], deletedIds: [...prevState.deletedIds, item.id] }))
        } else if (item.myPhotosId) {
            const filteredImgs = this.state.selectedImgs.filter(img => img.myPhotosId !== item.myPhotosId);
            this.setState(prevState => ({ selectedImgs: filteredImgs[filteredImgs.length - 1].isAddIcon ? filteredImgs : [...filteredImgs, { isAddIcon: true, id: 'addIcon' }], deletedIds: [...prevState.deletedIds, item.myPhotosId] }))
        } else {
            const filteredImgs = this.state.selectedImgs.filter(img => img.path !== item.path);
            this.setState({ selectedImgs: filteredImgs[filteredImgs.length - 1].isAddIcon ? filteredImgs : [...filteredImgs, { isAddIcon: true, id: 'addIcon' }] })
        }
    }

    addMorePicture = () => this.setState({ isVisibleAddPicture: true });

    renderSelectedImg = ({ item, index }) => {
        console.log('\n\n\n item :', item)
        if (item.isAddIcon) {
            console.log('\n\n\n item isAdicon:', item)
            return<TouchableOpacity style={[styles.selImgView, { backgroundColor: '#FFFFFF', borderRadius: widthPercentageToDP(4),}]} onPress={this.addMorePicture}>
                <View style={styles.imgNumContainer}>
                    <IconButton style={styles.addBtnCont} iconProps={{ name: 'add', type: 'MaterialIcons', style: { fontSize: 40, color: '#F5891F' } }} onPress={this.addMorePicture} />
                </View>
            </TouchableOpacity>
        }
        return <View style={styles.selImgView}>
            <ImageBackground source={{ uri: item.path ? item.path : `${GET_PICTURE_BY_ID}${`${item.id ? item.id : item.myPhotosId}`.replace(THUMBNAIL_TAIL_TAG, PORTRAIT_TAIL_TAG)}` }} style={styles.thumbnail}>
                <View style={styles.imgNumContainer}>
                    <DefaultText style={styles.imgNumTxt}>{index + 1}</DefaultText>
                </View>
            </ImageBackground>
            <IconButton style={styles.closeIconContainer} iconProps={{ name: 'close', type: 'Ionicons', style: styles.closeIcon }} onPress={() => this.unselectImg(item, index)} />
        </View>
    }

    onSubmit = () => {
        const { postType, postTypes, user, comingFrom } = this.props;
        const { title, description, isPrivate, selectedBikeId, deletedIds, selectedImgs, waypointDescription, waypointName } = this.state;
        if (selectedImgs.length === 0 && title.trim().length === 0 && description.trim().length === 0) {
            Alert.alert('Please check the fields', 'Please select any image or enter title/description');
            return;
        }
        this.setState({ isUploading: true });
        if (comingFrom === PageKeys.ITINERARY_SECTION) {
            let imageOrder = selectedImgs.reduce((obj, item) => {
                if (item.path) {
                    obj.ids.push('');
                    obj.imgs.push(item);
                } else if ((item.myPhotosId && item.myPhotosId !== 'addIcon') || (item.id && item.id !== 'addIcon')) {obj.ids.push(item.id ? item.id : item.myPhotosId)};
                return obj;
            }, ({ imgs: [], ids: [], }));
            console.log(imageOrder, '//// image orders')
            const update = { name: waypointName, description: waypointDescription };
            if (deletedIds.length > 0) update.deletedIds = deletedIds;
            if (imageOrder.imgs.length > 0) update.pictureList = imageOrder.imgs;
            
            if (imageOrder.ids.findIndex(item => item !== '') !== -1) update.ids = imageOrder.ids;
            console.log('///cordinates   ' ,update)
            switch (this.props.waypointType) {
                case RIDE_POINT.SOURCE: {
                    (update.pictureList || update.ids) && Toast.show({ text: 'Uploading images... We will let you know once it is completed' });
                    this.props.updateSource(update, this.props.selectedPost, this.props.rideId, this.props.updateRideOnMap, this.props.onUpdateSuccess,this.props.onDismiss)
                    setTimeout(this.gotoPreviousPage, 200);
                    break;
                }
                case RIDE_POINT.DESTINATION: {
                    (update.pictureList || update.ids) && Toast.show({ text: 'Uploading images... We will let you know once it is completed' });
                    this.props.updateDestination(update, this.props.selectedPost, this.props.rideId, this.props.updateRideOnMap, this.props.onUpdateSuccess,this.props.onDismiss)
                    setTimeout(this.gotoPreviousPage, 200);
                    break;
                }
                case RIDE_POINT.WAYPOINT: {
                   
                    (update.pictureList || update.ids) && Toast.show({ text: 'Uploading images... We will let you know once it is completed' });
                    const combinedCoordinates = this.props.selectedPost.lng + "." + this.props.selectedPost.lat;
                    this.props.updateWaypoint(update, this.props.selectedPost, this.props.rideId, this.props.index, this.props.updateRideOnMap, combinedCoordinates, this.props.onUpdateSuccess,this.props.onDismiss)
                    setTimeout(this.gotoPreviousPage, 200);
                    break;
                }
                default: null
            }
        } else if (this.props.comingFrom === PageKeys.NEWS_FEED) {
            let postProps = { title, description, isPrivate, postTypeId: postTypes[postType]?postTypes[postType].id:null };
            console.log(postProps,'///// postprops')
            if (selectedImgs.length > 0) {
                let imageOrder = selectedImgs.reduce((obj, item) => {
                    if (item.path) {
                        obj.ids.push('');
                        obj.imgs.push(item);
                    }
                    else if (item.myPhotosId && item.myPhotosId !== 'addIcon') {
                        obj.ids.push(item.myPhotosId)
                    }
                    return obj;
                }, ({ ids: [], imgs: [] }));
                if (imageOrder.imgs.length > 0) postProps.pictures = imageOrder.imgs;
                if (imageOrder.ids.findIndex(item => item !== '') !== -1) postProps.ids = imageOrder.ids;
            }
            postProps.fromIndex = 0;
            postProps.toIndex = selectedImgs[selectedImgs.length - 1].id === 'addIcon' ? selectedImgs.length - 1 : selectedImgs.length;
            if (postProps.pictures || postProps.ids) {
                this.props.createPost(user.userId, selectedBikeId, postType, postProps, true, this.props.comingFrom, (res) => {
                    if (postProps.pictures || postProps.ids) {
                        this.props.updatePost(selectedBikeId, postType, postProps, res.id, true, (res) => this.props.onUpdateSuccess && this.props.onUpdateSuccess(res));
                    }
                });
                Toast.show({ text: 'Uploading images... We will let you know once it is completed' });
                setTimeout(this.gotoPreviousPage, 200);
            } else {
                this.props.createPost(user.userId, selectedBikeId, postType, postProps, true, this.props.comingFrom, (res) => this.props.onUpdateSuccess && this.props.onUpdateSuccess(res));
                setTimeout(this.gotoPreviousPage, 200);
            }
        } else {
            let postProps = { title, description, isPrivate, postTypeId: postTypes[postType]?postTypes[postType].id:null };
            if (selectedImgs.length > 0) {
                let imageOrder = selectedImgs.reduce((obj, item) => {
                    if (item.path) {
                        obj.ids.push('');
                        obj.imgs.push(item);
                    }
                    else if (item.myPhotosId && item.myPhotosId !== 'addIcon') {
                        obj.ids.push(item.myPhotosId)
                    }
                    return obj;
                }, ({ ids: [], imgs: [] }));
                if (imageOrder.imgs.length > 0) postProps.pictures = imageOrder.imgs;
                if (imageOrder.ids.findIndex(item => item !== '') !== -1) postProps.ids = imageOrder.ids;
            }
            if (this.props.selectedPost) {
                if (this.props.postType === POST_TYPE.ALBUM) {
                    const pictureDetail = { description: this.state.description, id: this.props.selectedPost.id, isPrivate: this.state.isPrivate };
                    if (selectedBikeId) {
                        pictureDetail.spaceId = selectedBikeId;
                    }
                    this.props.updatePictureDetails(pictureDetail, this.props.user.userId, (res) => this.props.onUploadSuccess && this.props.onUploadSuccess(res));
                    setTimeout(this.gotoPreviousPage, 200);
                } else {
                    if (deletedIds.length > 0) postProps.deletedIds = deletedIds;
                    this.props.updatePost(selectedBikeId, postType, postProps, this.props.selectedPost.id, true, (res) => this.props.onUpdateSuccess && this.props.onUpdateSuccess(res));
                    (postProps.pictures || postProps.ids) && Toast.show({ text: 'Uploading images... We will let you know once it is completed' });
                    setTimeout(this.gotoPreviousPage, 200);
                }
            } else {
                postProps.fromIndex = 0;
                postProps.toIndex = selectedImgs[selectedImgs.length - 1].id === 'addIcon' ? selectedImgs.length - 1 : selectedImgs.length;
                if (postProps.pictures || postProps.ids) {
                    const numberOfPicture = postProps.pictures ? postProps.pictures.length : 0 + postProps.ids ? postProps.ids.length : 0;
                    if (postType === POST_TYPE.ALBUM) {
                        Toast.show({ text: `${numberOfPicture} being uploading` });
                        this.promiseAllSetlled(postProps)
                    }
                    else {
                        this.props.createPost(user.userId, selectedBikeId, postType, postProps, true, null, (res) => {
                            this.props.onUploadSuccess && this.props.onUploadSuccess()
                            if ((postProps.pictures || postProps.ids) && postType !== POST_TYPE.ALBUM) {
                                this.props.updatePost(selectedBikeId, postType, postProps, res.id, true);
                            }
                        });
                    }
                    Toast.show({ text: 'Uploading images... We will let you know once it is completed' });
                    setTimeout(this.gotoPreviousPage, 200);
                } else {
                    this.props.createPost(user.userId, selectedBikeId, postType, postProps);
                    setTimeout(this.gotoPreviousPage, 200);
                }
            }
        }
    }

    promiseAllSetlled = (postProps) => {
        const createPostPromises = postProps.pictures.map(item => {
            return this.props.addPictureInAlbum(this.props.user.userId, this.state.selectedBikeId,
                { ...postProps, pictures: item })
        })

        Promise.allSettled(createPostPromises).then((result) => {
            result.map(picture => {
                if (picture.status === 'fulfilled') {
                    if (this.props.comingFrom === PageKeys.BIKE_ALBUM) {
                        this.props.updateBikeAlbum(picture.value.data.pictureList)
                    }
                    else {
                        this.props.replaceAlbumList(picture.value.data.pictureList)
                    }
                }
            })
        });

    }
    getHeading() {
        if (this.props.comingFrom === PageKeys.ITINERARY_SECTION) {
            return 'Edit Waypoint'
        }
        else {
            switch (this.props.postType) {
                case POST_TYPE.WISH_LIST: return this.props.selectedPost ? 'Edit Item' : 'Add to Wish List';
                case POST_TYPE.MY_RIDE: return this.props.selectedPost ? 'Edit Item' : 'Add to My Ride';
                case POST_TYPE.ALBUM: return this.props.isEditablePicture ? 'Upload Photo' : 'Edit Photo'
                default: return this.props.selectedPost ? 'Edit Post' : 'New Post';
            }
        }
    }

    renderFormFields = () => {
        const { title, description, selectedBikeId, isPrivate, bikeList, waypointName, waypointDescription } = this.state;
        const { bike } = this.props;
        const BIKE_LIST = [];
        if (!bike) {
            BIKE_LIST.push({ label: 'SELECT A BIKE', value: null });
            bikeList.forEach(bike => BIKE_LIST.push({ label: bike.name, value: bike.spaceId }));
        } else {
            BIKE_LIST.push({ label: bike.name, value: bike.spaceId });
        }
        if (this.props.postType === POST_TYPE.WISH_LIST || this.props.postType === POST_TYPE.MY_RIDE) {
            return <View>
                <View style={{ flex: 1, marginLeft: widthPercentageToDP(12), marginBottom: 100 }}>
                    <LabeledInputPlaceholder
                        containerStyle={{ backgroundColor: '#F4F4F4' }}
                        inputValue={title} inputStyle={{ paddingBottom: 0 }}
                        outerContainer={{ marginTop: IS_ANDROID ? null : heightPercentageToDP(3) }}
                        returnKeyType='next'
                        inputRef={elRef => this.fieldRefs[0] = elRef}
                        onChange={this.onChangeTitle} label='ITEM NAME' labelStyle={styles.labelStyle}
                        hideKeyboardOnSubmit={false}
                        onSubmit={() => this.fieldRefs[1].focus()}
                    />
                    <LabeledInputPlaceholder
                        containerStyle={{ backgroundColor: '#F4F4F4' }}
                        inputValue={description}
                        inputStyle={{ paddingBottom: 0 }}
                        multiline={true}
                        inputRef={elRef => this.fieldRefs[1] = elRef}
                        outerContainer={{ marginTop: IS_ANDROID ? null : heightPercentageToDP(3) }}
                        returnKeyType='next'
                        onChange={this.onChangeDescription} label='ADDITIONAL INFO' labelStyle={styles.labelStyle}
                        hideKeyboardOnSubmit={true}
                        onPress={this.onSubmit}
                    />
                </View>
            </View>
        }
        else if (this.props.postType === POST_TYPE.ALBUM) {
            console.log('\n\n\n Actions currentsceen : ', this.props.comingFrom)
            return <View>
                <View style={{ marginLeft: widthPercentageToDP(12), marginBottom: 20 }}>
                    <TextInput value={description} multiline={true} style={styles.albumDescrArea} onChangeText={this.onChangeDescription} />
                    <View style={{ flexDirection: 'row' }}>
                        <DefaultText style={styles.labelStyle}>PHOTO DESCRIPTION</DefaultText>
                    </View>
                </View>
                <View style={styles.hDivider} />
                <View style={{ marginLeft: widthPercentageToDP(12), marginBottom: 50 }}>
                    <View style={[styles.dropdownContainer, { paddingLeft: 0, marginHorizontal: 0, marginRight: 32, marginTop: 20 }]}>
                        <IconicList
                            disabled={BIKE_LIST.length === 0 || this.props.comingFrom === PageKeys.BIKE_ALBUM}
                            iconProps={IS_ANDROID ? {} : { type: 'MaterialIcons', name: 'arrow-drop-down', style: { color: APP_COMMON_STYLES.infoColor, fontSize: 28 } }}
                            pickerStyle={[{ borderBottomWidth: 0 }, IS_ANDROID ? { flex: 1 } : null]}
                            textStyle={styles.dropdownTxt}
                            selectedValue={selectedBikeId}
                            values={BIKE_LIST}
                            placeholder={bike ? 'CHOOSE A BIKE' : null}
                            outerContainer={{ flex: 1, alignItems: 'flex-end' }}
                            containerStyle={{ flex: 1 }}
                            innerContainerStyle={{ height: 24 }}
                            onChange={this.onChangeBike} />
                    </View>
                    <View style={[styles.switchBtnContainer, { marginLeft: 0 }]}>
                        <LinkButton style={[styles.grayBorderBtn, { marginRight: 17 }, isPrivate ? null : styles.greenLinkBtn]} title='ROAD CREW' titleStyle={[styles.grayBorderBtnText, { color: isPrivate ? '#9A9A9A' : '#fff' }]} onPress={() => isPrivate === true && this.onChangePrivacyMode(false)} />
                        <LinkButton style={[styles.grayBorderBtn, isPrivate ? styles.redLinkBtn : null]} title='ONLY ME' titleStyle={[styles.grayBorderBtnText, { color: isPrivate ? '#fff' : '#9A9A9A' }]} onPress={() => isPrivate === false && this.onChangePrivacyMode(true)} />
                    </View>
                </View>
            </View>
        }
        else if (this.props.comingFrom === PageKeys.ITINERARY_SECTION) {
            return <View style={{ marginLeft: widthPercentageToDP(12), marginTop: heightPercentageToDP(5), marginBottom: 50 }}>
                <LabeledInputPlaceholder
                    containerStyle={{ backgroundColor: '#F4F4F4' }}
                    inputValue={waypointName}
                    inputStyle={{ paddingBottom: 0 }}
                    multiline={true}
                    outerContainer={{ marginTop: IS_ANDROID ? null : heightPercentageToDP(3) }}
                    returnKeyType='next'
                    onChange={this.onChangeWaypointName} label='WAYPOINT NAME' labelStyle={styles.labelStyle}
                    hideKeyboardOnSubmit={true} />
                <LabeledInputPlaceholder
                    containerStyle={{ backgroundColor: '#F4F4F4' }}
                    inputValue={waypointDescription}
                    inputStyle={{ paddingBottom: 0 }}
                    multiline={true}
                    outerContainer={{ marginTop: IS_ANDROID ? null : heightPercentageToDP(3) }}
                    returnKeyType='next'
                    onChange={this.onChangeWaypointDescription} label='ADDITIONAL DESCRIPTION' labelStyle={styles.labelStyle}
                    hideKeyboardOnSubmit={true} />
            </View >
        }
        return <View style={{ flex: 1, marginBottom: 50 }}>
            <View style={styles.rootContainer}>
                <View style={styles.fill}>
                    <TextInput value={title} placeholder='POST TITLE' placeholderTextColor={APP_COMMON_STYLES.infoColor} style={styles.postTitle} autoCapitalize='characters' onChangeText={this.onChangeTitle} />
                    <TextInput value={description} placeholder='Write a caption' placeholderTextColor='#000000' multiline={true} style={styles.descrArea} onChangeText={this.onChangeDescription} />
                </View>
            </View>
            <View style={styles.btmContainer}>
                <View style={styles.dropdownContainer}>
                    <IconicList
                        disabled={BIKE_LIST.length === 0}
                        iconProps={IS_ANDROID ? {} : { type: 'MaterialIcons', name: 'arrow-drop-down', style: { color: APP_COMMON_STYLES.infoColor, fontSize: 28 } }}
                        pickerStyle={[{ borderBottomWidth: 0 }, IS_ANDROID ? { flex: 1 } : null]}
                        textStyle={styles.dropdownTxt}
                        selectedValue={selectedBikeId}
                        values={BIKE_LIST}
                        placeholder={bike ? 'SELECT A BIKE' : null}
                        outerContainer={{ flex: 1, alignItems: 'flex-end' }}
                        containerStyle={{ flex: 1 }}
                        innerContainerStyle={{ height: 24 }}
                        onChange={this.onChangeBike} />
                </View>
                <View style={styles.hDivider} />
                <View style={styles.switchBtnContainer}>
                    <LinkButton style={[styles.grayBorderBtn, { marginRight: 17 }, isPrivate ? null : styles.greenLinkBtn]} title='ROAD CREW' titleStyle={[styles.grayBorderBtnText, { color: isPrivate ? '#9A9A9A' : '#fff' }]} onPress={() => isPrivate === true && this.onChangePrivacyMode(false)} />
                    <LinkButton style={[styles.grayBorderBtn, isPrivate ? styles.redLinkBtn : null]} title='ONLY ME' titleStyle={[styles.grayBorderBtnText, { color: isPrivate ? '#fff' : '#9A9A9A' }]} onPress={() => isPrivate === false && this.onChangePrivacyMode(true)} />
                </View>
            </View>
        </View>
    }

    dragImageKeyExtractor = (item) => item.id || item.path.substring(item.path.lastIndexOf('/') + 1);

    getSubmitBtnTitle() {
        switch (this.props.postType || this.props.comingFrom) {
            case POST_TYPE.WISH_LIST: return this.props.selectedPost ? 'UPDATE' : 'ADD ITEM'
            case POST_TYPE.MY_RIDE: return this.props.selectedPost ? 'UPDATE' : 'ADD ITEM'
            case POST_TYPE.ALBUM: return this.props.isEditablePicture ? 'UPLOAD' : 'UPDATE'
            case PageKeys.ITINERARY_SECTION: return 'UPDATE'
            default: return this.props.selectedPost ? 'UPDATE' : 'POST';
        }
    }

    render() {
        const { postType, showLoader, isEditablePicture } = this.props;
        const { selectedImgs, isVisibleAddPicture } = this.state;
        console.log('\n\n\n selectedImgs : ', selectedImgs)
        return <BasePage heading={this.getHeading()} showLoader={showLoader}>
            <ScrollView scrollEnabled={this.state.scrollEnabled} style={{ backgroundColor: '#fff', }} contentContainerStyle={{ flexGrow: 1, paddingBottom: styles.submitBtn.height }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps='handled'>
                {
                    selectedImgs.length === 1 || isVisibleAddPicture === true
                        ? <View style={[styles.btnContainer, postType === POST_TYPE.MY_RIDE || postType === POST_TYPE.WISH_LIST || postType === POST_TYPE.ALBUM || this.props.comingFrom === PageKeys.ITINERARY_SECTION ? { backgroundColor: '#fff' } : null]}>
                            <View style={styles.imageUploadIconsCont}>
                                <TouchableWithoutFeedback onPress={this.onPressCameraIcon}>        
                                <View style={styles.imageUploadIcon}>
                                    {/* <ImageButton onPress={this.onPressCameraIcon} imageSrc={(this.props.postType && (postType !== POST_TYPE.MY_RIDE && postType !== POST_TYPE.WISH_LIST && postType !== POST_TYPE.ALBUM)) || (this.props.comingFrom !== PageKeys.ITINERARY_SECTION) ? require('../../assets/img/cam-icon-gray.png') : require('../../assets/img/cam-icon.png')} imgStyles={styles.iconStyle} /> */}
                                    {
                                        (this.props.postType && (postType !== POST_TYPE.MY_RIDE && postType !== POST_TYPE.WISH_LIST && postType !== POST_TYPE.ALBUM)) || (this.props.comingFrom !== PageKeys.ITINERARY_SECTION)
                                            ? <TouchableOpacity onPress={this.onPressCameraIcon} style={styles.iconStyle}>
                                                <CameraIcon />
                                            </TouchableOpacity>
                                            : <ImageButton onPress={this.onPressCameraIcon} imageSrc={require('../../assets/img/cam-icon.png')} imgStyles={styles.iconStyle} />
                                    }
                                    <DefaultText style={styles.uploadImageIconLabel}>{' TAKE \nPHOTO'}</DefaultText>
                                </View>
                                </TouchableWithoutFeedback>
                                <TouchableWithoutFeedback onPress={this.onPressGalleryIcon}>
                                <View style={styles.imageUploadIcon}>
                                    <ImageButton onPress={this.onPressGalleryIcon} imageSrc={(this.props.postType && (postType !== POST_TYPE.MY_RIDE && postType !== POST_TYPE.WISH_LIST && postType !== POST_TYPE.ALBUM)) || (this.props.comingFrom !== PageKeys.ITINERARY_SECTION) ? require('../../assets/img/upload-icon-gray.png') : require('../../assets/img/upload-icon-orange.png')} imgStyles={styles.iconStyle} />
                                    <DefaultText style={styles.uploadImageIconLabel}>{'UPLOAD \n PHOTO'}</DefaultText>
                                </View>
                                </TouchableWithoutFeedback>
                                {(this.props.comingFrom !== PageKeys.ALBUM && this.props.comingFrom !== PageKeys.BIKE_ALBUM) ? 
                                <TouchableWithoutFeedback onPress={this.onPressSelectFromAlbum}>
                                <View style={styles.imageUploadIcon}>
                                    <ImageButton onPress={this.onPressSelectFromAlbum} imageSrc={(this.props.postType && (postType !== POST_TYPE.MY_RIDE && postType !== POST_TYPE.WISH_LIST && postType !== POST_TYPE.ALBUM)) || (this.props.comingFrom !== PageKeys.ITINERARY_SECTION) ? require('../../assets/img/photos-icon-gray.png') : require('../../assets/img/photos-icon.png')} imgStyles={styles.iconStyle} />
                                    <DefaultText style={styles.uploadImageIconLabel}>{'SELECT FROM \n MY PHOTOS'}</DefaultText>
                                </View>
                                </TouchableWithoutFeedback>
                                    : null}
                            </View>
                        </View>
                        : postType === POST_TYPE.ALBUM && isEditablePicture === false
                            ? <SelectedImage
                                outerContainer={{ marginTop: 50 }}
                                image={{ uri: selectedImgs[0].path ? selectedImgs[0].path : `${GET_PICTURE_BY_ID}${selectedImgs[0].id ? selectedImgs[0].id.replace(THUMBNAIL_TAIL_TAG, PORTRAIT_TAIL_TAG) : null}` }}
                                onPressCloseImg={() => this.unselectImg(selectedImgs[0])}
                                isEditablePicture={isEditablePicture}
                            />
                            : <View style={{
                                alignSelf: 'center',
                                alignItems: 'center',
                                backgroundColor: '#C4C6C8',
                                paddingBottom: childrenMargin,
                                width: widthPercentageToDP(100),
                            }}>
                                <FlatList
                                    style={styles.listStyles}
                                    numColumns={3}
                                    columnWrapperStyle={styles.imgPreviewArea}
                                    data={selectedImgs}
                                    keyExtractor={this.imgKeyExtractor}
                                    renderItem={this.renderSelectedImg}
                                />
                            </View>
                }
                {this.renderFormFields()}
                <BasicButton disabled={this.state.isLoadingImage || this.state.isUploading} title={this.getSubmitBtnTitle()} style={styles.submitBtn} titleStyle={styles.submitBtnTxt} onPress={this.onSubmit} />
            </ScrollView>
        </BasePage>
    }
}
const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    const { postTypes, showLoader, hasNetwork, lastApi, isRetryApi } = state.PageState;
    const { currentBike: bike } = state.GarageInfo;
    return { user, postTypes, showLoader, bike, hasNetwork, lastApi, isRetryApi };
}
const mapDispatchToProps = (dispatch) => {
    return {
        createPost: (userId, spaceId, postType, postData, isAsync, comingFrom = null, successCallback, errorCallback) => dispatch(createPost(postType, userId, spaceId, postData, isAsync, false, (res) => {
            if (comingFrom !== PageKeys.NEWS_FEED) {
                let numberOfPicture = (postData.pictures ? postData.pictures.length : 0) + (postData.ids ? postData.ids.filter(item => item !== "").length : 0);
                switch (postType) {
                    case POST_TYPE.MY_RIDE:
                        dispatch(updateBikeSpecsAction({ postType, postData: { ...res, numberOfPicUploading: numberOfPicture } }))
                        break;
                    case POST_TYPE.WISH_LIST:
                        dispatch(updateBikeSpecsAction({ postType, postData: { ...res, numberOfPicUploading: numberOfPicture } }))
                        break;
                    case POST_TYPE.JOURNAL:
                        dispatch(updateJournalAction({ updates: [{ ...res, numberOfPicUploading: numberOfPicture }], reset: false, isNewPost: true, }));
                        break;
                    case POST_TYPE.ALBUM:
                        dispatch(replaceAlbumListAction({ pageNumber: 1, isNewPic: true, pictureList: res.pictureList }))
                        break;
                }
            }
            typeof successCallback === 'function' && successCallback(res);
        }, errorCallback)),
        addPictureInAlbum: (userId, spaceId, postData) => addPictureInAlbum(userId, spaceId, postData),
        updatePost: (spaceId, postType, postData, postId, isAsync, successCallback, errorCallback) => dispatch(updatePost(spaceId, postData, postId, isAsync, false, (res) => {
            console.log("updatePost success: ", res);
            switch (postType) {
                case POST_TYPE.MY_RIDE:
                    dispatch(editBikeListAction({ postType, postData: res, id: postId }))
                    break;
                case POST_TYPE.WISH_LIST:
                    dispatch(editBikeListAction({ postType, postData: res, id: postId }))
                    break;
                case POST_TYPE.JOURNAL:
                    dispatch(replaceJournalAction(res));
                    break;
                case POST_TYPE.ALBUM: break;
            }
            typeof successCallback === 'function' && successCallback(res);
        }, errorCallback)),
        updateSource: (updates, point, rideId, updateRideOnMap, successCallback,onDismiss) => dispatch(updateSource(updates, point, rideId, updateRideOnMap, false, successCallback,onDismiss)),
        updateWaypoint: (updates, point, rideId, index, updateRideOnMap, combinedCoordinates, successCallback,onDismiss) => dispatch(updateWaypoint(updates, point, rideId, index, updateRideOnMap, combinedCoordinates, false, successCallback,onDismiss)),
        updateDestination: (updates, point, rideId, updateRideOnMap, successCallback,onDismiss) => dispatch(updateDestination(updates, point, rideId, updateRideOnMap, false, successCallback,onDismiss)),
        updatePictureDetails: (pictureDetails, userId, successCallback) => updatePictureDetails(pictureDetails, userId).then(res => {
            console.log('updatePictureDetails success: ', res.data)
            if (pictureDetails.spaceId) {
                const { spaceId, ...otherBikeDetail } = pictureDetails;
                dispatch(updateDescInBikeAlbumAction(otherBikeDetail))
            }
            dispatch(updateAlbumListAction(pictureDetails))
            dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }));
            successCallback(res);
        }).catch(er => {
            console.log('updatePictureDetails error : ', er)
            handleServiceErrors(er, [pictureDetails, userId], 'updatePictureDetails', true, true);
        }),
        resetErrorHandling: (state) => dispatch(resetErrorHandlingAction({ comingFrom: 'post_form', isRetryApi: state })),
        replaceAlbumList: (pictureList) => dispatch(replaceAlbumListAction({ pageNumber: 1, isNewPic: true, pictureList: pictureList })),
        updateBikeAlbum: (pictureList) => dispatch(updateBikeAlbumAction({ updates: pictureList, reset: false, isNewPic: true, })),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(PostForm);

const styles = StyleSheet.create({
    fill: {
        flex: 1,
    },
    btnContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        backgroundColor: '#C4C6C8',
        height: heightPercentageToDP(30)
    },
    imageUploadIconsCont: {
        paddingHorizontal: 20,
        height: heightPercentageToDP(25),
        width: widthPercentageToDP(100),
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
    },
    imageUploadIcon: {
        alignItems: 'center',
        flex: 1
    },
    iconStyle: {
        width: 41,
        height: 33
    },
    uploadImageIconLabel: {
        letterSpacing: 1.8,
        marginTop: 15,
        fontFamily: CUSTOM_FONTS.robotoSlabBold,
        color: '#000'
    },
    scrollView: {
        flex: 1,
        backgroundColor: '#ffffff'
    },
    rootContainer: {
        flex: 1,
        marginHorizontal: CONTAINER_H_SPACE,
        marginTop: 10
    },
    selImgView: {
        width: childrenWidth,
        height: childrenHeight,
        marginRight: widthPercentageToDP(5)
    },
    imgNumContainer: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imgNumTxt: {
        fontSize: 45,
        color: 'rgba(255,255,255,0.6)',
        fontFamily: CUSTOM_FONTS.robotoBold
    },
    thumbnail: {
        flex: 1,
        width: null,
        height: null
    },
    closeIconContainer: {
        position: 'absolute',
        height: widthPercentageToDP(6),
        width: widthPercentageToDP(6),
        borderRadius: widthPercentageToDP(4),
        backgroundColor: '#f69039',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'flex-end',
        top: heightPercentageToDP(-1.5),
        right: widthPercentageToDP(-3)
    },
    closeIcon: {
        fontSize: 22,
        color: '#fff'
    },
    imgPreviewArea: {
        paddingHorizontal: widthPercentageToDP(3),
        marginTop: 30,
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    listStyles: {
        flexGrow: 0
    },
    hDivider: {
        backgroundColor: '#C4C6C8',
        marginTop: 10,
        height: 1.5
    },
    dropdownContainer: {
        marginHorizontal: CONTAINER_H_SPACE,
        borderRadius: 50,
        borderWidth: 1,
        borderColor: '#B2B2B2',
        paddingLeft: 10
    },
    dropdownTxt: {
        paddingLeft: 10,
        bottom: 6,
        fontFamily: CUSTOM_FONTS.robotoSlabBold,
        color: '#585756',
        fontSize: 12
    },
    switchBtnContainer: {
        flexDirection: 'row',
        marginTop: 20,
        marginLeft: 20
    },
    postTitle: {
        fontSize: 13,
        color: APP_COMMON_STYLES.infoColor,
        fontFamily: CUSTOM_FONTS.robotoSlabBold,
        letterSpacing: 1.2
    },
    descrArea: {
        fontSize: 13,
        marginVertical: 5
    },
    albumDescrArea: {
        fontSize: 13,
        backgroundColor: '#F4F4F4',
        paddingLeft: 4,
        paddingTop: 8,
        minHeight: 34,
        borderBottomWidth: 1,
        marginTop: IS_ANDROID ? null : heightPercentageToDP(3)
    },
    submitBtn: {
        height: 35,
        backgroundColor: '#f69039',
        width: 213,
        alignSelf: 'center',
        borderRadius: 20,
    },
    submitBtnTxt: {
        letterSpacing: 1.4,
        fontSize: 14,
        fontFamily: CUSTOM_FONTS.robotoBold
    },
    labelStyle: {
        fontSize: 11,
        letterSpacing: 1.1,
        fontFamily: CUSTOM_FONTS.robotoSlabBold
    },
    grayBorderBtn: {
        borderWidth: 1,
        borderColor: '#9A9A9A',
        alignItems: 'center',
        width: 80,
        paddingVertical: 5,
        borderRadius: 22
    },
    grayBorderBtnText: {
        fontFamily: CUSTOM_FONTS.robotoSlabBold,
        letterSpacing: 0.5
    },
    greenLinkBtn: {
        backgroundColor: '#2EB959',
        borderColor: '#2EB959'
    },
    redLinkBtn: {
        backgroundColor: '#B92E2E',
        borderColor: '#B92E2E'
    }
});
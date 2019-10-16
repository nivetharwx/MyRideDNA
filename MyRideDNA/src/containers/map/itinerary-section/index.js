import React, { Component } from 'react';
import { StyleSheet, Alert, ActivityIndicator, Animated, FlatList, TextInput, View, Text, ScrollView, Image, ImageBackground, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import { BaseModal } from '../../../components/modal';
import { widthPercentageToDP, heightPercentageToDP, APP_COMMON_STYLES, IS_ANDROID, WindowDimensions, TAB_CONTAINER_HEIGHT, JS_SDK_ACCESS_TOKEN, RIDE_POINT, APP_EVENT_TYPE, THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG } from '../../../constants';
import { Icon as NBIcon, ActionSheet, Tabs, ScrollableTab, TabHeading, Tab, ListItem, Left, Body, Right, Item } from 'native-base';
import { IconButton, BasicButton } from '../../../components/buttons';
import ImagePicker from 'react-native-image-crop-picker';
import { updateSource, updateWaypoint, updateDestination, getWaypointPictureList, updateRide, deleteWaypointPicture } from '../../../api';
import { updateRideAction, updateRideInListAction, apiLoaderActions } from '../../../actions';

const BUTTONS = ["Gallery", "Camera", "Cancel"];
const CANCEL_IDX = 2;
const INDEX_ID_SEPARATOR = '_._';
class ItinerarySection extends Component {
    allImageRef = {};
    oldPosition = {};
    position = new Animated.ValueXY();
    dimensions = new Animated.ValueXY();
    animation = new Animated.Value(0);
    viewImage = null;
    constructor(props) {
        super(props);
        this.state = {
            editingPointId: null,
            selectedImages: null,
            imageSelectionMode: false,
            description: '',
            activeImage: null,
            uploadProgress: {},
        };
    }

    componentDidMount() {
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.ride !== this.props.ride) {
            if (this.props.ride.rideId) {
                if (this.state.selectedImages !== null) {
                    this.setState({ selectedImages: null, imageSelectionMode: false });
                }
                setTimeout(() => {
                    if (this.props.ride.source) {
                        if (this.props.ride.source.pictureIdList && this.props.ride.source.pictureIdList.length > 0 && (!prevProps.ride.source || prevProps.ride.source.pictureIdList !== this.props.ride.source.pictureIdList)) {
                            if (this.state.uploadProgress[RIDE_POINT.SOURCE] === true) {
                                this.setState(prevState => {
                                    const { [RIDE_POINT.SOURCE]: deletedKey, ...others } = prevState.uploadProgress;
                                    return { uploadProgress: { ...others } };
                                });
                            }
                            this.props.getWaypointPictureList(RIDE_POINT.SOURCE, this.props.ride.source.pictureIdList.map(pictureId => pictureId.replace(THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG)));
                        }
                    }
                    this.props.ride.waypoints.forEach((point, idx) => {
                        if (point.pictureIdList && point.pictureIdList.length > 0 && (!prevProps.ride.waypoints[idx] || prevProps.ride.waypoints[idx].pictureIdList !== this.props.ride.waypoints[idx].pictureIdList)) {
                            if (this.state.uploadProgress[idx] === true) {
                                this.setState(prevState => {
                                    const { [idx]: deletedKey, ...others } = prevState.uploadProgress;
                                    return { uploadProgress: { ...others } };
                                });
                            }
                            this.props.getWaypointPictureList(idx, point.pictureIdList.map(pictureId => pictureId.replace(THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG)));
                        }
                    });
                    if (this.props.ride.destination) {
                        if (this.props.ride.destination.pictureIdList && this.props.ride.destination.pictureIdList.length > 0 && (!prevProps.ride.destination || prevProps.ride.destination.pictureIdList !== this.props.ride.destination.pictureIdList)) {
                            if (this.state.uploadProgress[RIDE_POINT.DESTINATION] === true) {
                                this.setState(prevState => {
                                    const { [RIDE_POINT.DESTINATION]: deletedKey, ...others } = prevState.uploadProgress;
                                    return { uploadProgress: { ...others } };
                                });
                            }
                            this.props.getWaypointPictureList(RIDE_POINT.DESTINATION, this.props.ride.destination.pictureIdList.map(pictureId => pictureId.replace(THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG)));
                        }
                    }
                }, 50);
            } else {
                this.setState({
                    editingPointId: null,
                    selectedImages: null,
                    imageSelectionMode: false,
                    description: '',
                    activeImage: null,
                    uploadProgress: {},
                });
            }
            if (this.state.editingPointId !== null) {
                this.setState({ editingPointId: null, description: '' });
            }
        }
    }

    showLargerImage = (id) => {
        const idParts = id.split(INDEX_ID_SEPARATOR);
        let activeImage = null;
        if (idParts[0] === RIDE_POINT.SOURCE) {
            const picIdx = this.props.ride.source.pictureIdList.indexOf(idParts[1]);
            activeImage = this.props.ride.source.pictureList[picIdx];
        } else if (idParts[0] === RIDE_POINT.DESTINATION) {
            const picIdx = this.props.ride.destination.pictureIdList.indexOf(idParts[1]);
            activeImage = this.props.ride.destination.pictureList[picIdx];
        } else {
            const picIdx = this.props.ride.waypoints[idParts[0]].pictureIdList.indexOf(idParts[1]);
            activeImage = this.props.ride.waypoints[idParts[0]].pictureList[picIdx];
        }
        this.allImageRef[id].measure((x, y, width, height, pageX, pageY) => {
            this.oldPosition.x = pageX;
            this.oldPosition.y = pageY;
            this.oldPosition.width = width;
            this.oldPosition.height = height;

            this.position.setValue({ x: pageX, y: pageY });
            this.dimensions.setValue({ x: width, y: height });
        });

        this.setState({ activeImage }, () => {
            this.viewImage.measure((dx, dy, dWidth, dHeight, dPageX, dPageY) => {
                Animated.parallel([
                    Animated.timing(this.position.x, {
                        toValue: 0,
                        duration: 300,
                        // useNativeDriver: true
                    }),
                    Animated.timing(this.position.y, {
                        toValue: heightPercentageToDP(30),
                        duration: 300,
                        // useNativeDriver: true
                    }),
                    Animated.timing(this.dimensions.x, {
                        toValue: widthPercentageToDP(100),
                        duration: 300,
                        // useNativeDriver: true
                    }),
                    Animated.timing(this.dimensions.y, {
                        toValue: heightPercentageToDP(40),
                        duration: 300,
                        // useNativeDriver: true
                    }),
                    Animated.timing(this.animation, {
                        toValue: 1,
                        duration: 300,
                        // useNativeDriver: true
                    }),
                ]).start();
            });
        });
    }

    hideLargerImage = () => {
        Animated.parallel([
            Animated.timing(this.position.x, {
                toValue: this.oldPosition.x,
                duration: 300,
                // useNativeDriver: true
            }),
            Animated.timing(this.position.y, {
                toValue: this.oldPosition.y,
                duration: 300,
                // useNativeDriver: true
            }),
            Animated.timing(this.dimensions.x, {
                toValue: this.oldPosition.width,
                duration: 300,
                // useNativeDriver: true
            }),
            Animated.timing(this.dimensions.y, {
                toValue: this.oldPosition.height,
                duration: 300,
                // useNativeDriver: true
            }),
            Animated.timing(this.animation, {
                toValue: 0,
                duration: 300,
                // useNativeDriver: true
            }),
        ]).start(() => {
            this.setState({ activeImage: null });
        });
    }

    pointKeyExtractor = item => item.id || item.lng + '' + item.lat;

    onPressAddPhotos = (id) => {
        ActionSheet.show(
            {
                options: BUTTONS,
                cancelButtonIndex: CANCEL_IDX,
                title: "Choose option"
            },
            buttonIndex => {
                if (BUTTONS[buttonIndex] === 'Gallery') {
                    this.openGallery(id);
                } else if (BUTTONS[buttonIndex] === 'Camera') {
                    this.openCamera(id);
                }
            }
        )
    }

    openGallery = async (id) => {
        try {
            const images = await ImagePicker.openPicker({
                multiple: true,
                maxFiles: 4,
                width: 300,
                height: 300,
                cropping: false,
                includeBase64: true,
            });
            // DOC: Only first four pictures
            if (images.length > 4) images.length = 4;
            const pictureList = images.reduce((list, img) => {
                list.push({ picture: img.data, mimeType: img.mime });
                return list;
            }, []);
            if (id === RIDE_POINT.SOURCE) {
                this.setState(prevState => ({ uploadProgress: { ...prevState.uploadProgress, [id]: true } }));
                this.props.updateSource({ pictureList }, this.props.ride.source, { rideId: this.props.ride.rideId });
            } else if (id === RIDE_POINT.DESTINATION) {
                this.setState(prevState => ({ uploadProgress: { ...prevState.uploadProgress, [id]: true } }));
                this.props.updateDestination({ pictureList }, this.props.ride.destination, { rideId: this.props.ride.rideId });
            } else {
                this.setState(prevState => ({ uploadProgress: { ...prevState.uploadProgress, [id]: true } }));
                this.props.updateWaypoint({ pictureList }, this.props.ride.waypoints[id], { rideId: this.props.ride.rideId }, id);
            }
        } catch (er) {
            console.log("Error occurd: ", er);
        }
    }

    openCamera = async (id) => {
        try {
            const image = await ImagePicker.openCamera({
                multiple: true,
                maxFiles: 4,
                width: 300,
                height: 300,
                cropping: false, // DOC: Setting this to true (in openCamera) is not working as expected (19-12-2018).
                includeBase64: true,
            });
            // DOC: Only first four pictures
            // if (images.length > 4) images.length = 4;
            // const pictureList = images.reduce((list, img) => {
            //     list.push({ picture: img.data, mimeType: img.mime });
            //     return list;
            // }, []);
            const pictureList = [{ picture: image.data, mimeType: image.mime }];
            if (id === RIDE_POINT.SOURCE) {
                this.setState(prevState => ({ uploadProgress: { ...prevState.uploadProgress, [id]: true } }));
                this.props.updateSource({ pictureList }, this.props.ride.source, { rideId: this.props.ride.rideId });
            } else if (id === RIDE_POINT.DESTINATION) {
                this.setState(prevState => ({ uploadProgress: { ...prevState.uploadProgress, [id]: true } }));
                this.props.updateDestination({ pictureList }, this.props.ride.destination, { rideId: this.props.ride.rideId });
            } else {
                this.setState(prevState => ({ uploadProgress: { ...prevState.uploadProgress, [id]: true } }));
                this.props.updateWaypoint({ pictureList }, this.props.ride.waypoints[id], { rideId: this.props.ride.rideId }, id);
            }
        } catch (er) {
            console.log("Error occurd: ", er);
        }
    }

    onPressEditDescription = (id) => {
        let description = '';
        if (id === this.props.ride.rideId) {
            description = this.props.ride.description;
        } else if (id === RIDE_POINT.SOURCE) {
            description = this.props.ride.source.description;
        } else if (id === RIDE_POINT.DESTINATION) {
            description = this.props.ride.destination.description;
        } else {
            description = this.props.ride.waypoints[id].description;
        }
        this.setState({ editingPointId: id, description });
    }

    onPressSubmitDescription = () => {
        if (this.state.editingPointId === this.props.ride.rideId) {
            this.state.description && this.props.updateRide({ description: this.state.description, rideId: this.props.ride.rideId }, this.props.ride.rideType);
        } else if (this.state.editingPointId === RIDE_POINT.SOURCE) {
            this.state.description && this.props.updateSource({ description: this.state.description }, this.props.ride.source, { rideId: this.props.ride.rideId });
        } else if (this.state.editingPointId === RIDE_POINT.DESTINATION) {
            this.state.description && this.props.updateDestination({ description: this.state.description }, this.props.ride.destination, { rideId: this.props.ride.rideId });
        } else {
            this.state.description && this.props.updateWaypoint({ description: this.state.description }, this.props.ride.waypoints[this.state.editingPointId], { rideId: this.props.ride.rideId }, this.state.editingPointId);
        }
    }

    changeToImageSelectionMode = (index) => {
        if (!this.props.isEditable) return;
        this.setState(prevState => ({ imageSelectionMode: true, selectedImages: { [index]: true } }));
    }

    onSelectImage = (index) => {
        if (this.state.imageSelectionMode === false) {
            this.showLargerImage(index);
            return;
        }
        if (Object.keys(this.state.selectedImages).length > 0) {
            const prevId = Object.keys(this.state.selectedImages)[0].split(INDEX_ID_SEPARATOR)[0];
            if (prevId !== index.split(INDEX_ID_SEPARATOR)[0]) return;
        }
        if (this.state.selectedImages[index]) return this.onUnselectImage(index);
        this.setState(prevState => ({ selectedImages: { ...prevState.selectedImages, [index]: true } }));
    }

    onUnselectImage = (index) => this.setState(prevState => {
        const { [index]: deletedKey, ...otherKeys } = prevState.selectedImages;
        if (Object.keys(otherKeys).length === 0) {
            return { selectedImages: null, imageSelectionMode: false };
        } else {
            return { selectedImages: { ...otherKeys } };
        }
    });

    onDeletePictures = () => {
        const { selectedImages } = this.state;
        const keys = Object.keys(selectedImages);
        const id = keys[0].split(INDEX_ID_SEPARATOR)[0];
        const pictureIdList = keys.map(k => k.split(INDEX_ID_SEPARATOR)[1]);
        this.props.deleteWaypointPicture(this.props.ride, id !== RIDE_POINT.SOURCE && id !== RIDE_POINT.DESTINATION ? parseInt(id) : id, pictureIdList);
    }

    onChangeDescription = (val) => this.setState({ description: val });

    renderRideWaypoint = ({ item, index }) => {
        return <ListItem avatar style={styles.listItem}>
            <Left style={styles.itemLeft}>
                <View style={styles.itemLeftView}>
                    <View style={styles.verticalBorderView}></View>
                    <View style={{ marginVertical: heightPercentageToDP(1), width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                        <NBIcon name='map-marker' type='MaterialCommunityIcons' style={styles.iconLeft} />
                        <Text style={{ textAlign: 'center', fontSize: widthPercentageToDP(5) }}>
                            {
                                item.name
                                    ? `${index + 1}. ${item.name}`
                                    : `Unknown (${item.lat}, ${item.lng})`
                            }
                        </Text>
                    </View>
                    <View style={styles.verticalBorderView}></View>
                </View>
            </Left>
            <Body style={styles.itemBody}>
                {
                    item.description
                        ? this.state.editingPointId === index
                            ? <View style={[styles.ptDescrCont, styles.descrActive]}>
                                <TextInput multiline={true} style={{ flex: 1 }} value={this.state.description} onChangeText={this.onChangeDescription} />
                                <IconButton style={styles.addEditButtonContainer} iconProps={{ name: 'md-checkmark', type: 'Ionicons', style: styles.whiteFont }} onPress={this.onPressSubmitDescription} />
                            </View>
                            : <View style={[styles.ptDescrCont, styles.descrActive]}>
                                <Text style={{ flex: 1 }}>{item.description}</Text>
                                {
                                    this.props.isEditable
                                        ? <IconButton style={styles.addEditButtonContainer} iconProps={{ name: 'edit', type: 'MaterialIcons', style: styles.whiteFont }} onPress={() => this.onPressEditDescription(index)} />
                                        : null
                                }
                            </View>
                        : this.state.editingPointId === index
                            ? <View style={styles.ptDescrCont}>
                                <TextInput multiline={true} style={{ flex: 1 }} placeholder='Add description for this point' value={this.state.description} onChangeText={this.onChangeDescription} />
                                <IconButton style={styles.addEditButtonContainer} iconProps={{ name: 'md-checkmark', type: 'Ionicons', style: styles.whiteFont }} onPress={this.onPressSubmitDescription} />
                            </View>
                            : <View style={styles.ptDescrCont}>
                                <Text style={{ flex: 1 }}>{this.props.isEditable ? `Add description for this point` : `No description for this point`}</Text>
                                {
                                    this.props.isEditable
                                        ? <IconButton style={styles.addEditButtonContainer} iconProps={{ name: 'add', type: 'MaterialIcons', style: styles.whiteFont }} onPress={() => this.onPressEditDescription(index)} />
                                        : null
                                }
                            </View>
                }
                <View style={styles.photosContainer}>
                    {
                        item.pictureList ?
                            item.pictureList.map((photo, idx) => <View key={item.pictureIdList[idx]} style={styles.photoFrame}>
                                <TouchableOpacity style={{ flex: 1 }} onLongPress={() => this.changeToImageSelectionMode(index + INDEX_ID_SEPARATOR + item.pictureIdList[idx])} onPress={() => this.onSelectImage(index + INDEX_ID_SEPARATOR + item.pictureIdList[idx])}>
                                    <Image style={styles.photo} source={{ uri: photo }} ref={imgRef => this.allImageRef[index + INDEX_ID_SEPARATOR + item.pictureIdList[idx]] = imgRef} />
                                    <View style={[styles.selection, { height: this.state.selectedImages && this.state.selectedImages[index + INDEX_ID_SEPARATOR + item.pictureIdList[idx]] ? '100%' : 0 }]}>
                                        <NBIcon name='md-checkmark' type='Ionicons' style={styles.whiteFont}></NBIcon>
                                    </View>
                                </TouchableOpacity>
                            </View>)
                            : item.pictureIdList ?
                                item.pictureIdList.map((photo, idx) => <View key={item.pictureIdList[idx]} style={styles.photoFrame}>
                                    <Image style={styles.photo} source={require('../../../assets/img/placeholder-image.jpg')} />
                                </View>)
                                : null
                    }
                    {
                        this.props.isEditable
                            ? !item.pictureIdList || item.pictureIdList.length < 4
                                ? this.state.uploadProgress[index] === true
                                    ? <View style={styles.photoFramePlaceholder}>
                                        <Text style={styles.whiteFont}>Uploading</Text>
                                        <ActivityIndicator size='large' color='#FFF' animating={this.state.uploadProgress[index] ? true : false} />
                                    </View>
                                    : <TouchableOpacity style={styles.photoFramePlaceholder} onPress={() => this.onPressAddPhotos(index)}>
                                        <Text style={styles.whiteFont}>Add Photo</Text>
                                        <NBIcon name='add' type='MaterialIcons' style={styles.whiteFont} />
                                    </TouchableOpacity>
                                : null
                            : <Text>No photos added</Text>
                    }
                </View>
            </Body>
        </ListItem>
    }

    render() {
        const { ride, onClose } = this.props;
        const { selectedImages } = this.state;
        if (ride.rideId === null) return null;
        const activeImageStyle = {
            // transform: [{ scale: `${this.dimensions.x / this.oldPosition.width},${this.dimensions.y / this.oldPosition.height}` }],
            // transform: [{ translateX: this.position.x }, { translateY: this.position.y }],
            width: this.dimensions.x,
            height: this.dimensions.y,
            left: this.position.x,
            top: this.position.y
        };
        const animatedCrossOpacity = {
            opacity: this.animation
        };

        return <View style={styles.modalRoot}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        {
                            selectedImages
                                ? <IconButton title={`${Object.keys(selectedImages).length} images`} titleStyle={[styles.whiteFont, { fontWeight: 'bold', fontSize: widthPercentageToDP(4) }]} iconProps={{ name: 'delete', type: 'MaterialCommunityIcons', style: { fontSize: widthPercentageToDP(8), color: '#fff' } }} onPress={this.onDeletePictures} />
                                : <Text style={styles.headerText}>{`${ride.name} - Itinerary`}</Text>
                        }
                    </View>
                    <View style={styles.headerRight}>
                        <IconButton iconProps={{ name: 'window-close', type: 'MaterialCommunityIcons', style: { fontSize: widthPercentageToDP(8), color: '#fff' } }} onPress={onClose} />
                    </View>
                </View>
                <View style={styles.bodyContent}>
                    <ScrollView contentContainerStyle={{ paddingBottom: heightPercentageToDP(1) }}>
                        {
                            ride.description
                                ? this.state.editingPointId === ride.rideId
                                    ? <View style={[styles.mainDescrCont, styles.descrActive]}>
                                        <TextInput multiline={true} style={{ flex: 1 }} value={this.state.description} onChangeText={this.onChangeDescription} />
                                        <IconButton style={styles.addEditButtonContainer} iconProps={{ name: 'md-checkmark', type: 'Ionicons', style: styles.whiteFont }} onPress={this.onPressSubmitDescription} />
                                    </View>
                                    : <View style={[styles.mainDescrCont, styles.descrActive]}>
                                        <Text style={{ flex: 1 }}>{ride.description}</Text>
                                        {
                                            this.props.isEditable
                                                ? <IconButton style={styles.addEditButtonContainer} iconProps={{ name: 'edit', type: 'MaterialIcons', style: styles.whiteFont }} onPress={() => this.onPressEditDescription(ride.rideId)} />
                                                : null
                                        }
                                    </View>
                                : this.state.editingPointId === ride.rideId
                                    ? <View style={styles.mainDescrCont}>
                                        <TextInput multiline={true} style={{ flex: 1 }} placeholder='Add description for ride' value={this.state.description} onChangeText={this.onChangeDescription} />
                                        <IconButton style={styles.addEditButtonContainer} iconProps={{ name: 'md-checkmark', type: 'Ionicons', style: styles.whiteFont }} onPress={this.onPressSubmitDescription} />
                                    </View>
                                    : <View style={styles.mainDescrCont}>
                                        <Text style={{ flex: 1 }}>{this.props.isEditable ? `Add description for ride` : `No description for ride`}</Text>
                                        {
                                            this.props.isEditable
                                                ? <IconButton style={styles.addEditButtonContainer} iconProps={{ name: 'add', type: 'MaterialIcons', style: styles.whiteFont }} onPress={() => this.onPressEditDescription(ride.rideId)} />
                                                : null
                                        }
                                    </View>

                        }
                        {
                            ride.source
                                ? <ListItem avatar style={styles.listItem}>
                                    <Left style={styles.itemLeft}>
                                        <View style={styles.itemLeftView}>
                                            <View style={styles.verticalBorderView}></View>
                                            <View style={{ marginVertical: heightPercentageToDP(1), width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                                                <NBIcon name='map-pin' type='FontAwesome' style={[styles.iconLeft, { paddingLeft: widthPercentageToDP(2) }]} />
                                                <Text style={{ textAlign: 'center', fontSize: widthPercentageToDP(5) }}>
                                                    {
                                                        ride.source.name
                                                            ? ride.source.name
                                                            : `Unknown (${ride.source.lat}, ${ride.source.lng})`
                                                    }
                                                </Text>
                                            </View>
                                            <View style={styles.verticalBorderView}></View>
                                        </View>
                                    </Left>
                                    <Body style={styles.itemBody}>
                                        {
                                            ride.source.description
                                                ? this.state.editingPointId === RIDE_POINT.SOURCE
                                                    ? <View style={[styles.ptDescrCont, styles.descrActive]}>
                                                        <TextInput multiline={true} style={{ flex: 1 }} value={this.state.description} onChangeText={this.onChangeDescription} />
                                                        <IconButton style={styles.addEditButtonContainer} iconProps={{ name: 'md-checkmark', type: 'Ionicons', style: styles.whiteFont }} onPress={this.onPressSubmitDescription} />
                                                    </View>
                                                    : <View style={[styles.ptDescrCont, styles.descrActive]}>
                                                        <Text style={{ flex: 1 }}>{ride.source.description}</Text>
                                                        {
                                                            this.props.isEditable
                                                                ? <IconButton style={styles.addEditButtonContainer} iconProps={{ name: 'edit', type: 'MaterialIcons', style: styles.whiteFont }} onPress={() => this.onPressEditDescription(RIDE_POINT.SOURCE)} />
                                                                : null
                                                        }
                                                    </View>
                                                : this.state.editingPointId === RIDE_POINT.SOURCE
                                                    ? <View style={styles.ptDescrCont}>
                                                        <TextInput multiline={true} style={{ flex: 1 }} placeholder='Add description for source' value={this.state.description} onChangeText={this.onChangeDescription} />
                                                        <IconButton style={styles.addEditButtonContainer} iconProps={{ name: 'md-checkmark', type: 'Ionicons', style: styles.whiteFont }} onPress={this.onPressSubmitDescription} />
                                                    </View>
                                                    : <View style={styles.ptDescrCont}>
                                                        <Text style={{ flex: 1 }}>{this.props.isEditable ? `Add description for source` : `No description for source`}</Text>
                                                        {
                                                            this.props.isEditable
                                                                ? <IconButton style={styles.addEditButtonContainer} iconProps={{ name: 'add', type: 'MaterialIcons', style: styles.whiteFont }} onPress={() => this.onPressEditDescription(RIDE_POINT.SOURCE)} />
                                                                : null
                                                        }
                                                    </View>
                                        }
                                        <View style={styles.photosContainer}>
                                            {
                                                ride.source.pictureList ?
                                                    ride.source.pictureList.map((photo, idx) => <View key={ride.source.pictureIdList[idx]} style={styles.photoFrame}>
                                                        <TouchableOpacity style={{ flex: 1 }} onLongPress={() => this.changeToImageSelectionMode(RIDE_POINT.SOURCE + INDEX_ID_SEPARATOR + ride.source.pictureIdList[idx])} onPress={() => this.onSelectImage(RIDE_POINT.SOURCE + INDEX_ID_SEPARATOR + ride.source.pictureIdList[idx])}>
                                                            <Image style={styles.photo} source={{ uri: photo }} ref={imgRef => this.allImageRef[RIDE_POINT.SOURCE + INDEX_ID_SEPARATOR + ride.source.pictureIdList[idx]] = imgRef} />
                                                            <View style={[styles.selection, { height: this.state.selectedImages && this.state.selectedImages[RIDE_POINT.SOURCE + INDEX_ID_SEPARATOR + ride.source.pictureIdList[idx]] ? '100%' : 0 }]}>
                                                                <NBIcon name='md-checkmark' type='Ionicons' style={styles.whiteFont}></NBIcon>
                                                            </View>
                                                        </TouchableOpacity>
                                                    </View>)
                                                    : ride.source.pictureIdList ?
                                                        ride.source.pictureIdList.map((photo, idx) => <View key={ride.source.pictureIdList[idx]} style={styles.photoFrame}>
                                                            <Image style={styles.photo} source={require('../../../assets/img/placeholder-image.jpg')} />
                                                        </View>)
                                                        : null
                                            }
                                            {
                                                this.props.isEditable
                                                    ? !ride.source.pictureIdList || ride.source.pictureIdList.length < 4
                                                        ? this.state.uploadProgress[RIDE_POINT.SOURCE] === true
                                                            ? <View style={styles.photoFramePlaceholder}>
                                                                <Text style={styles.whiteFont}>Uploading</Text>
                                                                <ActivityIndicator size='large' color='#FFF' animating={this.state.uploadProgress[RIDE_POINT.SOURCE] ? true : false} />
                                                            </View>
                                                            : <TouchableOpacity style={styles.photoFramePlaceholder} onPress={() => this.onPressAddPhotos(RIDE_POINT.SOURCE)}>
                                                                <Text style={styles.whiteFont}>Add Photo</Text>
                                                                <NBIcon name='add' type='MaterialIcons' style={styles.whiteFont} />
                                                            </TouchableOpacity>
                                                        : null
                                                    : <Text>No photos added</Text>
                                            }
                                        </View>
                                    </Body>
                                </ListItem>
                                : null
                        }
                        <FlatList
                            extraData={this.state}
                            data={ride.waypoints}
                            renderItem={this.renderRideWaypoint}
                            keyExtractor={this.pointKeyExtractor}
                        // ItemSeparatorComponent={this.renderSeparator}
                        />
                        {
                            ride.destination
                                ? <ListItem avatar style={styles.listItem}>
                                    <Left style={styles.itemLeft}>
                                        <View style={styles.itemLeftView}>
                                            <View style={styles.verticalBorderView}></View>
                                            <View style={{ marginVertical: heightPercentageToDP(1), width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                                                <NBIcon name='flag-variant' type='MaterialCommunityIcons' style={styles.iconLeft} />
                                                <Text style={{ textAlign: 'center', fontSize: widthPercentageToDP(5) }}>
                                                    {
                                                        ride.destination.name
                                                            ? ride.destination.name
                                                            : `Unknown (${ride.destination.lat}, ${ride.destination.lng})`
                                                    }
                                                </Text>
                                            </View>
                                            <View style={styles.verticalBorderView}></View>
                                        </View>
                                    </Left>
                                    <Body style={styles.itemBody}>
                                        {
                                            ride.destination.description
                                                ? this.state.editingPointId === RIDE_POINT.DESTINATION
                                                    ? <View style={[styles.ptDescrCont, styles.descrActive]}>
                                                        <TextInput multiline={true} style={{ flex: 1 }} value={this.state.description} onChangeText={this.onChangeDescription} />
                                                        <IconButton style={styles.addEditButtonContainer} iconProps={{ name: 'md-checkmark', type: 'Ionicons', style: styles.whiteFont }} onPress={this.onPressSubmitDescription} />
                                                    </View>
                                                    : <View style={[styles.ptDescrCont, styles.descrActive]}>
                                                        <Text style={{ flex: 1 }}>{ride.destination.description}</Text>
                                                        {
                                                            this.props.isEditable
                                                                ? <IconButton style={styles.addEditButtonContainer} iconProps={{ name: 'edit', type: 'MaterialIcons', style: styles.whiteFont }} onPress={() => this.onPressEditDescription(RIDE_POINT.DESTINATION)} />
                                                                : null
                                                        }
                                                    </View>
                                                : this.state.editingPointId === RIDE_POINT.DESTINATION
                                                    ? <View style={styles.ptDescrCont}>
                                                        <TextInput multiline={true} style={{ flex: 1 }} placeholder='Add description for destination' value={this.state.description} onChangeText={this.onChangeDescription} />
                                                        <IconButton style={styles.addEditButtonContainer} iconProps={{ name: 'md-checkmark', type: 'Ionicons', style: styles.whiteFont }} onPress={this.onPressSubmitDescription} />
                                                    </View>
                                                    : <View style={styles.ptDescrCont}>
                                                        <Text style={{ flex: 1 }}>{this.props.isEditable ? `Add description for destination` : `No description for destination`}</Text>
                                                        {
                                                            this.props.isEditable
                                                                ? <IconButton style={styles.addEditButtonContainer} iconProps={{ name: 'add', type: 'MaterialIcons', style: styles.whiteFont }} onPress={() => this.onPressEditDescription(RIDE_POINT.DESTINATION)} />
                                                                : null
                                                        }
                                                    </View>
                                        }
                                        <View style={styles.photosContainer}>
                                            {
                                                ride.destination.pictureList ?
                                                    ride.destination.pictureList.map((photo, idx) => <View key={ride.destination.pictureIdList[idx]} style={styles.photoFrame}>
                                                        <TouchableOpacity style={{ flex: 1 }} onLongPress={() => this.changeToImageSelectionMode(RIDE_POINT.DESTINATION + INDEX_ID_SEPARATOR + ride.destination.pictureIdList[idx])} onPress={() => this.onSelectImage(RIDE_POINT.DESTINATION + INDEX_ID_SEPARATOR + ride.destination.pictureIdList[idx])}>
                                                            <Image style={styles.photo} source={{ uri: photo }} ref={imgRef => this.allImageRef[RIDE_POINT.DESTINATION + INDEX_ID_SEPARATOR + ride.destination.pictureIdList[idx]] = imgRef} />
                                                            <View style={[styles.selection, { height: this.state.selectedImages && this.state.selectedImages[RIDE_POINT.DESTINATION + INDEX_ID_SEPARATOR + ride.destination.pictureIdList[idx]] ? '100%' : 0 }]}>
                                                                <NBIcon name='md-checkmark' type='Ionicons' style={styles.whiteFont}></NBIcon>
                                                            </View>
                                                        </TouchableOpacity>
                                                    </View>)
                                                    : ride.destination.pictureIdList ?
                                                        ride.destination.pictureIdList.map((photo, idx) => <View key={ride.destination.pictureIdList[idx]} style={styles.photoFrame}>
                                                            <Image style={styles.photo} source={require('../../../assets/img/placeholder-image.jpg')} />
                                                        </View>)
                                                        : null
                                            }
                                            {
                                                this.props.isEditable
                                                    ? !ride.destination.pictureIdList || ride.destination.pictureIdList.length < 4
                                                        ? this.state.uploadProgress[RIDE_POINT.DESTINATION] === true
                                                            ? <View style={styles.photoFramePlaceholder}>
                                                                <Text style={styles.whiteFont}>Uploading</Text>
                                                                <ActivityIndicator size='large' color='#FFF' animating={this.state.uploadProgress[RIDE_POINT.DESTINATION] ? true : false} />
                                                            </View>
                                                            : <TouchableOpacity style={styles.photoFramePlaceholder} onPress={() => this.onPressAddPhotos(RIDE_POINT.DESTINATION)}>
                                                                <Text style={styles.whiteFont}>Add Photo</Text>
                                                                <NBIcon name='add' type='MaterialIcons' style={styles.whiteFont} />
                                                            </TouchableOpacity>
                                                        : null
                                                    : <Text>No photos added</Text>
                                            }
                                        </View>
                                    </Body>
                                </ListItem>
                                : null
                        }
                    </ScrollView>
                </View>
            </View>
            <View style={StyleSheet.absoluteFill} pointerEvents={this.state.activeImage ? 'auto' : 'none'}>
                <TouchableOpacity style={{ flex: 1, zIndex: 1000, backgroundColor: this.state.activeImage ? 'rgba(0,0,0,0.8)' : 'transparent' }} ref={elRef => this.viewImage = elRef} onPress={this.hideLargerImage}>
                    <Animated.Image
                        source={this.state.activeImage ? { uri: this.state.activeImage } : null}
                        style={[{ resizeMode: 'cover', top: 0, left: 0, height: null, width: null }, activeImageStyle]}
                    ></Animated.Image>
                    {/* <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff' }}>X</Text> */}
                    <Animated.View style={[{ position: 'absolute', top: heightPercentageToDP(27), right: 0, backgroundColor: APP_COMMON_STYLES.infoColor, height: widthPercentageToDP(8), width: widthPercentageToDP(8), borderRadius: widthPercentageToDP(4), alignItems: 'center' }, animatedCrossOpacity]}>
                        <TouchableOpacity onPress={this.hideLargerImage}>
                            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff' }}>X</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </TouchableOpacity>
                {/* <Animated.View style={[{ flex: 1, zIndex: 900, backgroundColor: '#fff', padding: 20, paddingTop: 50, paddingBotton: 10 }, animatedContentStyle]}>
                    <Text>TESING TEXT CONTENT</Text>
                </Animated.View> */}
            </View>
        </View >
    }
}
const mapStateToProps = (state) => {
    const { ride } = state.RideInfo.present;
    const { user } = state.UserAuth;
    return { user, ride };
}
const mapDipatchToProps = (dispatch) => {
    return {
        updateRide: (updates, rideType) => {
            dispatch(apiLoaderActions(true));
            updateRide(updates, () => {
                dispatch(apiLoaderActions(false));
                dispatch(updateRideAction(updates));
                dispatch(updateRideInListAction({ ride: updates, rideType }));
            }, (err) => dispatch(apiLoaderActions(false)))
        },
        updateSource: (updates, point, ride) => dispatch(updateSource(updates, point, ride)),
        updateWaypoint: (updates, point, ride, index) => dispatch(updateWaypoint(updates, point, ride, index)),
        updateDestination: (updates, point, ride) => dispatch(updateDestination(updates, point, ride)),
        getWaypointPictureList: (id, pictureIdList) => dispatch(getWaypointPictureList(id, pictureIdList)),
        deleteWaypointPicture: (ride, id, pictureIdList) => dispatch(deleteWaypointPicture(ride, id, pictureIdList)),
    };
}
export default connect(mapStateToProps, mapDipatchToProps)(ItinerarySection);

const styles = StyleSheet.create({
    modalRoot: {
        backgroundColor: 'rgba(0,0,0,0.3)',
        flex: 1,
        flexDirection: 'row',
        elevation: 20
    },
    container: {
        width: widthPercentageToDP(100),
        height: '100%',
        backgroundColor: '#fff'
    },
    header: {
        backgroundColor: APP_COMMON_STYLES.headerColor,
        height: APP_COMMON_STYLES.headerHeight,
        position: 'absolute',
        zIndex: 100,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerLeft: {

    },
    headerText: {
        color: 'white',
        fontSize: widthPercentageToDP(4),
        fontWeight: 'bold',
        marginLeft: widthPercentageToDP(2),
    },
    bodyContent: {
        flex: 1,
        marginTop: APP_COMMON_STYLES.headerHeight
    },
    listItem: {
        marginBottom: heightPercentageToDP(5),
        marginRight: widthPercentageToDP(1.5)
    },
    itemLeft: {
        flexDirection: 'column',
        width: widthPercentageToDP(25),
        paddingRight: widthPercentageToDP(2),
        // borderRightWidth: 2,
        // borderRightColor: APP_COMMON_STYLES.infoColor,
        paddingTop: 0,
    },
    itemLeftView: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center'
    },
    iconLeft: {
        fontSize: widthPercentageToDP(9),
        color: APP_COMMON_STYLES.infoColor,
        width: widthPercentageToDP(9),
    },
    horizontalBorderView: {
        height: widthPercentageToDP(2),
        width: '100%',
        backgroundColor: APP_COMMON_STYLES.infoColor
    },
    verticalBorderView: {
        flex: 1,
        width: widthPercentageToDP(2),
        backgroundColor: APP_COMMON_STYLES.infoColor
    },
    itemBody: {
        marginLeft: 0,
        borderBottomWidth: 0,
        // borderLeftWidth: 2,
        // borderLeftColor: APP_COMMON_STYLES.infoColor,
        // borderColor: APP_COMMON_STYLES.infoColor,
        paddingLeft: widthPercentageToDP(2)
    },
    mainDescrCont: {
        padding: widthPercentageToDP(2),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: '#DBDBDB',
        minHeight: heightPercentageToDP(10),
        marginVertical: heightPercentageToDP(1),
        marginHorizontal: widthPercentageToDP(1.5),
        borderRadius: widthPercentageToDP(1)
    },
    ptDescrCont: {
        padding: widthPercentageToDP(2),
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#DBDBDB',
        borderRadius: widthPercentageToDP(1)
    },
    descrActive: {
        backgroundColor: 'rgba(0, 118, 180, 0.2)'
    },
    // photosContainer: {
    //     borderBottomColor: 'rgba(0,0,0,0.3)',
    //     borderBottomWidth: 1,
    //     paddingVertical: heightPercentageToDP(1),
    //     paddingRight: widthPercentageToDP(1)
    // },
    // photoFrame: {
    //     width: '100%',
    //     height: heightPercentageToDP(20),
    //     borderWidth: 1,
    //     borderColor: APP_COMMON_STYLES.infoColor,
    //     marginBottom: heightPercentageToDP(0.5)
    // },
    // photo: {
    //     flex: 1,
    //     width: null,
    //     height: null
    // },
    photosContainer: {
        paddingVertical: heightPercentageToDP(1),
        // paddingRight: widthPercentageToDP(1),
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    photoFrame: {
        width: '48%',
        height: heightPercentageToDP(20),
        // borderWidth: 1,
        // borderColor: APP_COMMON_STYLES.infoColor,
        marginBottom: heightPercentageToDP(0.5),
        marginRight: heightPercentageToDP(0.5),
        // borderRadius: widthPercentageToDP(1)
    },
    photoFramePlaceholder: {
        width: '48%',
        backgroundColor: 'rgba(0,0,0,0.6)',
        height: heightPercentageToDP(20),
        borderWidth: 1,
        borderColor: '#fff',
        marginBottom: heightPercentageToDP(0.5),
        marginRight: heightPercentageToDP(0.5),
        justifyContent: 'center',
        alignItems: 'center',
        // borderRadius: widthPercentageToDP(1)
    },
    photo: {
        flex: 1,
        width: null,
        height: null,
    },
    addEditButtonContainer: {
        alignSelf: 'flex-start',
        backgroundColor: APP_COMMON_STYLES.headerColor,
        width: widthPercentageToDP(8),
        height: widthPercentageToDP(8),
        borderRadius: widthPercentageToDP(4)
    },
    selection: {
        position: 'absolute',
        width: '100%',
        overflow: 'hidden',
        backgroundColor: 'rgba(0,0,0,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    whiteFont: {
        color: '#fff'
    }
});
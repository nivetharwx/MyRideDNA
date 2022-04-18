import React, { Component } from 'react';
import {
    View,
    ScrollView,
    Image,
    PermissionsAndroid,
    TouchableWithoutFeedback,
    StyleSheet,
    TouchableOpacity,
    Text,
    BackHandler,
    SafeAreaView,
    Platform
} from 'react-native';
import CameraRoll from '@react-native-community/cameraroll';

import { Icon as NBIcon } from 'native-base';

import RNFetchBlob from 'rn-fetch-blob';
import { WindowDimensions } from '../../constants';
import { Actions } from 'react-native-router-flux';
import { Toast } from 'native-base';
import { ImageLoader } from '../../components/loader';
import { DefaultText } from '../labels';

const MAXIMUM_SELECTION = 10;
const ANDROID_HEADER_HEIGHT = 50;
const IOS_HEADER_HEIGHT = 90;
const HEADER_HEIGHT = Platform.OS === 'android' ? ANDROID_HEADER_HEIGHT : IOS_HEADER_HEIGHT;

export class GalleryView extends Component {
    maximumSelection = 1;
    constructor(props) {
        super(props);
        this.state = {
            media: [],
            selectedImages: new Map(),
            nextCursor: null,
            showLoader: true
        };
        this.maximumSelection = props.maxFiles > MAXIMUM_SELECTION
            ? MAXIMUM_SELECTION
            : props.maxFiles < 0
                ? 1
                : props.maxFiles;
    }

    componentDidMount() {
        this.getGalleryPhotos();
    }

    doBeforePop = () => {

        // Actions.push(PageKeys.GALLERY, {
        //     maxFiles: 6,
        //     onDidDismiss: (selectedFiles) => {
        //         console.log("selectedFiles from map: ", selectedFiles);
        //         return new Promise((resolve, reject) => resolve("Success"));
        //     }
        // });

        if (typeof this.props.onDidDismiss !== 'function') return Actions.pop();

        this.setState({ showLoader: true });
        const selectedFiles = Array.from(this.state.selectedImages.values());
        // Pass data back to the callback function
        this.props.onDidDismiss(selectedFiles).then(_ => {
            this.setState({ showLoader: false }, () => Actions.pop());
        });

        // let picPromises = [];
        // this.state.selectedImages.forEach((uri, key) => {
        //     picPromises.push(RNFetchBlob.fs.readFile(uri, 'base64'));
        // });
        // Promise.all(picPromises).then((result) => {
        //     let selectedImages = [];
        //     for (let index = 0, length = result.length; index < length; index++) {
        //         selectedImages[index] = `data:image/jpg;base64,${result[index]}`;
        //     }
        //     console.log("selectedImages from gallery: ", selectedImages);
        //     // Pass data back to the callback function
        //     this.props.onDidDismiss(selectedImages).then(_ => {
        //         this.setState({ showLoader: false }, () => Actions.pop());
        //     });
        // }).catch((err) => {
        //     console.log(err);
        //     // Pass data back to the callback function
        //     this.props.onDidDismiss([]).then(_ => {
        //         this.setState({ showLoader: false }, () => Actions.pop());
        //     });
        // });
    }

    onScroll = (e) => {
        let height = e.nativeEvent.contentSize.height;
        let offset = e.nativeEvent.contentOffset.y;
        if (WindowDimensions.height + offset >= height) {
            if (this.state.nextCursor != null) {
                this.setState({ showLoader: true }, () => this.getGalleryPhotos());
            }
        }
    }

    getGalleryPhotos = () => {
        if (Platform.OS === 'ios') {
            this._fetchPhotos();
            return;
        }
        try {
            PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                {
                    'title': 'Read Storage Permission',
                    'message': 'MyRideDNA needs access to your external storage ' +
                        'so you can update your pictures.'
                }
            ).then((granted) => {
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    this._fetchPhotos();
                } else {
                    console.log("Permission denied");
                    this.setState({ showLoader: false });
                }
            })
        } catch (err) {
            console.log(err);
            this.setState({ showLoader: false });
        }
    }

    _fetchAlbums() {
        // let cameraRollOptions = { assetType: 'Photos' };
        // CameraRoll.getAlbums(cameraRollOptions)
    }

    _fetchPhotos() {
        let cameraRollOptions = {
            first: 50,
            assetType: 'Photos',
        };
        // let cameraRollOptions = {
        //     first: 20,
        //     assetType: 'Photos',
        //     groupName: group_name,
        //     groupTypes: 'Album',
        // }
        if (this.state.nextCursor) {
            cameraRollOptions.after = this.state.nextCursor;
        }
        CameraRoll.getPhotos(cameraRollOptions).then(r => {
            let cursor = null;
            if (r.page_info.has_next_page) {
                cursor = r.page_info.end_cursor;
            }
            const { media } = this.state;
            this.setState({ media: media.concat(r.edges.filter((p, i) => p.node.image.uri)), nextCursor: cursor, showLoader: false });
        }).catch((err) => {
            console.log(err);
            this.setState({ showLoader: false });
        });
    }

    onPressBackButton = () => Actions.pop();

    toggleImageSelection = (image) => {
        let { selectedImages } = this.state;
        if (selectedImages.has(image.name)) {
            selectedImages.delete(image.name);
        } else {
            if (selectedImages.size < this.maximumSelection) {
                selectedImages.set(image.name, image);
            } else {
                Toast.show({ text: 'Maximum selection reached', position: 'bottom', duration: 1000, type: 'warning', style: styles.toast });
                return;
            }
        }
        this.setState({ selectedImages: selectedImages });
    }

    render() {
        return (
            <SafeAreaView>
                <ImageLoader show={this.state.showLoader} offsetTop={50} />
                <ScrollView style={{ marginTop: HEADER_HEIGHT }} onScroll={(e) => this.onScroll(e)}>
                    <View style={styles.galleryContainer}>
                        {this.state.media.map((p, i) => {
                            return (
                                <TouchableWithoutFeedback key={'key' + i} onPress={() => this.toggleImageSelection({ uri: p.node.image.uri, type: p.node.type, name: p.node.image.filename })}>
                                    <View style={[styles.galleryImage]}>
                                        <Image
                                            style={{
                                                width: null,
                                                height: null,
                                                flex: 1
                                            }}
                                            source={{ uri: p.node.image.uri }}
                                        />
                                        <View style={[styles.selection, { height: this.state.selectedImages.has(p.node.image.filename) ? '100%' : 0 }]}>
                                            {/* <NBIcon name='md-checkmark' type='Ionicons' style={{ color: 'white', fontSize: 30 }}></NBIcon> */}
                                            <DefaultText style={{ color: 'white', fontSize: 30 }}>{Array.from(this.state.selectedImages.values()).findIndex(img => img.name === p.node.image.filename) + 1}</DefaultText>
                                        </View>
                                    </View>
                                </TouchableWithoutFeedback>
                            );
                        })}
                    </View>
                </ScrollView>
                <SafeAreaView style={[styles.header, { backgroundColor: this.state.selectedImages.size > 0 ? '#0076B5' : '#ffffff' }]}>
                    <View style={{ marginHorizontal: 20 }}>
                        <TouchableOpacity onPress={this.onPressBackButton}>
                            <NBIcon name='arrow-back' type='MaterialIcons' fontSize={22} style={{ color: this.state.selectedImages.size > 0 ? '#ffffff' : '#000000' }} />
                        </TouchableOpacity>
                    </View>
                    <View style={{ flex: 1 }}>
                        <DefaultText style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
                            {this.state.selectedImages.size > 0 ? this.state.selectedImages.size + ' selected' : ''}
                        </DefaultText>
                    </View>
                    <View style={{ marginHorizontal: 20, alignContent: 'flex-end' }}>
                        <TouchableOpacity onPress={this.doBeforePop}>
                            <DefaultText style={{ color: 'white', fontSize: 16 }}>
                                {this.state.selectedImages.size > 0 ? 'OK' : ''}
                            </DefaultText>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    galleryContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    galleryImage: {
        width: (WindowDimensions.width / 2) - 10,
        height: 120,
        marginVertical: 5,
        marginHorizontal: 5,
        borderWidth: 1,
        borderColor: 'white',
    },
    selection: {
        position: 'absolute',
        width: '100%',
        overflow: 'hidden',
        backgroundColor: 'rgba(0,0,0,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    header: {
        position: 'absolute',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        top: 0,
        left: 0,
        width: '100%',
        height: HEADER_HEIGHT,
        overflow: 'hidden',
    },
    toast: {
        bottom: '50%',
        width: '90%',
        alignSelf: 'center',
        borderRadius: 5
    }
});
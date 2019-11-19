import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, StatusBar, ScrollView, View, Keyboard, Alert, KeyboardAvoidingView } from 'react-native';
import { BasicHeader } from '../../../../components/headers';
import { heightPercentageToDP, widthPercentageToDP, APP_COMMON_STYLES, IS_ANDROID } from '../../../../constants';
import { Actions } from 'react-native-router-flux';
import { LabeledInput } from '../../../../components/inputs';
import { BasicButton } from '../../../../components/buttons';
import { Thumbnail } from '../../../../components/images';
import ImageCropPicker from 'react-native-image-crop-picker';
import { addBikeToGarage, editBike, addPictures } from '../../../../api';
import { toggleLoaderAction } from '../../../../actions';
import { Loader } from '../../../../components/loader';

class AddBikeForm extends Component {
    fieldRefs = [];
    constructor(props) {
        super(props);
        this.state = {
            bikeImages: [],
            bike: props.bikeIndex >= 0 ? props.spaceList[props.bikeIndex] : {},
            showLoader: false
        };
        if (typeof this.state.bike.pictureList === 'undefined') {
            this.state.bike.pictureList = [];
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.spaceList !== this.props.spaceList) {
            // if (this.state.bikeImages.length > 0) {
            //     const newBike = this.props.spaceList[this.props.spaceList.length - 1];
            //     this.props.addPictures(this.props.user.userId, newBike, this.state.bikeImages);
            //     this.setState({ bikeImages: [] });
            // } else {
            //     Actions.pop();
            // }
            this.setState({ bikeImages: [] });
            Actions.pop();
        }
    }

    onPressUploadImages = async () => {
        this.props.toggleLoader(true);
        try {
            const imageList = await ImageCropPicker.openPicker({
                width: 300,
                height: 300,
                cropping: false,
                includeBase64: true,
                multiple: true,
                mediaType: 'photo',
                compressImageQuality: 0.8,
            });
            this.setState({
                bikeImages: imageList.reduce((arr, { mime, data }) => {
                    arr.push({ mimeType: mime, picture: data });
                    return arr;
                }, [])
            });
            this.props.toggleLoader(false);
        } catch (er) {
            this.props.toggleLoader(false);
            console.log("Error occurd: ", er);
        }
    }

    onChangeName = (val) => this.setState(prevState => ({ bike: { ...prevState.bike, name: val + '' } }));

    onChangeMake = (val) => this.setState(prevState => ({ bike: { ...prevState.bike, make: val } }));

    onChangeModel = (val) => this.setState(prevState => ({ bike: { ...prevState.bike, model: val } }));

    onChangeYear = (val) => this.setState(prevState => ({ bike: { ...prevState.bike, year: val } }));

    onChangeNotes = (val) => this.setState(prevState => ({ bike: { ...prevState.bike, notes: val } }));
    hideLoader = () => {
        this.setState({ showLoader: false });
    }
    onSubmit = () => {
        Keyboard.dismiss();
        const { bike, bikeImages } = this.state;
        if (!bike.name || bike.name.trim().length === 0) {
            Alert.alert('Field Error', 'Please enter a bike name');
            return;
        }
        const pictureList = [...bikeImages];
        if (!bike.spaceId) {
            this.setState({ showLoader: true });
            this.props.addBikeToGarage(this.props.user.userId, bike, pictureList, (res) => {
                this.hideLoader()
            }, (err) => {
                this.hideLoader()
            });
        } else {
            this.setState({ showLoader: true });
            this.props.editBike(this.props.user.userId, bike, pictureList, this.props.bikeIndex, (res) => {
                this.hideLoader()
            }, (err) => {
                this.hideLoader()
            });
        }
        // if (!bike.spaceId) {
        //     this.props.addBikeToGarage(this.props.user.userId, bike);
        // } else {
        //     this.props.editBike(this.props.user.userId, bike, this.props.bikeIndex);
        //     if (bikeImages.length > 0) {
        //         this.props.addPictures(this.props.user.userId, bike, bikeImages);
        //     }
        // }
    }

    render() {
        const { bikeImages, bike, showLoader } = this.state;
        return (
            <View style={styles.fill} >
                <View style={APP_COMMON_STYLES.statusBar}>
                <StatusBar translucent backgroundColor={APP_COMMON_STYLES.statusBarColor} barStyle="light-content" />
                </View>
                <KeyboardAvoidingView behavior={IS_ANDROID ? null : 'padding'} style={styles.fill}>
                    <BasicHeader headerHeight={heightPercentageToDP(8.5)} title={bike.spaceId ? 'Edit Bike' : 'Add Bike'} leftIconProps={{ reverse: true, name: 'md-arrow-round-back', type: 'Ionicons', onPress: () => Actions.pop() }} />
                    <ScrollView style={styles.form} contentContainerStyle={styles.formContent}>
                        <LabeledInput inputValue={bike.name} inputRef={elRef => this.fieldRefs[0] = elRef} returnKeyType='next' onChange={this.onChangeName} placeholder='Name' onSubmit={() => this.fieldRefs[1].focus()} hideKeyboardOnSubmit={false} />
                        <LabeledInput inputValue={bike.make} inputRef={elRef => this.fieldRefs[1] = elRef} returnKeyType='next' onChange={this.onChangeMake} placeholder='Make' onSubmit={() => this.fieldRefs[2].focus()} hideKeyboardOnSubmit={false} />
                        <LabeledInput inputValue={bike.model} inputRef={elRef => this.fieldRefs[2] = elRef} returnKeyType='next' onChange={this.onChangeModel} placeholder='Model' onSubmit={() => this.fieldRefs[3].focus()} hideKeyboardOnSubmit={false} />
                        <LabeledInput inputValue={bike.year ? bike.year + '' : ''} inputRef={elRef => this.fieldRefs[3] = elRef} returnKeyType='next' onChange={this.onChangeYear} inputType='telephoneNumber' placeholder='Year' onSubmit={() => this.fieldRefs[4].focus()} hideKeyboardOnSubmit={false} />
                        <LabeledInput inputValue={bike.notes} inputRef={elRef => this.fieldRefs[4] = elRef} returnKeyType='next' onChange={this.onChangeNotes} placeholder='Notes' onSubmit={() => { }} hideKeyboardOnSubmit={true} />
                        <BasicButton title='UPLOAD IMAGES' style={styles.imageUploadBtn} onPress={this.onPressUploadImages} />
                        {
                            <View style={styles.imgContainer}>
                                {/* <FlatList
                            data={bikeImages}
                            keyExtractor={(item, index) => index + ''}
                            renderItem={({ item, index }) => <Thumbnail horizontal={false} height={heightPercentageToDP(12)} width={widthPercentageToDP(28)} active={index === 0} imagePath={require('../../assets/img/harley.jpg')} />}
                        /> */}
                                {
                                    bikeImages.map((imgObj, index) => (
                                        <Thumbnail hideOverlay={true} key={index + ''} horizontal={false} containerStyle={{ height: heightPercentageToDP(12), width: widthPercentageToDP(20), marginBottom: heightPercentageToDP(1) }}
                                            height={heightPercentageToDP(12)} width={widthPercentageToDP(20)} imagePath={{ uri: `data:${imgObj.mimeType};base64,${imgObj.picture}` }} />
                                    ))
                                }
                            </View>
                        }
                    </ScrollView>
                    <BasicButton title='SUBMIT' style={styles.submitBtn} onPress={this.onSubmit} />

                </KeyboardAvoidingView>
                <Loader isVisible={showLoader} />
            </View>
        );
    }
}

const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    const { spaceList } = state.GarageInfo;
    return { user, spaceList };
}
const mapDispatchToProps = (dispatch) => {
    return {
        addBikeToGarage: (userId, bike, pictureList, successCallback, errorCallback) => dispatch(addBikeToGarage(userId, bike, pictureList, successCallback, errorCallback)),
        editBike: (userId, bike, pictureList, index, successCallback, errorCallback) => dispatch(editBike(userId, bike, pictureList, index, successCallback, errorCallback)),
        // editBike: (userId, bike, index) => dispatch(editBike(userId, bike, index)),
        toggleLoader: (toggleValue) => dispatch(toggleLoaderAction(toggleValue)),
        addPictures: (userId, bike, pictureList) => dispatch(addPictures(userId, bike, pictureList)),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(AddBikeForm);

const styles = StyleSheet.create({
    fill: {
        flex: 1
    },
    form: {
        marginTop: APP_COMMON_STYLES.headerHeight,
    },
    formContent: {
        paddingTop: 20,
        // flex: 1,
        // justifyContent: 'space-around'
    },
    submitBtn: {
        height: heightPercentageToDP(8.5),
    },
    imageUploadBtn: {
        marginLeft: 10,
        height: heightPercentageToDP(5),
        width: '50%'
    },
    imgContainer: {
        marginTop: heightPercentageToDP(2),
        flexDirection: 'row',
        flexWrap: 'wrap',
    }
});
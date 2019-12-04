import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, Platform, TouchableWithoutFeedback, StatusBar, FlatList, ScrollView, View, Keyboard, Alert, TextInput, Text, ActivityIndicator, Animated, Easing, ImageBackground } from 'react-native';
import { Actions } from 'react-native-router-flux';
import { DatePicker, Icon as NBIcon, Toast, ListItem, Left, Body, Right, Thumbnail } from 'native-base';
import { BasicHeader } from '../../../../components/headers';
import { IconButton, BasicButton, ImageButton } from '../../../../components/buttons';
import { APP_COMMON_STYLES, heightPercentageToDP, widthPercentageToDP, IS_ANDROID, CUSTOM_FONTS } from '../../../../constants';
import { LabeledInputPlaceholder } from '../../../../components/inputs';
import { createFriendGroup, updateFriendGroup } from '../../../../api';
import { Loader } from '../../../../components/loader';
import ImagePicker from 'react-native-image-crop-picker';
import { DefaultText } from '../../../../components/labels';

const hasIOSAbove10 = parseInt(Platform.Version) > 10;

class GroupForm extends Component {
    updatingGroupList = false;
    constructor(props) {

        super(props);
        this.state = {
            groupDetail: {
                groupName: this.props.pageIndex === -1 ? '' : this.props.friendGroupList[this.props.pageIndex].groupName
            }
        };
    }

    componentDidMount() {
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.friendGroupList !== this.props.friendGroupList) {
            if (this.updatingGroupList === true) {
                Toast.show({ text: 'Added New Group' });
            }
            this.onPressBackButton();
        }
    }


    retryApiFunction = () => {
        this.state.spinValue.setValue(0);
        Animated.timing(this.state.spinValue, {
            toValue: 1,
            duration: 300,
            easing: Easing.linear,
            useNativeDriver: true
        }).start(() => {
            if (this.props.hasNetwork === true) {
                this.props.getPassengerList(this.props.user.userId, 0, 10, (res) => {
                }, (err) => {
                });
            }
        });

    }

    onPressBackButton = () => {
        Actions.pop()
    }

    onPressGalleryIcon = async () => {
        this.setState({ isLoadingProfPic: true });
        try {
            const imageObj = await ImagePicker.openPicker({
                width: 300,
                height: 300,
                cropping: false,
                includeBase64: true,
            });
            Toast.show({ text: 'One image selected' });
            this.setState(prevState => ({ groupDetail: { ...prevState.groupDetail, mimeType: imageObj.mime, profilePicture: imageObj.data } }));
            // this.props.updateProfilePicture(imageObj.data, imageObj.mime, this.props.user.userId);
        } catch (er) {
            this.setState({ isLoadingProfPic: false });
            console.log("Error occurd: ", er);
        }
    }

    onPressCameraIcon = async () => {
        this.setState({ isLoadingProfPic: true });
        try {
            const imageObj = await ImagePicker.openCamera({
                width: 300,
                height: 300,
                includeBase64: true,
                cropping: false, // DOC: Setting this to true (in openCamera) is not working as expected (19-12-2018).
            });
            Toast.show({ text: 'One image selected' });
            this.setState(prevState => ({ groupDetail: { ...prevState.groupDetail, mimeType: imageObj.mime, profilePicture: imageObj.data } }));
            // this.props.updateProfilePicture(imageObj.data, imageObj.mime, this.props.user.userId);
        } catch (er) {
            this.setState({ isLoadingProfPic: false });
            console.log("Error occurd: ", er);
        }

    }

    onChangeGroupName = (val) => {
        this.setState(prevState => ({ groupDetail: { ...prevState.groupDetail, groupName: val } }));
    }



    onSubmit = () => {
        const { groupDetail } = this.state;
        if (this.props.pageIndex === -1) {
            this.updatingGroupList = true;
            this.props.createFriendGroup({
                createdBy: this.props.user.userId,
                createdDate: new Date().toISOString(),
                ...groupDetail,
            });
        }
        else {
            this.props.updateFriendGroup({
                groupId: this.props.friendGroupList[this.props.pageIndex].groupId,
                updatedBy: this.props.user.userId,
                ...groupDetail
            })
        }
    }


    render() {
        const { groupDetail } = this.state;
        return (
            <View style={styles.fill}>
                <View style={APP_COMMON_STYLES.statusBar}>
                    <StatusBar translucent backgroundColor={APP_COMMON_STYLES.statusBarColor} barStyle="light-content" />
                </View>
                <View style={styles.fill}>
                    <BasicHeader
                        title='New Group'
                        leftIconProps={{ reverse: true, name: 'md-arrow-round-back', type: 'Ionicons', onPress: this.onPressBackButton }}
                    />
                    <ScrollView keyboardShouldPersistTaps='always'>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', marginTop: 41 + APP_COMMON_STYLES.headerHeight }}>
                            <View style={{ alignSelf: 'center', alignItems: 'center' }}>
                                <ImageButton onPress={this.onPressCameraIcon} imageSrc={require('../../../../assets/img/cam-icon.png')} imgStyles={{ width: 45, height: 37 }} />
                                <DefaultText style={{ letterSpacing: 2, marginTop: 15, fontFamily:CUSTOM_FONTS.robotoSlabBold, color: '#000', fontSize: 12 }}>{' TAKE \nPHOTO'}</DefaultText>
                            </View>
                            <View style={{ alignSelf: 'center', alignItems: 'center' }}>
                                <ImageButton onPress={this.onPressGalleryIcon} imageSrc={require('../../../../assets/img/photos-icon.png')} imgStyles={{ width: 41, height: 33 }} />
                                <DefaultText style={{ letterSpacing: 2, marginTop: 15,  fontFamily:CUSTOM_FONTS.robotoSlabBold, color: '#000', fontSize: 12 }}>{'UPLOAD \n PHOTO'}</DefaultText>
                            </View>
                        </View>
                        <View style={{ marginLeft: widthPercentageToDP(12), marginTop: heightPercentageToDP(3) }}>
                            <LabeledInputPlaceholder
                                inputValue={groupDetail.groupName} inputStyle={{ paddingBottom: 0 }}
                                outerContainer={{ marginTop: IS_ANDROID ? null : heightPercentageToDP(3) }}
                                onChange={this.onChangeGroupName} label='GROUP NAME' labelStyle={styles.labelStyle}
                                onSubmit={() => this.fieldRefs[1].focus()} hideKeyboardOnSubmit={false} />
                        </View>
                        <BasicButton title='UPDATE' style={styles.submitBtn} titleStyle={{ letterSpacing: 2, fontSize: 20, fontFamily: CUSTOM_FONTS.robotoSlabBold }} onPress={this.onSubmit} />
                    </ScrollView>
                </View>
                <Loader isVisible={this.props.showLoader} />
            </View>
        );
    }
}

const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    const { showLoader, pageNumber, hasNetwork, lastApi } = state.PageState;
    const { friendGroupList } = state.FriendGroupList;
    return { user, showLoader, pageNumber, hasNetwork, lastApi, friendGroupList };
}
const mapDispatchToProps = (dispatch) => {
    return {
        createFriendGroup: (newGroupInfo) => dispatch(createFriendGroup(newGroupInfo)),
        updateFriendGroup: (updatedGroupInfo) => dispatch(updateFriendGroup(updatedGroupInfo))
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(GroupForm);

const styles = StyleSheet.create({
    fill: {
        flex: 1,
        backgroundColor: '#fff'
    },
    labelStyle: {
        color: '#000',
        fontSize: 10,
        fontFamily:CUSTOM_FONTS.robotoSlabBold,
        letterSpacing: 1.1
    },
    submitBtn: {
        height: heightPercentageToDP(9),
        backgroundColor: '#f69039',
        marginTop: heightPercentageToDP(45)
    },
});
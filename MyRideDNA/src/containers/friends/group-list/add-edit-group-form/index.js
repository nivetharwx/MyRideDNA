import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, FlatList, ScrollView, View, Text, Image, TouchableWithoutFeedback } from 'react-native';
import { Actions } from 'react-native-router-flux';
import { Toast } from 'native-base';
import { IconButton, BasicButton, ImageButton, LinkButton } from '../../../../components/buttons';
import { APP_COMMON_STYLES, heightPercentageToDP, widthPercentageToDP, IS_ANDROID, CUSTOM_FONTS, PageKeys, GET_PICTURE_BY_ID, THUMBNAIL_TAIL_TAG, PORTRAIT_TAIL_TAG } from '../../../../constants';
import { LabeledInputPlaceholder } from '../../../../components/inputs';
import { createFriendGroup, updateFriendGroup, getGroupMembers } from '../../../../api';
import ImagePicker from 'react-native-image-crop-picker';
import { DefaultText } from '../../../../components/labels';
import { SelectedImage } from '../../../../components/images';
import { BaseModal } from '../../../../components/modal';
import { BasePage } from '../../../../components/pages';

class GroupForm extends Component {
    updatingGroupList = false;
    constructor(props) {

        super(props);
        this.state = {
            groupName: (this.props.groupDetail && this.props.groupDetail.groupName) || '',
            picture: (this.props.groupDetail && this.props.groupDetail.profilePictureId) ? { profilePictureId: this.props.groupDetail.profilePictureId } : null,
            members: [],
            hasRemainingList: false,
            showOptionsModal: false,
            selectedMember: null,
            toggleMemberAsAdmin: [],
            deletedMembersId: [],
            deletedId: null,
        };
    }

    componentDidMount() {
        if (this.props.groupDetail) {
            this.props.getGroupMembers(this.props.groupDetail.groupId, this.props.user.userId, (res) => {
                this.setState({ members: res.groupMembers })
            }, (er) => { })
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.friendGroupList !== this.props.friendGroupList) {
            if (this.updatingGroupList === true) {
                Toast.show({ text: 'Added New Group' });
            }
            // this.onPressBackButton();
        }
    }


    onPressBackButton = () => {
        Actions.pop()
    }

    onPressGalleryIcon = async () => {
        this.setState({ isLoadingProfPic: true });
        try {
            const imageObj = await ImagePicker.openPicker({ cropping: false });
            ImagePicker.openCropper({ height: imageObj.height, width: imageObj.width, path: imageObj.path, hideBottomControls: true, compressImageQuality: imageObj.size > 600000 ? IS_ANDROID ? 0.4 : 0.2 : 1, }).then(image => {
                this.setState(prevState => ({ picture: { mimeType: image.mime, path: image.path } }));
            })
        } catch (er) {
            this.setState({ isLoadingProfPic: false });
            console.log("Error occurd: ", er);
        }
    }

    onPressCameraIcon = async () => {
        this.setState({ isLoadingProfPic: true });
        try {
            const imageObj = await ImagePicker.openCamera({ cropping: false });
            ImagePicker.openCropper({ height: imageObj.height, width: imageObj.width, path: imageObj.path, hideBottomControls: true, compressImageQuality: imageObj.size > 600000 ? IS_ANDROID ? 0.4 : 0.2 : 1, }).then(image => {
                this.setState(prevState => ({ picture: { mimeType: image.mime, path: image.path } }));
            })
        } catch (er) {
            this.setState({ isLoadingProfPic: false });
            console.log("Error occurd: ", er);
        }
    }

    onPressSelectFromAlbum = () => Actions.push(PageKeys.ALBUM, { isSelectMode: true, isMultiSelect: false, getSelectedPhotos: (photoIds) => this.setState({ picture: { id: photoIds[0] } }) });

    onChangeGroupName = (val) => this.setState(prevState => ({ groupName: val }));

    onSubmit = () => {
        const { groupName, picture, toggleMemberAsAdmin, deletedMembersId, members, deletedId } = this.state;
        if (groupName.trim().length === 0) {
            Toast.show({
                text: 'Enter Group Name',
                buttonText: 'Okay'
            });
            return;
        }

        if (!this.props.groupDetail) {
            const groupDetail = {
                createdBy: this.props.user.userId,
                createdDate: new Date().toISOString(),
                memberIds: this.state.members.map(item => item.userId),
                groupName,
            }
            if (deletedId) {
                groupDetail.deletedId = deletedId
            }
            if (picture && (picture.path || picture.id)) {
                groupDetail.picture = picture
            }
            Toast.show({ text: 'Creating Group... We will let you know once it is completed' });
            this.props.createFriendGroup(groupDetail);
            this.onPressBackButton();
        }
        else {
            let groupMembers = [];
            this.state.members.forEach(item => {
                if (item.userId) {
                    groupMembers.push({ memberId: item.userId, isAdmin: false });
                }
            })
            const groupDetail = {
                groupId: this.props.groupDetail.groupId,
                updatedBy: this.props.user.userId,
                groupName
            }
            if (deletedId) {
                groupDetail.deletedId = deletedId;
            }
            if (groupMembers.length > 0) {
                groupDetail.groupMembers = groupMembers
            }
            if (picture && (picture.path || picture.id)) {
                groupDetail.picture = picture
            }
            if (deletedMembersId.length > 0) {
                groupDetail.deletedIds = deletedMembersId
            }
            Toast.show({ text: 'Updating Group... We will let you know once it is completed' });
            if (groupDetail.picture) {
                this.props.updateFriendGroup(groupDetail, true, (res) => {
                    this.onPressBackButton();
                }, (er) => { })
            }
            else {
                this.props.updateFriendGroup(groupDetail, false, (res) => {
                    this.onPressBackButton();
                }, (er) => { })
            }

        }
    }

    showOptionsModal = (item) => this.setState({ showOptionsModal: true, selectedMember: item });

    hideOptionsModal = () => this.setState({ showOptionsModal: false, selectedMember: null });

    selectedMembers = (members) => {
        let newMembers = []
        members.forEach(item => {
            newMembers.push({ ...item, memberId: item.userId })
        })
        this.setState(prevState => ({ members: [...prevState.members, ...newMembers] }))
    }

    addMember = () => {
        Actions.push(PageKeys.CONTACTS_SECTION, { title: 'Select contact', filter: 'members', comingFrom: PageKeys.GROUP, groupId: this.props.groupDetail ? this.props.groupDetail.groupId : undefined, addedMembers: this.state.members, selectedMembers: (members) => this.selectedMembers(members) })
    }

    unselectProfilePic = () => this.setState(prevState => ({ picture: null, deletedId: this.state.picture.profilePictureId }));

    memberKeyExtractor = (item) => item.userId;

    removeMember = () => {
        const updatedMemberList = this.state.members.filter(item => item.memberId !== this.state.selectedMember.memberId)
        if (!this.state.selectedMember.userId) {
            this.setState({ members: updatedMemberList, showOptionsModal: false, deletedMembersId: [...this.state.deletedMembersId, this.state.selectedMember.memberId] });
        }
        else {
            this.setState({ members: updatedMemberList, showOptionsModal: false })
        }
    }

    render() {
        const { groupName, showOptionsModal, selectedMember, members, picture } = this.state;
        const { user, showLoader, groupDetail } = this.props;
        return (
            <BasePage heading={groupDetail ? 'Edit Group' : 'Add New Group'} showLoader={showLoader}>
                <BaseModal containerStyle={APP_COMMON_STYLES.optionsModal} isVisible={showOptionsModal} onCancel={this.hideOptionsModal} onPressOutside={this.hideOptionsModal}>
                    <View style={APP_COMMON_STYLES.optionsContainer}>
                        <LinkButton style={APP_COMMON_STYLES.optionBtn} title={`REMOVE FROM GROUP`} titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={this.removeMember} />
                    </View>
                </BaseModal>
                <ScrollView keyboardShouldPersistTaps='always' contentContainerStyle={{ flexGrow: 1 }}>
                    {
                        picture && (picture.path || picture.profilePictureId || picture.id)
                            ? <SelectedImage
                                outerContainer={{ marginTop: APP_COMMON_STYLES.statusBar.height }}
                                image={{ uri: picture.path ? picture.path : `${GET_PICTURE_BY_ID}${picture.id ? picture.id.replace(THUMBNAIL_TAIL_TAG, PORTRAIT_TAIL_TAG) : picture.profilePictureId.replace(THUMBNAIL_TAIL_TAG, PORTRAIT_TAIL_TAG)}` }}
                                onPressCloseImg={this.unselectProfilePic} />
                            : <View style={styles.imageUploadIconsCont}>
                                <TouchableWithoutFeedback onPress={this.onPressCameraIcon}>
                                <View style={styles.imageUploadIcon}>
                                    <ImageButton onPress={this.onPressCameraIcon}  imageSrc={require('../../../../assets/img/cam-icon.png')} imgStyles={styles.iconStyle} />
                                    <DefaultText style={styles.uploadImageIconLabel}>{' TAKE \nPHOTO'}</DefaultText>
                                </View>
                                </TouchableWithoutFeedback>
                                <TouchableWithoutFeedback onPress={this.onPressGalleryIcon}>
                                <View style={styles.imageUploadIcon}>
                                    <ImageButton onPress={this.onPressGalleryIcon} imageSrc={require('../../../../assets/img/upload-icon-orange.png')} imgStyles={styles.iconStyle} />
                                    <DefaultText style={styles.uploadImageIconLabel}>{'UPLOAD \n PHOTO'}</DefaultText>
                                </View>
                                </TouchableWithoutFeedback>
                                <TouchableWithoutFeedback onPress={this.onPressSelectFromAlbum}>
                                <View style={styles.imageUploadIcon}>
                                    <ImageButton onPress={this.onPressSelectFromAlbum} imageSrc={require('../../../../assets/img/photos-icon.png')} imgStyles={styles.iconStyle} />
                                    <DefaultText style={[styles.uploadImageIconLabel, { letterSpacing: 0.6 }]}>{'SELECT FROM \n MY PHOTOS'}</DefaultText>
                                </View>
                                </TouchableWithoutFeedback>
                            </View>
                    }
                    <View style={{ marginLeft: widthPercentageToDP(12), marginTop: 10 }}>
                        <LabeledInputPlaceholder
                            containerStyle={{ backgroundColor: '#F4F4F4' }}
                            inputValue={groupName} inputStyle={{ paddingBottom: 0 }}
                            outerContainer={{ marginTop: IS_ANDROID ? null : heightPercentageToDP(3) }}
                            onChange={this.onChangeGroupName} label='GROUP NAME' labelStyle={styles.labelStyle}
                            hideKeyboardOnSubmit={true} />
                    </View>
                    <View style={styles.clubLabelCont}>
                        <Text style={[styles.labelStyle, { marginLeft: 43, color: '#F4F4F4', fontSize: 13 }]}>GROUP MEMBERS</Text>
                        {
                            this.props.isAdmin || !this.props.groupDetail ?
                                <IconButton style={{ marginRight: 20 }} iconProps={{ name: 'ios-add-circle', type: 'Ionicons', style: { fontSize: 20, color: '#fff' } }} onPress={this.addMember} />
                                : null
                        }
                    </View>
                    <FlatList
                        contentContainerStyle={[{ paddingBottom: this.state.hasRemainingList ? 40 : 0 }, styles.friendList]}
                        keyboardShouldPersistTaps="handled"
                        data={members}
                        keyExtractor={this.memberKeyExtractor}
                        renderItem={({ item, index }) => (
                            <View style={{ flexDirection: 'row', height: 54, marginTop: 10 }}>
                                <View style={{ width: 54 }}>
                                    <Image source={item.profilePictureId ? { uri: `${GET_PICTURE_BY_ID}${item.profilePictureId}` } : require('../../../../assets/img/friend-profile-pic.png')} style={{ flex: 1, height: null, width: null }} />
                                </View>
                                <View style={styles.memberNameCont}>
                                    <DefaultText style={styles.memberName}>{item.name.split(' ')[0]}{item.isAdmin ? ' (Admin)' : ''}</DefaultText>
                                    {
                                        this.props.isAdmin && item.memberId !== user.userId ?
                                            <IconButton iconProps={{ name: 'options', type: 'SimpleLineIcons', style: { color: '#9A9A9A', fontSize: 20 } }} onPress={() => this.showOptionsModal(item)} />
                                            : null
                                    }
                                </View>
                            </View>
                        )
                        }
                    />
                </ScrollView>
                <BasicButton title={this.props.groupDetail ? 'UPDATE' : 'CREATE GROUP'} style={styles.submitBtn} titleStyle={{ letterSpacing: 1.4, fontSize: 14, fontFamily: CUSTOM_FONTS.robotoBold }} onPress={this.onSubmit} />
            </BasePage>
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
        updateFriendGroup: (updatedGroupInfo, isAsync, successCallback, errorCallback) => dispatch(updateFriendGroup(updatedGroupInfo, isAsync, successCallback, errorCallback)),
        getGroupMembers: (groupId, userId, successCallback, errorCallback) => getGroupMembers(groupId, userId, true).then(res => {
            typeof successCallback === 'function' && successCallback(res.data)
            console.log('getGroupMembers success: ', res.data)
        }).catch(er => {
            console.log('getGroupMembers error: ', res.data)
        }),
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
        fontFamily: CUSTOM_FONTS.robotoSlabBold,
        letterSpacing: 1.1
    },
    submitBtn: {
        height: 35,
        backgroundColor: '#f69039',
        width: 213,
        alignSelf: 'center',
        borderRadius: 20,
        marginTop: 10,
        marginBottom: 20
    },
    clubLabelCont: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: heightPercentageToDP(3),
        width: 309,
        backgroundColor: '#2B77B4',
        height: 30,
        borderTopRightRadius: 15,
        borderBottomRightRadius: 15,
        alignItems: 'center',

    },
    friendList: {
        paddingTop: 16,
        marginLeft: 33,
    },
    memberNameCont: {
        width: 222,
        backgroundColor: '#EAEAEA',
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 13
    },
    memberName: {
        color: '#585756',
        fontFamily: CUSTOM_FONTS.robotoBold,
        fontSize: 14,
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
});
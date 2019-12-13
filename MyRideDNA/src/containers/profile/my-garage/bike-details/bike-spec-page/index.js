import React, { Component } from 'react';
import { Alert, View, ImageBackground, Image, StatusBar, FlatList, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { connect } from 'react-redux';
import { IconButton, LinkButton } from '../../../../../components/buttons';
import { APP_COMMON_STYLES, widthPercentageToDP, heightPercentageToDP, PageKeys, THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG, POST_TYPE, PORTRAIT_TAIL_TAG, GET_PICTURE_BY_ID, CUSTOM_FONTS } from '../../../../../constants';
import { BaseModal } from '../../../../../components/modal';
import { Actions } from 'react-native-router-flux';
import { BasicHeader } from '../../../../../components/headers';
import { SquareCard } from '../../../../../components/cards';
import { DefaultText } from '../../../../../components/labels';
import { appNavMenuVisibilityAction, updatePageContentStatusAction } from '../../../../../actions';
import { getPosts, deletePost } from '../../../../../api';

class BikeSpec extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showOptionsModal: false
        };
    }

    componentDidMount() { }

    componentDidUpdate(prevProps, prevState) { }

    showAppNavMenu = () => this.props.showAppNavMenu();

    showOptionsModal = () => this.setState({ showOptionsModal: true });

    hideOptionsModal = () => this.setState({ showOptionsModal: false });

    onPressBackButton = () => Actions.pop();

    openPostForm = () => Actions.push(PageKeys.POST_FORM, { comingFrom: Actions.currentScene, postType: this.props.postType, currentBikeId: this.props.bike.spaceId });

    onPressDeleteSpec = () => {
        setTimeout(() => {
            Alert.alert(
                'Delete confirmation',
                `Are you sure to delete ${this.props.specification.title}?`,
                [
                    {
                        text: 'Cancel',
                        onPress: () => null,
                        style: 'cancel',
                    },
                    { text: 'Delete', onPress: () => this.props.deleteSpec(this.props.postType, this.props.specification.id, () => Actions.pop()) },
                ]
            );
        }, 100);
        this.hideOptionsModal();
    }

    render() {
        const { showOptionsModal } = this.state;
        const { specification } = this.props;
        return <View style={styles.fill}>
            <BaseModal containerStyle={APP_COMMON_STYLES.optionsModal} isVisible={showOptionsModal} onCancel={this.hideOptionsModal} onPressOutside={this.hideOptionsModal}>
                <View style={APP_COMMON_STYLES.optionsContainer}>
                    <LinkButton style={APP_COMMON_STYLES.optionBtn} title='EDIT' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={this.openPostForm} />
                    <LinkButton style={APP_COMMON_STYLES.optionBtn} title='DELETE' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={this.onPressDeleteSpec} />
                    <LinkButton style={APP_COMMON_STYLES.optionBtn} title='CANCEL' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={this.hideOptionsModal} />
                </View>
            </BaseModal>
            <View style={APP_COMMON_STYLES.statusBar}>
                <StatusBar translucent backgroundColor={APP_COMMON_STYLES.statusBarColor} barStyle="light-content" />
            </View>
            <View style={styles.fill}>
                <BasicHeader title={specification.title}
                    leftIconProps={{ reverse: true, name: 'md-arrow-round-back', type: 'Ionicons', onPress: this.onPressBackButton }}
                    rightIconProps={{ name: 'options', type: 'SimpleLineIcons', style: { color: '#fff', fontSize: 20 }, onPress: this.showOptionsModal }}
                />
                <ScrollView
                    style={styles.pageContent}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingTop: APP_COMMON_STYLES.headerHeight }}
                >
                    <View style={styles.profilePic}>
                        <ImageBackground source={specification.pictureIds && specification.pictureIds[0] ? { uri: `${GET_PICTURE_BY_ID}${specification.pictureIds[0].id.replace(THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG)}` } : require('../../../../../assets/img/profile-pic.png')} style={{ height: null, width: null, flex: 1, borderRadius: 0 }} />
                    </View>
                    <Image source={require('../../../../../assets/img/profile-bg.png')} style={styles.profilePicBtmBorder} />
                    <View style={styles.pageContent}>
                        <View style={styles.contentPadding}>
                            <DefaultText style={styles.labelText}>ADDITIONAL INFO</DefaultText>
                            <DefaultText style={styles.labelContent}>{specification.description || ""}</DefaultText>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </View>
    }
}

const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    const { hasNetwork, postTypes } = state.PageState;
    const { currentBike: bike, activeBikeIndex, currentBikeSpec: specification } = state.GarageInfo;
    return { user, hasNetwork, bike, activeBikeIndex, postTypes, specification };
}
const mapDispatchToProps = (dispatch) => {
    return {
        showAppNavMenu: () => dispatch(appNavMenuVisibilityAction(true)),
        deleteSpec: (postType, postId, successCallback) => dispatch(deletePost(postId, () => {
            dispatch(updatePageContentStatusAction({ type: postType, action: 'DELETE' }));
            typeof successCallback === 'function' && successCallback();
        })),
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(BikeSpec);

const styles = StyleSheet.create({
    fill: {
        flex: 1,
    },
    pageContent: {
        flex: 1,
        backgroundColor: '#fff',
    },
    contentPadding: {
        marginHorizontal: 27,
        marginTop: 20
    },
    profilePic: {
        width: widthPercentageToDP(100),
        height: 255,
    },
    profilePicBtmBorder: {
        width: widthPercentageToDP(100),
        height: 13
    },
    labelText: {
        color: '#707070',
        fontFamily: CUSTOM_FONTS.robotoSlabBold,
        letterSpacing: 1.6,
        fontSize: 8
    },
    labelContent: {
        marginTop: 10,
        fontFamily: CUSTOM_FONTS.robotoSlabBold,
    }
});
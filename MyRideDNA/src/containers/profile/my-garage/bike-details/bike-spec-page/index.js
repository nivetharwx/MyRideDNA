import React, { Component } from 'react';
import { Alert, View, Image, StyleSheet, ScrollView, Text } from 'react-native';
import { connect } from 'react-redux';
import { BasicButton, LinkButton } from '../../../../../components/buttons';
import { APP_COMMON_STYLES, widthPercentageToDP, PageKeys, CUSTOM_FONTS, POST_TYPE, GET_PICTURE_BY_ID, THUMBNAIL_TAIL_TAG, PORTRAIT_TAIL_TAG, MEDIUM_TAIL_TAG, IS_ANDROID, heightPercentageToDP } from '../../../../../constants';
import { BaseModal, GesturedCarouselModal } from '../../../../../components/modal';
import { Actions } from 'react-native-router-flux';
import { Carousel, PostCard } from '../../../../../components/cards';
import { DefaultText } from '../../../../../components/labels';
import { deleteBikeSpecsAction, resetErrorHandlingAction, apiLoaderActions } from '../../../../../actions';
import { deletePost, handleServiceErrors } from '../../../../../api';
import { BasePage } from '../../../../../components/pages';
import { ImageLoader } from '../../../../../components/loader';
import ImageViewer from 'react-native-image-viewing'
import { Icon as NBIcon } from 'native-base';

class BikeSpec extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showOptionsModal: false,
            isVisiblePictureModal: false,
            selectedPictureList: null,
            showRequestModal:false
        };
    }

    componentDidMount() { }

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

    showOptionsModal = () => this.setState({ showOptionsModal: true });

    hideOptionsModal = () => this.setState({ showOptionsModal: false });

    onPressBackButton = () => Actions.pop();

    openPostForm = () => {
        Actions.push(PageKeys.POST_FORM, { comingFrom: Actions.currentScene, postType: this.props.postType, currentBikeId: this.props.bike.spaceId, selectedPost: this.props.specification });
        this.hideOptionsModal();
        this.hideRequestModal();
    }

    onPressDeleteSpec = () => {
        this.props.deleteSpec(this.props.postType, this.props.specification.id, () => {Actions.pop()
            this.hideOptionsModal();
        })
    }

    onPressImage = (item) => {
        this.setState({ isVisiblePictureModal: true, selectedPictureList: item })
    }

    hidePictureModal = () => this.setState({ isVisiblePictureModal: false, selectedPictureList: null });

    openRequestModal = () => this.setState({ showRequestModal: true, });

    hideRequestModal = () => this.setState({ showRequestModal: false});

    render() {
        const { showOptionsModal, isVisiblePictureModal, selectedPictureList, showRequestModal } = this.state;
        const { specification, isEditable, bikeDetail, postType } = this.props;
        if (!specification && isEditable) return <View style={styles.fill} />;
        return <BasePage heading={isEditable ? specification.title : bikeDetail.title}
            headerRightIconProps={isEditable ? { reverse: false, name: 'options', type: 'SimpleLineIcons', style: { color: '#fff', fontSize: 20 }, onPress: this.showOptionsModal } : null}>
            {/* {isVisiblePictureModal && <GesturedCarouselModal isVisible={isVisiblePictureModal} onCancel={this.hidePictureModal}
                pictureIds={selectedPictureList}
                isGestureEnable={true}
                isZoomEnable={true}
                initialCarouselIndex={0}
            />} */}
             {
                isVisiblePictureModal && <ImageViewer  FooterComponent={(img)=>{
                    return   ( <View style={{ height: 100,backgroundColor:'rgba(0, 0, 0, 0.37)',display:'flex',flexDirection:'column',justifyContent:'space-between'}}>
                            <DefaultText style={{ fontSize: 16, color: 'white',marginLeft:20 }} text={selectedPictureList[img.imageIndex].description} numberOfLines={2}/>
                            <Text style={{ fontSize: 16, color: 'white',textAlign:'center',marginBottom:19, }} >{(img.imageIndex+1)+' / '+selectedPictureList.length}</Text>
                            </View>)
                }} HeaderComponent={()=>{
                   return <View style={{height:IS_ANDROID?heightPercentageToDP(6):heightPercentageToDP(10),display:'flex',backgroundColor:'rgba(0, 0, 0, 0.37)',flexDirection:'row',justifyContent:'flex-end',alignItems:'flex-end'}}>
                       <View style={{width:100,height:50,display:'flex',flexDirection:'row',justifyContent:'space-evenly',alignItems:'center'}}>
                       <NBIcon name='close' fontSize={20}  style={{ color: '#fff'}} onPress={this.hidePictureModal} />
                       </View>
                   </View>
               }} visible={isVisiblePictureModal} onRequestClose={this.hidePictureModal} images={selectedPictureList.map(image=>{
                       return {
                           ...image,uri: `${GET_PICTURE_BY_ID}${image.id.replace(THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG)}`
                       }
                   })} imageIndex={0} />
               } 
            <BaseModal containerStyle={APP_COMMON_STYLES.optionsModal} isVisible={showOptionsModal} onCancel={this.hideOptionsModal} onPressOutside={this.hideOptionsModal}>
                <View>
                <View style={APP_COMMON_STYLES.optionsContainer}>
                    <LinkButton style={APP_COMMON_STYLES.optionBtn} title='EDIT' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={this.openPostForm} />
                    <LinkButton style={APP_COMMON_STYLES.optionBtn} title='DELETE' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={this.openRequestModal} />
                </View>
                {
                        showRequestModal && <BaseModal containerStyle={{ justifyContent: 'center', alignItems: 'center' }} isVisible={showRequestModal} onCancel={this.hideRequestModal} >
                            <View style={styles.deleteBoxCont}>
                                <DefaultText style={styles.deleteTitle}>Delete Item</DefaultText>
                                <DefaultText numberOfLines={4} style={styles.deleteText}>{`Are you sure you want to delete this item from ${postType === POST_TYPE.WISH_LIST?'your Wish List':'My Ride'}? You will not be able to undo this action.`}</DefaultText>
                                <View style={styles.btnContainer}>
                                    <BasicButton title='CANCEL' style={[styles.actionBtn, { backgroundColor: '#8D8D8D' }]} titleStyle={styles.actionBtnTxt} onPress={this.hideRequestModal} />
                                    <BasicButton title='DELETE' style={styles.actionBtn} titleStyle={styles.actionBtnTxt} onPress={this.onPressDeleteSpec} />
                                </View>
                            </View>
                        </BaseModal>
                    }
                    </View>
            </BaseModal>

            <ScrollView style={styles.pageContent} showsVerticalScrollIndicator={false}>
                <View style={styles.profilePic}>
                    {
                        (specification && specification.pictureIds.length > 0) || (bikeDetail && bikeDetail.pictureIds.length > 0) ?
                            // <Carousel
                            //     pictureIds={isEditable ? specification.pictureIds ? specification.pictureIds : [] : bikeDetail.pictureIds ? bikeDetail.pictureIds : []} />
                            <PostCard
                                onPress={() => (specification && specification.pictureIds.length > 0) ? this.onPressImage(specification.pictureIds) : (bikeDetail && bikeDetail.pictureIds.length > 0) ? this.onPressImage(bikeDetail.pictureIds) : null}
                                numberOfpicture={specification && specification.pictureIds ? specification.pictureIds.length : bikeDetail && bikeDetail.pictureIds ? bikeDetail.pictureIds.length : null}
                                image={(specification && specification.pictureIds.length > 0) ? `${GET_PICTURE_BY_ID}${specification.pictureIds[0].id.replace(THUMBNAIL_TAIL_TAG, PORTRAIT_TAIL_TAG)}` : (bikeDetail && bikeDetail.pictureIds.length > 0) ? `${GET_PICTURE_BY_ID}${bikeDetail.pictureIds[0].id.replace(THUMBNAIL_TAIL_TAG, PORTRAIT_TAIL_TAG)}` : null}
                            />
                            :
                            <Image source={postType === POST_TYPE.MY_RIDE ? require('../../../../../assets/img/my-ride.png') : postType === POST_TYPE.WISH_LIST ? require('../../../../../assets/img/wishlist.png') : null} style={styles.placeholderImage} />
                    }
                    {specification && this.props.apiCallsInProgress[specification.id] && <ImageLoader show={this.props.apiCallsInProgress[specification.id]} />}
                </View>
                <Image source={require('../../../../../assets/img/profile-bg.png')} style={styles.profilePicBtmBorder} />
                <View style={styles.pageContent}>
                    <View style={styles.contentPadding}>
                        <DefaultText style={styles.labelText}>ADDITIONAL INFO</DefaultText>
                        <DefaultText style={styles.labelContent}>{isEditable ? specification.description : bikeDetail.description || ''}</DefaultText>
                    </View>
                </View>
            </ScrollView>
        </BasePage>
    }
}

const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    const { hasNetwork, lastApi, isRetryApi, postTypes, apiCallsInProgress } = state.PageState;
    const { currentBike: bike, currentBikeSpec: specification } = state.GarageInfo;
    return { user, hasNetwork, lastApi, isRetryApi, bike, postTypes, specification, apiCallsInProgress };
}
const mapDispatchToProps = (dispatch) => {
    return {

        deleteSpec: (postType, postId, successCallback) => deletePost(postId).then(res => {
            if (res.status === 200) {
                console.log('deletePost : ', res.data);
                dispatch(apiLoaderActions(false));
                dispatch(deleteBikeSpecsAction({ postType: postType, id: postId }))
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                typeof successCallback === 'function' && successCallback();
            }
        }).catch(er => {
            console.log('deletePost error : ', er.response);
            handleServiceErrors(er, [postType, postId, successCallback], 'deleteSpec', true, true);
            dispatch(apiLoaderActions(false));
        }),
        resetErrorHandling: (state) => dispatch(resetErrorHandlingAction({ comingFrom: 'bike_spec_page', isRetryApi: state })),
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
    },
    placeholderImage: {
        width: widthPercentageToDP(100),
        height: 220
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
});
import React, { Component } from 'react';
import { View, ImageBackground, Text, Alert, StatusBar, ScrollView, FlatList, TextInput, KeyboardAvoidingView, TouchableOpacity, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import { appNavMenuVisibilityAction, updateAlbumListAction } from '../../actions';
import { ShifterButton, IconButton, LinkButton } from '../../components/buttons';
import { Thumbnail, Item, List, Icon as NBIcon } from 'native-base';
import { APP_COMMON_STYLES, widthPercentageToDP, WindowDimensions, heightPercentageToDP, PageKeys, THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG } from '../../constants';
import { ChatBubble } from '../../components/bubble';
import { getFormattedDateFromISO } from '../../util';
import { BaseModal } from '../../components/modal';
import { ActionConst, Actions } from 'react-native-router-flux';
import { BasicHeader } from '../../components/headers';
import { SquareCard } from '../../components/cards';
import { getAlbum, getPictureList } from '../../api';

const roadbuddiesDummyData = [{ name1: 'person1', id: '1' }, { name1: 'person2', id: '2' }, { name1: 'person3', id: '3' }, { name1: 'person4', id: '4' }, { name1: 'person5', id: '6' }, { name1: 'person6', id: '6' }, { name1: 'person7', id: '7' }, { name1: 'person8', id: '8' }, { name1: 'person9', id: '9' }]


class Album extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isVisiblePicture: false,
            selectedPicture: null
        };
    }
    componentDidMount() {
        this.props.getAlbum(this.props.user.userId);
    }
    componentDidUpdate(prevProps, prevState) {
        if (prevProps.albumList !== this.props.albumList) {
            console.log('did update')
            const pictureIdList = [];
            this.props.albumList.forEach((album) => {
                if (!album.profilePicture && album.profilePictureId) {
                    pictureIdList.push(album.profilePictureId.replace(THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG));
                }
            })
            console.log('pictureIdList : ', pictureIdList)
            if (pictureIdList.length > 0) {
                this.props.getPictureList(pictureIdList);
            }
        }
    }
    onPressBackButton = () => {
        Actions.pop()
    }

    openPicture = (item) => {
        console.log('openPicture : ', item);
        this.setState({ selectedPicture: item, isVisiblePicture: true });
    }

    onCancelVisiblePicture = () => {
        this.setState({ selectedPicture: null, isVisiblePicture: false })
    }

    albumKeyExtractor = (item) => item.profilePictureId


    render() {
        const { user, albumList } = this.props;
        const { isVisiblePicture, selectedPicture } = this.state;
        return <View style={styles.fill}>
            <BaseModal alignCenter={true} isVisible={isVisiblePicture} onCancel={this.onCancelVisiblePicture} onPressOutside={this.onCancelVisiblePicture}>
                <View style={{ backgroundColor: '#fff' }}>
                    <View style={styles.closeIconContainer}>
                        <IconButton iconProps={{ name: 'close', type: 'Ionicons', style: { fontSize: widthPercentageToDP(5), color: '#fff' } }} style={{}} onPress={() => this.setState({ isVisiblePicture: false, selectedPicture: null })} />
                    </View>
                    <View style={{ height: heightPercentageToDP(70), width: widthPercentageToDP(92), justifyContent: 'center', alignItems: 'center', paddingBottom: heightPercentageToDP(6) }}>
                        <View style={{ height: heightPercentageToDP(58), width: widthPercentageToDP(82) }}>
                            {
                                selectedPicture === null ?
                                    null :
                                    <ImageBackground source={selectedPicture.profilePicture ? { uri: selectedPicture.profilePicture } : require('../../assets/img/profile-pic.png')} style={{ height: null, width: null, flex: 1, borderRadius: 0 }} />
                            }
                        </View>
                    </View>
                </View>
            </BaseModal>
            <View style={APP_COMMON_STYLES.statusBar}>
                <StatusBar translucent backgroundColor='black' barStyle="light-content" />
            </View>
            <View style={styles.fill}>
                <BasicHeader title='My Photos'
                    leftIconProps={{ reverse: true, name: 'md-arrow-round-back', type: 'Ionicons', onPress: this.onPressBackButton }}
                    rightIconProps={{ reverse: true, name: 'md-add', type: 'Ionicons', rightIconPropsStyle: styles.rightIconPropsStyle, style: { color: '#fff', fontSize: heightPercentageToDP(3.5) } }} />
                <View style={{ marginTop: heightPercentageToDP(9.6), flex: 1 }}>
                    <FlatList
                        numColumns={3}
                        data={albumList}
                        columnWrapperStyle={{ justifyContent: 'flex-start' }}
                        keyExtractor={this.albumKeyExtractor}
                        renderItem={({ item, index }) => (
                            <View style={{ margin: 2, flexDirection: 'column' }}>
                                {/* <View style={{borderWidth:2.5, borderColor:'#ffffff'}}> */}
                                <SquareCard
                                    squareCardPlaceholder={require('../../assets/img/profile-pic.png')}
                                    item={item}
                                    imageStyle={styles.imageStyle}
                                    onPress={() => this.openPicture(item)}
                                />

                            </View>
                        )}
                    />

                </View>
            </View >
        </View>
    }
}
const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    const { hasNetwork } = state.PageState
    const { albumList } = state.Album
    return { user, hasNetwork, albumList };
}
const mapDispatchToProps = (dispatch) => {
    return {
        showAppNavMenu: () => dispatch(appNavMenuVisibilityAction(true)),
        getAlbum: (userId) => dispatch(getAlbum(userId)),
        getPictureList: (pictureIdList) => getPictureList(pictureIdList, (pictureObj) => {
            dispatch(updateAlbumListAction({ pictureObj }))
        }, (error) => {
            console.log('getPictureList album error : ', error)
            // dispatch(updateFriendInListAction({ userId: friendId }))
        }),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(Album);

const styles = StyleSheet.create({
    fill: {
        flex: 1,
        backgroundColor: '#fff',
    },
    rightIconPropsStyle: {
        height: heightPercentageToDP(4.2),
        width: widthPercentageToDP(7),
        backgroundColor: '#F5891F',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 19,
        color: 'white'
    },
    imageStyle: {
        height: heightPercentageToDP(20),
        width: widthPercentageToDP(32.6)
    },
    closeIconContainer: {
        height: heightPercentageToDP(5),
        width: widthPercentageToDP(8),
        borderRadius: 22,
        backgroundColor: '#F5891F',
        marginLeft: widthPercentageToDP(16),
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        top: heightPercentageToDP(-1.5),
        right: widthPercentageToDP(-1.5)
    }
});
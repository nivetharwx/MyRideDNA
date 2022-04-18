import React, { Component } from 'react';
import { View, StyleSheet, FlatList, } from 'react-native';
import {  CUSTOM_FONTS, PageKeys, GET_PICTURE_BY_ID, THUMBNAIL_TAIL_TAG, PORTRAIT_TAIL_TAG } from '../../constants';
import {  ImageButton } from '../../components/buttons';
import { connect } from 'react-redux';
import { DefaultText } from '../../components/labels';
import { BasePage } from '../../components/pages';
import { getGroupMembers, getLikes } from '../../api';
import { setCurrentFriendAction } from '../../actions';
import { Actions } from 'react-native-router-flux';

class Likes extends Component {
    constructor(props) {
        super(props);
        this.state = {
            likes: [],
        }
    }

    componentDidMount() {
        console.log('\n\n\n this.props.notificationBody : ', this.props.notificationBody)
        if (this.props.comingFrom === PageKeys.CHAT) {
            getGroupMembers(this.props.groupData.id, this.props.user.userId, true, 0).then(({ data }) => {
                this.setState({ likes: data.groupMembers.length > 0 ? data.groupMembers : [] })
            });
        }
        else if(this.props.comingFrom === PageKeys.NOTIFICATIONS){
            getLikes( this.props.notificationBody.tragetId, this.props.notificationBody.reference.targetScreen === 'POST_DETAIL'?'post':'ride').then(({ data }) => {
                this.setState({ likes: data.likes.length > 0 ? data.likes : [] })
            })
        }
        else {
            getLikes(this.props.id, this.props.type).then(({ data }) => {
                this.setState({ likes: data.likes.length > 0 ? data.likes : [] })
            })
        }

    }

    componentDidUpdate(prevProps, prevState) {
    }

    openFriendsProfile = (item)=>{
        console.log('\n\n\n item : ', item)
        if (item.userId === this.props.user.userId) {
            Actions.push(PageKeys.PROFILE, { tabProps: { activeTab: 0 } });
        }
        else if (item.isFriend) {
            this.props.setCurrentFriend({ userId: item.userId || item.memberId });
            Actions.push(PageKeys.FRIENDS_PROFILE, { frienduserId: item.userId || item.memberId });
        }
        else {
            Actions.push(PageKeys.PASSENGER_PROFILE, { isUnknown: true, person: { ...item, userId: item.userId || item.memberId } })
        }
    }

    render() {
        const { user } = this.props;
        const { likes } = this.state;
        return (
            <BasePage heading={`${this.props.comingFrom === PageKeys.CHAT ? 'Group Members' : 'Likes'}`} rootContainerSafePadding={20}>
                <FlatList
                    style={styles.contentBody}
                    keyboardShouldPersistTaps="handled"
                    data={likes}
                    keyExtractor={item => item.id || item.memberId}
                    renderItem={({ item }) => (
                        <View style={{ flexDirection: 'row', marginTop: 12 }}>
                            {
                                this.props.comingFrom === PageKeys.CHAT
                                    ? <View style={{ flexDirection: 'row' }}>
                                        <ImageButton pictureStyle={{ resizeMode: null }} imgStyles={{ height: 40, width: 40, borderRadius: 20, overflow: 'hidden' }} imageSrc={item.profilePictureId ? { uri: `${GET_PICTURE_BY_ID}${item.profilePictureId.replace(THUMBNAIL_TAIL_TAG, PORTRAIT_TAIL_TAG)}` } : require('../../assets/img/profile-pic-placeholder.png')} onPress={() => this.openFriendsProfile(item)} />
                                        <DefaultText style={styles.name}>{item.name}</DefaultText>
                                    </View>
                                    :
                                    <View style={{ flexDirection: 'row' }}>
                                        <ImageButton pictureStyle={{ resizeMode: null }} imgStyles={{ height: 40, width: 40, borderRadius: 20, overflow: 'hidden' }} imageSrc={(item.profilePictureList && item.profilePictureList[0]) ? { uri: `${GET_PICTURE_BY_ID}${item.profilePictureList[0].pictureName.replace(THUMBNAIL_TAIL_TAG, PORTRAIT_TAIL_TAG)}` } : require('../../assets/img/profile-pic-placeholder.png')} onPress={() => this.openFriendsProfile(item)} />
                                        <DefaultText style={styles.name}>{item.userName}</DefaultText>
                                    </View>
                            }
                        </View>
                    )}
                />
            </BasePage>
        );
    }
}
const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    const { hasNetwork, lastApi, isRetryApi } = state.PageState
    return { user, hasNetwork, lastApi, isRetryApi };
}
const mapDispatchToProps = (dispatch) => {
    return {
        setCurrentFriend: (data) => dispatch(setCurrentFriendAction(data)),
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Likes);
const styles = StyleSheet.create({
    fill: {
        flex: 1,
        backgroundColor: '#fff',
    },
    contentBody: {
        marginLeft: 28
    },
    thumbnail: {
        height: 40,
        width: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignSelf: 'center',
    },
    name: {
        alignSelf: 'center',
        color: '#1D527C',
        fontFamily: CUSTOM_FONTS.robotoBold,
        fontSize: 14,
        marginLeft: 10
    }
});
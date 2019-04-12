import React, { PureComponent } from 'react';
import { View, StatusBar, KeyboardAvoidingView, Keyboard, FlatList, TextInput, Text, AppState, ScrollView } from 'react-native';
import { connect } from 'react-redux';
import { BasicHeader } from '../../components/headers';
import { Actions } from 'react-native-router-flux';
import { Icon as NBIcon, Tabs, Tab, TabHeading, ScrollableTab, Item, Toast, ListItem, Left, Body, Thumbnail, Right, CheckBox } from 'native-base';
import styles from './styles';
import { APP_COMMON_STYLES, widthPercentageToDP, heightPercentageToDP, IS_ANDROID } from '../../constants';
import { IconLabelPair } from '../../components/labels';
import { IconButton } from '../../components/buttons';
import Contacts from 'react-native-contacts';
import Permissions from 'react-native-permissions';
import { searchForFriend, sendFriendRequest, sendInvitationOrRequest } from '../../api';
import { clearSearchFriendListAction, resetFriendRequestResponseAction, resetInvitationResponseAction } from '../../actions';
import { isValidEmailFormat } from '../../util';

class ContactsSection extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            activeTab: 0,
            canSubmit: false,
            recieverEmail: '',
            hasOpenedSettings: false,
            isVisibleSearchModal: false,
            searchName: '',
            selectedMember: null,
            userEnteredEmail: '',
            customMessage: ''
        };
    }

    async componentDidMount() {
        AppState.addEventListener('change', this.handleAppStateChange);
        try {
            await Permissions.request('contacts');
            this.readDeviceContacts();
        } catch (er) {
            console.log("Error: ", er);
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.searchResults !== this.props.searchResults) {
            if (this.props.searchResults === null) {
                this.setState({ isVisibleSearchModal: false });
            } else {
                if (this.state.isVisibleSearchModal === false) {
                    this.setState({ isVisibleSearchModal: true });
                }
            }
        }
        if (prevProps.friendRequestSuccess !== this.props.friendRequestSuccess) {
            if (this.props.friendRequestSuccess !== null) {
                Toast.show({
                    text: "Friend request sent successfully",
                    buttonText: 'Okay',
                    type: 'success',
                    position: 'bottom',
                    onClose: () => this.props.clearFriendRequestResponse()
                });
                this.setState({ selectedMember: null, searchName: null, userEnteredEmail: '', customMessage: '', canSubmit: false });
            }
        } else if (prevProps.friendRequestError !== this.props.friendRequestError) {
            if (this.props.friendRequestError !== null) {
                Toast.show({
                    text: this.props.friendRequestError.userMessage,
                    buttonText: 'Okay',
                    position: 'bottom',
                    type: 'danger',
                    onClose: () => this.props.clearFriendRequestResponse()
                });
            }
        }
        if (prevProps.invitationSuccess !== this.props.invitationSuccess) {
            if (this.props.invitationSuccess !== null) {
                Toast.show({
                    text: "Request sent successfully",
                    buttonText: 'Okay',
                    type: 'success',
                    position: 'bottom',
                    onClose: () => this.props.clearInvitationResponse()
                });
                this.setState({ selectedMember: null, searchName: null, userEnteredEmail: '', customMessage: '', canSubmit: false });
            }
        } else if (prevProps.invitationError !== this.props.invitationError) {
            if (this.props.invitationError !== null) {
                Toast.show({
                    text: this.props.invitationError.userMessage,
                    buttonText: 'Okay',
                    position: 'bottom',
                    type: 'danger',
                    onClose: () => this.props.clearInvitationResponse()
                });
            }
        }
    }

    readDeviceContacts = () => {
        Contacts.getAll((err, contacts) => {
            if (err === 'denied') {
                Toast.show({
                    text: 'Please accept request to access your contacts',
                    buttonText: 'OK',
                    duration: 2000,
                    onClose: async (e) => {
                        if (e === 'user') {
                            await Permissions.openSettings();
                            this.setState({ hasOpenedSettings: true });
                        }
                    }
                });
                return;
            }
            setTimeout(() => {
                this.setState({
                    deviceContacts: contacts.reduce((list, contact) => {
                        list.push({
                            id: contact.recordID,
                            thumbnailPath: contact.thumbnailPath,
                            email: contact.emailAddresses.length > 0 ? contact.emailAddresses[0].email : null,
                            name: contact.givenName ? contact.middleName ? contact.givenName + contact.middleName : contact.givenName : '',
                            note: contact.note
                        })
                        return list;
                    }, [])
                });
            }, 0);
        });
    }

    handleAppStateChange = (nextAppState) => {
        if (nextAppState === 'active') {
            if (this.state.hasOpenedSettings) {
                this.setState({ hasOpenedSettings: false });
                this.readDeviceContacts();
            }
        }
    }

    contactKeyExtractor = (item) => item.id;

    renderDeviceContact = ({ item, index }) => {
        return <ListItem disabled={item.email === null} avatar style={{ marginLeft: 0 }}>
            <Left style={{ paddingLeft: 5 }}>
                {
                    item.thumbnailPath
                        ? <Thumbnail source={{ uri: item.thumbnailPath }} />
                        : <View style={{ alignItems: 'center', justifyContent: 'center', width: widthPercentageToDP(10), height: widthPercentageToDP(10), borderWidth: 2, borderColor: '#6B7663', borderRadius: widthPercentageToDP(5), backgroundColor: item.email === null ? '#6B7663' : '#FFF' }}>
                            <Text style={{ color: item.email === null ? '#FFF' : '#6B7663', fontWeight: 'bold' }}>{item.name.charAt(0)}</Text>
                        </View>
                }
            </Left>
            <Body>
                <Text>{item.name}</Text>
                {
                    item.note
                        ? <Text note>{item.note}</Text>
                        : null
                }
            </Body>
            <Right style={{ borderBottomWidth: 0 }}>

            </Right>
        </ListItem>
    }

    componentWillUnmount() {
        AppState.removeEventListener('change', this.handleAppStateChange);
    }

    onPressBackButton = () => Actions.pop();

    onChangeTab = ({ from, i }) => {
        this.setState({ activeTab: i });
    }

    onCancelSearchModal = () => {
        this.setState({ isVisibleSearchModal: false });
    }

    searchResultsKeyExtractor = (item) => item.userId;

    selectCommunityMember = (index) => {
        Keyboard.dismiss();
        this.setState({
            selectedMember: this.props.searchResults[index],
            searchName: this.props.searchResults[index].name,
            canSubmit: true
        }, () => {
            this.props.clearSearchResults();
        });
    }

    onClearSearchName = () => {
        this.setState({ searchName: '', selectedMember: null, canSubmit: false });
    }

    onClearUserEnteredEmail = () => this.setState({ userEnteredEmail: '', canSubmit: false });

    onClearCustomMessage = () => this.setState({ customMessage: '' });

    searchInCommunity = (val) => {
        this.setState({ searchName: val, selectedMember: null }, () => {
            if (this.state.searchName !== '') {
                this.props.searchForFriend(val, this.props.user.userId, 0);
            }
        });
        // if (val.slice(-1) !== '') {

        //     this.setState({ recieverEmail: val, canSubmit: val.trim().length > 0 });
        // } else if (val.trim().length === 0 && this.state.canSubmit) {
        //     this.setState({ canSubmit: false });
        // }
    }

    onChangeEmail = (val) => this.setState({ userEnteredEmail: val });

    onChangeCustomMessage = (val) => this.setState({ customMessage: val });

    validateEmail = () => {
        if (this.state.userEnteredEmail !== '' && isValidEmailFormat(this.state.userEnteredEmail)) {
            this.setState({ canSubmit: true });
        }
    }

    sendInvitationOrRequest = () => {
        if (this.state.selectedMember !== null) {
            this.sendFriendRequest();
        } else {
            this.sendFriendInvitation();
        }
    }

    sendFriendRequest = () => {
        const { user } = this.props;
        const { selectedMember } = this.state;
        const requestBody = {
            senderId: user.userId,
            senderName: user.name,
            senderNickname: user.nickname,
            senderEmail: user.email,
            userId: selectedMember.userId,
            name: selectedMember.name,
            nickname: selectedMember.nickname,
            email: selectedMember.email,
            actionDate: new Date().toISOString()
        };
        this.props.sendFriendRequest(requestBody);
    }

    sendFriendInvitation = () => {
        // TODO: Pass proper params customMessage, email, userId
        // TODO: Check this.state.customMessage add default message if empty
        console.log("sendFriendInvitation called");
        const { user } = this.props;
        this.props.sendInvitationOrRequest({
            senderId: user.userId,
            senderName: user.name,
            senderNickname: user.nickname,
            senderEmail: user.email,
            emailList: [this.state.userEnteredEmail],
            date: new Date().toISOString()
        })
    }

    renderCommunityMember = ({ item, index }) => {
        return (
            <ListItem avatar onPress={() => this.selectCommunityMember(index)}>
                <Left style={{ alignItems: 'center', justifyContent: 'center' }}>
                    {
                        item.profilePictureThumbnail
                            ? <Thumbnail source={{ uri: 'Image URL' }} />
                            : <NBIcon active name="person" type='MaterialIcons' style={{ width: widthPercentageToDP(6), color: '#fff' }} />
                    }
                </Left>
                <Body>
                    <Text style={{ color: '#fff' }}>{item.name}</Text>
                    <Text style={{ color: '#fff' }} note></Text>
                </Body>
                <Right>

                </Right>
            </ListItem>
        );
    }

    render() {
        const { activeTab, canSubmit, deviceContacts, customMessage, isVisibleSearchModal, userEnteredEmail, searchName, selectedMember } = this.state;
        const { user, searchResults } = this.props;
        return (
            <View style={styles.rootContainer}>
                <View style={APP_COMMON_STYLES.statusBar}>
                    <StatusBar translucent backgroundColor={APP_COMMON_STYLES.statusBarColor} barStyle="light-content" />
                </View>
                <View style={styles.fill}>
                    <BasicHeader title='Connect with people' leftIconProps={{ reverse: true, name: 'md-arrow-round-back', type: 'Ionicons', onPress: this.onPressBackButton }} />
                    {
                        isVisibleSearchModal
                            ? <View style={styles.searchMemberModal}>
                                <View style={{ flex: 1 }}>
                                    {
                                        <IconButton iconProps={{ name: 'close', type: 'MaterialCommunityIcons', style: { fontSize: widthPercentageToDP(8), color: 'white', alignSelf: user.handDominance === 'left' ? 'flex-start' : 'flex-end' } }} onPress={this.onCancelSearchModal} />
                                    }
                                    {
                                        searchResults && searchResults.length > 0
                                            ? <FlatList
                                                keyboardShouldPersistTaps='handled'
                                                style={{ marginTop: widthPercentageToDP(4) }}
                                                contentContainerStyle={{ paddingBottom: searchResults.length > 0 ? heightPercentageToDP(8) : 0 }}
                                                data={searchResults}
                                                keyExtractor={this.searchResultsKeyExtractor}
                                                renderItem={this.renderCommunityMember}
                                                extraData={this.state}
                                            />
                                            : <Text style={{ alignSelf: 'center', color: APP_COMMON_STYLES.infoColor, fontSize: widthPercentageToDP(5), letterSpacing: 1, fontWeight: 'bold' }}>Not found any users</Text>
                                    }
                                </View>
                            </View>
                            : null
                    }
                    <Tabs onChangeTab={this.onChangeTab} style={{ flex: 1, backgroundColor: '#fff', marginTop: APP_COMMON_STYLES.headerHeight }} renderTabBar={() => <ScrollableTab ref={elRef => this.tabsRef = elRef} activeTab={activeTab} backgroundColor='#E3EED3' underlineStyle={{ height: 0 }} />}>
                        <Tab
                            heading={<TabHeading style={{ width: widthPercentageToDP(33.33), backgroundColor: activeTab === 0 ? '#81BB41' : '#E3EED3' }}>
                                <IconLabelPair containerStyle={styles.tabHeaderContent} text={`Community`} textStyle={{ color: activeTab === 0 ? '#fff' : '#6B7663', fontSize: widthPercentageToDP(3) }} iconProps={{ name: 'account-group', type: 'MaterialCommunityIcons', style: { color: activeTab === 0 ? '#fff' : '#6B7663' } }} />
                            </TabHeading>}>
                            <ScrollView style={styles.fill} contentContainerStyle={styles.formContent}>
                                <Item style={styles.itemField}>
                                    <TextInput clearButtonMode='always' value={searchName} onChangeText={this.searchInCommunity} style={styles.fill} placeholder='Name of MyRideDNA user' placeholderTextColor='#6B7663' />
                                    <IconButton iconProps={{ name: 'close-circle', type: 'MaterialCommunityIcons' }} onPress={this.onClearSearchName} />
                                </Item>
                                <Text style={styles.sectionDeviderText}>OR</Text>
                                <Item disabled={selectedMember !== null} style={styles.itemField}>
                                    <TextInput value={userEnteredEmail} onChangeText={this.onChangeEmail} onBlur={this.validateEmail} editable={selectedMember === null} style={styles.fill} placeholder='Send to email' placeholderTextColor='#6B7663' />
                                    <IconButton iconProps={{ name: 'close-circle', type: 'MaterialCommunityIcons' }} onPress={this.onClearUserEnteredEmail} />
                                </Item>
                                <Item disabled={selectedMember !== null} style={[styles.itemField, styles.textareaItem]}>
                                    <TextInput editable={selectedMember === null} multiline={true} maxLength={160} value={customMessage} onChangeText={this.onChangeCustomMessage} style={styles.fill} placeholder='Your message to the person (160 characters or less)' placeholderTextColor='#6B7663' />
                                    <IconButton iconProps={{ name: 'close-circle', type: 'MaterialCommunityIcons' }} onPress={this.onClearCustomMessage} />
                                </Item>
                            </ScrollView>
                            <IconButton iconProps={{ name: 'send-o', type: 'FontAwesome', style: styles.enabledStyle }} style={[styles.submitBtn, styles.enabledStyle]} onPress={this.sendInvitationOrRequest} disabled={!canSubmit} />
                        </Tab>
                        <Tab
                            heading={<TabHeading style={{ width: widthPercentageToDP(33.3), backgroundColor: activeTab === 1 ? '#81BB41' : '#E3EED3', borderColor: '#fff', borderRightWidth: 1, borderLeftWidth: 1 }}>
                                <IconLabelPair containerStyle={styles.tabHeaderContent} text={`Device\nContacts`} textStyle={{ color: activeTab === 1 ? '#fff' : '#6B7663', fontSize: widthPercentageToDP(3) }} iconProps={{ name: 'contacts', type: 'MaterialIcons', style: { color: activeTab === 1 ? '#fff' : '#6B7663' } }} />
                            </TabHeading>}>
                            <View style={styles.tabContent}>
                                <FlatList
                                    keyboardShouldPersistTaps='handled'
                                    data={deviceContacts}
                                    renderItem={this.renderDeviceContact}
                                    keyExtractor={this.contactKeyExtractor}
                                />
                            </View>
                        </Tab>
                        <Tab
                            heading={<TabHeading style={{ width: widthPercentageToDP(33.3), backgroundColor: activeTab === 2 ? '#81BB41' : '#E3EED3' }}>
                                <IconLabelPair containerStyle={styles.tabHeaderContent} text={`Facebook`} textStyle={{ color: activeTab === 2 ? '#fff' : '#6B7663', fontSize: widthPercentageToDP(3) }} iconProps={{ name: 'logo-facebook', type: 'Ionicons', style: { color: activeTab === 2 ? '#fff' : '#6B7663' } }} />
                            </TabHeading>}>
                            <View style={styles.rootContainer}>

                            </View>
                        </Tab>
                    </Tabs>
                </View>
            </View>
        );
    }
}
const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    const { searchResults, friendRequestSuccess, friendRequestError, invitationSuccess, invitationError } = state.CommunitySearchList;
    return { user, searchResults, friendRequestSuccess, friendRequestError, invitationSuccess, invitationError };
};
const mapDispatchToProps = (dispatch) => {
    return {
        searchForFriend: (searchParam, userId, pageNumber) => dispatch(searchForFriend(searchParam, userId, pageNumber)),
        clearSearchResults: () => dispatch(clearSearchFriendListAction()),
        clearFriendRequestResponse: () => dispatch(resetFriendRequestResponseAction()),
        clearInvitationResponse: () => dispatch(resetInvitationResponseAction()),
        sendFriendRequest: (requestBody) => dispatch(sendFriendRequest(requestBody)),
        sendInvitationOrRequest: (requestBody) => dispatch(sendInvitationOrRequest(requestBody)),
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(ContactsSection);
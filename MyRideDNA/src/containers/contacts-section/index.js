import React, { PureComponent } from 'react';
import { View, StatusBar, KeyboardAvoidingView, FlatList, TextInput, Text, AppState } from 'react-native';
import { connect } from 'react-redux';
import { BasicHeader } from '../../components/headers';
import { Actions } from 'react-native-router-flux';
import { Tabs, Tab, TabHeading, ScrollableTab, Item, Toast, ListItem, Left, Body, Thumbnail, Right } from 'native-base';
import styles from './styles';
import { APP_COMMON_STYLES, widthPercentageToDP, heightPercentageToDP } from '../../constants';
import { IconLabelPair } from '../../components/labels';
import { IconButton } from '../../components/buttons';
import Contacts from 'react-native-contacts';
import Permissions from 'react-native-permissions';

class ContactsSection extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            activeTab: 0,
            canSubmit: false,
            recieverEmail: '',
            hasOpenedSettings: false
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
                            name: contact.givenName + contact.middleName,
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

    searchInCommunity = (val) => {
        if (val.slice(-1) !== '') {
            // TODO: API call, search for friend
            this.setState({ recieverEmail: val, canSubmit: val.trim().length > 0 });
        } else if (val.trim().length === 0 && this.state.canSubmit) {
            this.setState({ canSubmit: false });
        }
    }

    sendInvitationOrRequest = () => {
        console.log("sendInvitationOrRequest called");
    }

    render() {
        const { activeTab, canSubmit, deviceContacts } = this.state;
        return (
            <View style={styles.rootContainer}>
                <View style={APP_COMMON_STYLES.statusBar}>
                    <StatusBar translucent backgroundColor={APP_COMMON_STYLES.statusBarColor} barStyle="light-content" />
                </View>
                <View style={styles.fill}>
                    <BasicHeader title='Connect with people' leftIconProps={{ reverse: true, name: 'md-arrow-round-back', type: 'Ionicons', onPress: this.onPressBackButton }} />
                    <Tabs onChangeTab={this.onChangeTab} style={{ flex: 1, backgroundColor: '#fff', marginTop: APP_COMMON_STYLES.headerHeight }} renderTabBar={() => <ScrollableTab ref={elRef => this.tabsRef = elRef} activeTab={activeTab} backgroundColor='#E3EED3' underlineStyle={{ height: 0 }} />}>
                        <Tab
                            heading={<TabHeading style={{ width: widthPercentageToDP(33.33), backgroundColor: activeTab === 0 ? '#81BB41' : '#E3EED3' }}>
                                <IconLabelPair containerStyle={styles.tabHeaderContent} text={`Community`} textStyle={{ color: activeTab === 0 ? '#fff' : '#6B7663' }} iconProps={{ name: 'account-group', type: 'MaterialCommunityIcons', style: { color: activeTab === 0 ? '#fff' : '#6B7663' } }} />
                            </TabHeading>}>
                            <KeyboardAvoidingView behavior='padding' style={styles.tabContent}>
                                <View>
                                    <Item style={styles.itemField}>
                                        <TextInput onChangeText={this.searchInCommunity} style={styles.fill} placeholder='Name of MyRideDNA user' placeholderTextColor='#6B7663' />
                                    </Item>
                                    <Text style={styles.sectionDeviderText}>OR</Text>
                                    <Item style={styles.itemField}>
                                        <TextInput style={styles.fill} placeholder='Send to email' placeholderTextColor='#6B7663' />
                                    </Item>
                                    <Item style={[styles.itemField, styles.textareaItem]}>
                                        <TextInput multiline={true} clearButtonMode='while-editing' maxLength={160} style={styles.fill} placeholder='Your message to the person (160 characters or less)' placeholderTextColor='#6B7663' />
                                    </Item>
                                </View>
                                <IconButton iconProps={{ name: 'send-o', type: 'FontAwesome', style: styles.enabledStyle }} style={[styles.submitBtn, styles.enabledStyle]} onPress={this.sendInvitationOrRequest} disabled={!canSubmit} />
                            </KeyboardAvoidingView>
                        </Tab>
                        <Tab
                            heading={<TabHeading style={{ width: widthPercentageToDP(33.3), backgroundColor: activeTab === 1 ? '#81BB41' : '#E3EED3', borderColor: '#fff', borderRightWidth: 1, borderLeftWidth: 1 }}>
                                <IconLabelPair containerStyle={styles.tabHeaderContent} text={`Device Contacts`} textStyle={{ color: activeTab === 1 ? '#fff' : '#6B7663' }} iconProps={{ name: 'contacts', type: 'MaterialIcons', style: { color: activeTab === 1 ? '#fff' : '#6B7663' } }} />
                            </TabHeading>}>
                            <View style={styles.tabContent}>
                                <FlatList
                                    data={deviceContacts}
                                    renderItem={this.renderDeviceContact}
                                    keyExtractor={this.contactKeyExtractor}
                                />
                            </View>
                        </Tab>
                        <Tab
                            heading={<TabHeading style={{ width: widthPercentageToDP(33.3), backgroundColor: activeTab === 2 ? '#81BB41' : '#E3EED3' }}>
                                <IconLabelPair containerStyle={styles.tabHeaderContent} text={`Facebook`} textStyle={{ color: activeTab === 2 ? '#fff' : '#6B7663' }} iconProps={{ name: 'logo-facebook', type: 'Ionicons', style: { color: activeTab === 2 ? '#fff' : '#6B7663' } }} />
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
    return {};
};
const mapDispatchToProps = (dispatch) => {
    return {};
};
export default connect(mapStateToProps, mapDispatchToProps)(ContactsSection);
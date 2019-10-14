import React, { Component } from 'react';
import { View, ImageBackground, Text, Alert, StatusBar, ScrollView, FlatList, TextInput, KeyboardAvoidingView, TouchableOpacity, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import { appNavMenuVisibilityAction } from '../../actions';
import { ShifterButton, IconButton, LinkButton } from '../../components/buttons';
import { Thumbnail, Item, List, Icon as NBIcon } from 'native-base';
import { APP_COMMON_STYLES, widthPercentageToDP, WindowDimensions, heightPercentageToDP, PageKeys } from '../../constants';
import { ChatBubble } from '../../components/bubble';
import { getFormattedDateFromISO } from '../../util';
import { BaseModal } from '../../components/modal';
import { ActionConst, Actions } from 'react-native-router-flux';
import { BasicHeader } from '../../components/headers';
import { SquareCard } from '../../components/cards';
import { getAlbum } from '../../api';

const roadbuddiesDummyData = [{ name1: 'person1', id: '1' }, { name1: 'person2', id: '2' }, { name1: 'person3', id: '3' }, { name1: 'person4', id: '4' }, { name1: 'person5', id: '6' }, { name1: 'person6', id: '6' }, { name1: 'person7', id: '7' }, { name1: 'person8', id: '8' }, { name1: 'person9', id: '9' }]


class Album extends Component {

    constructor(props) {
        super(props);
        this.state = {

        };
    }
    componentDidMount() {
        this.props.getAlbum(this.props.user.userId);
    }
    componentDidUpdate(prevProps, prevState) {

    }
    onPressBackButton = () => {
        Actions.pop()
    }

    roadBuddiesKeyExtractor = (item) => item.id


    render() {
        const { user, albumList } = this.props;
        console.log('albumList : ',albumList)
        return <View style={styles.fill}>
            <View style={APP_COMMON_STYLES.statusBar}>
                <StatusBar translucent backgroundColor='black' barStyle="light-content" />
            </View>
            <View style={styles.fill}>
                <BasicHeader title='My Photos'
                    leftIconProps={{ reverse: true, name: 'md-arrow-round-back', type: 'Ionicons', onPress: this.onPressBackButton }}
                    rightIconProps={{ reverse: true, name: 'md-add', type: 'Ionicons', rightIconPropsStyle: styles.rightIconPropsStyle, style: { color: '#fff', fontSize: heightPercentageToDP(3.5) } }} />
                <View style={{ marginTop: heightPercentageToDP(9.6), flex:1}}>
                    <FlatList
                        numColumns={3}
                        data={roadbuddiesDummyData}
                        columnWrapperStyle={{ justifyContent:'space-evenly'}}
                        keyExtractor={this.roadBuddiesKeyExtractor}
                        renderItem={({ item, index }) => (
                            <View style={{margin:2,flexDirection: 'column'}}>
                            {/* <View style={{borderWidth:2.5, borderColor:'#ffffff'}}> */}
                                <SquareCard
                                    squareCardPlaceholder={require('../../assets/img/profile-pic.png')}
                                    item={item}
                                    imageStyle={styles.imageStyle}
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
    imageStyle:{
        height:heightPercentageToDP(20),
        width:widthPercentageToDP(32.6)
    }
});
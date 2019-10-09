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

class Album extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
           
        };
    }
    componentDidMount() {
        
    }
    componentDidUpdate(prevProps, prevState) {
        
    }

    


    render() {
        const { user} = this.props;
        return <View style={styles.fill}>
            <View style={APP_COMMON_STYLES.statusBar}>
                <StatusBar translucent backgroundColor='black' barStyle="light-content" />
            </View>
            <View style={styles.fill}>
            <Text>Album</Text>
            </View >
        </View>
    }
}
const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    const { hasNetwork } = state.PageState
    return { user, hasNetwork };
}
const mapDispatchToProps = (dispatch) => {
    return {
        showAppNavMenu: () => dispatch(appNavMenuVisibilityAction(true)),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(Album);

const styles = StyleSheet.create({
    fill: {
        flex: 1,
        backgroundColor: '#fff'
    }
});
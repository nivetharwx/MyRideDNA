import React, { Component } from 'react';
import { View, ImageBackground, StatusBar, FlatList, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { connect } from 'react-redux';
import { IconButton } from '../../../../../components/buttons';
import { APP_COMMON_STYLES, widthPercentageToDP, heightPercentageToDP, PageKeys, THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG, POST_TYPE, PORTRAIT_TAIL_TAG } from '../../../../../constants';
import { BaseModal } from '../../../../../components/modal';
import { Actions } from 'react-native-router-flux';
import { BasicHeader } from '../../../../../components/headers';
import { SquareCard } from '../../../../../components/cards';
import { DefaultText } from '../../../../../components/labels';
import { appNavMenuVisibilityAction } from '../../../../../actions';

class BikeSpecs extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {

    }

    componentDidUpdate(prevProps, prevState) {
    }

    showAppNavMenu = () => this.props.showAppNavMenu();

    onPressBackButton = () => Actions.pop();

    openPostForm = () => Actions.push(PageKeys.POST_FORM, { comingFrom: Actions.currentScene, postType: this.props.postType, currentBikeId: this.props.bike.spaceId });

    renderHeader = () => {
        let title = '';
        switch (this.props.postType) {
            case POST_TYPE.WISH_LIST:
                title = 'Wish List';
                break;
            case POST_TYPE.MY_RIDE:
                title = 'My Ride';
        }
        return <BasicHeader title={title}
            leftIconProps={{ reverse: true, name: 'md-arrow-round-back', type: 'Ionicons', onPress: this.onPressBackButton }}
            rightIconProps={{ reverse: true, name: 'md-add', type: 'Ionicons', rightIconPropsStyle: styles.rightIconPropsStyle, style: { color: '#fff', fontSize: 19 }, onPress: this.openPostForm }}
        />
    }

    render() {
        return <View style={styles.fill}>
            <View style={APP_COMMON_STYLES.statusBar}>
                <StatusBar translucent backgroundColor={APP_COMMON_STYLES.statusBarColor} barStyle="light-content" />
            </View>
            <View style={styles.fill}>
                {this.renderHeader()}
                <View style={styles.fill}>
                    
                </View>
            </View>
        </View>
    }
}

const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    const { hasNetwork, postTypes } = state.PageState;
    const { currentBikeId, activeBikeIndex } = state.GarageInfo;
    const currentBikeIndex = state.GarageInfo.spaceList.findIndex(({ spaceId }) => spaceId === currentBikeId);
    const bike = currentBikeIndex === -1 ? null : state.GarageInfo.spaceList[currentBikeIndex];
    return { user, hasNetwork, bike, activeBikeIndex, currentBikeIndex, postTypes };
}
const mapDispatchToProps = (dispatch) => {
    return {
        showAppNavMenu: () => dispatch(appNavMenuVisibilityAction(true)),
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(BikeSpecs);

const styles = StyleSheet.create({
    fill: {
        flex: 1,
    },
    rightIconPropsStyle: {
        height: 27,
        width: 27,
        borderRadius: 13.5,
        backgroundColor: '#F5891F'
    }
});
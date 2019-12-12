import React, { Component } from 'react';
import { View, ImageBackground, StatusBar, FlatList, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { connect } from 'react-redux';
import { IconButton, LinkButton } from '../../../../../components/buttons';
import { APP_COMMON_STYLES, widthPercentageToDP, heightPercentageToDP, PageKeys, THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG, POST_TYPE, PORTRAIT_TAIL_TAG, GET_PICTURE_BY_ID } from '../../../../../constants';
import { BaseModal } from '../../../../../components/modal';
import { Actions } from 'react-native-router-flux';
import { BasicHeader } from '../../../../../components/headers';
import { SquareCard } from '../../../../../components/cards';
import { DefaultText } from '../../../../../components/labels';
import { appNavMenuVisibilityAction } from '../../../../../actions';
import { getPosts } from '../../../../../api';

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

    onPressDeleteSpec = () => { }

    render() {
        const { showOptionsModal } = this.state;
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
                <BasicHeader title={null}
                    leftIconProps={{ reverse: true, name: 'md-arrow-round-back', type: 'Ionicons', onPress: this.onPressBackButton }}
                    rightIconProps={{ name: 'options', type: 'SimpleLineIcons', style: { color: '#fff', fontSize: 20 }, onPress: this.showOptionsModal }}
                />
                <View style={styles.pageContent}>
                </View>
            </View>
        </View>
    }
}

const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    const { hasNetwork, postTypes } = state.PageState;
    const { currentBike: bike, activeBikeIndex } = state.GarageInfo;
    return { user, hasNetwork, bike, activeBikeIndex, postTypes };
}
const mapDispatchToProps = (dispatch) => {
    return {
        showAppNavMenu: () => dispatch(appNavMenuVisibilityAction(true)),
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
});
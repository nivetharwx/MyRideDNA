import React, { Component } from 'react';
import { SafeAreaView, Text } from 'react-native';
import { PageKeys } from '../../constants';
import { ShifterButton } from '../../components/buttons';
import { Actions } from 'react-native-router-flux';
import { MenuModal } from '../../components/modal';
import Rides from '../rides';
import Map from '../map';

export class AppNavigationMenu extends Component {
    constructor(props) {
        super(props);
        rootScreen = PageKeys.MAP;
        this.state = {
            currentScreen: PageKeys.MAP,
            showAppNavigation: false,
        };
    }

    toggleAppNavigation = () => this.setState(prevState => ({ showAppNavigation: !prevState.showAppNavigation }));

    onCloseAppNavMenu = () => this.setState(prevState => ({ showAppNavigation: false }));

    onPressAppNavMenu = (screenKey) => {
        this.setState(prevState => ({ showAppNavigation: false, currentScreen: screenKey }), () => {
            this.rootScreen !== screenKey ? Actions.push(screenKey, {}) : Actions.popTo(this.rootScreen);
        });
    }

    renderScreen() {
        const { currentScreen } = this.state;
        switch (currentScreen) {
            case PageKeys.RIDES:
                return <Rides />
        }
    }

    render() {
        const { currentScreen, showAppNavigation } = this.state;
        return (
            <SafeAreaView style={{ flex: 1 }}>
                <MenuModal isVisible={showAppNavigation} activeMenu={currentScreen} onClose={this.onCloseAppNavMenu} onPressNavMenu={this.onPressAppNavMenu} />
                <Map />
                {
                    this.rootScreen != currentScreen && this.renderScreen()
                }
                {/* Shifter: - Brings the menu */}
                <ShifterButton onPress={this.toggleAppNavigation} />
            </SafeAreaView>
        );
    }
}
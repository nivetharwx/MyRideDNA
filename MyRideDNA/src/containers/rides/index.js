import React, { Component } from 'react';
import { SafeAreaView, Text } from 'react-native';
import { connect } from 'react-redux';

import { Tabs } from '../../components/tabs';
import { Accordion } from "native-base";
import { PageKeys } from '../../constants';
import { Actions } from 'react-native-router-flux';
import { ShifterButton } from '../../components/buttons';
import { appNavMenuVisibilityAction } from '../../actions';

export class Rides extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    showAppNavMenu = () => this.props.showAppNavMenu();

    render() {
        return (
            <SafeAreaView style={{ flex: 1 }}>
                {/* <Accordion
                    dataArray={}
                    headerStyle={{ backgroundColor: "#b7daf8" }}
                    contentStyle={{ backgroundColor: "#ddecf8" }}
                /> */}

                <Text>RIDES</Text>

                {/* Shifter: - Brings the menu */}
                <ShifterButton onPress={this.showAppNavMenu} />
            </SafeAreaView>
        );
    }

    componentWillUnmount() {
        console.log("Rides unmounted");
    }
}

const mapStateToProps = (state) => {
    const { showMenu } = state.TabVisibility;
    return { showMenu };
}

const mapDispatchToProps = (dispatch) => {
    return {
        showAppNavMenu: () => dispatch(appNavMenuVisibilityAction(true))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Rides);
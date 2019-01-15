import React, { Component } from 'react';
import { View, Text } from 'react-native';

export class Garage extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }


    render() {
        return (
            <View style={{ flex: 1 }}>
                <Text>Garage</Text>
            </View>
        );
    }
}
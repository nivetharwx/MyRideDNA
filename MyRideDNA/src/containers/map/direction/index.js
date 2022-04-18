import React, { Component } from 'react';
import { StyleSheet, View,} from 'react-native';
import { connect } from 'react-redux';
import MapboxGL from '@mapbox/react-native-mapbox-gl';
import styles from '../styles';

class Direction extends Component {
    _mapView = null;
    constructor(props) {
        super(props);
        this.state = {
            mapViewHeight: 0,
        };
    }

    componentDidMount() {
    }

    componentDidUpdate(prevProps, prevState) {
    }


    render() {
        const { } = this.props;
        const {mapViewHeight } = this.state;
        return (
            <View style={{flex:1}}>
                 <MapboxGL.MapView
                    // showUserLocation={true}
                    contentInset={10}
                    styleURL={MapboxGL.StyleURL.Street}
                    zoomLevel={5}
                    // centerCoordinate={this.state.defaultCenterCoords}
                    style={[styles.fillParent, { marginTop: 0 }]}
                    ref={el => this._mapView = el}
                    compassEnabled={true}
                    onLayout={({ nativeEvent }) => {
                        const { height } = nativeEvent.layout;
                        height != this.state.mapViewHeight && this.setState({ mapViewHeight: height })
                    }}
                    surfaceView={true}
                    zoomEnabled={true}
                    scrollEnabled={true}
                    pitchEnabled={true}
                    rotateEnabled={true}
                ></MapboxGL.MapView>
            </View>
        );
    }
}
const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    return { user };
}
const mapDispatchToProps = (dispatch) => {
    return {
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(Direction);

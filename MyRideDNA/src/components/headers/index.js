import React from 'react';
import {
    SafeAreaView,
    View,
    TouchableOpacity,
    TouchableHighlight,
    Text,
    StyleSheet,
    Animated,
    TextInput
} from 'react-native';
import { Icon as NBIcon, InputGroup } from 'native-base';
import { WindowDimensions } from '../../constants';

export class BasicHeader extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            searchbarAnim: new Animated.Value(-WindowDimensions.width),
            searchbarMode: props.searchbarMode
        }
    }

    componentDidUpdate() {
        if (this.props.searchbarMode != this.state.searchbarMode) {
            this.animateHeader(this.props.searchbarMode);
        }
    }

    animateHeader = (showSearchbar) => {
        if (showSearchbar === false) {
            Animated.timing(this.state.searchbarAnim, {
                toValue: -WindowDimensions.width,
                duration: 300,
                useNativeDriver: true
            }).start(() => this.setState({ searchbarMode: showSearchbar }));
        } else {
            this.setState({ searchbarMode: showSearchbar }, () => {
                Animated.timing(this.state.searchbarAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true
                }).start()
            });
        }
    }

    render() {
        const { headerHeight, leftIconProps, title, rightIconProps, onCancelSearchMode, searchValue, onChangeSearchValue } = this.props;
        const { searchbarAnim, searchbarMode } = this.state;

        const searchCancelAnim = searchbarAnim.interpolate({
            inputRange: [-WindowDimensions.width, 0],
            outputRange: [0, 1]
        });
        const searchClearAnim = searchbarAnim.interpolate({
            inputRange: [-WindowDimensions.width, 0],
            outputRange: [0, 1]
        });

        return (
            <SafeAreaView style={[styles.header, { height: headerHeight ? headerHeight : 60 }]}>
                {
                    searchbarMode === false
                        ? <View style={{ flex: 1, flexDirection: 'row' }}>
                            {
                                leftIconProps
                                    ? <View style={{ marginHorizontal: 20, alignItems: 'center', justifyContent: 'center' }}>
                                        <TouchableOpacity style={leftIconProps.reverse ? styles.iconPadding : null} onPress={leftIconProps.onPress}>
                                            <NBIcon name={leftIconProps.name} type={leftIconProps.type} style={[{
                                                fontSize: 25,
                                                color: leftIconProps.reverse ? 'black' : 'white'
                                            }, leftIconProps.style]} />
                                        </TouchableOpacity>
                                    </View>
                                    : null
                            }
                            {
                                title
                                    ? <View style={{ flex: 1, alignSelf: 'center', marginHorizontal: leftIconProps ? 0 : 20 }}>
                                        <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
                                            {title}
                                        </Text>
                                    </View>
                                    : null
                            }
                            {
                                rightIconProps
                                    ? <Animated.View style={{ marginHorizontal: 20, alignItems: 'center', justifyContent: 'center' }}>
                                        <TouchableOpacity style={rightIconProps.reverse ? styles.iconPadding : null} onPress={typeof rightIconProps.onPress === 'function' && rightIconProps.onPress}>
                                            <NBIcon name={rightIconProps.name} type={rightIconProps.type} style={[{
                                                fontSize: 25,
                                                color: rightIconProps.reverse ? 'black' : 'white'
                                            }, rightIconProps.style]} />
                                        </TouchableOpacity>
                                    </Animated.View>
                                    : null
                            }
                        </View>
                        : <Animated.View style={{ flex: 1, flexDirection: 'row', translateX: searchbarAnim }}>
                            <Animated.View style={{ marginHorizontal: 20, alignItems: 'center', justifyContent: 'center', opacity: searchCancelAnim }}>
                                <TouchableOpacity onPress={onCancelSearchMode}>
                                    <NBIcon name='md-arrow-round-back' type='Ionicons' style={{
                                        fontSize: 25,
                                        color: 'white'
                                    }} />
                                </TouchableOpacity>
                            </Animated.View>
                            <View style={{ flex: 1, justifyContent: 'center' }}>
                                <TextInput style={{ color: '#fff', borderBottomColor: '#fff', borderBottomWidth: 2, marginRight: this.props.onClearSearchValue ? 0 : 10 }}
                                    value={searchValue} onChangeText={onChangeSearchValue}
                                />
                            </View>
                            {
                                this.props.onClearSearchValue
                                    ? <Animated.View style={{ marginHorizontal: 20, alignItems: 'center', justifyContent: 'center', opacity: searchClearAnim }}>
                                        <TouchableOpacity onPress={this.onClearSearchValue}>
                                            <NBIcon name='close' type='MaterialCommunityIcons' style={{
                                                fontSize: 25,
                                                color: 'white'
                                            }} />
                                        </TouchableOpacity>
                                    </Animated.View>
                                    : null
                            }
                        </Animated.View>
                }
            </SafeAreaView>
        );

    }
}

export class SearchHeader extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            widthAnim: new Animated.Value(20)
        }
    }
    render() {
        const { widthAnim } = this.state;
        return (
            <SafeAreaView style={styles.header}>
                <TouchableOpacity>
                    <NBIcon name='menu' type='MaterialIcons' style={{ color: '#fff' }} />
                </TouchableOpacity>
                <TouchableOpacity>
                    <NBIcon name='search' type='FontAwesome' style={{ color: '#fff' }} />
                </TouchableOpacity>
            </SafeAreaView>
        );
    }
}


const styles = StyleSheet.create({
    header: {
        position: 'absolute',
        // alignItems: 'center',
        top: 0,
        left: 0,
        width: '100%',
        overflow: 'hidden',
        backgroundColor: '#0076B5',
        zIndex: 100,
        flexDirection: 'row',
    },
    iconPadding: {
        padding: 5,
        backgroundColor: 'white',
        borderRadius: 19,
        height: 38,
        width: 38,
        alignItems: 'center',
        justifyContent: 'center'
    },
})
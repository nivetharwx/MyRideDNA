import React from 'react';
import {
    SafeAreaView,
    View,
    TouchableOpacity,
    Text,
    StyleSheet,
    Animated,
    TextInput,
    Platform
} from 'react-native';
import { Icon as NBIcon } from 'native-base';
import { WindowDimensions, APP_COMMON_STYLES, widthPercentageToDP } from '../../constants';
import { IconButton } from '../buttons';

export class BasicHeader extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            searchbarAnim: new Animated.Value(-WindowDimensions.width),
            searchbarMode: props.searchbarMode,
            titleEditingMode: false
        }
    }

    componentDidUpdate() {
        if (this.props.searchbarMode != this.state.searchbarMode) {
            this.animateHeader(this.props.searchbarMode);
        }
    }

    toggleTitleEditingMode = () => this.setState(prevState => ({ titleEditingMode: !prevState.titleEditingMode }));

    onTitleSubmit = ({ nativeEvent }) => {
        this.props.onSubmitTitleEditing && this.props.onSubmitTitleEditing(nativeEvent.text);
        this.setState({ titleEditingMode: false });
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
        const { leftIconProps, title, rightIconProps, onCancelSearchMode,
            searchValue, onChangeSearchValue, hasEditableTitle, style, searchIconProps } = this.props;
        const { searchbarAnim, searchbarMode, titleEditingMode } = this.state;

        const searchCancelAnim = searchbarAnim.interpolate({
            inputRange: [-WindowDimensions.width, 0],
            outputRange: [0, 1]
        });
        const searchClearAnim = searchbarAnim.interpolate({
            inputRange: [-WindowDimensions.width, 0],
            outputRange: [0, 1]
        });

        return (
            <View style={[styles.header, style]}>
                {
                    searchbarMode === false || searchbarMode === undefined
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
                            <View style={{ flex: 1, alignSelf: 'center', marginHorizontal: leftIconProps ? 0 : 20 }}>
                                {
                                    titleEditingMode === false
                                        ? hasEditableTitle
                                            ? <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
                                                    {title}
                                                </Text>
                                                <IconButton style={{ paddingHorizontal: 0 }} onPress={this.toggleTitleEditingMode} iconProps={{ name: 'edit', type: 'MaterialIcons', style: { color: '#fff' } }} />
                                            </View>
                                            : <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
                                                {title}
                                            </Text>
                                        : <View style={{ flexDirection: 'row', marginRight: rightIconProps ? 20 : 0, justifyContent: 'space-between', alignItems: 'center' }}>
                                            <IconButton style={{ marginRight: '8%' }} onPress={this.toggleTitleEditingMode} iconProps={{ name: 'md-arrow-round-back', type: 'Ionicons', style: { color: '#fff' } }} />
                                            <TextInput style={{ flex: 1, color: '#fff', borderBottomColor: '#fff', borderBottomWidth: 2, fontSize: 16 }}
                                                defaultValue={title} maxLength={20} onSubmitEditing={this.onTitleSubmit}
                                            />
                                        </View>
                                }
                            </View>
                            {
                                searchIconProps
                                    ? <Animated.View style={{ marginHorizontal: 20, alignItems: 'center', justifyContent: 'center' }}>
                                        <TouchableOpacity style={searchIconProps.reverse ? styles.iconPadding : null} onPress={searchIconProps.onPress && searchIconProps.onPress}>
                                            <NBIcon name={searchIconProps.name} type={searchIconProps.type} style={[{
                                                fontSize: 25,
                                                color: searchIconProps.reverse ? 'black' : 'white'
                                            }, searchIconProps.style]} />
                                        </TouchableOpacity>
                                    </Animated.View>
                                    : null
                            }
                            {
                                rightIconProps
                                    ? <Animated.View style={{ marginHorizontal: 20, alignItems: 'center', justifyContent: 'center' }}>
                                        <TouchableOpacity style={rightIconProps.reverse ? styles.iconPadding : null} onPress={rightIconProps.onPress && rightIconProps.onPress}>
                                            <NBIcon name={rightIconProps.name} type={rightIconProps.type} style={[{
                                                fontSize: 25,
                                                color: rightIconProps.reverse ? 'black' : 'white'
                                            }, rightIconProps.style]} />
                                        </TouchableOpacity>
                                    </Animated.View>
                                    : null
                            }
                        </View>
                        : <Animated.View style={{ flex: 1, flexDirection: 'row', transform: [{ translateX: searchbarAnim }] }}>
                            <Animated.View style={{ marginHorizontal: 20, alignItems: 'center', justifyContent: 'center', opacity: searchCancelAnim }}>
                                <IconButton onPress={onCancelSearchMode} iconProps={{
                                    name: 'md-arrow-round-back', type: 'Ionicons', style: {
                                        fontSize: 25,
                                        color: 'white'
                                    }
                                }} />
                            </Animated.View>
                            <View style={{ flex: 1, justifyContent: 'center' }}>
                                <TextInput style={{ color: '#fff', borderBottomColor: '#fff', borderBottomWidth: 2, marginRight: this.props.onClearSearchValue ? 0 : 10 }}
                                    value={searchValue} onChangeText={onChangeSearchValue} autoFocus={true}
                                />
                            </View>
                            {
                                this.props.onClearSearchValue
                                    ? <Animated.View style={{ marginHorizontal: 20, alignItems: 'center', justifyContent: 'center', opacity: searchClearAnim }}>
                                        <IconButton onPress={this.props.onClearSearchValue} iconProps={{
                                            name: 'close', type: 'MaterialCommunityIcons', style: {
                                                fontSize: 25,
                                                color: 'white'
                                            }
                                        }} />
                                    </Animated.View>
                                    : null
                            }
                        </Animated.View>
                }
            </View>
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
        backgroundColor: APP_COMMON_STYLES.headerColor,
        zIndex: 100,
        flexDirection: 'row',
        height: APP_COMMON_STYLES.headerHeight,
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
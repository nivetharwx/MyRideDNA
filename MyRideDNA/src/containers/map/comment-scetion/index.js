import React, { Component } from 'react';
import { StyleSheet, View, Text, TextInput, FlatList } from 'react-native';
import { connect } from 'react-redux';
import { heightPercentageToDP, widthPercentageToDP, APP_COMMON_STYLES } from '../../../constants';
import { IconButton } from '../../../components/buttons';
import { Item } from 'native-base';

class CommentSection extends Component {
    txtInputRef = null;
    constructor(props) {
        super(props);
        this.state = {
            showEditConentent: false,
            description: null
        };
    }

    onPressEdit = () => {
        this.setState({ showEditConentent: true }, () => {
            this.txtInputRef.focus();
        });
    }

    onSubmitDescription = ({ nativeEvent }) => {
        this.setState({ description: nativeEvent.text + '', showEditConentent: false });
    }

    onPressSubmit = () => {
        const text = this.txtInputRef._lastNativeText;
        if (typeof text === 'undefined') return;
        this.setState({ description: text + '', showEditConentent: false });
    }

    render() {
        const { point, onClose, isEditable } = this.props;
        const { description, showEditConentent } = this.state;
        return (
            <View style={styles.modalRoot}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.headerText}>{point.name}</Text>
                        {
                            isEditable && description && !showEditConentent
                                ? <IconButton onPress={this.onPressEdit} style={{ backgroundColor: 'transparent', alignSelf: 'center', alignItems: 'flex-end', justifyContent: 'flex-end' }}
                                    iconProps={{ name: 'edit', type: 'MaterialIcons', style: { color: '#fff' } }} />
                                : null
                        }
                        <IconButton onPress={onClose} style={{ marginLeft: widthPercentageToDP(2), backgroundColor: 'transparent', alignSelf: 'center', alignItems: 'flex-end', justifyContent: 'flex-end' }}
                            iconProps={{ name: 'window-close', type: 'MaterialCommunityIcons', style: { color: '#fff' } }} />
                    </View>
                    <View style={styles.bodyContent}>
                        <Text>{description}</Text>
                    </View>
                    {
                        showEditConentent || description === null
                            ? <Item style={styles.msgInputBoxContainer}>
                                {/* <IconButton style={styles.footerLeftIcon} iconProps={{ name: 'md-attach', type: 'Ionicons' }} /> */}
                                <TextInput ref={el => this.txtInputRef = el} defaultValue={description} placeholder='Add description here' style={{ flex: 1, marginRight: widthPercentageToDP(1) }} onSubmitEditing={this.onSubmitDescription} />
                                <IconButton iconProps={{ name: 'md-send', type: 'Ionicons', style: { color: APP_COMMON_STYLES.headerColor } }} onPress={this.onPressSubmit} />
                            </Item>
                            : null
                    }
                </View>
            </View>
        );
    }
}
const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    return { user };
}
const mapDispatchToProps = (dispatch) => {
    return {};
}
export default connect(mapStateToProps, mapDispatchToProps)(CommentSection);

const styles = StyleSheet.create({
    modalRoot: {
        backgroundColor: 'rgba(0,0,0,0.3)',
        flex: 1,
        // flexDirection: 'row',
    },
    container: {
        marginTop: heightPercentageToDP(25),
        marginHorizontal: widthPercentageToDP(5),
        width: widthPercentageToDP(90),
        height: '50%',
        backgroundColor: '#fff',
    },
    header: {
        backgroundColor: APP_COMMON_STYLES.headerColor,
        height: APP_COMMON_STYLES.headerHeight,
        position: 'absolute',
        zIndex: 100,
        width: '100%',
        alignItems: 'center',
        flexDirection: 'row',
        paddingHorizontal: widthPercentageToDP(2)
    },
    headerText: {
        color: 'white',
        fontSize: widthPercentageToDP(4),
        fontWeight: 'bold',
        flex: 1,
        marginLeft: 5
    },
    bodyContent: {
        flex: 1,
        marginTop: APP_COMMON_STYLES.headerHeight,
        paddingVertical: heightPercentageToDP(2),
        paddingHorizontal: widthPercentageToDP(2)
    },
    bodyPadding: {
        paddingBottom: heightPercentageToDP(2)
    },
    msgInputBoxContainer: {
        borderColor: APP_COMMON_STYLES.headerColor,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderLeftWidth: 2,
        borderRightWidth: 2,
        height: heightPercentageToDP(8),
        borderRadius: heightPercentageToDP(4),
    },
    footerLeftIcon: {
        marginLeft: 10
    },
});
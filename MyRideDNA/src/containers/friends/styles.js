import { CUSTOM_FONTS } from "../../constants";

const styles = {
    fill: {
        flex: 1
    },
    activeTab: {
        backgroundColor: '#000000'
    },
    inActiveTab: {
        backgroundColor: '#81BA41'
    },
    borderRightWhite: {
        borderRightWidth: 1,
        borderColor: '#fff'
    },
    borderLeftWhite: {
        borderLeftWidth: 1,
        borderColor: '#fff'
    },
    tabText: {
        fontSize: 13,
        fontFamily: CUSTOM_FONTS.robotoBold,
        letterSpacing: 0.6
    },
    headerRtIconContainer: {
        height: 27,
        width: 27,
        backgroundColor: '#F5891F',
        borderRadius: 13.5
    },
    addIcon: {
        color: '#fff',
        fontSize: 19
    },
};

export default styles;
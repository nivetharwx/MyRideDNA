import { WindowDimensions, widthPercentageToDP } from "../../constants";

const styles = {
    fill: {
        flex: 1
    },
    tabContentCont: {
        paddingHorizontal: 0
    },
    bottomTabContainer: {
        position: 'absolute',
        zIndex: 900,
        bottom: 0,
        // paddingBottom: IS_ANDROID ? 0 : 20,
        height: '100%',
        width: '100%',
    },
    bottomTab: {
        alignItems: 'center',
        justifyContent: 'center',
        width: widthPercentageToDP(33.3),
    }
};

export default styles;
// import { createSelector } from 'reselect';

// const getBikes = ({ GarageInfo }) => GarageInfo.spaceList;
// const getCurrentBikeId = ({ GarageInfo }) => GarageInfo.currentBikeId;

// export const getCurrentBikeState = createSelector(
//     [getBikes, getCurrentBikeId],
//     (bikes, bikeId) => {
//         let currentBikeIndex = -1;
//         const bike = bikes.find(({ spaceId }, index) => {
//             if (spaceId === bikeId) {
//                 currentBikeIndex = index;
//                 return true;
//             }
//             return false;
//         });
//         return { bike, currentBikeIndex };
//     }
// );
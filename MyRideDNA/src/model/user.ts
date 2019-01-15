export class User {
    userId: string;
    email: string;
    password: string;
    isThirdParty: boolean;
    name: string;
    nickname?: string;
    homeAddress?: HomeAddress;
    dob?: string;
    gender?: string;
    profilePicture?: string;
    additionalPicturesList?: Array<string>;
    locationEnable: boolean;
    profilePictureThumbnail?: string;
    profilePictureId?: string;
    distanceUnit?: string;
    locationRadius?: number;
    timeIntervalInSeconds?: number;

    constructor(user: User) {
        this.userId = user.userId;
        this.dob = user.dob;
        this.email = user.email;
        this.gender = user.gender;
        this.homeAddress = user.homeAddress || new HomeAddress();
        this.isThirdParty = user.isThirdParty;
        this.locationEnable = user.locationEnable;
        this.name = user.name;
        this.nickname = user.nickname;
        this.password = user.password;
        this.profilePicture = user.profilePicture;
        this.profilePictureThumbnail = user.profilePictureThumbnail;
        this.additionalPicturesList = user.additionalPicturesList || [];
        this.profilePictureId = user.profilePictureId;
        this.distanceUnit = user.distanceUnit || 'km';
        this.timeIntervalInSeconds = user.timeIntervalInSeconds || 10;
        this.locationRadius = user.locationRadius || 1;
    }
}

class HomeAddress {
    address: string;
    city: string;
    zipCode: number;
    state: string;
    country: string;
}
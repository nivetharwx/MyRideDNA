export class Marker {
    id?: string;
    lat: number;
    lng: number;
    date: string;
    name?: string;
    comment?: string;
    description?: string;
    displayMode?: string;
    address?: string;
}

export class RideInfo {
    rideId?: string = null;
    userId?: string = null;
    date?: string = null;
    name?: string = null;
    waypoints?: Array<Marker> = [];
    trackpoints?: Array<any> = [];
    privacyMode?: 'private' | 'public' | 'friends' = 'private';
    source?: Marker = null;
    destination?: Marker = null;
    isHighway?: boolean = true;
    isRecorded?: boolean = false;
    status?: 'running' | 'paused' | 'completed' = null;
    fromRideId?: string = null;
}
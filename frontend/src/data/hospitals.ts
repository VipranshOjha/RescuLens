export interface Hospital {
    id: string;
    name: string;
    lat: number;
    lon: number;
    beds: number;
    capabilities: string[];
}

export const HOSPITALS: Hospital[] = [
    {
        id: "H1",
        name: "City Trauma Center",
        lat: 23.23,
        lon: 77.40,
        beds: 4,
        capabilities: ["trauma", "cardiac", "icu"]
    },
    {
        id: "H2",
        name: "Metro Cardiac Institute",
        lat: 23.26,
        lon: 77.43,
        beds: 2,
        capabilities: ["cardiac", "icu"]
    },
    {
        id: "H3",
        name: "Green Valley Clinic",
        lat: 23.28,
        lon: 77.45,
        beds: 12,
        capabilities: ["general"]
    }
];

export const getHospitalByName = (name: string): Hospital | undefined => {
    return HOSPITALS.find(h => h.name === name);
};

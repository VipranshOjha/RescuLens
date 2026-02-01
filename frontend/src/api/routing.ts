import axios from 'axios';

// Using OSRM Public Demo Server
// NOTE: This is for demonstration purposes only. Production apps should use a self-hosted instance or a commercial provider.
const OSRM_API_BASE = 'https://router.project-osrm.org/route/v1/driving';

export interface RouteResponse {
    routes: {
        geometry: string; // encoded polyline or geojson depending on param
        duration: number;
        distance: number;
    }[];
}

/**
 * Fetches a driving route between two points.
 * @param start [lat, lon]
 * @param end [lat, lon]
 * @returns Array of [lat, lon] points representing the path
 */
export const getRoute = async (start: [number, number], end: [number, number]): Promise<[number, number][]> => {
    try {
        // OSRM expects {lon},{lat}
        const startStr = `${start[1]},${start[0]}`;
        const endStr = `${end[1]},${end[0]}`;

        const url = `${OSRM_API_BASE}/${startStr};${endStr}?overview=full&geometries=geojson`;

        const response = await axios.get(url);

        if (response.data.routes && response.data.routes.length > 0) {
            // OSRM returns GeoJSON coordinates as [lon, lat], Leaflet expects [lat, lon]
            const coordinates = response.data.routes[0].geometry.coordinates;
            return coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
        }

        return [start, end]; // Fallback to straight line
    } catch (error) {
        console.error("Failed to fetch route:", error);
        return [start, end]; // Fallback to straight line
    }
};

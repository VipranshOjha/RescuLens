import axios from 'axios';

const API_URL = 'http://localhost:8000';

export interface Incident {
    id: string;
    created_at: string;
    updated_at: string;
    input_text: string;
    symptoms: string[];
    urgency: 'CRITICAL' | 'URGENT' | 'NON-URGENT' | 'ADVICE';
    dispatch_required: boolean;
    dispatch_confirmed?: boolean;
    status: string;
    lat?: number;
    lon?: number;
    reasoning: string[];
    audit_log: any[];
}

export interface AnalyzeResponse {
    incident_id: string;
    symptoms: string[];
    urgency: string;
    dispatch_required: boolean;
    reasoning: string[];
}

export const client = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const api = {
    analyzeText: async (text: string): Promise<AnalyzeResponse> => {
        const response = await client.post<AnalyzeResponse>('/analyze', { text });
        return response.data;
    },

    getIncidents: async (): Promise<Incident[]> => {
        const response = await client.get<Incident[]>('/incidents');
        return response.data;
    },

    getIncident: async (id: string): Promise<Incident> => {
        const response = await client.get<Incident>(`/incident/${id}`);
        return response.data;
    },

    confirmDispatch: async (id: string): Promise<boolean> => {
        const response = await client.post<boolean>(`/incidents/${id}/dispatch`);
        return response.data;
    },

    requestManualReview: async (id: string): Promise<any> => {
        const response = await client.post(`/incidents/${id}/review`);
        return response.data;
    },

    denyDispatch: async (id: string): Promise<any> => {
        const response = await client.post(`/incidents/${id}/deny`);
        return response.data;
    },

    simulateIncidents: async (count: number = 5): Promise<void> => {
        await client.post(`/simulate?cases=${count}`);
    },
};

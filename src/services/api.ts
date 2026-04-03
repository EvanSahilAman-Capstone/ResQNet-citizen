const API_BASE_URL = 'http://10.0.2.2:8000'; // Android emulator -> local backend

export type Broadcast = {
  _id?: string;
  id?: string;
  message?: string;
  priority?: string;
  radius?: number;
  coordinates?: [number, number];
};

export async function fetchBroadcasts(): Promise<Broadcast[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/broadcasts`);

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed: ${response.status} ${text}`);
    }

    const data = await response.json();

    console.log('Broadcast API response:', data);

    if (Array.isArray(data)) return data;
    if (Array.isArray(data.broadcasts)) return data.broadcasts;

    return [];
  } catch (error) {
    console.log('API ERROR:', error);
    return [];
  }
}
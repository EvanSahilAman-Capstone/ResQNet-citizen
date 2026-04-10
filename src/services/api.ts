import Auth0 from 'react-native-auth0';

const API_BASE_URL = 'http://192.168.2.22:8000';

export const auth0 = new Auth0({
  domain: 'resqnet.ca.auth0.com',
  clientId: 'GmO0r2OeT2XLpWM4dxbu1vDuyNimkHdi',
});

export type Broadcast = {
  _id?: string;
  id?: string;
  message?: string;
  priority?: string;
  radius?: number;
  coordinates?: [number, number];
  description?: string;
  timestamp?: string;
  status?: string;
};

export type SafeZone = {
  _id?: string;
  safe_zone_id?: string;
  name?: string;
  description?: string;
  category?: string;
  status?: string;
  coordinates?: [number, number];
  radius_m?: number;
  capacity?: number | null;
  current_count?: number | null;
  contact_info?: string;
};

export async function getAccessToken(): Promise<string> {
  const credentials = await auth0.credentialsManager.getCredentials();
  if (!credentials?.accessToken) {
    throw new Error('No access token available.');
  }
  return credentials.accessToken;
}

async function authorizedFetch(path: string, options: RequestInit = {}) {
  const token = await getAccessToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API failed: ${response.status} ${text}`);
  }

  return response;
}

export async function fetchMe() {
  const response = await authorizedFetch('/api/me');
  return await response.json();
}

export async function fetchBroadcasts(): Promise<Broadcast[]> {
  const response = await authorizedFetch('/broadcasts');
  const data = await response.json();

  if (Array.isArray(data)) return data;
  if (Array.isArray(data.broadcasts)) return data.broadcasts;

  return [];
}

export async function getReportUploadUrl(reportId: string, hazardType: string) {
  const response = await authorizedFetch(
    `/reports/upload-url?report_id=${encodeURIComponent(reportId)}&hazard_type=${encodeURIComponent(hazardType)}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  return await response.json();
}

export async function uploadImageToS3(
  uploadUrl: string,
  formFields: Record<string, string>,
  image: {
    uri: string;
    type?: string;
    fileName?: string;
  }
) {
  try {
    const formData = new FormData();

    Object.entries(formFields).forEach(([key, value]) => {
      formData.append(key, value);
    });

    formData.append('file', {
      uri: image.uri,
      type: image.type || 'image/jpeg',
      name: image.fileName || 'wildfire-report.jpg',
    } as any);

    console.log('S3 upload URL:', uploadUrl);
    console.log('S3 form fields:', JSON.stringify(formFields, null, 2));
    console.log('Image object:', JSON.stringify(image, null, 2));

    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    const responseText = await response.text();
    console.log('S3 upload status:', response.status);
    console.log('S3 upload response:', responseText);

    if (!response.ok) {
      throw new Error(`S3 upload failed: ${response.status} ${responseText}`);
    }

    return true;
  } catch (error: any) {
    console.log('S3 upload error:', error);
    throw error;
  }
}

export async function submitFireReport(payload: any) {
  const response = await authorizedFetch('/reports', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return await response.json();
}

export async function fetchSafeZones(): Promise<{
  safe_zones: SafeZone[];
  count: number;
}> {
  const response = await authorizedFetch('/safe-zones');
  const data = await response.json();

  return {
    safe_zones: Array.isArray(data?.safe_zones) ? data.safe_zones : [],
    count: typeof data?.count === 'number' ? data.count : 0,
  };
}

export async function getNearestSafeZone(lat: number, lng: number): Promise<{
  safe_zones: SafeZone[];
  count: number;
}> {
  const response = await authorizedFetch(
    `/safe-zones/nearest?lat=${lat}&lng=${lng}&limit=1`
  );
  const data = await response.json();

  return {
    safe_zones: Array.isArray(data?.safe_zones) ? data.safe_zones : [],
    count: typeof data?.count === 'number' ? data.count : 0,
  };
}

export async function fetchEvacuationRoute(origin: [number, number]) {
  const response = await authorizedFetch('/api/routing/evacuation', {
    method: 'POST',
    body: JSON.stringify({
      origin: [origin[1], origin[0]],
    }),
  });

  return await response.json();
}
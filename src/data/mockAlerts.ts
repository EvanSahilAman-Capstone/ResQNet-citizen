export type CitizenAlert = {
  _id?: string;
  id?: string;
  message: string;
  priority: string;
  radius: number;
  coordinates: [number, number];
  description: string;
  timestamp: string;
  status: string;
};

export const mockAlerts: CitizenAlert[] = [
  {
    _id: '1',
    message: 'Wildfire near Mississauga north zone',
    priority: 'HIGH',
    radius: 2,
    coordinates: [43.6532, -79.3832],
    description:
      'Residents in the highlighted zone should prepare for evacuation and avoid non-essential travel.',
    timestamp: '2026-04-03 08:30 PM',
    status: 'ACTIVE',
  },
  {
    _id: '2',
    message: 'Smoke hazard expanding toward Oakville',
    priority: 'URGENT',
    radius: 3,
    coordinates: [43.4675, -79.6877],
    description:
      'Heavy smoke is moving into nearby communities. Stay indoors if not under evacuation instruction.',
    timestamp: '2026-04-03 09:10 PM',
    status: 'UPDATED',
  },
  {
    _id: '3',
    message: 'Road obstruction reported near Milton route',
    priority: 'MEDIUM',
    radius: 1,
    coordinates: [43.5183, -79.8774],
    description:
      'Emergency services reported route disruption. Follow updated routing once available.',
    timestamp: '2026-04-03 09:40 PM',
    status: 'ACTIVE',
  },
];
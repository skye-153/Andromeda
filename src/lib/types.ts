export interface FileData {
    id: string;
    name: string;
    originalName: string;
    size: number;
    type: string;
    content: string; // base64 encoded file content
}

export interface Node {
    id: string;
    position: { x: number; y: number };
    title: string;
    description: string;
    links: string[];
    files: FileData[];
    isDone?: boolean;
    size?: string; // e.g., "100%", "150%", "50%"
    color?: string; // e.g., "#FF0000", "blue"
}

export interface MapConnection {
  id: string;
  from: string;
  to: string;
}

export interface MapData {
    id: string;
    name: string;
    nodes: Node[];
    connections: MapConnection[];
}

export interface ICalendarEvent {
  id: string;
  title: string;
  description?: string;
  dueDate?: string; // YYYY-MM-DD format
  isCompleted: boolean;
  isUndated: boolean;
  importance?: 'low' | 'medium' | 'high';
}

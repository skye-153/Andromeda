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

export interface Connection {
    id: string;
    from: string; // from node id
    to: string;   // to node id
}

export interface MapData {
    id: string;
    name: string;
    nodes: Node[];
    connections: Connection[];
}

export interface Task {
    id: string;
    title: string;
    dueDate?: string; // YYYY-MM-DD format
    isCompleted: boolean;
    isUndated: boolean;
}

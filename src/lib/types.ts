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

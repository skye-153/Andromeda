export interface Node {
    id: string;
    position: { x: number; y: number };
    title: string;
    description: string;
    links: string[];
    files: string[];
}

export interface Connection {
    id: string;
    from: string;
    to: string;
}

export interface MapData {
    id: string;
    name: string;
    nodes: Node[];
    connections: Connection[];
}

declare class WebSocketService {
    private wss;
    private clients;
    initialize(server: import('http').Server): void;
    private sendStatsToClient;
    broadcastStats(): Promise<void>;
    getConnectedClientsCount(): number;
}
export declare const webSocketService: WebSocketService;
export {};
//# sourceMappingURL=websocketService.d.ts.map
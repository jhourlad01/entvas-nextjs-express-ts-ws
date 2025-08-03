declare class WebSocketService {
    private wss;
    private clients;
    initialize(server: import('http').Server): void;
    private sendStatsToClient;
    broadcastStats(): Promise<void>;
    getConnectedClientsCount(): number;
    private calculateHourData;
    private calculateDayData;
    private calculateWeekData;
    private calculateTopEventTypes;
}
export declare const webSocketService: WebSocketService;
export {};
//# sourceMappingURL=websocketService.d.ts.map
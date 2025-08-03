export default function HealthPage() {
    return (
        <div>
            <h1>Health Check</h1>
            <p>Status: OK</p>
            <p>Service: Client</p>
            <p>Timestamp: {new Date().toISOString()}</p>
        </div>
    );
}

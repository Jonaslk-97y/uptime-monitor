import { useState, useEffect, JSX } from "react";
import axios from "axios";

// TypeScript Interfaces for type-safety
interface PingHistory {
  timestamp: string;
  status: "UP" | "DOWN";
  responseTime: number;
  statusCode: number;
}

interface Monitor {
  _id: string;
  name: string;
  url: string;
  currentStatus: "UP" | "DOWN";
  lastChecked: string;
  history: PingHistory[];
}

export default function Dashboard(): JSX.Element {
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [name, setName] = useState<string>("");
  const [url, setUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = "http://localhost:5000/api/monitors";

  // Fetch all monitors from backend API
  const fetchMonitors = async (): Promise<void> => {
    try {
      const response = await axios.get<{ success: boolean; data: Monitor[] }>(
        API_URL,
      );
      if (response.data.success) {
        setMonitors(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching monitors:", err);
      setError("Could not connect to the monitoring service backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitors();
    // Poll the backend API every 30 seconds to update live dashboard metrics
    const interval = setInterval(fetchMonitors, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handle adding a new monitor
  const handleAddMonitor = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!name || !url) return;
    setError(null);

    try {
      const response = await axios.post<{ success: boolean; data: Monitor }>(
        API_URL,
        { name, url },
      );
      if (response.data.success) {
        setMonitors([response.data.data, ...monitors]);
        setName("");
        setUrl("");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Failed to create monitor. Ensure URL is valid.");
      }
    }
  };

  // Handle deleting a monitor
  const handleDeleteMonitor = async (id: string): Promise<void> => {
    if (
      !window.confirm("Are you sure you want to stop tracking this endpoint?")
    )
      return;

    try {
      await axios.delete(`${API_URL}/${id}`);
      setMonitors(monitors.filter((m) => m._id !== id));
    } catch (err) {
      console.error("Failed to delete monitor:", err);
      setError("Failed to remove the monitor endpoint.");
    }
  };

  if (loading)
    return (
      <div style={{ color: "#94a3b8" }}>Loading monitored endpoints...</div>
    );

  return (
    <div>
      {/* Global Error Banner */}
      {error && (
        <div
          style={{
            background: "#ef4444",
            color: "white",
            padding: "1rem",
            borderRadius: "6px",
            marginBottom: "1.5rem",
            fontWeight: 600,
          }}
        >
          {error}
        </div>
      )}

      {/* Target Management Form Component */}
      <form className="monitor-form" onSubmit={handleAddMonitor}>
        <input
          type="text"
          placeholder="Service Name (e.g., Google API)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Endpoint URL (https://...)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
        />
        <button type="submit">Add Endpoint</button>
      </form>

      {/* Dashboard Grid System */}
      {monitors.length === 0 ? (
        <p style={{ color: "#94a3b8", textAlign: "center" }}>
          No endpoints currently tracked. Add one above to begin profiling.
        </p>
      ) : (
        <div className="grid">
          {monitors.map((monitor) => {
            // Calculate historical metric values safely
            const totalPings = monitor.history.length;
            const dynamicUptime =
              totalPings > 0
                ? (
                    (monitor.history.filter((h) => h.status === "UP").length /
                      totalPings) *
                    100
                  ).toFixed(1)
                : "100.0";

            const lastPingTime =
              totalPings > 0
                ? `${monitor.history[monitor.history.length - 1].responseTime}ms`
                : "N/A";

            return (
              <div className="card" key={monitor._id}>
                <div>
                  <div className="card-header">
                    <h3>{monitor.name}</h3>
                    <div className="status-badge">
                      <span className={`dot ${monitor.currentStatus}`}></span>
                      {monitor.currentStatus}
                    </div>
                  </div>
                  <div className="url">{monitor.url}</div>
                  <div
                    style={{
                      color: "#94a3b8",
                      fontSize: "0.85rem",
                      lineHeight: "1.5",
                    }}
                  >
                    <div>
                      Uptime Profile:{" "}
                      <strong style={{ color: "#f8fafc" }}>
                        {dynamicUptime}%
                      </strong>
                    </div>
                    <div>
                      Latency Metrics:{" "}
                      <strong style={{ color: "#f8fafc" }}>
                        {lastPingTime}
                      </strong>
                    </div>
                  </div>
                </div>
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteMonitor(monitor._id)}
                >
                  Remove Monitor
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

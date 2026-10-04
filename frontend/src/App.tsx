import { useState } from "react";
import "./App.css";

const EVENT_TYPES = [
  "page_view",
  "product_view",
  "add_to_cart",
  "checkout_started",
  "purchase",
];

type Condition = {
  eventType: string;
  operator: "at_least" | "exactly";
  count: number;
  withinDays: number;
};

function App() {
  const [name, setName] = useState("");
  const [conditions, setConditions] = useState<Condition[]>([
    {
      eventType: "product_view",
      operator: "at_least",
      count: 2,
      withinDays: 7,
    },
  ]);
  const [result, setResult] = useState<{
    name: string;
    asOf: string;
    total: number;
    members: {
      anonymousId: string;
      evidence: {
        eventType: string;
        observedCount: number;
      }[];
    }[];
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [apiError, setApiError] = useState(false);

  const addCondition = () => {
    setConditions([
      ...conditions,
      {
        eventType: "product_view",
        operator: "at_least",
        count: 1,
        withinDays: 7,
      },
    ]);
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const updateCondition = (
    index: number,
    field: keyof Condition,
    value: string | number
  ) => {
    setConditions(
      conditions.map((condition, i) =>
        i === index
          ? {
              ...condition,
              [field]: value,
            }
          : condition
      )
    );
  };

  const previewAudience = async () => {
    setApiError(false);
      if (!name.trim()) {
        setError("Please enter an audience name.");
        return;
      }

      if (conditions.some((condition) => condition.count < 0)) {
        setError("Count cannot be negative.");
        return;
      }

      if (conditions.some((condition) => condition.withinDays < 1)) {
        setError("Time window must be at least 1 day.");
        return;
      }
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(
        "http://localhost:3000/v1/audiences/preview",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            asOf: new Date().toISOString(),
            conditions,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Unable to preview audience");
      }

      const data = await response.json();
      setResult(data);
    } catch {
      setError("Unable to connect to the backend. Please try again.");
      setApiError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="app">
      <div className="container">

        <header className="header">
          <p className="eyebrow">Audience Builder</p>
          <h1>Build an audience</h1>
          <p className="subtitle">
            Define behavioral conditions and preview the users who match them.
          </p>
        </header>

        <div className="card">

          <div className="form-group">
            <label className="form-label">
              Audience name
            </label>

            <input
              className="text-input"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Viewed but did not purchase"
            />
          </div>

          <div className="section-header">
            <h2>Conditions</h2>
            <p className="section-description">
              Users must satisfy all conditions.
            </p>
          </div>

          <div className="conditions">
            {conditions.map((condition, index) => (
              <div className="condition" key={index}>

                <select
                  value={condition.eventType}
                  onChange={(event) =>
                    updateCondition(index, "eventType", event.target.value)
                  }
                >
                  {EVENT_TYPES.map((eventType) => (
                    <option key={eventType} value={eventType}>
                      {eventType}
                    </option>
                  ))}
                </select>

                <select
                  value={condition.operator}
                  onChange={(event) =>
                    updateCondition(index, "operator", event.target.value)
                  }
                >
                  <option value="at_least">at least</option>
                  <option value="exactly">exactly</option>
                </select>

                <input
                  type="number"
                  min="0"
                  value={condition.count}
                  onChange={(event) =>
                    updateCondition(
                      index,
                      "count",
                      Number(event.target.value)
                    )
                  }
                />

                <span className="condition-text">
                  times in the last
                </span>

                <input
                  type="number"
                  min="1"
                  value={condition.withinDays}
                  onChange={(event) =>
                    updateCondition(
                      index,
                      "withinDays",
                      Number(event.target.value)
                    )
                  }
                />

                <span className="condition-text">days</span>

                {conditions.length > 1 && (
                  <button
                    className="remove-condition"
                    onClick={() => removeCondition(index)}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            className="add-condition"
            onClick={addCondition}
          >
            + Add condition
          </button>

          <div className="divider" />

          <button
            className="preview-button"
            onClick={previewAudience}
            disabled={loading}
          >
            {loading ? "Previewing..." : "Preview audience"}
          </button>

          {error && (
            <div className="error">
              <span>{error}</span>

              {apiError && (
                <button
                  className="retry-button"
                  onClick={previewAudience}
                >
                  Retry
                </button>
              )}
            </div>
          )}
        </div>

        {result && (
          <section className="card result-card">

            <div className="result-header">
              <div>
                <p className="result-label">
                  Audience preview
                </p>

                <h2>{result.name}</h2>
              </div>

              <div className="result-count">
                <strong>{result.total}</strong>
                <span>matching users</span>
              </div>
            </div>

            {result.members.length === 0 ? (
              <div className="empty-state">
                No users match these conditions.
              </div>
            ) : (
              <ul className="members">
                {result.members.map((member) => (
                  <li
                    className="member"
                    key={member.anonymousId}
                  >
                    <div className="member-id">
                      {member.anonymousId}
                    </div>

                    <div className="evidence">
                      {member.evidence.map((item) => (
                        <span
                          className="evidence-item"
                          key={item.eventType}
                        >
                          {item.eventType}: {item.observedCount}
                        </span>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            )}

          </section>
        )}
      </div>
    </main>
  );
}

export default App;
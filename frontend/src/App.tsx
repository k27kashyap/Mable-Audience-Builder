import { useState } from "react";

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
    <main>
      <h1>Mable Audience Builder</h1>

      <label>
        Audience name
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. Viewed but did not purchase"
        />
      </label>

      <h2>Conditions</h2>

      {conditions.map((condition, index) => (
        <div key={index}>
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
              updateCondition(index, "count", Number(event.target.value))
            }
          />

          <span>times in the last</span>

          <input
            type="number"
            min="1"
            value={condition.withinDays}
            onChange={(event) =>
              updateCondition(index, "withinDays", Number(event.target.value))
            }
          />

          <span>days</span>

          {conditions.length > 1 && (
            <button onClick={() => removeCondition(index)}>
              Remove
            </button>
          )}
        </div>
      ))}

      <button onClick={addCondition}>Add condition</button>
      <button onClick={previewAudience} disabled={loading}>
        {loading ? "Previewing..." : "Preview audience"}
      </button>

     {error && (
        <div>
          <p>{error}</p>

          {apiError && (
            <button onClick={previewAudience}>
              Retry
            </button>
          )}
        </div>
      )}

      {result && (
        <section>
          <h2>Audience preview</h2>

          <p>
            <strong>{result.total}</strong> matching users
          </p>

          {result.members.length === 0 ? (
            <p>No users match these conditions.</p>
          ) : (
            <ul>
              {result.members.map((member) => (
                <li key={member.anonymousId}>
                  <strong>{member.anonymousId}</strong>

                  <ul>
                    {member.evidence.map((item) => (
                      <li key={item.eventType}>
                        {item.eventType}: {item.observedCount}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </main>
  );
}

export default App;
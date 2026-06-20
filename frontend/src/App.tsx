import { useEffect, useState } from "react";
import "./App.css";

const API_BASE_URL = "";

type Config = {
  battery_capacity_wh: number;
  battery_current_wh: number;
  latitude: number;
  longitude: number;
  timezone: string;
  panel_w: number;
  efficiency: number;
  load_power_w: number;
  Last_Log: string;
};

type CalcItem = {
  percent: number;
  status: string;
  remaining_wh: number;
};

type CalcResponse = {
  Last_Log: string;
  message: string;
  recalculated: boolean;
  result: Record<string, CalcItem>;
};

type SetPoint = {
  keyName: keyof Config;
  message: string;
  value: number | string;
  valueType: "number" | "string";
  x: number;
  y: number;
};

const defaultCircles = [
  { hour: 2, percent: 0, x: 45, y: 10 },
  { hour: 4, percent: 0, x: 180, y: 10 },
  { hour: 6, percent: 0, x: 315, y: 10 },
  { hour: 8, percent: 0, x: 450, y: 10 },
  { hour: 10, percent: 0, x: 585, y: 10 },
  { hour: 12, percent: 0, x: 735, y: 10 },
  { hour: 14, percent: 0, x: 45, y: 120 },
  { hour: 16, percent: 0, x: 180, y: 120 },
  { hour: 18, percent: 0, x: 315, y: 120 },
  { hour: 20, percent: 0, x: 450, y: 120 },
  { hour: 22, percent: 0, x: 585, y: 120 },
  { hour: 24, percent: 0, x: 735, y: 120 },
];

function getStatusColor(percent: number) {
  if (percent > 50) return "#2ecc71";
  if (percent > 30) return "#f1c40f";
  if (percent > 10) return "#e67e22";
  return "#e74c3c";
}

function getBatteryPercent(currentWh: number, capacityWh: number): number {
  const percent = (currentWh / capacityWh) * 100;
  return Math.max(0, Math.min(100, Math.round(percent)));
}

function ForecastCircle(props: {
  hour: number;
  percent: number;
  x: number;
  y: number;
}) {
  return (
    <div
      className="forecast-circle"
      style={{
        left: `${props.x}px`,
        top: `${props.y}px`,
        backgroundColor: getStatusColor(props.percent),
      }}
    >
      <div>{props.hour}時間後</div>
      <div>{props.percent}%</div>
    </div>
  );
}

function EditableBatteryCircle(props: {
  config: Config;
  onChange: (newConfig: Config) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const currentPercent = getBatteryPercent(
    props.config.battery_current_wh,
    props.config.battery_capacity_wh
  );

  function saveValue() {
    if (inputValue === "") return;

    const newValue = Number(inputValue);
    if (Number.isNaN(newValue)) return;

    const fixedValue = Math.max(
      0,
      Math.min(props.config.battery_capacity_wh, newValue)
    );

    props.onChange({
      ...props.config,
      battery_current_wh: fixedValue,
    });

    setEditing(false);
  }

  return (
    <div
      className="big-forecast-circle"
      style={{
        left: "660px",
        top: "300px",
        backgroundColor: getStatusColor(currentPercent),
      }}
      onClick={() => {
        setEditing(true);
        setInputValue(String(props.config.battery_current_wh));
      }}
    >
      {editing ? (
        <input
          autoFocus
          className="set-point-input"
          value={inputValue}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => {
            const value = e.target.value;
            if (/^\d*\.?\d*$/.test(value)) setInputValue(value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") saveValue();
            if (e.key === "Escape") setEditing(false);
          }}
          onBlur={() => setEditing(false)}
        />
      ) : (
        <>
          <div>現在</div>
          <div>{currentPercent}%</div>
          <div>{props.config.battery_current_wh}Wh</div>
        </>
      )}
    </div>
  );
}

function EditableSetPoint(props: {
  point: SetPoint;
  onChange: (point: SetPoint, newValue: number | string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");

  function saveValue() {
    if (inputValue === "") return;

    if (props.point.valueType === "number") {
      const newValue = Number(inputValue);
      if (Number.isNaN(newValue)) return;
      props.onChange(props.point, newValue);
    } else {
      props.onChange(props.point, inputValue);
    }

    setEditing(false);
  }

  return (
    <div
      className="set-point"
      style={{
        left: `${props.point.x}px`,
        top: `${props.point.y}px`,
      }}
      onClick={() => {
        setEditing(true);
        setInputValue(String(props.point.value));
      }}
    >
      {editing ? (
        <input
          autoFocus
          className="set-point-input"
          value={inputValue}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => {
            const value = e.target.value;
            if (props.point.valueType === "number") {
              if (/^\d*\.?\d*$/.test(value)) setInputValue(value);
            } else {
              setInputValue(value);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") saveValue();
            if (e.key === "Escape") setEditing(false);
          }}
          onBlur={() => setEditing(false)}
        />
      ) : (
        <div>
          {props.point.message}: {props.point.value}
        </div>
      )}
    </div>
  );
}

function makeSetPoints(config: Config): SetPoint[] {
  return [
    { keyName: "battery_capacity_wh", message: "バッテリー最大", value: config.battery_capacity_wh, valueType: "number", x: 45, y: 250 },
    { keyName: "latitude", message: "緯度", value: config.latitude, valueType: "number", x: 45, y: 290 },
    { keyName: "longitude", message: "経度", value: config.longitude, valueType: "number", x: 45, y: 330 },
    { keyName: "timezone", message: "タイムゾーン", value: config.timezone, valueType: "string", x: 45, y: 370 },
    { keyName: "load_power_w", message: "1時間当たり消費量(W)", value: config.load_power_w, valueType: "number", x: 45, y: 410 },
    { keyName: "panel_w", message: "ソーラーパネル(W)", value: config.panel_w, valueType: "number", x: 45, y: 450 },
    { keyName: "efficiency", message: "パネル効率", value: config.efficiency, valueType: "number", x: 45, y: 490 },
  ];
}

export default function App() {
  const [config, setConfig] = useState<Config | null>(null);
  const [setPoints, setSetPoints] = useState<SetPoint[]>([]);
  const [calc, setCalc] = useState<Record<string, CalcItem> | null>(null);

  async function fetchCalc() {
    try {
      const res = await fetch(`${API_BASE_URL}/calc`);
      const data: CalcResponse = await res.json();

      console.log("calc data", data);

      setCalc(data.result);

    } catch (error) {
      console.error("calc取得エラー:", error);
    }
  }



  async function saveConfigAndCalc(newConfig: Config) {

    const configForSave = {
    ...newConfig,
    Last_Log: "",
  };

    setConfig(newConfig);
    setSetPoints(makeSetPoints(newConfig));

    await fetch(`${API_BASE_URL}/config`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(configForSave),
    });

    await fetchCalc();
  }

  useEffect(() => {
    async function init() {
      try {
        const configRes = await fetch(`${API_BASE_URL}/config`);
        const configData: Config = await configRes.json();

        setConfig(configData);
        setSetPoints(makeSetPoints(configData));

        const calcRes = await fetch(`${API_BASE_URL}/calc`);
        const calcData: CalcResponse = await calcRes.json();

        setCalc(calcData.result);

        if (calcData.Last_Log) {
          const newConfig = {
            ...configData,
            Last_Log: calcData.Last_Log,
          };

          setConfig(newConfig);
          setSetPoints(makeSetPoints(newConfig));
        }
      } catch (error) {
        console.error("初期取得エラー:", error);
      }
    }

    init();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      fetchCalc();
    }, 300000);

    return () => clearInterval(timer);
  }, []);

  function updateSetPoint(point: SetPoint, newValue: number | string) {
    if (config === null) return;

    const newConfig = {
      ...config,
      [point.keyName]: newValue,
    };

    saveConfigAndCalc(newConfig);
  }

  function makeCirclesFromCalc() {
    return defaultCircles.map((circle) => {
      const key = `${circle.hour}h`;
      const calcItem = calc?.[key];

      return {
        ...circle,
        percent: calcItem ? Math.max(0,Math.round(calcItem.percent)) : circle.percent,
      };
    });
  }

  if (config === null) {
    return <div>読み込み中...</div>;
  }

  const displayCircles = makeCirclesFromCalc();

  return (
    <div className="screen">
      {displayCircles.map((circle) => (
        <ForecastCircle
          key={circle.hour}
          hour={circle.hour}
          percent={circle.percent}
          x={circle.x}
          y={circle.y}
        />
      ))}

      <EditableBatteryCircle config={config} onChange={saveConfigAndCalc} />

      {setPoints.map((point) => (
        <EditableSetPoint
          key={point.keyName}
          point={point}
          onChange={updateSetPoint}
        />
      ))}
    </div>
  );
}
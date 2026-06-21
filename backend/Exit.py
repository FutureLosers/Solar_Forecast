import pandas as pd
from Csv_Operation import save_history
from batter import Battery
from solar_calc import SolarForecastTime, LoadDevice
from weather_api import datetime_sunshine
from config_loader import load_config, save_config


def is_same_hour(last_log: str, timezone: str) -> bool:
    if not last_log:
        return False

    try:
        last_time = pd.Timestamp(last_log)
        now = pd.Timestamp.now(tz=timezone)

        if last_time.tzinfo is None:
            last_time = last_time.tz_localize(timezone)

        return (
            last_time.year == now.year
            and last_time.month == now.month
            and last_time.day == now.day
            and last_time.hour == now.hour
        )

    except Exception:
        return False

def calculate_forecast(config):
    df = datetime_sunshine(
        latitude=config["latitude"],
        longitude=config["longitude"],
        timezone=config["timezone"],
    )

    solarforecasttime = SolarForecastTime(
        current_time=pd.Timestamp.now(tz=config["timezone"]),
    )

    solar_24h_df = solarforecasttime.get_24h_solar_data(df)

    solar_24h_df["generation_wh"] = (
        config["panel_w"]
        * solar_24h_df["shortwave_radiation"]
        / 1000
        * config["efficiency"]
    )

    loaddevice = LoadDevice(config["load_power_w"])

    battery = Battery(
        config["battery_capacity_wh"],
        config["battery_current_wh"]
    )

    result = {}
    history_result = {}

    for i in range(2, 25, 2):
        generated_power = float(
            solar_24h_df["generation_wh"].iloc[:i].sum()
        )


        consumed_power = float(loaddevice.power_w * i)

        remained_power = (
            battery.current_wh
            + generated_power
            - consumed_power
        )

        if remained_power > battery.capacity_wh:
            remained_power = battery.capacity_wh

        if remained_power < 0:
            remained_power = 0



        result_battery = Battery(
            battery.capacity_wh,
            remained_power
        )

        percent = round(
            float(result_battery.get_remaining_percent()),
            2
        )

        result[f"{i}h"] = {
            "percent": percent,
            "status": result_battery.judgement(),
            "remaining_wh": round(float(remained_power), 2),
        }



        history_result[f"{i}h"] = percent

    save_history(
        result_dict=history_result,
        power_w=config["load_power_w"],
        panel_w=config["panel_w"],
        efficiency=config["efficiency"],
        latitude=config["latitude"],
        longitude=config["longitude"],
    )

    return result

def load_calc():
    config = load_config()

    if is_same_hour(
        str(config.get("Last_Log", "")),
        str(config.get("timezone", "Asia/Tokyo"))
    ):
        result = calculate_forecast(config)

        return {
            "message": "同じ時間帯なので再計算しません",
            "Last_Log": config.get("Last_Log", ""),
            "recalculated": False,
            "result": result,
        }

    result = calculate_forecast(config)

    now_text = (
        pd.Timestamp.now(tz=config["timezone"])
        .strftime("%Y-%m-%d %H:%M:%S")
    )

    config["Last_Log"] = now_text
    save_config(config)

    return {
        "message": "再計算しました",
        "Last_Log": now_text,
        "recalculated": True,
        "result": result,
    }

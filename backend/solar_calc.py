import pandas as pd

class SolarForecastTime:
    def __init__(
        self,
        current_time,
    ):
        self.current_time = current_time

    def round_up_to_next_hour(self):
        """
        現在時刻を1時間単位で切り上げる
        例: 15:30 → 16:00
        例: 15:00 → 15:00
        """
        current_time = pd.to_datetime(self.current_time)

        if current_time.minute == 0 and current_time.second == 0:
            return current_time

        return current_time.ceil("h")

    def get_24h_solar_data(self, hourly_dataframe):
        """
        切り上げた現在時刻から24時間分の日射量を取り出す
        """
        start_time = self.round_up_to_next_hour()
        end_time = start_time + pd.Timedelta(hours=24)

        solar_24h_df = hourly_dataframe[
            (hourly_dataframe["date"] >= start_time) &
            (hourly_dataframe["date"] < end_time)
        ]

        return solar_24h_df

class LoadDevice:# ESP32などの平均消費電力
    power_w: float

    def __init__(self, power_w):
        self.power_w = power_w

class SolarPanel: #ソーラパネルのエネルギーと効率
    watt: float          # 例: 10W
    efficiency: float    # 例: 0.65

    def __init__(self,watt,efficiency):
        self.watt = watt
        self.efficiency = efficiency

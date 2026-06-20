import openmeteo_requests
import pandas as pd
import requests_cache
from retry_requests import retry


def datetime_sunshine(latitude, longitude, timezone):
    # Open-Meteo APIクライアントの設定
    cache_session = requests_cache.CachedSession(
        ".cache",
        expire_after=3600
    )
    retry_session = retry(
        cache_session,
        retries=5,
        backoff_factor=0.2
    )
    openmeteo = openmeteo_requests.Client(session=retry_session)

    url = "https://api.open-meteo.com/v1/forecast"

    params = {
        "latitude": latitude,
        "longitude": longitude,
        "hourly": ["shortwave_radiation"],
        "timezone": timezone,
        "forecast_days": 1,
    }

    responses = openmeteo.weather_api(url, params=params)

    response = responses[0]

    print(f"Coordinates: {response.Latitude()}°N {response.Longitude()}°E")
    print(f"Elevation: {response.Elevation()} m")
    print(f"Timezone difference to GMT+0: {response.UtcOffsetSeconds()}s")

    hourly = response.Hourly()
    hourly_shortwave_radiation = hourly.Variables(0).ValuesAsNumpy()

    hourly_data = {
        "date": pd.date_range(
            start=pd.to_datetime(hourly.Time(), unit="s", utc=True),
            end=pd.to_datetime(hourly.TimeEnd(), unit="s", utc=True),
            freq=pd.Timedelta(seconds=hourly.Interval()),
            inclusive="left"
        ),
        "shortwave_radiation": hourly_shortwave_radiation
    }

    hourly_dataframe = pd.DataFrame(data=hourly_data)

    return hourly_dataframe
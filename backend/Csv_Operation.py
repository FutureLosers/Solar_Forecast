import pandas as pd
from pathlib import Path
from datetime import datetime

def save_history(
    result_dict,
    power_w,
    panel_w,
    efficiency,
    latitude,
    longitude
):

    history_file = Path(
        "history.csv"
    )

    row = {
        "Datetime":
        datetime.now()
        .strftime(
            "%Y-%m-%d %H:%M:%S"
        ),

        **result_dict,

        "Power_w":
        power_w,

        "SolarPanel_watt":
        panel_w,

        "SolarPanel_efficiency":
        efficiency,

        "latitude":
        latitude,

        "longitude":
        longitude,
    }

    df = pd.DataFrame([row])

    if history_file.exists():

        df.to_csv(
            history_file,
            mode="a",
            header=False,
            index=False
        )

    else:

        df.to_csv(
            history_file,
            index=False
        )
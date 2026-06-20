from pathlib import Path

CONFIG_FILE = Path("config.txt")


def load_config():
    config = {}

    with open(CONFIG_FILE, "r", encoding="utf-8") as file:
        for line in file:
            line = line.strip()

            if not line or line.startswith("#"):
                continue

            key, value = line.split("=", 1)

            try:
                config[key] = float(value)
            except ValueError:
                config[key] = value

    return config


def save_config(config):
    with open(CONFIG_FILE, "w", encoding="utf-8") as file:
        for key, value in config.items():
            file.write(f"{key}={value}\n")
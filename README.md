# Solar Forecast

Solar Forecast は、太陽光パネルと蓄電池の残量を24時間先まで予測するツールです。

## 機能

* 蓄電池残量の予測
* 太陽光発電量の予測
* Open-Meteo APIによる日射量取得
* React + TypeScript フロントエンド
* Flask バックエンド
* 設定変更時の自動再計算
* 計算履歴のCSV保存

## 使用技術

### Frontend

* React
* TypeScript
* CSS

### Backend

* Flask
* Pandas
* Open-Meteo API

## セットアップ

### Python

```bash
pip install -r requirements.txt
```

### React

```bash
cd frontend
npm install
npm run build
```

## 設定ファイル

config_sample.txt を config.txt にコピーして使用してください。

```bash
copy config_sample.txt config.txt
```

## 起動

```bash
cd backend
python api_server.py
```

ブラウザでアクセス

```text
http://127.0.0.1:5100
```

## 設定項目

| 項目                  | 説明        |
| ------------------- | --------- |
| battery_capacity_wh | バッテリー容量   |
| battery_current_wh  | 現在残量      |
| latitude            | 緯度        |
| longitude           | 経度        |
| timezone            | タイムゾーン    |
| panel_w             | ソーラーパネル出力 |
| efficiency          | パネル効率     |
| load_power_w        | 消費電力      |
| Last_Log            | 最終計算時刻    |

## ライセンス

MIT License

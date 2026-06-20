from flask import (
    Flask,
    jsonify,
    request,
    send_from_directory
)
from flask_cors import CORS

from config_loader import load_config, save_config
from Exit import load_calc

app = Flask(
    __name__,
    static_folder="../frontend/dist",
    static_url_path=""
)

@app.route("/")
def serve():
    return send_from_directory(
        app.static_folder,
        "index.html"
    )


@app.route("/config", methods=["GET"])
def get_config():
    return jsonify(load_config())


@app.route("/config", methods=["POST"])
def save_config_api():

    new_config = request.get_json()

    save_config(new_config)

    return jsonify({
        "message": "saved"
    })


@app.route("/calc", methods=["GET"])
def get_calc():
    return jsonify(load_calc())


if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5100,
        debug=True
    )
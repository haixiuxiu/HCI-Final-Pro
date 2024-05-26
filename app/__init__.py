from flask import Flask
from flask_socketio import SocketIO

socketio = SocketIO()

def create_app():
    app = Flask(__name__)

    from .routes import main as main_blueprint
    app.register_blueprint(main_blueprint)

    socketio.init_app(app)

    return app

from flask_cors import CORS
import os

def init_cors(app):
    origins_env = os.environ.get('CORS_ORIGINS')
    if origins_env:
        origins = [o.strip() for o in origins_env.split(',') if o.strip()]
    else:
        origins = ['*']
    CORS(app, resources={r"/*": {"origins": origins}})
    return app
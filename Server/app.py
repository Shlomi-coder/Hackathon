from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import logging
import traceback

def json_to_pd(data):
    return data

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Enable CORS with more permissive settings for development
CORS(app, resources={
    r"/*": {
        "origins": [
            "https://www.youtube.com",
            "https://youtube.com",
            "https://*.youtube.com"
        ],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"})

@app.route('/process', methods=['POST'])
def process_array():
    try:
        # Log the origin of the request
        origin = request.headers.get('Origin', 'No Origin')
        logger.info(f"Request received from: {origin}")
        
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        input_pd = json_to_pd(data)
        result = input_pd
        logger.info(f"Processing data: {result}")
        return jsonify(result)
    
    except Exception as e:
        error_details = traceback.format_exc()
        logger.error(f"Error processing request: {str(e)}\n{error_details}")
        return jsonify({
            "error": str(e),
            "details": error_details
        }), 500

if __name__ == '__main__':
    import ssl  # Add this import at the top of your file

    # SSL context configuration
    context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    context.load_cert_chain('cert.pem', 'key.pem')  # Path to your certs

    logger.info(f"Server starting on https://{local_ip}:5000")  # Changed to HTTPS
    app.run(
        host='0.0.0.0', 
        port=5000, 
        ssl_context=context,  # Enable HTTPS
        debug=True
    )
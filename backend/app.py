from flask import Flask, jsonify, request
from flask_cors import CORS
import datetime
import uuid

app = Flask(__name__)
CORS(app)

# Dummy Data
potholes = [
    {
        "id": "PH-101",
        "latitude": 11.3456,
        "longitude": 77.7256,
        "road_name": "Main Road",
        "area": "Salem",
        "severity": "High",
        "confidence": 98.4,
        "zone": "Red",
        "timestamp": "2026-07-02 10:30:15",
        "status": "Pending",
        "image_url": "uploads/pothole101.jpg"
    },
    {
        "id": "PH-102",
        "latitude": 11.3521,
        "longitude": 77.7123,
        "road_name": "Cross Cut Road",
        "area": "Salem",
        "severity": "Medium",
        "confidence": 85.2,
        "zone": "Orange",
        "timestamp": "2026-07-02 11:15:00",
        "status": "Repaired",
        "image_url": "uploads/pothole102.jpg"
    }
]

@app.route('/api/potholes', methods=['GET'])
def get_potholes():
    return jsonify({"success": True, "data": potholes})

@app.route('/api/detect', methods=['POST'])
def detect_pothole():
    # In reality, this would process an image/video with YOLOv8 or similar
    # For now, return mock response
    return jsonify({
        "success": True,
        "detected": True,
        "count": 2,
        "confidence": 92.5,
        "severity": "High",
        "processing_time": 0.45
    })

@app.route('/api/zones', methods=['GET'])
def get_zones():
    zones = [
        {"name": "Zone 1 - High Risk", "type": "Red", "potholes": 18, "coordinates": [[11.34, 77.72], [11.35, 77.72], [11.35, 77.73], [11.34, 77.73]]},
        {"name": "Zone 2 - Moderate Risk", "type": "Orange", "potholes": 8, "coordinates": [[11.33, 77.74], [11.34, 77.74], [11.34, 77.75], [11.33, 77.75]]},
        {"name": "Zone 3 - Safe", "type": "Green", "potholes": 2, "coordinates": [[11.355, 77.695], [11.365, 77.695], [11.365, 77.705], [11.355, 77.705]]}
    ]
    return jsonify({"success": True, "data": zones})

@app.route('/api/analytics', methods=['GET'])
def get_analytics():
    return jsonify({
        "success": True,
        "data": {
            "health_score": 78,
            "total_potholes": 12450,
            "monthly_trends": [1200, 1900, 3000, 5000, 2000, 3000, 4500],
            "severity_distribution": {"Low": 45, "Medium": 30, "High": 15, "Critical": 10}
        }
    })

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    if data and data.get('username') and data.get('password'):
        return jsonify({
            "success": True, 
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_token",
            "user": {
                "id": str(uuid.uuid4()),
                "username": data.get('username'),
                "role": "Admin"
            }
        })
    return jsonify({"success": False, "message": "Invalid credentials"}), 401

import os
import json

# ─── Persistent Storage ──────────────────────────────────────────────────────
# Use abspath to guarantee the correct file path regardless of working directory.
POTHOLES_FILE = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'potholes_data.json'))
print(f"[Config] Potholes file path: {POTHOLES_FILE}")

def load_potholes():
    """Load potholes from the JSON file on disk. Returns empty list if not found."""
    if os.path.exists(POTHOLES_FILE):
        try:
            with open(POTHOLES_FILE, 'r') as f:
                data = json.load(f)
                print(f"[load_potholes] Loaded {len(data)} entries from {POTHOLES_FILE}")
                return data
        except Exception as e:
            print(f"[load_potholes] Error reading file: {e}")
            return []
    print(f"[load_potholes] File not found: {POTHOLES_FILE}")
    return []

def save_potholes(data):
    """Save the current list of potholes to the JSON file on disk."""
    with open(POTHOLES_FILE, 'w') as f:
        json.dump(data, f, indent=2)
    print(f"[save_potholes] Saved {len(data)} entries to {POTHOLES_FILE}")

# Load existing potholes from file when the server starts
live_potholes = load_potholes()
print(f"[Startup] Loaded {len(live_potholes)} existing potholes from file.")

@app.route('/add_pothole', methods=['POST'])
def add_pothole():
    """
    Receives JSON with 'latitude' and 'longitude' from Raspberry Pi.
    Always reads from file first, appends the new pothole, then saves back.
    This way it never depends on in-memory state and survives restarts.
    """
    data = request.json
    print(f"[POST /add_pothole] Received data: {data}")
    if data and 'latitude' in data and 'longitude' in data:
        # Always load fresh from file to avoid stale in-memory state
        current = load_potholes()
        new_pothole = {
            "id": f"PH-LIVE-{len(current) + 1}-{uuid.uuid4().hex[:6]}",
            "lat": float(data['latitude']),
            "lng": float(data['longitude']),
            "status": "Pending",
            "severity": "High",
            "detectionDate": datetime.datetime.now().strftime("%Y-%m-%d"),
            "detectionTime": datetime.datetime.now().strftime("%H:%M:%S"),
            "roadName": "Live Detection",
            "confidence": 99,
            "repairDate": "-",
            "repairTime": "-",
            "officerName": "-",
            "remarks": "-"
        }
        current.append(new_pothole)
        save_potholes(current)  # Save to file immediately
        print(f"[POST /add_pothole] Saved! lat={new_pothole['lat']}, lng={new_pothole['lng']} | Total: {len(current)}")
        return jsonify({"success": True, "message": "Pothole added successfully"}), 201
    print(f"[POST /add_pothole] Invalid data: {data}")
    return jsonify({"success": False, "message": "Invalid data format. Expected latitude and longitude."}), 400

@app.route('/potholes', methods=['GET'])
def get_live_potholes():
    """
    Always reads directly from the JSON file on disk.
    This guarantees the latest data is returned even after server restarts.
    """
    potholes = load_potholes()  # Read fresh from file every time
    print(f"[GET /potholes] Returning {len(potholes)} potholes")
    return jsonify({"success": True, "data": potholes}), 200

@app.route('/clear_potholes', methods=['POST'])
def clear_potholes():
    """
    Utility endpoint to clear all stored potholes (useful for testing).
    """
    save_potholes([])
    return jsonify({"success": True, "message": "All potholes cleared."}), 200

if __name__ == '__main__':
    # use_reloader=False prevents the server from restarting on code changes
    # which would cause Flask to reload and lose the in-memory state mid-session.
    app.run(host='0.0.0.0', port=5000, debug=True, use_reloader=False)

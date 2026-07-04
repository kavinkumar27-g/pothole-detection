"""
=============================================================
  send_pothole_pi.py  —  Run this on Raspberry Pi 5
=============================================================
  Sends GPS coordinates to the Flask backend on the Windows PC.

  HOW TO USE:
  ─────────────────────────────────────────────────────────
  Option 1 — Pass coordinates directly in the command:
    python send_pothole_pi.py 11.009348 76.959099

  Option 2 — Edit the defaults below and just run:
    python send_pothole_pi.py
  ─────────────────────────────────────────────────────────
"""

import requests
import sys

# ─── CONFIGURATION ───────────────────────────────────────────────────────────
# Windows PC IP address (shown in backend terminal: "Running on http://10.x.x.x:5000")
SERVER_IP   = "10.202.6.16"   # <-- Change this to your Windows PC IP
SERVER_PORT = 5000
URL = f"http://{SERVER_IP}:{SERVER_PORT}/add_pothole"
# ─────────────────────────────────────────────────────────────────────────────


def send_pothole(latitude, longitude):
    """
    Sends a pothole location to the Flask backend.
    Backend accepts JSON: { "latitude": ..., "longitude": ... }
    """
    payload = {
        "latitude": float(latitude),
        "longitude": float(longitude)
    }

    print("─" * 50)
    print(f"  Sending to  : {URL}")
    print(f"  Latitude    : {latitude}")
    print(f"  Longitude   : {longitude}")
    print("─" * 50)

    try:
        response = requests.post(URL, json=payload, timeout=10)
        print(f"  Status Code : {response.status_code}")
        print(f"  Response    : {response.text}")

        if response.status_code == 201:
            print("\n✅ SUCCESS — Marker will appear on the map within 3 seconds!")
        else:
            print("\n❌ FAILED — Check your coordinates and server IP.")

    except requests.exceptions.ConnectionError:
        print(f"\n❌ ERROR: Cannot connect to {URL}")
        print(f"   → Is the backend (python app.py) running on {SERVER_IP}?")
        print(f"   → Is SERVER_IP = '{SERVER_IP}' correct?")

    except requests.exceptions.Timeout:
        print("\n❌ ERROR: Connection timed out. Check Windows firewall for port 5000.")


# ─── MAIN ─────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    # Accept coordinates as command-line arguments:
    #   python send_pothole_pi.py <latitude> <longitude>
    if len(sys.argv) == 3:
        lat = sys.argv[1]
        lng = sys.argv[2]
        print(f"Using coordinates from command line: {lat}, {lng}")
    else:
        # No arguments given — prompt the user to type them in
        print("Enter the pothole coordinates:")
        lat = input("  Latitude  : ").strip()
        lng = input("  Longitude : ").strip()

    send_pothole(lat, lng)

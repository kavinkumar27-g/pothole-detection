# Raspberry Pi 5 Setup

## 1. Update the System

```bash
sudo apt update
sudo apt upgrade -y
```

---

## 2. Create the Project Directory

```bash
mkdir yolo
cd yolo
```

---

## 3. Create and Activate a Python Virtual Environment

```bash
python3 -m venv --system-site-packages venv
source venv/bin/activate
```

---

## 4. Install Required Python Packages

```bash
pip install ultralytics ncnn
```

---

## 5. Verify Camera Connection

```bash
ls /dev/video*
```

If your USB camera is detected, it will appear as:

```text
/dev/video0
```

---

## 6. Export the YOLO Model to NCNN Format

```bash
yolo export model=potholes.pt format=ncnn
```

This creates the NCNN model folder:

```text
potholes_ncnn_model/
```

---

## 7. Download the Inference Script

```bash
wget https://ejtech.io/code/yolo_detect.py
```

---

## 8. Run Real-Time Pothole Detection

For a USB Camera:

```bash
python yolo_detect.py \
    --model=potholes_ncnn_model \
    --source=usb0 \
    --resolution=1280x720
```

For a Raspberry Pi Camera Module:

```bash
python yolo_detect.py \
    --model=potholes_ncnn_model \
    --source=picamera \
    --resolution=1280x720
```

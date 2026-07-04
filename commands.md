#COMMANDS USED IN RASPBERRY PI 5 SETUP
System update
sudo apt update sudo apt upgrade

#Create Project Directory
mkdir yolo cd yolo

#Create Virtual Environment
python3 -m venv --system-site-packages venv 
source venv/bin/activate

#Install Required Packages
pip install ultralytics ncnn

#Check Connected Camera
ls /dev/video*

#Export Trained Model to NCNN Format
yolo export model=potholes.pt format=ncnn

#Download Inference Script
wget https://ejtech.io/code/yolo_detect.py

#Run Real-Time Detection
python yolo_detect.py --model=potholes_ncnn_model --source=usb0 --resolution=1280x720

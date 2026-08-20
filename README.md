# 🛡️ Sentinel AI

### AI-Powered Early Risk Prediction System for Public Infrastructure

Sentinel AI is a smart infrastructure monitoring platform designed to help authorities identify infrastructure damage at an early stage and prioritize maintenance based on risk.

The system uses Computer Vision and Machine Learning to analyze infrastructure images, detect visible defects, estimate risk, and help authorities decide which infrastructure assets require attention first.

---

## 🚨 Problem

Public infrastructure such as roads, bridges, flyovers, and buildings gradually deteriorates due to factors such as:

- Structural cracks
- Potholes
- Corrosion
- Exposed steel
- Water leakage
- Age and environmental conditions

Currently, infrastructure inspections are often dependent on manual surveys, which can be:

- Time-consuming
- Expensive
- Difficult to scale
- Prone to human error
- Potentially dangerous for inspectors

Small defects can become serious structural problems if they are not detected and addressed early.

---

## 💡 Our Solution

Sentinel AI provides a digital workflow for infrastructure inspection.

An inspector or authorized user uploads an image of infrastructure.

The system then follows this pipeline:

```text
Infrastructure Image
        ↓
Computer Vision
        ↓
Defect Detection
        ↓
Feature Extraction
        ↓
Risk Prediction
        ↓
Priority Ranking
        ↓
Government Dashboard
        ↓
Maintenance Recommendation

## 📊 Dataset
I’m packaging the verified dataset facts into a concise submission-ready summary you can paste into the hackathon form.

## Dataset Details for Hackathon Submission

Dataset Name:
Merged Sentinel Dataset

Dataset Source:
Custom/merged infrastructure defect detection dataset containing bridge and structural defect images.

Dataset Type:
Computer Vision object detection dataset for infrastructure damage detection.

Number of Images:
- Train: 42,454 images
- Validation: 3,352 images
- Test: 1,378 images

Annotation Format:
YOLO-style bounding box annotations in text files.

Classes Present:
- Crack-related defects
- Corrosion
- Concrete damage
- Bridge crack
- Other structural defect categories as defined in the dataset labels

Dataset Structure:
- Train images and labels
- Validation images and labels
- Test images and labels

Purpose:
Used for training and evaluating object detection models to identify infrastructure defects from images.

Potential Use Case:
Suitable for building an AI-powered system for:
- defect detection
- crack identification
- infrastructure monitoring
- automated inspection support

🔗 **Dataset:** :  https://drive.google.com/drive/folders/14Z6DaVJEDst1coa-kA6V1tM0qEfTqoH8?usp=sharing

About Model : 

Use a pre-trained detector such as YOLOv8 or YOLO11
Fine-tune it on our custom defect dataset
Used the detections to generate features like:
Defect count
Defect size
Confidence score
For image detection: fine-tune YOLO
For risk prediction: train XGBoost or Random Forest on metadata
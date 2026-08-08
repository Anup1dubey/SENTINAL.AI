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

The Computer Vision component of Sentinel AI uses the following dataset for infrastructure damage detection:

**RDD2022 – Road Damage Dataset**

The dataset contains annotated road images covering different categories of road damage, including cracks and potholes.

🔗 **Dataset:** [RDD2022 Dataset](YOUR_DATASET_LINK_HERE)
# 🔥 Firefly: Real-Time Fire and Smoke Detection System 💨

[![GitHub contributors](https://img.shields.io/github/contributors/sgindeed/Firefly?color=brightgreen&style=flat-square)](https://github.com/sgindeed/Firefly/graphs/contributors)
[![GitHub issues](https://img.shields.io/github/issues/sgindeed/Firefly?color=yellow&style=flat-square)](https://github.com/sgindeed/Firefly/issues)
[![GitHub license](https://img.shields.io/github/license/sgindeed/Firefly?color=blue&style=flat-square)](https://github.com/sgindeed/Firefly/blob/main/LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/sgindeed/Firefly?style=social)](https://github.com/sgindeed/Firefly/stargazers)

**Firefly** is a comprehensive system designed for real-time fire and smoke detection. Leveraging machine learning, a robust API, and a user-friendly frontend, Firefly provides timely alerts to ensure safety and prevent potential disasters.

## 🌟 Key Features

* **Real-time Video Analysis:** Continuously monitors video streams for signs of fire and smoke.
* **Advanced Machine Learning:** Employs the VGG16 model for accurate and efficient detection.
* **Scalable API:** Built with FastAPI for high performance and easy integration.
* **Persistent Data Storage:** Utilizes MongoDB Atlas for secure and reliable data management.
* **User Authentication:** Secure user registration and login functionality.
* **Email Alerts:** Automated email notifications upon detection of fire or smoke.
* **Intuitive Frontend:** User-friendly interface for monitoring and managing the system.
* **Alert Logging:** Detailed logs of detection events for analysis and review.

## 📂 Project Structure

```
Firefly/ (Root)
│
├── src/
│   ├── fire_detection_backend/ (Node.js Backend)
│   │   ├── server.js
│   │   ├── ... (other backend files)
│   │   ├── models/
│   │   │   ├── Session.js
│   │   │   ├── User.js
│   │   │   ├── video.js
│   │   ├── userRoutes.js
│   │   ├── fireAlarm.js (Optional)
│   │   ├── .env
│   │   └── package.json
│   │
│   ├── api/ (FastAPI Python API)
│   │   ├── api.py
│   │   ├── fs_model_v2.pkl (ML Model)
│   │   └── ... (other API files)
│   │
│   └── fire_detection_frontend/ (Frontend)
│       ├── index.html
│       ├── script.js
│       ├── style.css
│       └── ... (other frontend assets)
│
├── README.md
├── LICENSE
└── ... (other project files)
```

## 🛠️ Technologies Used

* **Machine Learning:** TensorFlow, Keras, VGG16, Pickle
* **API:** FastAPI (Python), Uvicorn, HTTPX
* **Backend:** Node.js, Express, Mongoose, JWT, Bcrypt, Nodemailer, Sharp
* **Database:** MongoDB Atlas
* **Frontend:** HTML, CSS, JavaScript
* **Other:** CORS, Dotenv, Axios

## ⚙️ Setup Instructions

1.  **Clone the Repository:**

    ```bash
    git clone [https://github.com/sgindeed/Firefly.git](https://github.com/sgindeed/Firefly.git)
    cd Firefly
    ```

2.  **Backend Setup (Node.js):**

    * Navigate to the `src/fire_detection_backend` directory.

        ```bash
        cd src/fire_detection_backend
        ```

    * Install dependencies:

        ```bash
        npm install
        ```

    * Create a `.env` file and configure your environment variables (e.g., `MONGO_URI`, `JWT_SECRET`, `EMAIL_USER`, `EMAIL_PASS`).

    * Start the backend server:

        ```bash
        npm start
        ```

3.  **API Setup (Python):**

    * Navigate to the `src/api` directory.

        ```bash
        cd ../api
        ```

    * (Optional but Recommended) Create a virtual environment:

        ```bash
        python3 -m venv venv
        source venv/bin/activate  # On Linux/macOS
        # venv\Scripts\activate   # On Windows
        ```

    * Install dependencies:

        ```bash
        pip install -r requirements.txt
        pip install fastapi uvicorn tensorflow keras pillow httpx
        ```

    * Run the API:

        ```bash
        uvicorn api:app --reload --port 8001
        ```

4.  **Frontend Setup:**

    * Navigate to the `src/fire_detection_frontend` directory.

        ```bash
        cd ../fire_detection_frontend
        ```

    * Open `index.html` in your browser.

## 🤝 Contribution Guidelines

We welcome contributions to Firefly! If you'd like to contribute, please follow these steps:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix.
3.  Make your changes and commit them.
4.  Push your changes to your fork.
5.  Submit a pull request.

## 🧑‍💻 Contributors

A huge thank you to our dedicated team of developers:

* **Supratim Ghosh:** 🔥 Smoke and Fire Detection using ML (VGG16 Model)
* **Suvojit Adak:** 🐍 FastAPI Python API Development
* **Mahak Gupta:** 💾 MongoDB Atlas Database Integration & Node.js Backend
* **Anushka Adak:** 🎨 Frontend Development (HTML, CSS, JS) & 🔍 Project Research
* **Aishee Guha Biswas:**  💻 Frontend Development

## 📜 License

This project is licensed under the [MIT License](https://github.com/sgindeed/Firefly/blob/main/LICENSE).

## 🙏 Acknowledgements

* We extend our gratitude to the open-source community for providing the tools and libraries that made this project possible.
* Special thanks to the TensorFlow, Keras, FastAPI, Node.js, and MongoDB communities.

## 📧 Contact

For any inquiries or feedback, please feel free to reach out to the contributors through their GitHub usernames:

* **Supratim Ghosh:** [sgindeed](https://github.com/sgindeed)
* **Suvojit Adak:** [SuojitAdak01](https://github.com/SuojitAdak01)
* **Mahak Gupta:** [Mahak-27](https://github.com/Mahak-27)
* **Anushka Adak:** [anushkaadak](https://github.com/anushkaadak)
* **Aishee Guha Biswas:** [Aishee06](https://github.com/Aishee06)

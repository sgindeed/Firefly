// Store registered users
const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
const startButton = document.getElementById('startButton');
const stopCameraButton = document.getElementById('stopCamera');
const videoElement = document.getElementById('camera-video');
const canvasElement = document.getElementById('canvasElement');
const fireAlertElement = document.getElementById('fire-alert');
const smokeAlertElement = document.getElementById('smoke-alert');
const neutralAlertElement = document.getElementById('neutral-alert');
const canvasContext = canvasElement.getContext('2d');
const liveBadge = document.getElementById('live-badge');
const noCameraAccessDiv = document.getElementById('no-camera-access');
const cameraStatusDot = document.getElementById('camera-status-dot');
const cameraStatusText = document.getElementById('camera-status-text');
const toggleDetectionButton = document.getElementById('toggle-detection');

let streamActive = false;
// System variables
let cameraStream = null;
let detectionActive = false;
let detectionInterval = null;
let fakeDetectionTimeout = null;
let alertCount = 0;
let systemActive = false;

function saveRegisteredUsers() {
    localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
}

function showNotification(message, isError = false) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.style.backgroundColor = isError ? '#ff3b30' : '#4CAF50';
    notification.style.display = 'block';

    // Hide notification after 5 seconds
    setTimeout(() => {
        notification.style.display = 'none';
    }, 5000);
}

// Authentication Functions
function showSignup() {
    document.getElementById("welcome-page").style.display = "none";
    document.getElementById("signup-page").style.display = "block";
}

function showLogin() {
    document.getElementById("welcome-page").style.display = "none";
    document.getElementById("login-page").style.display = "block";
}

function goBack() {
    document.getElementById("signup-page").style.display = "none";
    document.getElementById("login-page").style.display = "none";
    document.getElementById("welcome-page").style.display = "block";
}
async function submitSignup() {
    const userName = document.getElementById("name").value.trim();
    const userEmail = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value.trim();

    // Basic input validation
    if (!userName || !userEmail || !password) {
        showNotification("Please fill in all fields", true);
        return;
    }
    if (!isValidEmail(userEmail)) {
        showNotification("Please enter a valid email address", true);
        return;
    }
    if (password.length < 6) {
        showNotification("Password must be at least 6 characters long", true);
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: userName, email: userEmail, password }),
        });

        const res = await response.json();
        console.log("🔍 Backend Response:", res);

        if (!response.ok) {
            showNotification(res.message || "Signup failed", true);
            return;
        }

        showNotification("✅ Account created successfully!");
        setTimeout(goBack, 1500);
    } catch (error) {
        console.error("❌ Fetch Error:", error);
        showNotification("Server error. Try again later.", true);
    }
}

// ✅ Function to validate email format
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function submitLogin() {
    const userEmail = document.getElementById("login-email").value.trim().toLowerCase();
    const password = document.getElementById("login-password").value.trim();

    if (!userEmail || !password) {
        showNotification("Please fill in all fields", true);
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: userEmail, password }) 
        });

        const res = await response.json();
        console.log("🔍 Backend Response:", res);

        if (!response.ok) {
            showNotification(res.message || "Login failed", true);
            return;
        }

        if (!res.token) {
            console.error("❌ No token received from backend!");
            showNotification("Login failed: No token received", true);
            return;
        }

        // Store the JWT token
        localStorage.setItem("authToken", res.token);

        // Decode token to get user details
        const userData = parseJwt(res.token);
        if (!userData) {
            console.error("❌ Invalid token format!");
            showNotification("Login failed: Invalid token", true);
            return;
        }

        console.log("✅ Decoded User Data:", userData);

        // 🔧 Display actual user name
        document.getElementById("user-name").textContent = userData.name || "User";

        document.getElementById("auth-container").style.display = "none";
        document.getElementById("dashboard").style.display = "block";

        showNotification("Login successful!");
    } catch (error) {
        console.error("❌ Fetch Error:", error);
        showNotification("Server error. Try again later.", true);
    }
}

// ✅ Function to decode JWT token
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(atob(base64));
    } catch (e) {
        console.error("❌ JWT Parsing Error:", e);
        return null;
    }
}

async function startCamera() {
    if (!streamActive) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            videoElement.srcObject = stream;
            videoElement.style.display = 'block';
            noCameraAccessDiv.style.display = 'none';
            liveBadge.textContent = 'LIVE';
            liveBadge.classList.add('active');
            cameraStatusDot.classList.add('connected');
            cameraStatusText.textContent = 'Connected';
            streamActive = true;
            detectionActive = true;
            toggleDetectionButton.innerHTML = '<i class="fas fa-eye-slash"></i> Stop Detection';
            processVideo(); // Start processing frames immediately
        } catch (error) {
            console.error('Error accessing camera:', error);
            alert('Could not access the camera.'); // Basic error message
            liveBadge.textContent = 'NO ACCESS';
            liveBadge.classList.remove('active');
            cameraStatusDot.classList.remove('connected');
            cameraStatusText.textContent = 'No Access';
        }
    }
}
function stopCamera() {
    if (streamActive) {
        const stream = videoElement.srcObject;
        if (stream) {
            const tracks = stream.getTracks();
            tracks.forEach(track => track.stop());
        }
        videoElement.srcObject = null;
        videoElement.style.display = 'none';
        noCameraAccessDiv.style.display = 'flex';
        liveBadge.textContent = 'NOT ACTIVE';
        liveBadge.classList.remove('active');
        cameraStatusDot.classList.remove('connected');
        cameraStatusText.textContent = 'Not Connected';
        fireAlertElement.style.display = 'none';
        smokeAlertElement.style.display = 'none';
        neutralAlertElement.style.display = 'none';
        streamActive = false;
        detectionActive = false;
        toggleDetectionButton.innerHTML = '<i class="fas fa-eye"></i> Start Detection';
    }
}


async function processVideo() {
    if (!streamActive || !detectionActive || videoElement.paused || videoElement.ended) {
        setTimeout(processVideo, 100);
        return;
    }

    canvasContext.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
    const imgDataUrl = canvasElement.toDataURL('image/jpeg', 0.8);

    try {
        const response = await fetch('http://127.0.0.1:8001/predict/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ image_data: imgDataUrl.split(',')[1] })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("Frontend Prediction Result:", result); // Log the entire result object
        fireAlertElement.style.display = 'none';
        smokeAlertElement.style.display = 'none';
        neutralAlertElement.style.display = 'none';

        if (result.prediction === 'Fire') {
            fireAlertElement.style.display = 'block';
            fireAlertElement.textContent = 'FIRE DETECTED!';
            fireAlertElement.style.backgroundColor = 'rgba(255, 0, 0, 0.7)';
        } else if (result.prediction === 'Smoke') {
            smokeAlertElement.style.display = 'block';
            smokeAlertElement.textContent = 'SMOKE DETECTED!';
            smokeAlertElement.style.backgroundColor = 'rgba(108, 117, 125, 0.7)';
        } else if (result.prediction === 'Neutral') {
            neutralAlertElement.style.display = 'block';
        }

    } catch (error) {
        console.error('Error during prediction:', error);
        // Optionally display an error message
    }

    setTimeout(processVideo, 100);
}

function toggleDetection() {
    detectionActive = !detectionActive;
    if (detectionActive) {
        toggleDetectionButton.innerHTML = '<i class="fas fa-eye-slash"></i> Stop Detection';
        if (streamActive) {
            processVideo();
        } else {
            startCamera();
        }
    } else {
        toggleDetectionButton.innerHTML = '<i class="fas fa-eye"></i> Start Detection';
        fireAlertElement.style.display = 'none';
        smokeAlertElement.style.display = 'none';
        neutralAlertElement.style.display = 'none';
    }
}


async function toggleSystemStatus() {
    systemActive = !systemActive;
    const statusDot = document.getElementById('system-status-dot');
    const statusText = document.getElementById('system-status-text');
    const toggleBtn = document.getElementById('detection-toggle-btn');
    if (systemActive) {
        statusDot.style.backgroundColor = '#4CAF50';
        statusText.textContent = 'ACTIVE';
        toggleBtn.innerHTML = '<i class="fas fa-power-off"></i><span>Stop Detection</span>';

        if (!cameraStream) {
            const cameraStarted = await startCamera();
            if (cameraStarted && !detectionActive) {
                startDetection();
            }
        } else if (!detectionActive) {
            startDetection();
        }
    } else {
        statusDot.style.backgroundColor = '#ff0000';
        statusText.textContent = 'INACTIVE';
        toggleBtn.innerHTML = '<i class="fas fa-power-off"></i><span>Start Detection</span>';

        if (detectionActive) stopDetection();
    }
}

function detectFire() {
    if (!detectionActive) return;

    const fireAlert = document.getElementById('fire-alert');
    fireAlert.style.display = 'block';

    const overlay = document.getElementById('detection-overlay');
    const detectionBox = document.createElement('div');
    detectionBox.className = 'detection-box';

    const x = Math.floor(Math.random() * 60) + 20;
    const y = Math.floor(Math.random() * 60) + 20;
    const width = Math.floor(Math.random() * 20) + 10;
    const height = Math.floor(Math.random() * 20) + 10;

    detectionBox.style.left = `${x}%`;
    detectionBox.style.top = `${y}%`;
    detectionBox.style.width = `${width}%`;
    detectionBox.style.height = `${height}%`;

    const label = document.createElement('div');
    label.className = 'detection-label';
    label.textContent = 'FIRE';
    detectionBox.appendChild(label);

    overlay.appendChild(detectionBox);
    addFireAlert();

    fakeDetectionTimeout = setTimeout(() => {
        fireAlert.style.display = 'none';
        detectionBox.remove();
    }, 5000);
}

function addFireAlert() {
    const alertsList = document.getElementById('alerts-list');
    const newAlert = document.createElement('div');
    newAlert.className = 'alert-item';

    const now = new Date();
    const timeString = now.toLocaleTimeString();
    const dateString = now.toLocaleDateString();

    alertCount++;
    document.getElementById('alert-count').textContent = alertCount;

    newAlert.innerHTML = `
        <div class="alert-title">
            <i class="fas fa-fire-alt alert-icon" style="color: #ff512f;"></i>
            Fire Detected
        </div>
        <div class="alert-meta">
            <div class="alert-meta-item">
                <i class="fas fa-calendar"></i>
                <span>${dateString}</span>
            </div>
            <div class="alert-meta-item">
                <i class="fas fa-clock"></i>
                <span>${timeString}</span>
            </div>
            <div class="alert-meta-item">
                <i class="fas fa-video"></i>
                <span>Main Camera</span>
            </div>
        </div>
    `;

    alertsList.insertBefore(newAlert, alertsList.firstChild);
    showNotification('ALERT: Fire detected!', true);
}

function takeSnapshot() {
    if (streamActive) {
        const snapshotCanvas = document.createElement('canvas');
        snapshotCanvas.width = videoElement.videoWidth;
        snapshotCanvas.height = videoElement.videoHeight;
        const snapshotContext = snapshotCanvas.getContext('2d');
        snapshotContext.drawImage(videoElement, 0, 0, snapshotCanvas.width, snapshotCanvas.height);
        const dataURL = snapshotCanvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = dataURL;
        a.download = 'snapshot.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    } else {
        alert('Please start the camera first.');
    }
}

videoElement.style.display = 'none';
noCameraAccessDiv.style.display = 'flex';

const startCameraButton = noCameraAccessDiv.querySelector('button');
if (startCameraButton) {
        startCameraButton.onclick = startCamera;
}

stopCameraButton.onclick = stopCamera;
toggleDetectionButton.onclick = toggleDetection;

function testAlert() {
    if (cameraStream) {
        detectFire();
        showNotification('Test alert triggered');
    } else {
        showNotification('Please start the camera first', true);
    }
}


function exportLogs() {
    // Create a text log with all alerts
    const alerts = document.querySelectorAll('.alert-item');
    let logText = "Firefly Detection System - Export Log\n";
    logText += "Generated: " + new Date().toLocaleString() + "\n\n";
    logText += "Total Alerts: " + alerts.length + "\n\n";

    alerts.forEach((alert, index) => {
        const title = alert.querySelector('.alert-title').textContent.trim();
        const meta = alert.querySelectorAll('.alert-meta-item');

        logText += `Alert #${index + 1}: ${title}\n`;
        meta.forEach(item => {
            logText += `- ${item.textContent.trim()}\n`;
        });
        logText += "\n";
    });

    // Create a blob with the log text
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    // Create a link to download the log
    const link = document.createElement('a');
    link.href = url;
    link.download = `firefly-logs-${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();

    // Clean up
    URL.revokeObjectURL(url);

    showNotification('Logs exported successfully');
}

function showSettings() {
    // For now, just show a notification
    showNotification('Settings feature will be available in the next update');
}

// Initialize the user dropdown functionality
document.addEventListener('DOMContentLoaded', function () {
    // Toggle user dropdown
    const userProfile = document.querySelector('.user-profile');
    const userDropdown = document.getElementById('user-dropdown');

    userProfile.addEventListener('click', function (e) {
        userDropdown.classList.toggle('show-dropdown');
        e.stopPropagation();
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function () {
        userDropdown.classList.remove('show-dropdown');
    });

    // Navigation menu functionality
    const navItems = document.querySelectorAll('.nav-item');
    const pages = document.querySelectorAll('.dashboard-page');

    navItems.forEach(item => {
        item.addEventListener('click', function () {
            // Remove active class from all items
            navItems.forEach(navItem => navItem.classList.remove('active'));

            // Add active class to clicked item
            this.classList.add('active');

            // Hide all pages
            pages.forEach(page => page.style.display = 'none');

            // Show the corresponding page
            const pageName = this.getAttribute('data-page');
            document.getElementById(pageName).style.display = 'block';
        });
    });

    // Check if user is logged in (if there's data in localStorage)
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        const userData = JSON.parse(currentUser);
        document.getElementById("user-name").textContent = userData.name;
        document.getElementById("auth-container").style.display = "none";
        document.getElementById("dashboard").style.display = "block";
    }

    // Initialize backend connection
    initializeBackend();
});

// Function to handle backend communication
function initializeBackend() {
    // Simulating backend connection status
    console.log("Connecting to backend services...");

    // Mock API endpoints for a real implementation:
    const API_ENDPOINTS = {
        FIRE_DETECTION: '/api/detection',
        ALERTS: '/api/alerts',
        SYSTEM_STATUS: '/api/system/status',
        USER_AUTH: '/api/auth'
    };

    // In a real implementation, this would make actual API calls
    setTimeout(() => {
        console.log("Backend services connected");
        // You could fetch initial data here, such as:
        // - Existing alerts
        // - System status
        // - User configuration
    }, 1000);
}

// Handle login on page load or refresh (keeping user session)
function checkExistingSession() {
    const sessionData = localStorage.getItem('currentUser');
    if (sessionData) {
        const userData = JSON.parse(sessionData);
        document.getElementById("user-name").textContent = userData.name;
        document.getElementById("auth-container").style.display = "none";
        document.getElementById("dashboard").style.display = "block";
    }
}

// Save current user session when logging in
function saveUserSession(userData) {
    localStorage.setItem('currentUser', JSON.stringify(userData));
}

function logout() {
    stopCamera();
    stopDetection();

    const currentUser = localStorage.getItem('authToken');
    if (!currentUser) {
        showNotification("You are not logged in!");
        return;
    }

    fetch("http://localhost:5000/api/logout", {  // Ensure correct URL
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: currentUser })
    })
    .then(response => response.json())
    .then(data => {
        console.log("🔍 Logout API Response:", data);

        if (data.message) {
            showNotification("Logged out successfully!");
            localStorage.removeItem('currentUser');  // Clear session

            document.getElementById("dashboard").style.display = "none";
            document.getElementById("auth-container").style.display = "flex";
            //document.getElementById("welcome-page").style.display = "block";
        } else {
            showNotification("Logout failed: " + data.error);
        }
    })
    .catch(error => console.error("❌ Logout Error:", error));
}





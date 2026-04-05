# Mini CRM Dashboard

A fully functional, frontend-only Customer Relationship Management (CRM) web application designed with a beautiful dark-pastel aesthetic. Built entirely using vanilla HTML, CSS, and JavaScript, it acts as a lightweight tool for managing leads, tracking statuses, and saving notes without needing a backend or database.

## 🚀 Features

* **Authentication (Frontend Only):** Secure login and signup system. The app forces authentication on every visit, safely storing hashed/mock-hashed credentials using browser LocalStorage.
* **Lead Management:** Complete CRUD (Create, Read, Update, Delete) capabilities. Leads track Name, Email, Phone, Source, and Status.
* **Notes & Follow-ups:** Append-only notes history with timestamps and optional follow-up dates for keeping track of lead interactions. Adding a note to a "New" lead automatically bumps their status to "Contacted."
* **Search & Filters:** Real-time search by lead name or email, accompanied by dynamic status filters.
* **Data Persistence:** All CRM data and user accounts are seamlessly stored in your browser's local storage so progress is saved across page reloads.
* **Responsive Dark Pastel Design:** A carefully crafted custom CSS layout that is fully mobile-responsive and elegantly colored in deep lavenders, pinks, and sky blue accents.

## 🛠️ Technologies Used

* **HTML5:** Semantic structuring and data attributes.
* **CSS3:** Custom properties (variables), Flexbox/Grid layouts, smooth transitions, and a modern dark pastel theme void of stark white backgrounds.
* **Vanilla JavaScript (ES6+):** Complete application state management, DOM manipulation, modular event listener setup, and LocalStorage communication.
* **Font Awesome:** Scalable vector icons.

## ⚙️ How to Run

Because this application relies entirely on frontend technologies, there are no dependencies to install or servers to boot up!

1. Clone or download this repository to your local machine.
2. Open the project folder.
3. Double-click the `index.html` file to open it in your preferred modern web browser (Chrome, Firefox, Edge, Safari).
   - *Alternatively, you can serve the directory using a lightweight local development server like VS Code's "Live Server" extension.*

## 🔒 Getting Started (Authentication)

1. When you first open the app, you will be met with the Login screen.
2. Since data is local, **you must create an account first.**
3. Click **"Sign up"** at the bottom of the login box.
4. Provide any dynamic email and password you would like to use for your session.
5. After successfully creating your account, use those exact credentials to log in to your CRM Dashboard!

## 📁 File Structure

* `index.html` - The structural backbone containing the Auth View, Dashboard layout, Tables, and Modals.
* `style.css` - The design system defining the responsive layout, elegant dark pastel animations, and component styles.
* `script.js` - The brains of the operation handling data parsing, CRUD event actions, dynamic table rendering, and the toast notification system.

## 📝 License

This project is open-source and free to use or modify for personal and educational purposes.

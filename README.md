# Basobas - House Rental Application

Basobas is a full-featured house rental platform inspired by Airbnb. It provides users with a seamless experience for listing, browsing, and booking rental properties. Built using the **MERN stack (MongoDB, Express.js, React.js, and Node.js)**, Basobas aims to revolutionize the rental market by offering a user-friendly and efficient platform.

## Features

- 🏠 **Property Listings** - Users can list their properties for rent with images, descriptions, and pricing.
- 🔍 **Search & Filters** - Advanced search options including location, price range, and property type.
- 🗓 **Booking System** - Secure and smooth booking experience with real-time availability updates.
- 🛡 **Authentication & Authorization** - Secure user authentication with JWT.
- 💳 **Payment Integration** - Online payments using Stripe (or other payment gateways).
- 📩 **Messaging System** - In-app chat system for communication between hosts and renters.
- 🌍 **Interactive Maps** - Integration with Google Maps for location-based searches.

## Tech Stack

- **Frontend:** React.js, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Authentication:** JWT
- **Payment Integration:** E-Sewa

## Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/yourusername/basobas.git
   ```

2. Navigate to the project directory:

   ```sh
   cd basobas
   ```

3. Install dependencies for both frontend and backend:

   ```sh
   cd client && npm install
   cd ../server && npm install
   ```

4. Set up environment variables:

   - Create a `.env` file in the `server` directory with the following:
     ```env
     MONGO_URI=your_mongodb_connection_string
     JWT_SECRET=your_secret_key
     STRIPE_SECRET_KEY=your_stripe_key
     ```

5. Run the development servers:
   ```sh
   cd frontend && npm run dev
   cd ../backend && npm run dev
   ```

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a new branch: `git checkout -b feature-branch`
3. Commit your changes: `git commit -m "Add new feature"`
4. Push to the branch: `git push origin feature-branch`
5. Open a Pull Request.

## Contact

For any inquiries or suggestions, feel free to reach out:

- 📧 Email: rohan02shrestha@gmail.com

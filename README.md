# BookLoop - Second-hand Book Marketplace

BookLoop is a MERN stack application that allows users to buy, sell, or rent second-hand books. It includes features such as user authentication, book listings, real-time chat, and more.

## Features

- User authentication (email/password and Google OAuth with JWT)
- Book listing and browsing
- Advanced search and filtering
- Real-time chat with Socket.io
- Chatbot for FAQs and support
- User dashboard
- Responsive design

## Tech Stack

- **Frontend**: React.js, CSS
- **Backend**: Express.js + Node.js
- **Database**: MongoDB
- **Real-time Communication**: Socket.io
- **Email Notifications**: Nodemailer

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB installation
- Cloudinary account (for image uploads)
- Gmail account (for email notifications)

### Installation

1. Clone the repository:
   \`\`\`
   git clone https://github.com/yourusername/bookloop.git
   cd bookloop
   \`\`\`

2. Install server dependencies:
   \`\`\`
   cd server
   npm install
   \`\`\`

3. Install client dependencies:
   \`\`\`
   cd ../client
   npm install
   \`\`\`

4. Create a `.env` file in the server directory with the following variables:
   \`\`\`
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   EMAIL_USER=your_gmail_email
   EMAIL_PASSWORD=your_gmail_password
   ADMIN_EMAIL=admin_email_for_notifications
   \`\`\`

5. Create a `.env` file in the client directory:
   \`\`\`
   REACT_APP_API_URL=http://localhost:5000
   \`\`\`

### Running the Application

1. Start the server:
   \`\`\`
   cd server
   npm run server
   \`\`\`

2. Start the client:
   \`\`\`
   cd ../client
   npm start
   \`\`\`

3. Open your browser and navigate to `http://localhost:3000`

## Deployment

The application can be deployed to platforms like Heroku, Vercel, or any other hosting service that supports Node.js applications.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Acknowledgments

- Thanks to all the open-source libraries and tools that made this project possible
- Special thanks to the MERN stack community for their excellent documentation and support

## Contact

If you have any questions or suggestions, please feel free to reach out to us at support@bookloop.com.

Happy reading and trading!

const mongoose = require('mongoose');
const User = require('./models/User');

const mongoURI = 'mongodb://localhost:27017/your_database_name'; // Replace with your actual MongoDB URI

async function createAdminUser() {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const existingAdmin = await User.findOne({ email: 'krish@gmail.com' });
    if (existingAdmin) {
      console.log('Admin user already exists.');
      process.exit(0);
    }

    const adminUser = new User({
      name: 'Admin',
      email: 'krish@gmail.com',
      password: 'krish123@',
      role: 'admin',
    });

    await adminUser.save();
    console.log('Admin user created successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser();

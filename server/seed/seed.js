import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Task from '../models/Task.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB Atlas for seeding');

    await Task.deleteMany({});
    await User.deleteMany({});

    const standardUser = await User.create({
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'Test@1234',
      role: 'user'
    });

    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'Admin@1234',
      role: 'admin'
    });

    const currentDate = new Date();
    const addDays = (days) => {
      const result = new Date(currentDate);
      result.setDate(result.getDate() + days);
      return result;
    };

    const initialTasks = [
      {
        title: 'Design high-fidelity dashboard wireframes',
        description: 'Complete user flow mockups and layout wireframes for task and team metrics overview.',
        priority: 'high',
        status: 'completed',
        dueDate: addDays(-2),
        assignedUser: standardUser._id,
        createdBy: adminUser._id
      },
      {
        title: 'Implement JWT authentication and bcrypt hashing',
        description: 'Set up secure user registration, token generation, password encryption, and middleware guards.',
        priority: 'urgent',
        status: 'completed',
        dueDate: addDays(-1),
        assignedUser: adminUser._id,
        createdBy: adminUser._id
      },
      {
        title: 'Construct RESTful endpoints for task CRUD',
        description: 'Develop endpoints for creating, retrieving, updating, and deleting tasks with input validation.',
        priority: 'high',
        status: 'in-progress',
        dueDate: addDays(2),
        assignedUser: standardUser._id,
        createdBy: adminUser._id
      },
      {
        title: 'Build interactive Kanban board with drag-and-drop',
        description: 'Allow users to intuitively reorder and transition task states across workflow columns.',
        priority: 'medium',
        status: 'in-progress',
        dueDate: addDays(4),
        assignedUser: standardUser._id,
        createdBy: adminUser._id
      },
      {
        title: 'Configure Recharts visualization widgets',
        description: 'Display visual statistics for priority distributions and completion progress on the dashboard.',
        priority: 'medium',
        status: 'pending',
        dueDate: addDays(5),
        assignedUser: adminUser._id,
        createdBy: adminUser._id
      },
      {
        title: 'Implement dark mode palette and persistence',
        description: 'Implement a refined neutral dark mode palette with localStorage persistence.',
        priority: 'low',
        status: 'pending',
        dueDate: addDays(7),
        assignedUser: standardUser._id,
        createdBy: adminUser._id
      },
      {
        title: 'Audit API response times and database indexes',
        description: 'Verify compound indexes on status, priority, and assignedUser fields for query optimization.',
        priority: 'low',
        status: 'pending',
        dueDate: addDays(10),
        assignedUser: adminUser._id,
        createdBy: adminUser._id
      },
      {
        title: 'Deploy backend service to Render and frontend to Vercel',
        description: 'Configure production environment variables, CORS policies, and automated build pipelines.',
        priority: 'urgent',
        status: 'in-progress',
        dueDate: addDays(3),
        assignedUser: adminUser._id,
        createdBy: adminUser._id
      }
    ];

    await Task.insertMany(initialTasks);

    console.log('Database successfully seeded with standard user, admin user, and sample tasks.');
    process.exit(0);
  } catch (error) {
    console.error(`Database seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();

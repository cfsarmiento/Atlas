const { Employee } = require('../models'); // Assuming Employee model is exported from models/index.js
const jwt = require('jsonwebtoken');

async function createEmployee(employeeData) {
  try {
    // Password will be hashed by the Sequelize hook in EmployeeManagerModel.js
    // Phone number is already encrypted by the controller.
    const newEmployee = await Employee.create(employeeData);
    return newEmployee;
  } catch (error) {
    console.error('Error creating employee in service:', error);
    throw error;
  }
}

// Function to log in an employee
async function loginEmployee(email, password) {
  console.log(`Attempting login for employee email: ${email}`)
  try {
    const employee = await Employee.findOne({ where: { email } });
    if (!employee) {
      console.log(`Login attempt failed: Employee not found for email ${email}`);
      return { success: false, message: 'Employee not found.' };
    }
    console.log(`Employee found: ${employee.id}, attempting password validation.`);

    const isValidPassword = await employee.validatePassword(password);
    if (!isValidPassword) {
      console.log(`Login attempt failed: Invalid password for employee ${email} (ID: ${employee.id})`);
      return { success: false, message: 'Invalid password.' };
    }

    console.log(`Password validation successful for employee ${email} (ID: ${employee.id})`);
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: employee.id, 
        email: employee.email,
        role: 'employee'
      }, 
      process.env.JWT_SECRET || 'atlas-dev-secret',
      { expiresIn: '24h' }
    );
    
    console.log(`JWT token generated for employee ${email} (ID: ${employee.id})`);
    
    // Login successful - return employee data (excluding password) and token
    const { password_hash, encrypted_phone_number, ...employeeData } = employee.get({ plain: true });
    
    return { 
      success: true, 
      employee: employeeData,
      token
    };

  } catch (error) {
    console.error('Error in loginEmployee service:', error);
    throw error;
  }
}

module.exports = {
  createEmployee,
  loginEmployee
}; 
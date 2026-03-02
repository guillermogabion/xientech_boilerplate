const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendMail');
const { json } = require('stream/consumers');
// --- LOGIN FUNCTION ---
exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        // 1. Check if user exists
        const user = await prisma.user.findUnique({
            where: { username }
        });

        if (!user) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        // 2. Check password
        // Use bcrypt.compare if you hash your passwords (recommended)
        // If you are using plain text (not recommended): const isMatch = password === user.password;
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        // 3. Generate JWT
        const token = jwt.sign(
            { 
                id: user.id,
                role: user.role,
                organizationId: user.organizationId
            },
            process.env.JWT_SECRET,
            { expiresIn: '8h' } // Token lasts for 8 hours
        );
            // console.log(data.user)

        // 4. Send response
        res.json({
            message: "Login successful",
            token, // This is the JWT
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                pic: user.pic,
                email: user.email,
                organizationId: user.organizationId,
                token: token // Putting the token here so the frontend can cache it inside 'offline_identity'
            }
        });

    } catch (error) {
        // Log the full error to the server terminal for the developer
        console.error("LOGIN_ERROR:", error);

        // Send a specific message back to the frontend
        res.status(500).json({ 
            message: "Internal Server Error during login",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined // Only show details in dev mode
        });
    }
};

// --- LOGOUT FUNCTION ---
// Since JWTs are stateless, "logging out" is mostly handled by the frontend 
// (deleting the token). However, you can provide an endpoint for it.
exports.logout = async (req, res) => {
    // Optionally: Add token to a blocklist in the database if using high security
    res.json({ message: "Logged out successfully. Please remove your token from storage." });
};

// --- IMPROVED CREATE USER (With Password Hashing) ---
// --- IMPROVED CREATE USER (With Organization Isolation) ---
exports.createUser = async (req, res) => {
    const { username, password, firstName, lastName, email, role, designation, pic } = req.body;
    
    // 1. SAFE CHECK: Use optional chaining (?.) to prevent server crash
    // If req.user is undefined, adminOrgId will simply be undefined instead of crashing
    const adminOrgId = req.user?.organizationId;

    // 2. LOGGING: This will show up in your terminal to help you debug
    if (!req.user) {
        console.error("--- AUTH ERROR: req.user is undefined. Is the protect middleware missing? ---");
    }

    if (!adminOrgId) {
        return res.status(403).json({ 
            message: "Authorization failed: No organization associated with your account. Please log out and log back in." 
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        let designationArray = Array.isArray(designation) ? designation : [designation || "NULL"];
        if (designationArray.length > 1) {
            designationArray = designationArray.filter(d => d !== "NULL");
        }

        const newUser = await prisma.user.create({
            data: { 
                username, 
                password: hashedPassword, 
                firstName,
                lastName,
                email,
                role,
                organizationId: adminOrgId, // Linked to the Admin's Org
                designation: {
                    set: designationArray 
                },
                pic: pic || null 
            }
        });

        const { password: _, ...userWithoutPassword } = newUser;
        res.status(201).json(userWithoutPassword);
    } catch (error) {
        console.error("!!! DATABASE ERROR !!!", error);
        res.status(400).json({ 
            message: error.code === 'P2002' ? "Username or Email already exists" : "Failed to create user",
            details: error.message
        });
    }
};
// ... keep your getUsers, updateUser, deleteUser as they 

exports.getUsers = async (req, res) => {
    console.log("--- FETCHING USERS FOR ORG:", req.user?.organizationId, "---");
    
    try {
        // 1. Get the admin's Org ID from the token (provided by authenticateToken)
        const adminOrgId = req.user?.organizationId;

        if (!adminOrgId) {
            return res.status(403).json({ message: "No organization context found." });
        }

        // 2. Pagination & Search params
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5; // Default to 5 users per page
        const skip = (page - 1) * limit;
        const search = req.query.search || "";

        // 3. Build the "where" filter
        // We MUST always filter by organizationId first to prevent seeing other orgs' data
        let where = {
            organizationId: adminOrgId,
            isDeleted: false // If you are using soft deletes
        };

        // If searching, add the OR condition inside the org filter
        if (search) {
            where.AND = [
                { organizationId: adminOrgId },
                {
                    OR: [
                        { username: { contains: search, mode: 'insensitive' } },
                        { firstName: { contains: search, mode: 'insensitive' } },
                        { lastName: { contains: search, mode: 'insensitive' } },
                        { email: { contains: search, mode: 'insensitive' } }
                    ]
                }
            ];
        }

        // 4. Execute Query
        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where: where,
                skip: skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: { // Don't send passwords back to the frontend
                    id: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    role: true,
                    designation: true,
                    pic: true,
                    isActive: true,
                    createdAt: true
                }
            }),
            prisma.user.count({ where: where })
        ]);

        // 5. Send paginated response
        res.json({ 
            data: users, 
            total, 
            pages: Math.ceil(total / limit),
            currentPage: page
        });

    } catch (error) {
        console.error("!!! GET USERS ERROR !!!", error);
        res.status(500).json({ 
            message: "Database Error", 
            details: error.message 
        });
    }
};

// UPDATE USER
exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { username, password, firstName, lastName, email, role, designation, pic } = req.body;

    try {
        // 1. Prepare the data object
        const updateData = {
            username,
            firstName,
            lastName,
            email,
            role,
            pic
        };

        // 2. Handle Password (only hash and update if a new one is provided)
        if (password && password.trim() !== "") {
            updateData.password = await bcrypt.hash(password, 10);
        }

        // 3. Sanitize Designation Array
        if (designation) {
            let designationArray = Array.isArray(designation) ? designation : [designation];
            
            // Remove "NULL" if other committees are selected
            if (designationArray.length > 1) {
                designationArray = designationArray.filter(d => d !== "NULL");
            }
            
            // Use 'set' to overwrite the old array with the new selection
            updateData.designation = { set: designationArray };
        }

        const updatedUser = await prisma.user.update({
            where: { id: parseInt(id) },
            data: updateData
        });

        // 4. Remove password from response
        const { password: _, ...userWithoutPassword } = updatedUser;
        res.json(userWithoutPassword);

    } catch (error) {
        console.error("Update Error:", error);
        res.status(400).json({ 
            error: "Update failed", 
            message: error.message 
        });
    }
};

// DELETE USER
exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.user.delete({
            where: { id: parseInt(id) }
        });
        res.json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(404).json({ error: "User not found" });
    }
};


// --- FETCH ALL USERS (No Pagination, No Filter) ---
// Useful for populating dropdowns and selection modals
exports.getAllUsers = async (req, res) => {
    console.log("--- FETCHING ALL USERS (LIST) ---");
    try {
        const users = await prisma.user.findMany({
            where: {
                isDeleted: false, // Ensure we don't show deleted accounts
                isActive: true    // Only show active officials
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                role: true,
                designation: true
            },
            orderBy: {
                lastName: 'asc' // Alphabetical order is better for dropdowns
            }
        });

        res.json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error("Get All Users Error:", error);
        res.status(500).json({ 
            message: "Failed to fetch user list",
            details: error.message 
        });
    }
};

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
   

  try {

   
    const user = await prisma.user.findFirst({ where: { email } });
    if (!user) return res.status(404).json({ message: "Email not found" });

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000);

      const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:5173';
    const resetUrl = `${baseUrl}/reset-password/${resetToken}`;


    console.log(resetUrl);
   
    // Update DB
    await prisma.user.update({
      where: { email },
      data: { 
        resetToken: resetToken, 
        resetTokenExpires: expires 
      }
    });


    
    // Check if sendEmail is actually working
    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Request',
        resetUrl: resetUrl,
        message: `Click here to reset: ${resetUrl}`
      });
    } catch (mailError) {
        console.error("MAILER ERROR:", mailError);
      console.log("Email failed to send, but token was saved:", resetUrl);
      // If email fails, we still want to know the token during development
      return res.status(500).json({ message: "Database updated, but email failed to send." });
    }

    res.json({ success: true, message: "Reset link sent to email!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    // 1. Find user with valid, non-expired token
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpires: { gt: new Date() } // 'gt' means 'greater than now'
      }
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    // 2. Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Update user and CLEAR the reset fields
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null
      }
    });

    res.json({ message: "Password updated successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};


exports.createRequest = async (req, res) => {
    // 1. Get data from req.body (sent from your frontend)
    // Note: Use 'type' or 'certType' based on your actual Prisma schema field name
    const { title, certType, residentId } = req.body;

    // Validation
    if (!title || !certType || !residentId) {
        return res.status(400).json({ 
            message: "Missing required fields: title, certType, or residentId" 
        });
    }

    try {
        // 2. Create the record in the database
        // Ensure 'request' matches your model name in schema.prisma (e.g., prisma.certificationRequest)
        const newRequest = await prisma.serviceRequest.create({
            data: {
                title: title,
                serviceType: certType, 
                residentId: Number(residentId), // Ensure it's a number for PostgreSQL
                status: "PENDING" // Default status
            }
        });

        // 3. Send success response
        res.status(201).json({
            success: true,
            message: "Request created successfully",
            data: newRequest
        });

    } catch (error) {
        console.error("Error creating request:", error);
        res.status(500).json({ 
            message: "Internal server error",
            error: error.message 
        });
    }
};

exports.getUserRequests = async (req, res) => {
    // Get ID from URL params (e.g., /api/requests/user/5) 
    // or from req.user if using middleware
    const { id } = req.params; 

    try {
        const requests = await prisma.serviceRequest.findMany({
            where: {
                residentId: Number(id)
            },
            orderBy: {
                createdAt: 'desc' // Newest requests first
            }
        });

        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ message: "Error fetching requests" });
    }
};

exports.getMe = async (req, res) => {
    try {

        console.log("Decoded user from middleware:", req.user);
        const user = await prisma.user.findUnique({
            select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
                pic: true,
                isActive: true
            }
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user);
    } catch (error) {
        console.error("getMe Error:", error);
        res.status(500).json({ message: "Server error fetching user profile" });
    }
};


exports.checkAdminExists = async (req, res) => {
  try {
    // We only want to know IF one exists, not see their data
    const user = await User.findOne({ role: 'ADMIN' }); 
    return res.status(200).json({ exists: !!user });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};
const prisma = require('../lib/prisma');
const bcrypt = require('bcryptjs');

exports.createOrganization = async (req, res) => {
    const { 
        name, 
        address, 
        contactNumber, 
        adminEmail, 
        adminUsername, // Add this
        adminFirstName, 
        adminLastName, 
        adminPassword 
    } = req.body;

    try {
        // 1. Check if organization name already exists
        const existingOrg = await prisma.organization.findUnique({
            where: { name: name }
        });

        if (existingOrg) {
            return res.status(400).json({ message: "Organization name already exists" });
        }

        const result = await prisma.$transaction(async (tx) => {
            const newOrg = await tx.organization.create({
                data: {
                    name,
                    address,
                    contactNumber,
                }
            });

            const hashedPassword = await bcrypt.hash(adminPassword, 10);
            const newAdmin = await tx.user.create({
                    data: {
                        email: adminEmail,
                        username: adminUsername, // ADDED THIS
                        firstName: adminFirstName,
                        lastName: adminLastName,
                        password: hashedPassword,
                        role: 'ADMIN',
                        organizationId: newOrg.id
                    }
                });

            return { newOrg, newAdmin };
        });

        await prisma.systemLog.create({
            data: {
                action: "CREATE_ORGANIZATION",
                module: "SYSTEM",
                details: `Created new organization: ${name} with admin ${adminEmail}`,
                userId: req.user.id,
                ipAddress: req.ip
            }
        });

        res.status(201).json({
            message: "Organization and Admin created successfully",
            data: result
        });

    } catch (error) {
        console.error("Create Org Error:", error);

        // If it's a Prisma Unique Constraint error
        if (error.code === 'P2002') {
            const field = error.meta?.target?.[0] || 'field';
            return res.status(400).json({ 
                message: `The ${field} provided is already in use. Please try another one.` 
            });
        }

        // Fallback for other errors
        res.status(500).json({ 
            message: error.message || "Failed to create organization" 
        });
    }
};

exports.getOrganizations = async (req, res) => {
    try {
        const orgs = await prisma.organization.findMany({
            include: {
                _count: {
                    select: { users: true }
                }
            }
        });
        res.json(orgs);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch organizations" });
    }
};
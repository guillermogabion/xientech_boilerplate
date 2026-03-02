const prisma = require('../lib/prisma');

const logAction = async (data) => {
  try {
    await prisma.systemLog.create({
      data: {
        action: data.action,
        module: data.module,
        userId: data.userId || null,
        details: data.details,
        ipAddress: data.ipAddress,
        status: data.status || 'SUCCESS'
      }
    });
  } catch (err) {
    console.error("Critical: Failed to write system log:", err);
  }
};

module.exports = { logAction };
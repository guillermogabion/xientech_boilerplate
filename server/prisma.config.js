module.exports = {
  schema: {
    address: './prisma/schema.prisma', // Ensure this path is correct!
  },
  seed: {
    run: 'node prisma/seed.js',
  },
};
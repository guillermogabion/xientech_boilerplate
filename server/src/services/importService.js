export const processImport = async (csvData: any[], mapping: any) => {
  const report = { success: 0, failed: 0, errors: [] as string[] };

  return await prisma.$transaction(async (tx) => {
    let totalHouseholds = await tx.household.count();

    for (const [index, row] of csvData.entries()) {
      try {
        // 1. Resolve Purok
        const pName = row[mapping.purokName]?.trim();
        const purok = await tx.purok.upsert({
          where: { name: pName },
          update: {},
          create: { name: pName, alias: pName.substring(0, 3).toUpperCase() }
        });

        // 2. Resolve Street (Manual check if upsert fails)
        let street = await tx.street.findFirst({
          where: { name: row[mapping.streetName]?.trim(), purok_id: purok.id }
        });

        if (!street) {
          street = await tx.street.create({
            data: { name: row[mapping.streetName]?.trim() || "Main Street", purok_id: purok.id }
          });
        }

        // 3. Resolve Household
        const csvHHNo = row[mapping.householdNo]?.trim();
        let household = await tx.household.findFirst({
          where: { household_no: csvHHNo }
        });

        if (!household) {
          totalHouseholds++;
          const abbrv = purok.name.substring(0, 3).toUpperCase().replace(/\s/g, '');
          const generatedID = `${abbrv}-${new Date().getFullYear()}-${totalHouseholds.toString().padStart(3, '0')}`;

          household = await tx.household.create({
            data: {
              household_no: generatedID,
              purok_id: purok.id,
              street_id: street.id,
              isIndigent: row[mapping.isIndigent] === 'true'
            }
          });
        }

        // 4. Create Resident (The Final Link)
        await tx.resident.create({
          data: {
            firstName: row[mapping.firstName],
            lastName: row[mapping.lastName],
            gender: row[mapping.gender] || "Unknown",
            household_id: household.id // Ensure this field matches your schema!
          }
        });

        report.success++;
      } catch (err) {
        // This is where you will finally see the error in your terminal
        console.error(`Row ${index + 1} Error:`, err.message);
        report.failed++;
        report.errors.push(`Row ${index + 1}: ${err.message}`);
      }
    }
    return report;
  }, {
    timeout: 30000 // Give it 30 seconds to finish the 50 rows
  });
};
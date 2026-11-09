import AddAdmin from '../cloud/parsefunction/AddAdmin.js';

/**
 * Automatically seeds the admin user on server startup if no admin exists.
 */
export default async function bootstrapAdmin() {
  try {
    const adminEmail = process.env.ADMIN_BOOTSTRAP_EMAIL || 'contact@colakin.ai';
    const adminPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD || 'ColakinSign123!';
    const adminName = process.env.ADMIN_BOOTSTRAP_NAME || 'Colakin Admin';
    const company = process.env.appName || 'Colakin';

    const extClsQuery = new Parse.Query('contracts_Users');
    extClsQuery.equalTo('UserRole', 'contracts_Admin');
    const existingAdmin = await extClsQuery.first({ useMasterKey: true });

    if (existingAdmin) {
      console.log(`ℹ️ Admin already present in database: ${existingAdmin.get('Email')}`);
      return;
    }

    console.log(`⏳ No admin detected. Auto-seeding initial admin: ${adminEmail}...`);
    await AddAdmin({
      params: {
        userDetails: {
          name: adminName,
          email: adminEmail,
          password: adminPassword,
          company: company,
          jobTitle: 'Administrator',
          role: 'contracts_Admin',
          timezone: 'Asia/Kolkata',
        },
      },
    });
    console.log(`🎉 Auto-seed complete: Admin ${adminEmail} successfully initialized!`);
  } catch (err) {
    console.error('⚠️ Admin bootstrap notice:', err.message);
  }
}


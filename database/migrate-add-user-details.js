require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function migrate() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Starting migration to add user detail columns...');
    
    // Check if columns already exist before adding them
    const result = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'user_settings' 
      AND column_name IN ('bio', 'skills', 'years_experience', 'specialties', 'role_title')
    `);
    
    const existingColumns = result.rows.map(row => row.column_name);
    console.log(`✓ Existing columns: ${existingColumns.length > 0 ? existingColumns.join(', ') : 'none'}`);
    
    // Add missing columns one by one
    if (!existingColumns.includes('bio')) {
      console.log('  - Adding bio column...');
      await client.query('ALTER TABLE user_settings ADD COLUMN bio TEXT');
      console.log('    ✓ Added bio');
    }
    
    if (!existingColumns.includes('skills')) {
      console.log('  - Adding skills column...');
      await client.query('ALTER TABLE user_settings ADD COLUMN skills JSONB');
      console.log('    ✓ Added skills');
    }
    
    if (!existingColumns.includes('years_experience')) {
      console.log('  - Adding years_experience column...');
      await client.query('ALTER TABLE user_settings ADD COLUMN years_experience INTEGER DEFAULT 0');
      console.log('    ✓ Added years_experience');
    }
    
    if (!existingColumns.includes('specialties')) {
      console.log('  - Adding specialties column...');
      await client.query('ALTER TABLE user_settings ADD COLUMN specialties JSONB');
      console.log('    ✓ Added specialties');
    }
    
    if (!existingColumns.includes('role_title')) {
      console.log('  - Adding role_title column...');
      await client.query('ALTER TABLE user_settings ADD COLUMN role_title VARCHAR(255)');
      console.log('    ✓ Added role_title');
    }
    
    console.log('\n✅ Migration completed successfully!');
    console.log('   All user detail columns are now available.');
    
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    if (error.code === '42701') {
      console.log('   (Column already exists - this is fine)');
    } else {
      process.exit(1);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();

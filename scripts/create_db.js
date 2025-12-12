#!/usr/bin/env node
require('dotenv').config();
const { Client } = require('pg');

async function main() {
  // Usage: node scripts/create_db.js "postgresql://postgres:pass@localhost:5432/postgres" mydb myuser mypass
  const [,, superConnArg, dbNameArg, dbUserArg, dbPassArg] = process.argv;

  const superConn = process.env.PSQL_SUPER_CONN || superConnArg;
  const newDb = process.env.NEW_DB || dbNameArg || 'portfolio_agent';
  const newUser = process.env.NEW_DB_USER || dbUserArg || 'webuser';
  const newPass = process.env.NEW_DB_PASS || dbPassArg || 'change_me';

  if (!superConn) {
    console.error('Missing Postgres superuser connection string. Provide via PSQL_SUPER_CONN or as the first argument.');
    console.error('Example: node scripts/create_db.js "postgresql://postgres:YourPass@localhost:5432/postgres" portfolio_agent webuser ChangeMe');
    process.exit(2);
  }

  const client = new Client({ connectionString: superConn });
  try {
    await client.connect();
    console.log('Connected to Postgres as superuser');

    // Create role if not exists
    const roleRes = await client.query('SELECT 1 FROM pg_roles WHERE rolname = $1', [newUser]);
    if (roleRes.rowCount === 0) {
      console.log(`Creating role '${newUser}'`);
      await client.query(`CREATE ROLE ${newUser} WITH LOGIN PASSWORD $1`, [newPass]);
    } else {
      console.log(`Role '${newUser}' already exists — updating password`);
      await client.query(`ALTER ROLE ${newUser} WITH PASSWORD $1`, [newPass]);
    }

    // Create database if not exists
    const dbRes = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [newDb]);
    if (dbRes.rowCount === 0) {
      console.log(`Creating database '${newDb}' owned by ${newUser}`);
      await client.query(`CREATE DATABASE ${newDb} OWNER ${newUser}`);
    } else {
      console.log(`Database '${newDb}' already exists — setting owner to ${newUser}`);
      await client.query(`ALTER DATABASE ${newDb} OWNER TO ${newUser}`);
    }

    console.log('Granting CONNECT privileges');
    await client.query(`GRANT CONNECT ON DATABASE ${newDb} TO ${newUser}`);

    console.log('\nDone. You can now run the server with:');
    console.log(`$env:DATABASE_URL = 'postgresql://${newUser}:${newPass}@localhost:5432/${newDb}'`);
    console.log('node server.js');
  } catch (err) {
    console.error('Error while creating DB/user:', err.message || err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();

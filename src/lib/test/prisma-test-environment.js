const { TestEnvironment } = require('jest-environment-node');
const { execSync } = require('child_process');
const { Client } = require('pg');
const { v4: uuid } = require('uuid');
const { join } = require('path');
const dotenv = require('dotenv');

// Load test environment variables
dotenv.config({ path: '.env.test' });

class PrismaTestEnvironment extends TestEnvironment {
  constructor(config) {
    super(config);

    // Ensure all required environment variables are present
    const requiredEnvVars = ['POSTGRES_USER', 'POSTGRES_PASSWORD', 'POSTGRES_HOST', 'POSTGRES_PORT', 'POSTGRES_DB'];
    requiredEnvVars.forEach(envVar => {
      if (!process.env[envVar]) {
        throw new Error(`Required environment variable ${envVar} is not set`);
      }
    });

    const dbUser = process.env.POSTGRES_USER;
    const dbPass = process.env.POSTGRES_PASSWORD;
    const dbHost = process.env.POSTGRES_HOST;
    const dbPort = process.env.POSTGRES_PORT;
    const dbName = process.env.POSTGRES_DB;

    this.schema = `test_${uuid()}`.replace(/-/g, '_');
    this.connectionString = `postgresql://${dbUser}:${dbPass}@${dbHost}:${dbPort}/${dbName}`;
  }

  async setup() {
    try {
      // Create the schema
      const client = new Client({
        connectionString: this.connectionString,
      });

      await client.connect();
      await client.query(`CREATE SCHEMA IF NOT EXISTS "${this.schema}"`);
      await client.end();

      // Set environment variables
      const dbUrl = `${this.connectionString}?schema=${this.schema}`;
      process.env.DATABASE_URL = dbUrl;
      this.global.process.env.DATABASE_URL = dbUrl;

      // Run migrations
      execSync(`npx prisma migrate deploy`, {
        env: {
          ...process.env,
          DATABASE_URL: dbUrl,
        },
        stdio: 'inherit',
      });

      return super.setup();
    } catch (error) {
      console.error('Error in PrismaTestEnvironment setup:', error);
      throw error;
    }
  }

  async teardown() {
    try {
      const client = new Client({
        connectionString: this.connectionString,
      });

      await client.connect();
      await client.query(`DROP SCHEMA IF EXISTS "${this.schema}" CASCADE`);
      await client.end();

      return super.teardown();
    } catch (error) {
      console.error('Error in PrismaTestEnvironment teardown:', error);
      throw error;
    }
  }
}

module.exports = PrismaTestEnvironment;

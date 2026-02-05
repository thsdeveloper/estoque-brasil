import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const migrationPath = path.join(__dirname, '001_create_tables.sql');
  const migrationSql = fs.readFileSync(migrationPath, 'utf-8');

  console.log('Running migration...');
  console.log('Migration file:', migrationPath);

  // Split the SQL into individual statements and execute them
  // Note: This is a simple approach; for complex migrations, consider using a proper migration tool
  const statements = migrationSql
    .split(/;[\s]*(?=(?:--|CREATE|ALTER|DROP|INSERT|UPDATE|DELETE|DO|COMMENT))/i)
    .filter(stmt => stmt.trim().length > 0)
    .map(stmt => stmt.trim() + (stmt.trim().endsWith(';') ? '' : ';'));

  for (const statement of statements) {
    if (statement.trim().length === 0) continue;

    // Skip comments-only statements
    if (/^--.*$/m.test(statement) && !/\b(CREATE|ALTER|DROP|INSERT|UPDATE|DELETE|DO)\b/i.test(statement)) {
      continue;
    }

    try {
      const { error } = await supabase.rpc('exec_sql', { sql: statement });

      if (error) {
        // If exec_sql doesn't exist, we need to run the migration via Supabase dashboard
        console.error('Error executing statement:', error.message);
        console.log('Statement:', statement.substring(0, 100) + '...');
      } else {
        console.log('Executed statement successfully');
      }
    } catch (err) {
      console.error('Exception executing statement:', err);
    }
  }

  console.log('Migration completed!');
}

runMigration().catch(console.error);

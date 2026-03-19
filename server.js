import express from 'express';
import cors from 'cors';
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// Enable JSON parsing and CORS
app.use(express.json());
app.use(cors());

// Initialize PostgreSQL connection
// Railway provides DATABASE_URL. If it's an internal URL (.internal), it doesn't support SSL.
const usesInternalRailwayNetwork = process.env.DATABASE_URL?.includes('.internal');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' && !usesInternalRailwayNetwork 
        ? { rejectUnauthorized: false } 
        : false
});

// Catch any idle database connection errors to prevent the entire Node process from crashing
pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
});

// API Routes
app.get('/api/health', async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT NOW()');
        client.release();
        res.json({ status: 'ok', db_time: result.rows[0].now });
    } catch (err) {
        console.error('Database connection error:', err);
        res.status(500).json({ status: 'error', message: 'Could not connect to database' });
    }
});

// Initialize database tables
const initDB = async () => {
    try {
        console.log("Initializing database tables...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS companies (
                id VARCHAR(255) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(255) PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                role VARCHAR(50) NOT NULL,
                company_id VARCHAR(255) NOT NULL,
                has_accepted_terms BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS products (
                id VARCHAR(255) PRIMARY KEY,
                company_id VARCHAR(255) NOT NULL,
                name VARCHAR(255) NOT NULL,
                sku VARCHAR(255) NOT NULL,
                case_pack INTEGER NOT NULL,
                size_ounces VARCHAR(50),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("Database tables initialized successfully.");
    } catch (err) {
        console.error("Error initializing tables:", err);
    }
};

// --- API ROUTES ---

// Companies
app.get('/api/companies', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM companies ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching companies' });
    }
});

app.post('/api/companies', async (req, res) => {
    const { id, name } = req.body;
    try {
        await pool.query(
            'INSERT INTO companies (id, name) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name',
            [id, name]
        );
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error saving company' });
    }
});

app.delete('/api/companies/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM companies WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error deleting company' });
    }
});

// Users
app.get('/api/users', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
        // Map database snake_case to frontend camelCase
        const formattedRows = rows.map(r => ({
            id: r.id, email: r.email, role: r.role, companyId: r.company_id, hasAcceptedTerms: r.has_accepted_terms
        }));
        res.json(formattedRows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching users' });
    }
});

app.post('/api/users', async (req, res) => {
    const { id, email, role, companyId, hasAcceptedTerms } = req.body;
    try {
        await pool.query(
            `INSERT INTO users (id, email, role, company_id, has_accepted_terms) 
             VALUES ($1, $2, $3, $4, $5) 
             ON CONFLICT (id) DO UPDATE SET 
             email = EXCLUDED.email, role = EXCLUDED.role, company_id = EXCLUDED.company_id, has_accepted_terms = EXCLUDED.has_accepted_terms`,
            [id, email, role, companyId, hasAcceptedTerms || false]
        );
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error saving user' });
    }
});

app.delete('/api/users/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error deleting user' });
    }
});

// Products
app.get(['/api/products', '/api/products/:companyId'], async (req, res) => {
    try {
        const { companyId } = req.params;
        let query = 'SELECT * FROM products ORDER BY created_at DESC';
        let params = [];
        
        if (companyId) {
            query = 'SELECT * FROM products WHERE company_id = $1 ORDER BY created_at DESC';
            params = [companyId];
        }
        
        const { rows } = await pool.query(query, params);
        const formattedRows = rows.map(r => ({
            id: r.id, companyId: r.company_id, name: r.name, sku: r.sku, casePack: r.case_pack, sizeOunces: r.size_ounces
        }));
        res.json(formattedRows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching products' });
    }
});

app.post('/api/products', async (req, res) => {
    const { id, companyId, name, sku, casePack, sizeOunces } = req.body;
    try {
        await pool.query(
            `INSERT INTO products (id, company_id, name, sku, case_pack, size_ounces) 
             VALUES ($1, $2, $3, $4, $5, $6) 
             ON CONFLICT (id) DO UPDATE SET 
             company_id = EXCLUDED.company_id, name = EXCLUDED.name, sku = EXCLUDED.sku, case_pack = EXCLUDED.case_pack, size_ounces = EXCLUDED.size_ounces`,
            [id, companyId, name, sku, casePack, sizeOunces || null]
        );
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error saving product' });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error deleting product' });
    }
});

// --- END API ROUTES ---

// Serve the Vite React app in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    // Using regex /.*/ instead of '*' to comply with Express 5 path-to-regexp strictness
    app.get(/.*/, (req, res) => {
        res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
}

app.listen(PORT, async () => {
    await initDB();
    console.log(`Server running on port ${PORT}`);
});

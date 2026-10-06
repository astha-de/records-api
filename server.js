const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Create internships table
db.run(`
  CREATE TABLE IF NOT EXISTS internships (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company TEXT NOT NULL,
    role TEXT NOT NULL,
    location TEXT NOT NULL,
    stipend INTEGER,
    duration TEXT NOT NULL,
    mode TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Open',
    skills TEXT,
    description TEXT,
    application_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Get all internships with pagination
app.get("/api/internships", (req, res) => {
  let page = parseInt(req.query.page) || 1;
  let limit = parseInt(req.query.limit) || 10;

  if (page < 1) page = 1;
  if (limit < 1) limit = 10;
  if (limit > 50) limit = 50;

  const offset = (page - 1) * limit;

  db.get(
    "SELECT COUNT(*) AS total FROM internships",
    [],
    (countErr, countRow) => {
      if (countErr) {
        return res.status(500).json({
          success: false,
          error: "Failed to fetch internships"
        });
      }

      db.all(
        `SELECT * FROM internships
         ORDER BY id DESC
         LIMIT ? OFFSET ?`,
        [limit, offset],
        (err, rows) => {
          if (err) {
            return res.status(500).json({
              success: false,
              error: "Failed to fetch internships"
            });
          }

          const total = countRow.total;
          const totalPages = Math.ceil(total / limit);

          res.json({
            success: true,
            data: rows,
            pagination: {
              page,
              limit,
              total,
              totalPages
            }
          });
        }
      );
    }
  );
});

// Get single internship by ID
app.get("/api/internships/:id", (req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({
      success: false,
      error: "Invalid internship ID"
    });
  }

  db.get(
    "SELECT * FROM internships WHERE id = ?",
    [id],
    (err, row) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: "Failed to fetch internship"
        });
      }

      if (!row) {
        return res.status(404).json({
          success: false,
          error: "Internship not found"
        });
      }

      res.json({
        success: true,
        data: row
      });
    }
  );
});

// Create a new internship
app.post("/api/internships", (req, res) => {
  const {
    company,
    role,
    location,
    stipend,
    duration,
    mode,
    status,
    skills,
    description,
    application_url
  } = req.body;

  // Validation
  if (!company || !role || !location || !duration || !mode) {
    return res.status(400).json({
      success: false,
      error: "company, role, location, duration and mode are required"
    });
  }

  const sql = `
    INSERT INTO internships
    (company, role, location, stipend, duration, mode, status, skills, description, application_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    company,
    role,
    location,
    stipend || null,
    duration,
    mode,
    status || "Open",
    skills || null,
    description || null,
    application_url || null
  ];

  db.run(sql, values, function (err) {
    if (err) {
      return res.status(500).json({
        success: false,
        error: "Failed to create internship"
      });
    }

    res.status(201).json({
      success: true,
      message: "Internship created successfully",
      data: {
        id: this.lastID
      }
    });
  });
});



 // Update internship by ID
app.put("/api/internships/:id", (req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({
      success: false,
      error: "Invalid internship ID"
    });
  }

  const {
    company,
    role,
    location,
    stipend,
    duration,
    mode,
    status,
    skills,
    description,
    application_url
  } = req.body;

  if (!company || !role || !location || !duration || !mode) {
    return res.status(400).json({
      success: false,
      error: "company, role, location, duration and mode are required"
    });
  }

  const sql = `
    UPDATE internships
    SET company = ?,
        role = ?,
        location = ?,
        stipend = ?,
        duration = ?,
        mode = ?,
        status = ?,
        skills = ?,
        description = ?,
        application_url = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  const values = [
    company,
    role,
    location,
    stipend || null,
    duration,
    mode,
    status || "Open",
    skills || null,
    description || null,
    application_url || null,
    id
  ];

  db.run(sql, values, function (err) {
    if (err) {
      return res.status(500).json({
        success: false,
        error: "Failed to update internship"
      });
    }

    if (this.changes === 0) {
      return res.status(404).json({
        success: false,
        error: "Internship not found"
      });
    }

    res.json({
      success: true,
      message: "Internship updated successfully"
    });
  });
});

// Delete internship by ID
app.delete("/api/internships/:id", (req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({
      success: false,
      error: "Invalid internship ID"
    });
  }

  db.run(
    "DELETE FROM internships WHERE id = ?",
    [id],
    function (err) {
      if (err) {
        return res.status(500).json({
          success: false,
          error: "Failed to delete internship"
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          success: false,
          error: "Internship not found"
        });
      }

      res.json({
        success: true,
        message: "Internship deleted successfully"
      });
    }
  );
});
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Internship Records API is running"
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
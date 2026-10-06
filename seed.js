const db = require("./db");
const internships = require("./seed-data.json");

const sql = `
  INSERT INTO internships
  (company, role, location, stipend, duration, mode, status, skills, description, application_url)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

let completed = 0;

internships.forEach((internship) => {
  db.run(
    sql,
    [
      internship.company,
      internship.role,
      internship.location,
      internship.stipend,
      internship.duration,
      internship.mode,
      internship.status,
      internship.skills,
      internship.description,
      internship.application_url
    ],
    (err) => {
      if (err) {
        console.error("Error inserting data:", err.message);
      } else {
        completed++;

        if (completed === internships.length) {
          console.log("Seed data inserted successfully.");
          db.close();
        }
      }
    }
  );
});
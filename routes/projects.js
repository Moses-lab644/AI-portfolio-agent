const express = require('express');
const { db } = require('../database/init');

const router = express.Router();

// Get user projects
router.get('/', (req, res) => {
  const userId = req.user.userId;
  
  db.all(
    'SELECT * FROM projects WHERE user_id = ? ORDER BY featured DESC, created_at DESC',
    [userId],
    (err, projects) => {
      if (err) {
        return res.status(500).json({ error: 'Server error' });
      }
      res.json(projects);
    }
  );
});

// Add new project
router.post('/', (req, res) => {
  const userId = req.user.userId;
  const { title, description, imageUrl, projectUrl, technologies, featured } = req.body;
  
  db.run(
    'INSERT INTO projects (user_id, title, description, image_url, project_url, technologies, featured) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [userId, title, description, imageUrl, projectUrl, JSON.stringify(technologies || []), featured || false],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to add project' });
      }
      
      res.json({
        id: this.lastID,
        message: 'Project added successfully'
      });
    }
  );
});

// Update project
router.put('/:projectId', (req, res) => {
  const { projectId } = req.params;
  const userId = req.user.userId;
  const { title, description, imageUrl, projectUrl, technologies, featured } = req.body;
  
  db.run(
    'UPDATE projects SET title = ?, description = ?, image_url = ?, project_url = ?, technologies = ?, featured = ? WHERE id = ? AND user_id = ?',
    [title, description, imageUrl, projectUrl, JSON.stringify(technologies || []), featured || false, projectId, userId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update project' });
      }
      res.json({ message: 'Project updated successfully' });
    }
  );
});

// Delete project
router.delete('/:projectId', (req, res) => {
  const { projectId } = req.params;
  const userId = req.user.userId;
  
  db.run('DELETE FROM projects WHERE id = ? AND user_id = ?', [projectId, userId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete project' });
    }
    res.json({ message: 'Project deleted successfully' });
  });
});

module.exports = router;
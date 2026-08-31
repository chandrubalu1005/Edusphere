const fs = require('fs');
const path = require('path');

// 1. Update courseRoutes.js to use multer
let routes = fs.readFileSync('backend/services/course-service/src/routes/courseRoutes.js', 'utf8');
if (!routes.includes('multer')) {
  routes = "const multer = require('multer');\n" +
           "const path = require('path');\n" +
           "const fs = require('fs');\n" +
           "const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads', 'courses');\n" +
           "fs.mkdirSync(UPLOAD_DIR, { recursive: true });\n" +
           "const storage = multer.diskStorage({\n" +
           "  destination: (req, file, cb) => {\n" +
           "    const dir = path.join(UPLOAD_DIR, req.params.id || 'misc');\n" +
           "    fs.mkdirSync(dir, { recursive: true });\n" +
           "    cb(null, dir);\n" +
           "  },\n" +
           "  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)\n" +
           "});\n" +
           "const upload = multer({ storage });\n" + routes;
           
  routes = routes.replace(
    "router.post('/:id/content',  authMiddleware, courseController.addContent);",
    "router.post('/:id/content',  authMiddleware, upload.single('file'), courseController.addContent);"
  );
  fs.writeFileSync('backend/services/course-service/src/routes/courseRoutes.js', routes);
}

// 2. Update courseController.js to handle req.file
let ctrl = fs.readFileSync('backend/services/course-service/src/controllers/courseController.js', 'utf8');
if (!ctrl.includes('req.file ?')) {
  const oldAddContentBody = `const { title, type, url, unlockDate } = req.body;
    if (!title || !url) {
      return res.status(400).json({ error: 'Title and URL are required' });
    }`;
    
  const newAddContentBody = `const { title, type, unlockDate } = req.body;
    let url = req.body.url;
    if (req.file) {
      url = \`/uploads/courses/\${req.params.id}/\${req.file.filename}\`;
    }
    if (!title || !url) {
      return res.status(400).json({ error: 'Title and URL (or file) are required' });
    }`;
    
  ctrl = ctrl.replace(oldAddContentBody, newAddContentBody);
  fs.writeFileSync('backend/services/course-service/src/controllers/courseController.js', ctrl);
}

// 3. Update server.js to serve static files
let server = fs.readFileSync('backend/services/course-service/src/server.js', 'utf8');
if (!server.includes('express.static')) {
  server = server.replace(
    "app.use(express.json());",
    "app.use(express.json());\nconst path = require('path');\nconst fs = require('fs');\nconst UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads', 'courses');\nfs.mkdirSync(UPLOAD_DIR, { recursive: true });\napp.use('/uploads/courses', express.static(UPLOAD_DIR));"
  );
  fs.writeFileSync('backend/services/course-service/src/server.js', server);
}

// 4. Update hooks.js to use FormData
let hooks = fs.readFileSync('frontend/src/api/hooks.js', 'utf8');
const oldMutation = `mutationFn: async ({ courseId, file, title, type, link }) => {
      // Simulate file upload URL if a file is provided, else use link URL
      const url = file ? \`/uploads/courses/\${courseId}/\${encodeURIComponent(file.name)}\` : link;
      const res = await api.post(\`/courses/\${courseId}/content\`, { title, type, url });
      return res.data;
    },`;
    
const newMutation = `mutationFn: async ({ courseId, file, title, type, link }) => {
      if (file) {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('type', type);
        formData.append('file', file);
        const res = await api.post(\`/courses/\${courseId}/content\`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        return res.data;
      } else {
        const res = await api.post(\`/courses/\${courseId}/content\`, { title, type, url: link });
        return res.data;
      }
    },`;
    
hooks = hooks.replace(oldMutation, newMutation);
fs.writeFileSync('frontend/src/api/hooks.js', hooks);

// 5. Update FacultyPortal.jsx to remove 'Simulated' toast
let fp = fs.readFileSync('frontend/src/portals/FacultyPortal.jsx', 'utf8');
fp = fp.replace(/toast\.success\('Simulated upload completed successfully\.'\);/g, "toast.success('Course content uploaded successfully.');");
fs.writeFileSync('frontend/src/portals/FacultyPortal.jsx', fp);

console.log('Success Course Upload Patched');

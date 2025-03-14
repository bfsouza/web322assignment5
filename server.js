/********************************************************************************
* WEB322 – Assignment 04
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
*
* Name: Bruno Felipi de Souza Student ID: 132021239 Date: 2025-03-03
*
* Published URL: https://web322assignment-brunos-projects-00093bef.vercel.app/
*
********************************************************************************/

const express = require("express");
const path = require("path");
const projectData = require("./modules/projects");
const app = express();

// Student details
const studentName = "Bruno Felipi de Souza";
const studentId = "132021239";

const { getAllSectors, addProject, editProject } = require('./projects');

app.use(express.static("public"));
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));

// Timestamp Middleware
app.use((req, res, next) => {
    res.locals.timestamp = new Date().toISOString();
    next();
});

// Routes
// app.get("/", (req, res) => {
//     res.sendFile(path.join(__dirname, "views", "home.html"));
// });

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// Define a basic route
app.get("/", (req, res) => {
    res.render('home', { page: '/' });
});

app.get("/about", (req, res) => {
    res.render('about', { page: '/about' });
});

app.get('/solutions/addProject', (req, res) => {
    getAllSectors()
        .then((sectors) => {
            res.render('addProject', { sectors });
        })
        .catch((err) => {
            console.error(err);
            res.render('500', { message: `Erro ao carregar setores: ${err.message}` });
        });
});

app.post('/solutions/addProject', (req, res) => {
    const projectData = req.body;
    addProject(projectData)
        .then(() => {
            res.redirect('/solutions/projects');
        })
        .catch((err) => {
            console.error(err);
            res.render('500', { message: `Desculpe, mas encontramos o seguinte erro: ${err.message}` });
        });
});

// GET "/solutions/projects"
app.get("/solutions/projects", async (req, res) => {
    try {
        const { sector } = req.query;
        const projects = sector
            ? await projectData.getProjectsBySector(sector)
            : await projectData.getAllProjects();
        if (projects.length === 0) {
            return res.status(404).render("404", {
                message: "No projects found for the specified sector.",
                studentName,
                studentId,
                timestamp: new Date().toISOString()
            });
        }
        res.render("projects", { projects });
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve projects", details: error.message });
    }
});

// GET "/solutions/projects/:id"
app.get("/solutions/projects/:id", async (req, res) => {
    try {
        const projectId = parseInt(req.params.id);
        if (isNaN(projectId)) throw new Error("Invalid project ID format");

        const project = await projectData.getProjectById(projectId);
        if (!project) {
            return res.status(404).render("404", {
                message: `Project with ID ${projectId} not found.`,
                studentName,
                studentId,
                timestamp: new Date().toISOString()
            });
        }

        res.render("project", { project });
    } catch (error) {
        res.status(404).render("404", {
            message: "Failed to retrieve project by ID.",
            studentName,
            studentId,
            timestamp: new Date().toISOString()
        });
    }
});

// POST "/post-request"
app.post("/post-request", (req, res) => {
    try {
        res.json({ studentName, studentId, timestamp: new Date().toISOString(), data: req.body });
    } catch (error) {
        res.status(500).json({ error: "Failed to process request", details: error.message });
    }
});

app.get('/solutions/editProject/:id', async (req, res) => {
    try {
        const projectId = parseInt(req.params.id);
        if (isNaN(projectId)) throw new Error("Invalid project ID format");

        const [project, sectors] = await Promise.all([
            projectData.getProjectById(projectId),
            getAllSectors()
        ]);

        if (!project) {
            return res.status(404).render('404', { message: `Project with ID ${projectId} not found.` });
        }

        res.render('editProject', { project, sectors });
    } catch (err) {
        console.error(err);
        res.status(404).render('404', { message: err.message });
    }
});

app.post('/solutions/editProject', (req, res) => {
    const projectId = req.body.id;
    const projectData = req.body;

    editProject(projectId, projectData)
        .then(() => {
            res.redirect('/solutions/projects');
        })
        .catch((err) => {
            console.error(err);
            res.render('500', { message: `I'm sorry, but we have encountered the following error: ${err.message}` });
        });
});

app.get('/solutions/deleteProject/:id', (req, res) => {
    const projectId = parseInt(req.params.id);
    if (isNaN(projectId)) {
        return res.render('500', { message: 'Invalid project ID format' });
    }

    deleteProject(projectId)
        .then(() => {
            res.redirect('/solutions/projects');
        })
        .catch((err) => {
            console.error(err);
            res.render('500', { message: `I'm sorry, but we have encountered the following error: ${err}` });
        });
});

// Initialize Projects
(async () => {
    try {
        await projectData.initialize();
        console.log("Projects initialized successfully.");
    } catch (error) {
        console.error("Failed to initialize projects:", error);
    }
})();

app.use((req, res) => {
    res.status(404).render("404", {
        message: "I'm sorry, we're unable to find what you're looking for.",
        studentName,
        studentId,
        timestamp: new Date().toISOString()
    });
});

module.exports = app;

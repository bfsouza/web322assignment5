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

const projectData = require('../modules/projects');

const studentName = "Bruno Felipi de Souza";
const studentId = "132021239";

describe('Project Data Module', () => {
    test('getAllProjects should return all projects', async () => {
        const projects = await projectData.getAllProjects();
        expect(projects).toBeDefined();
        expect(Array.isArray(projects)).toBe(true);
    });

    test('getProjectById should return a project for a valid ID', async () => {
        const projectId = 1; // Use a valid project ID for testing
        const project = await projectData.getProjectById(projectId);
        expect(project).toBeDefined();
    });

    test('getProjectById should return null for an invalid ID', async () => {
        const projectId = 9999; // Use an invalid project ID for testing
        const project = await projectData.getProjectById(projectId);
        expect(project).toBeNull();
    });

    afterAll(() => {
        console.log(`Student: ${studentName} (${studentId})`);
    });
});
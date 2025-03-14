/********************************************************************************
* WEB322 – Assignment 05
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
*
* Name: Bruno Felipi de Souza Student ID: 132021239 Date: 2025-02-14
*
* Published URL: https://web322assignment-brunos-projects-00093bef.vercel.app/
*
********************************************************************************/

require('dotenv').config();
require('pg');
const { Sequelize, DataTypes } = require('sequelize');

// set up sequelize to point to our postgres database

const sequelize = new Sequelize(process.env.PGDATABASE, process.env.PGUSER, process.env.PGPASSWORD, {
    host: process.env.PGHOST,
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false },
    },
});

sequelize
    .authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
    })
    .catch((err) => {
        console.log('Unable to connect to the database:', err);
    });

const Sector = sequelize.define(
    'Sector',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        sector_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        timestamps: false, // Desativa createdAt e updatedAt
    }
);

// Definir o modelo Project
const Project = sequelize.define(
    'Project',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        feature_img_url: {
            type: DataTypes.STRING,
        },
        summary_short: {
            type: DataTypes.TEXT,
        },
        intro_short: {
            type: DataTypes.TEXT,
        },
        impact: {
            type: DataTypes.TEXT,
        },
        original_source_url: {
            type: DataTypes.STRING,
        },
    },
    {
        timestamps: false, // Desativa createdAt e updatedAt
    }
);

// Sincronizar os modelos com o banco de dados
sequelize
    .sync()
    .then(() => console.log('Tables created successfully!'))
    .catch((error) => console.error('Error creating tables:', error));

Project.belongsTo(Sector, { foreignKey: 'sector_id' });

// Initialize function
function initialize() {
    return new Promise((resolve, reject) => {
        sequelize.sync()
            .then(() => {
                console.log('Database synchronized successfully!');
                resolve();
            })
            .catch((error) => {
                console.error('Error synchronizing the database:', error);
                reject(error);
            });
    });
}

// getAllProjects
function getAllProjects() {
    return Project.findAll({
        include: [Sector], // Inclui os dados do setor relacionado ao projeto
    })
    .then((projects) => {
        return projects; // Resolve a Promise com todos os projetos, incluindo os dados de Setor
    })
    .catch((error) => {
        console.error('Error fetching projects:', error);
        throw error; // Rejeita a Promise com o erro caso algo dê errado
    });
}

// getProjectById
function getProjectById(projectId) {
    return Project.findAll({
        where: {
            id: projectId, // Filtra pelo id do projeto
        },
        include: [Sector], // Inclui os dados do setor relacionado ao projeto
    })
    .then((projects) => {
        if (projects.length > 0) {
            return projects[0]; // Retorna o primeiro (e único) projeto encontrado
        } else {
            throw new Error('Unable to find requested project'); // Se não encontrar o projeto, lança um erro
        }
    })
    .catch((error) => {
        console.error('Error fetching project:', error);
        throw error; // Rejeita a Promise com o erro
    });
}

// getProjectsBySector
function getProjectsBySector(sector) {
    return Project.findAll({
        include: [Sector], // Inclui os dados do setor relacionado ao projeto
        where: {
            '$Sector.sector_name$': {
                [Sequelize.Op.iLike]: `%${sector}%` // Busca setores que contenham a string 'sector' (case-insensitive)
            }
        }
    })
    .then((projects) => {
        if (projects.length > 0) {
            return projects; // Retorna todos os projetos encontrados
        } else {
            throw new Error('Unable to find requested projects'); // Se não encontrar projetos, lança erro
        }
    })
    .catch((error) => {
        console.error('Error fetching projects by sector:', error);
        throw error; // Rejeita a Promise com o erro
    });
}

// Em projects.js
function getAllSectors() {
  return new Promise((resolve, reject) => {
    // Busca todos os setores no banco de dados
    Sector.findAll()
      .then((sectors) => resolve(sectors))
      .catch((err) => reject(err)); // Caso ocorra um erro, rejeita a Promise
  });
}

function addProject(projectData) {
  return new Promise((resolve, reject) => {
    // Adiciona o novo projeto no banco de dados
    Project.create(projectData)
      .then(() => resolve()) // Caso o projeto seja criado com sucesso
      .catch((err) => reject(err)); // Caso ocorra um erro, rejeita a Promise
  });
}

function editProject(id, projectData) {
    return new Promise((resolve, reject) => {
        Project.update(projectData, { where: { id } })
            .then(() => resolve())
            .catch((err) => reject(err.errors[0].message));
    });
}

function deleteProject(id) {
    return new Promise((resolve, reject) => {
        Project.destroy({ where: { id } })
            .then(() => resolve())
            .catch((err) => reject(err.errors[0].message));
    });
}

module.exports = {
    initialize,
    getAllProjects,
    getProjectById,
    getProjectsBySector,
    getAllSectors, 
    addProject,
    editProject,
    deleteProject
};
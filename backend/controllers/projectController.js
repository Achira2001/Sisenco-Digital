const Project = require("../models/Project");

// Get all projects
const getProjects = async (req, res) => {
  try {
    // Show only active projects by default
    const filter =
      req.query.includeInactive === "true" ? {} : { isActive: true };

    const projects = await Project.find(filter)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new project
const createProject = async (req, res) => {
  try {
    const { name, description, members } = req.body;

    // Check if the project already exists
    const existing = await Project.findOne({ name });

    if (existing) {
      return res
        .status(400)
        .json({ message: "A project with this name already exists" });
    }

    const project = await Project.create({
      name,
      description,
      members: members || [],
      createdBy: req.user._id,
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a project
const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const { name, description, members, isActive } = req.body;

    // Update only the fields that were provided
    if (name !== undefined) project.name = name;
    if (description !== undefined) project.description = description;
    if (members !== undefined) project.members = members;
    if (isActive !== undefined) project.isActive = isActive;

    const updatedProject = await project.save();

    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a project
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Instead of deleting, mark the project as inactive
    project.isActive = false;

    await project.save();

    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
};
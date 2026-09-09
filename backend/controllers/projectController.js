const Project = require("../models/Project");


const getProjects = async (req, res) => {
  try {
    
    const filter = req.query.includeInactive === "true" ? {} : { isActive: true };

    const projects = await Project.find(filter)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const createProject = async (req, res) => {
  try {
    const { name, description, members } = req.body;

    const existing = await Project.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: "A project with this name already exists" });
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


const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const { name, description, members, isActive } = req.body;
    if (name !== undefined) project.name = name;
    if (description !== undefined) project.description = description;
    if (members !== undefined) project.members = members;
    if (isActive !== undefined) project.isActive = isActive;

    const updated = await project.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    
    project.isActive = false;
    await project.save();

    res.json({ message: "Project deleted (archived) successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProjects, createProject, updateProject, deleteProject };

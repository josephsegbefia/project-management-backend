const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Project = require("../models/Project.model");
const Task = require("../models/Task.model");
const User = require("../models/User.model")

//  POST /api/projects  -  Creates a new project
router.post("/projects", (req, res, next) => {
  const { user, title, description } = req.body;

  Project.create({ user, title, description, tasks: [] })
  .then((project) => {
    return User.findByIdAndUpdate(user._id, {
      $push: { projects: project._id }
    }).then(() => {
      res.status(200).json({ message: `Project created!`, project: project})
    })
  }).catch((error) => {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" })
  })
});

//  GET /api/projects -  Retrieves all of a users projects
router.get("/:user/projects", (req, res, next) => {
  const { user } = req.params;
  Project.find({ user })
    .then((projects) => {
      res.status(200).json(projects);
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ message: "Internal Server Error"});
    })
});

//  GET /api/projects/:projectId -  Retrieves a specific project by id
router.get("/:user/projects/:projectId", (req, res, next) => {
  const { user, projectId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  if(!mongoose.Types.ObjectId.isValid(user)){
    res.status(400).json({ message: "Specified user is not valid" });
    return;
  }

  // Each Project document has `tasks` array holding `_id`s of Task documents
  // We use .populate() method to get swap the `_id`s for the actual Task documents
  // Project.findById(projectId)
  //   .populate("tasks")
  //   .then((project) => res.status(200).json(project))
  //   .catch((error) => res.json(error));

  Project.findOne({ _id: projectId, user })
    .then((project) => {
      res.status(200).json(project)
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ message: "Internal Server Error" });
    })
});

// PUT  /api/projects/:projectId  -  Updates a specific project by id
router.put("/projects/:projectId", (req, res, next) => {
  const { projectId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    res.status(400).json({ message: "Specified project id is not valid" });
    return;
  }



  Project.findByIdAndUpdate(projectId, req.body, { new: true })
    .then((updatedProject) => res.json(updatedProject))
    .catch((error) => res.json(error));
});

// DELETE  /api/projects/:projectId  -  Deletes a specific project by id
router.delete("/projects/:projectId", (req, res, next) => {
  const { projectId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  Project.findByIdAndRemove(projectId)
    .then(() =>
      res.json({
        message: `Project with ${projectId} is removed successfully.`,
      })
    )
    .catch((error) => res.json(error));
});

module.exports = router;

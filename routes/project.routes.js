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
    return User.findOneAndUpdate({ _id: user }, {
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
router.put("/:user/projects/:projectId", (req, res, next) => {
  const { user, projectId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    res.status(400).json({ message: "Specified project id is not valid" });
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(user)) {
    res.status(400).json({ message: "Specified user is not valid" });
    return;
  }



  Project.findOneAndUpdate({ _id: projectId, user: user }, req.body, { new: true })
    .then((updatedProject) => res.json(updatedProject))
    .catch((error) => res.json(error));
});

// DELETE  /api/projects/:projectId  -  Deletes a specific project by id
router.delete("/projects/:projectId", async (req, res, next) => {
  try {
    const { projectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      res.status(400).json({ message: "Specified id is not valid" });
      return;
    }

    const deletedProject = await Project.findByIdAndDelete(projectId)
    console.log("Project=====>", deletedProject)

    await User.findByIdAndUpdate(deletedProject.user, {
      $pull: { projects: deletedProject._id}
    })

    res.json({ message: "Project deleted successfully" });
  }catch(error){
    console.log(error);
  }

  // Project.findOneAndRemove({ _id:projectId, user: user })
  //   .then((project) => {
  //     console.log("Project=====>",project);
  //     return User.findOneAndUpdate({ _id: user }, {
  //       $pull: { projects: project._id }
  //     })
  //     .then(() => {
  //       res.status(200).json({ message: "Project deleted" });
  //     })
  //   })
  //   .catch((error) => {
  //     console.log(error);
  //     res.status(500).json({ message: "Internal Server Error"});
  //   })
});

module.exports = router;

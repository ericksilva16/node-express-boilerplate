const Joi = require('joi');
const { objectId } = require('./custom.validation');

const taskStatus = Joi.string().valid('pending', 'in_progress', 'done');

const createTask = {
  body: Joi.object().keys({
    title: Joi.string().required().min(3).max(100),
    description: Joi.string().max(500).allow(''),
    status: taskStatus,
    dueDate: Joi.date().iso().allow(null),
  }),
};

const getTasks = {
  query: Joi.object().keys({
    status: taskStatus,
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getTask = {
  params: Joi.object().keys({
    taskId: Joi.string().custom(objectId),
  }),
};

const updateTask = {
  params: Joi.object().keys({
    taskId: Joi.string().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      title: Joi.string().min(3).max(100),
      description: Joi.string().max(500).allow(''),
      status: taskStatus,
      dueDate: Joi.date().iso().allow(null),
    })
    .min(1),
};

const deleteTask = {
  params: Joi.object().keys({
    taskId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
};

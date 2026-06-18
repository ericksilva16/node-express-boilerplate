const httpStatus = require('http-status');
const { Task } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Criar uma tarefa
 * @param {Object} taskBody
 * @returns {Promise<Task>}
 */
const createTask = async (taskBody) => {
  return Task.create(taskBody);
};

/**
 * Listar tarefas com paginação e filtros
 * @param {Object} filter - Filtro Mongoose
 * @param {Object} options - Opções de query (sortBy, limit, page)
 * @returns {Promise<QueryResult>}
 */
const queryTasks = async (filter, options) => {
  return Task.paginate(filter, options);
};

/**
 * Buscar tarefa por ID
 * @param {ObjectId} id
 * @returns {Promise<Task>}
 */
const getTaskById = async (id, userId) => {
  if (userId) {
    return Task.findOne({ _id: id, user: userId });
  }
  return Task.findById(id);
};

/**
 * Atualizar tarefa por ID
 * @param {ObjectId} taskId
 * @param {Object} updateBody
 * @returns {Promise<Task>}
 */
const updateTaskById = async (taskId, updateBody, userId) => {
  const task = await getTaskById(taskId, userId);
  if (!task) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Tarefa não encontrada');
  }
  Object.assign(task, updateBody);
  await task.save();
  return task;
};

/**
 * Deletar tarefa por ID
 * @param {ObjectId} taskId
 * @returns {Promise<Task>}
 */
const deleteTaskById = async (taskId, userId) => {
  const task = await getTaskById(taskId, userId);
  if (!task) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Tarefa não encontrada');
  }
  await task.remove();
  return task;
};

module.exports = {
  createTask,
  queryTasks,
  getTaskById,
  updateTaskById,
  deleteTaskById,
};

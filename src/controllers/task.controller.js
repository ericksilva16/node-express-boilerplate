const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { taskService } = require('../services');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');

/**
 * Criar uma nova tarefa para o usuário autenticado
 */
const createTask = catchAsync(async (req, res) => {
  const task = await taskService.createTask({ ...req.body, user: req.user.id });
  res.status(httpStatus.CREATED).send(task);
});

/**
 * Listar tarefas do usuário autenticado (com paginação e filtro por status)
 */
const getTasks = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['status']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  // Garantir que usuário só veja suas próprias tarefas
  filter.user = req.user.id;
  const result = await taskService.queryTasks(filter, options);
  res.send(result);
});

/**
 * Buscar uma tarefa pelo ID
 */
const getTask = catchAsync(async (req, res) => {
  const task = await taskService.getTaskById(req.params.taskId, req.user.id);
  if (!task) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Tarefa não encontrada');
  }
  res.send(task);
});

/**
 * Atualizar uma tarefa pelo ID
 */
const updateTask = catchAsync(async (req, res) => {
  const task = await taskService.updateTaskById(req.params.taskId, req.body, req.user.id);
  res.send(task);
});

/**
 * Deletar uma tarefa pelo ID
 */
const deleteTask = catchAsync(async (req, res) => {
  await taskService.deleteTaskById(req.params.taskId, req.user.id);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
};

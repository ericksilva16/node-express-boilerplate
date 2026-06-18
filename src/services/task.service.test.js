const mongoose = require('mongoose');
const httpStatus = require('http-status');
const { Task } = require('../models');
const taskService = require('./task.service');
const ApiError = require('../utils/ApiError');

// Mock do model
jest.mock('../models/task.model');

describe('Task Service', () => {
  const fakeUserId = new mongoose.Types.ObjectId();

  const taskData = {
    title: 'Tarefa de teste',
    description: 'Descrição',
    status: 'pending',
    user: fakeUserId,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createTask', () => {
    it('deve criar uma tarefa com sucesso', async () => {
      Task.create.mockResolvedValue(taskData);
      const task = await taskService.createTask(taskData);
      expect(task).toEqual(taskData);
      expect(Task.create).toHaveBeenCalledWith(taskData);
    });
  });

  describe('getTaskById', () => {
    it('deve retornar a tarefa se encontrada', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      Task.findById.mockResolvedValue({ ...taskData, _id: fakeId });
      const task = await taskService.getTaskById(fakeId);
      expect(task).toBeDefined();
      expect(Task.findById).toHaveBeenCalledWith(fakeId);
    });

    it('deve retornar null se tarefa não encontrada', async () => {
      Task.findById.mockResolvedValue(null);
      const task = await taskService.getTaskById(new mongoose.Types.ObjectId());
      expect(task).toBeNull();
    });
  });

  describe('queryTasks', () => {
    it('deve chamar Task.paginate com filtro e opções corretos', async () => {
      const filter = { user: fakeUserId, status: 'pending' };
      const options = { limit: 10, page: 1 };
      const paginatedResult = { results: [taskData], page: 1, limit: 10, totalPages: 1, totalResults: 1 };
      Task.paginate.mockResolvedValue(paginatedResult);

      const result = await taskService.queryTasks(filter, options);
      expect(Task.paginate).toHaveBeenCalledWith(filter, options);
      expect(result).toEqual(paginatedResult);
    });
  });

  describe('updateTaskById', () => {
    it('deve atualizar e retornar a tarefa com sucesso', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const mockTask = {
        ...taskData,
        _id: fakeId,
        save: jest.fn().mockResolvedValue(true),
      };
      Task.findById.mockResolvedValue(mockTask);

      const updated = await taskService.updateTaskById(fakeId, { title: 'Título atualizado' });
      expect(updated.title).toBe('Título atualizado');
      expect(mockTask.save).toHaveBeenCalled();
    });

    it('deve lançar erro 404 se tarefa não existir', async () => {
      Task.findById.mockResolvedValue(null);
      await expect(taskService.updateTaskById(new mongoose.Types.ObjectId(), { title: 'Novo título' })).rejects.toThrow(
        new ApiError(httpStatus.NOT_FOUND, 'Tarefa não encontrada')
      );
    });
  });

  describe('deleteTaskById', () => {
    it('deve deletar a tarefa com sucesso', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const mockTask = {
        ...taskData,
        _id: fakeId,
        remove: jest.fn().mockResolvedValue(true),
      };
      Task.findById.mockResolvedValue(mockTask);

      const deleted = await taskService.deleteTaskById(fakeId);
      expect(deleted).toEqual(mockTask);
      expect(mockTask.remove).toHaveBeenCalled();
    });

    it('deve lançar erro 404 se tarefa não existir', async () => {
      Task.findById.mockResolvedValue(null);
      await expect(taskService.deleteTaskById(new mongoose.Types.ObjectId())).rejects.toThrow(
        new ApiError(httpStatus.NOT_FOUND, 'Tarefa não encontrada')
      );
    });
  });
});

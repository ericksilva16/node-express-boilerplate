const request = require('supertest');
const httpStatus = require('http-status');
const app = require('../../src/app');
const setupTestDB = require('../utils/setupTestDB');
const { Task } = require('../../src/models');
const { userOne, insertUsers } = require('../fixtures/user.fixture');
const { userOneAccessToken } = require('../fixtures/token.fixture');

setupTestDB();

describe('Task Routes', () => {
  describe('POST /v1/tasks', () => {
    let newTask;

    beforeEach(() => {
      newTask = {
        title: 'Nova tarefa de integração',
        description: 'Testando o endpoint de criação',
        status: 'pending',
      };
    });

    it('deve criar uma tarefa e retornar 201', async () => {
      await insertUsers([userOne]);

      const res = await request(app)
        .post('/v1/tasks')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newTask)
        .expect(httpStatus.CREATED);

      expect(res.body).toMatchObject({
        title: newTask.title,
        description: newTask.description,
        status: 'pending',
      });

      const dbTask = await Task.findById(res.body.id);
      expect(dbTask).toBeDefined();
    });

    it('deve retornar 401 se não autenticado', async () => {
      await request(app).post('/v1/tasks').send(newTask).expect(httpStatus.UNAUTHORIZED);
    });

    it('deve retornar 400 se title não fornecido', async () => {
      await insertUsers([userOne]);
      await request(app)
        .post('/v1/tasks')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send({ description: 'sem título' })
        .expect(httpStatus.BAD_REQUEST);
    });

    it('deve retornar 400 se title for menor que 3 caracteres', async () => {
      await insertUsers([userOne]);
      await request(app)
        .post('/v1/tasks')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send({ title: 'ab' })
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('GET /v1/tasks', () => {
    it('deve listar apenas as tarefas do usuário autenticado', async () => {
      await insertUsers([userOne]);

      const res = await request(app)
        .get('/v1/tasks')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .expect(httpStatus.OK);

      expect(res.body).toHaveProperty('results');
      expect(Array.isArray(res.body.results)).toBe(true);
    });

    it('deve retornar 401 se não autenticado', async () => {
      await request(app).get('/v1/tasks').expect(httpStatus.UNAUTHORIZED);
    });

    it('deve filtrar tarefas por status', async () => {
      await insertUsers([userOne]);

      const res = await request(app)
        .get('/v1/tasks?status=pending')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .expect(httpStatus.OK);

      expect(res.body).toHaveProperty('results');
    });
  });

  describe('GET /v1/tasks/:taskId', () => {
    it('deve retornar 401 se não autenticado', async () => {
      await request(app).get('/v1/tasks/60d0fe4f5311236168a109ca').expect(httpStatus.UNAUTHORIZED);
    });

    it('deve retornar 400 se taskId não for um ObjectId válido', async () => {
      await insertUsers([userOne]);
      await request(app)
        .get('/v1/tasks/id-invalido')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('PATCH /v1/tasks/:taskId', () => {
    it('deve retornar 401 se não autenticado', async () => {
      await request(app)
        .patch('/v1/tasks/60d0fe4f5311236168a109ca')
        .send({ status: 'done' })
        .expect(httpStatus.UNAUTHORIZED);
    });

    it('deve retornar 400 se body estiver vazio', async () => {
      await insertUsers([userOne]);
      await request(app)
        .patch('/v1/tasks/60d0fe4f5311236168a109ca')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send({})
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('DELETE /v1/tasks/:taskId', () => {
    it('deve retornar 401 se não autenticado', async () => {
      await request(app).delete('/v1/tasks/60d0fe4f5311236168a109ca').expect(httpStatus.UNAUTHORIZED);
    });
  });
});

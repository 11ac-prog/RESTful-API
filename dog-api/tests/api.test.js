/**
 * Integration tests (CRUD + 2 of your question endpoints) using in-memory MongoDB
 */
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import app from '../app.js';
import Dog from '../models/dataModel.js';

let mongod;

const seed = [
  {
    id: 1,
    name: 'Test Tall',
    breed_group: 'Working',
    life_span: { min: 10, max: 12 },
    weight: { metric: { min: 30, max: 40 } },
    height: { metric: { min: 60, max: 85 } },
    temperament: ['Loyal', 'Strong', 'Intelligent'],
    bred_for: 'Guarding, Companionship',
    origin: ['USA']
  },
  {
    id: 2,
    name: 'Test Heavy',
    breed_group: 'Herding',
    life_span: { min: 12, max: 14 },
    weight: { metric: { min: 50, max: 90 } },
    height: { metric: { min: 55, max: 60 } },
    temperament: ['Friendly', 'Confident', 'Brave', 'Calm'],
    bred_for: 'Work',
    origin: ['Germany', 'France']
  },
  {
    id: 3,
    name: 'Test LongLife',
    breed_group: 'Toy',
    life_span: { min: 15, max: 20 },
    weight: { metric: { min: 3, max: 6 } },
    height: { metric: { min: 20, max: 28 } },
    temperament: ['Playful'],
    bred_for: 'Lapdog, Companion',
    origin: []
  }
];

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
  await Dog.create(seed);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

describe('CRUD', () => {
  test('POST /api/dogs creates a dog then GET returns it', async () => {
    const resCreate = await request(app).post('/api/dogs').send({
      id: 100,
      name: 'New Pup',
      breed_group: 'Hound',
      weight: { metric: { min: 10, max: 20 } },
      height: { metric: { min: 30, max: 40 } }
    });
    expect(resCreate.status).toBe(201);
    expect(resCreate.body.name).toBe('New Pup');

    const resGet = await request(app).get('/api/dogs/100');
    expect(resGet.status).toBe(200);
    expect(resGet.body.name).toBe('New Pup');
  });
});

describe('Questions', () => {
  test('GET /api/questions/longest-average-lifespan identifies Test LongLife', async () => {
    const res = await request(app).get('/api/questions/longest-average-lifespan');
    expect(res.status).toBe(200);
    const names = res.body.answer.map(a => a.name);
    expect(names).toContain('Test LongLife');
  });

  test('GET /api/questions/average-weight returns a numeric answer', async () => {
    const res = await request(app).get('/api/questions/average-weight');
    expect(res.status).toBe(200);
    expect(typeof res.body.answer.kilograms).toBe('number');
    expect(typeof res.body.answer.pounds).toBe('number');
  });
});

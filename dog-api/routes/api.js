import { Router } from 'express';
import {
  createDog, getDogs, getDog, updateDog, deleteDog,
  qAverageWeightAll,
  qLongestAverageLifespan,
  qTallestBreed,
  qHeaviestGroupByAvg,
  qMedianWeightSmallBreeds,
  qWidestWeightRange,
  qCountIntelligentTemperament,
  qLapdogBreeds
} from '../controllers/dataController.js';

const router = Router();

// CRUD
router.post('/dogs', createDog);
router.get('/dogs', getDogs);
router.get('/dogs/:id', getDog);
router.patch('/dogs/:id', updateDog);
router.delete('/dogs/:id', deleteDog);

// 8 custom question endpoints
router.get('/questions/average-weight', qAverageWeightAll);
router.get('/questions/longest-average-lifespan', qLongestAverageLifespan);
router.get('/questions/tallest-breed', qTallestBreed);
router.get('/questions/heaviest-group-by-average', qHeaviestGroupByAvg);
router.get('/questions/median-weight-small-breeds', qMedianWeightSmallBreeds);
router.get('/questions/widest-weight-range', qWidestWeightRange);
router.get('/questions/count-intelligent-temperament', qCountIntelligentTemperament);
router.get('/questions/lapdog-breeds', qLapdogBreeds);

export default router;

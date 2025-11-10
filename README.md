# Dogs API

This project is a backend API that serves a **dog breeds** dataset with full **CRUD** operations plus **8 question endpoints** that compute insights (average weight, tallest breed, lapdog list, etc.). It uses **Node.js**, **Express**, **MongoDB (Atlas or local)**, and **Mongoose**, with optional **Jest** for tests and a ready-to-import **Postman** collection for manual checks.

## Link to the GitHub repository

**Repository:** [https://github.com/](https://github.com/)11ac-prog/RESTful-API

---

## Setup instructions

### Prerequisites

* Node.js 18+ and npm
* A MongoDB instance (Atlas SRV URI or local MongoDB)
* (Optional) Postman for manual testing

### 1) Clone & install

```bash
git clone https://github.com/11ac-prog/RESTful-API.git
cd dogs-api
npm install
```

### 2) Environment variables

Create a `.env` in the project root:

```
PORT=3000
```

### 3) Seed the database

Place your dataset at `./data/dogdata.json` (array of dog objects matching the schema), then:

```bash
npm run seed
```

This connects to `MONGODB_URI` and loads the data into the `dogs` collection.

### 4) Run the API

```bash
npm run dev     # with nodemon
# or
npm start       # plain node
```

Server defaults to: `http://localhost:3000`

### 5) Run tests (optional)

```bash
npm test
# for coverage:
npm test -- --coverage
```

Tests run against an in-memory MongoDB; your real DB is untouched.

### 6) (Optional) Postman

If you include the Postman files in `/postman`:

* Import **dogs-api.postman_collection.json** and **dogs-api.postman_environment.json**
* Select the environment (sets `baseUrl = http://localhost:3000/api`)
* Send requests from the **CRUD** and **Questions** folders

---

## Explanation of each endpoint

**Base URL:** `http://localhost:3000/api`

### CRUD – Dogs

* **POST `/dogs`** – Create a new dog

  * Body (example):

    ```json
    {
      "id": 999,
      "name": "Postman Pup",
      "breed_group": "Toy",
      "bred_for": "Lapdog, Companion",
      "life_span": { "min": 14, "max": 20 },
      "weight": { "metric": { "min": 2, "max": 4 } },
      "height": { "metric": { "min": 20, "max": 25 } },
      "temperament": ["Affectionate", "Friendly", "Intelligent"],
      "origin": ["UK"]
    }
    ```
  * Returns the created document (**201**).

* **GET `/dogs`** – List all dogs

  * Returns an array of dogs (**200**).

* **GET `/dogs/:id`** – Get a single dog

  * `:id` can be the dataset **numeric `id`** or the Mongo **`_id`**.
  * Returns one document (**200**) or **404** if not found.

* **PATCH `/dogs/:id`** – Update a dog (partial)

  * Body (example):

    ```json
    { "weight": { "metric": { "min": 3, "max": 5 } } }
    ```
  * Returns the updated document (**200**) or **404**.

* **DELETE `/dogs/:id`** – Delete a dog

  * Returns `{ deleted: true }` (**200**) or **404**.

---

### Analytics – 8 Question Endpoints

1. **Average weight across all breeds**
   `GET /questions/average-weight`

   * Computes per-breed average (using kg when available, falls back to lbs → kg).
   * Returns:

     ```json
     {
       "question": "...",
       "answer": { "kilograms": 12.34, "pounds": 27.2 },
       "countBreedsUsed": 123
     }
     ```

2. **Which breed has the longest average lifespan?**
   `GET /questions/longest-average-lifespan`

   * Average of `life_span.min` and `life_span.max`.
   * Returns possibly multiple winners:

     ```json
     {
       "question": "...",
       "answer": [{ "name": "Breed A", "avgYears": 16.5 }],
       "best": 16.5
     }
     ```

3. **Which breed is the tallest?**
   `GET /questions/tallest-breed`

   * Uses `height.metric.max` (cm) or converts imperial inches to cm.
   * Returns:

     ```json
     {
       "question": "...",
       "answer": [{ "name": "Breed B", "maxHeightCm": 86 }],
       "best": 86
     }
     ```

4. **Which breed group has the heaviest average weight?**
   `GET /questions/heaviest-group-by-average`

   * Per-breed average kg, then averaged by `breed_group`.
   * Returns winners and all groups sorted:

     ```json
     {
       "question": "...",
       "answer": [{ "group": "Working", "averageKg": 35.1, "averageLb": 77.38, "count": 12 }],
       "allGroups": [ ... ]
     }
     ```

5. **Median weight of small breeds (< 20 lbs)**
   `GET /questions/median-weight-small-breeds`

   * Filters breeds by **average lbs < 20**, then returns median (lbs).
   * Returns:

     ```json
     {
       "question": "...",
       "answer": 12.75,
       "countBreedsUsed": 42,
       "unit": "lbs",
       "note": "Per-breed average lbs used to determine set and median."
     }
     ```

6. **Which breed has the widest weight range between min and max?**
   `GET /questions/widest-weight-range`

   * Range = `max - min` (kg preferred; converts from lbs if needed).
   * Returns winners:

     ```json
     {
       "question": "...",
       "answer": [{ "name": "Breed C", "rangeKg": 22.5, "rangeLb": 49.6 }],
       "bestKg": 22.5
     }
     ```

7. **How many breeds list "intelligent" in temperament?**
   `GET /questions/count-intelligent-temperament`

   * Case-insensitive search in temperament array or CSV.
   * Returns:

     ```json
     {
       "question": "...",
       "answer": 19,
       "breeds": ["Breed X", "Breed Y", "..."]
     }
     ```

8. **Which breeds were bred for lapdog purposes?**
   `GET /questions/lapdog-breeds`

   * Matches “lap”, “lapdog”, or “companion” in `bred_for`.
   * Returns:

     ```json
     {
       "question": "...",
       "answer": [{ "name": "Breed Z", "bred_for": "Lapdog, Companion" }]
     }
     ```



import mongoose from 'mongoose';

const RangeSchema = new mongoose.Schema(
  { min: { type: Number }, max: { type: Number } },
  { _id: false }
);

const UnitRangeSchema = new mongoose.Schema(
  { imperial: RangeSchema, metric: RangeSchema },
  { _id: false }
);

const DogSchema = new mongoose.Schema(
  {
    // source field "id" (numeric, unique within dataset)
    id: { type: Number, index: true, unique: true, sparse: true },

    name: { type: String, required: true, index: true },
    breed_group: { type: String, default: null, index: true },
    bred_for: { type: String, default: null },

    life_span: RangeSchema,     // {min, max} (years)
    weight: UnitRangeSchema,    // {imperial:{min,max}, metric:{min,max}}
    height: UnitRangeSchema,    // {imperial:{min,max}, metric:{min,max}}

    temperament: [{ type: String }],
    origin: [{ type: String }],
    reference_image_id: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model('Dog', DogSchema);

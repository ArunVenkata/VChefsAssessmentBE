import mongoose from 'mongoose';

const ingredientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    quantity: { type: Number, default: null },
    unit: { type: String, default: null },
    isSpice: { type: Boolean, default: false }
}, { _id: false });

const recipeSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    servings: { type: Number, default: 8 }, // as per assignment
    ingredients: { type: [ingredientSchema], required: true },
    addedByLLM: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    created_at: { type: Date },
    updated_at: { type: Date }
});

recipeSchema.pre('save', function (next) {
    const now = new Date(); 
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now;
    }
    next();
});

recipeSchema.pre('findOneAndUpdate', function (next) {
    this.set({ updated_at: new Date() });
    next();
});


recipeSchema.index({ createdBy: 1 });

export default mongoose.model('Recipe', recipeSchema, "recipes");

import Recipe from "./models.js";

import { validateRecipeNameAndGenerate } from './generateRecipeUtil.js'

export class RecipeView {
    static permissions = ["IS_AUTHENTICATED"]
    async GET(req, res) {
        const { name, ingredient, minServings, maxServings, limit } = req.query;
        const query = {};

        if (name) {
            query.name = { $regex: name, $options: "i" };
        }

        if (ingredient) {
            query["ingredients.name"] = { $regex: ingredient, $options: "i" };
        }
        if (minServings || maxServings) {
            query.servings = {};
            if (minServings) {
                query.servings.$gte = parseInt(minServings, 10);
            }
            if (maxServings) {
                query.servings.$lte = parseInt(maxServings, 10);
            }
        }

        try {
            let recipeQuery = Recipe.find(query);
            if (limit) {
                recipeQuery = recipeQuery.limit(parseInt(limit, 10));
            }
            const recipes = await recipeQuery;
            return res.Response({ success: true, recipes });
        } catch (err) {
            console.error("Error searching recipes", err);
            return res.Response({ success: false, message: "Error searching recipes" }, 500);
        }
    }

    async POST(req, res) {
        const { name, ingredients, servings } = req.body;
        
        if (!name) {
            return res.Response({ success: false, message: "Recipe name is required." }, 400);
        }
        if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
            return res.Response({ success: false, message: "A non-empty ingredients list is required." }, 400);
        }

        for (const ingredient of ingredients) {
            if (!ingredient.name) {
                return res.Response({ success: false, message: "Each ingredient must have a name." }, 400);
            }
        }
        
        const recipeServings = servings ? parseInt(servings, 10) : 8;
        
        try {
            const existingRecipe = await Recipe.findOne({ name: { $regex: `^${name}$`, $options: "i" } });
            if (existingRecipe) {
                return res.Response({ success: false, message: "Recipe already exists." }, 409);
            }
            const createdBy = req.auth_user ? req.auth_user._id : null;

            const newRecipe = new Recipe({
                name,
                ingredients,
                createdBy,
                servings: recipeServings,
                addedByLLM: true
            });
            await newRecipe.save();
            return res.Response({ success: true, recipe: newRecipe });
        } catch (err) {
            console.error("Error saving new recipe:", err);
            return res.Response({ success: false, message: "Error saving new recipe" }, 500);
        }
    }
}




export class AIRecipeView{
    static permissions = ["IS_AUTHENTICATED"]

    async POST(req, res){
        const { recipeName } = req.body;
        if (!recipeName || typeof recipeName !== 'string' || recipeName.trim() === "") {
            return res.Response({ success: false, message: "A valid recipe name is required." }, 400);
        }
        const existingRecipe = await Recipe.findOne({ name: { $regex: `^${recipeName}$`, $options: "i" } });
        if (existingRecipe) {
            return res.Response({ success: false, message: "Recipe already exists." }, 409);
        }
        const aiResponse = await validateRecipeNameAndGenerate(recipeName)
        if (!aiResponse.success){
            return res.Response({success: false, message: aiResponse.message}, 200);
        }
        return res.Response({success: true, data: aiResponse.data, }, 200)
    }

}
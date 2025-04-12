import OpenAI from "openai";

const openai = new OpenAI();


export async function validateRecipeNameAndGenerate(recipeName) {
    if (!recipeName || recipeName.trim().length === 0) {
        throw new Error("Invalid recipe name.");
    }
    const prompt = `Validate the recipe name "${recipeName}" and generate a list of ingredients with suggested amounts for 8 servings.
For spices like turmeric, an exact quantity is not necessary.
if the recipe name is not valid, return a JSON with the following format:
{"success": false, "message": "<reason>"}

Otherwise, return a JSON with the following format:
{
  "name": "<recipe name>",
  "ingredients": [
      { "name": "<ingredient name>", "quantity": "<suggested quantity>", "unit": "<suggested unit>" },
      ...
  ],
  "servings": 8
}`;

    try{
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                {
                    role: "user",
                    content: prompt,
                },
            ],
        });
        
        const recipe = JSON.parse(completion.choices[0].message.content)
        if (recipe && !recipe.name){
            return {success: false, data: {}, message: recipe.message}
        }

        return {success: true, data: recipe}
    }catch(e){
        console.log("Error occurred, invalid recipe or credits are over", e)
        return {success: false, data: {}}
    }
}
import { Url } from "./api_lib/index.js";
import { GoogleAuthView, SignOutView } from "./userauth/views.js";
import { RecipeView, AIRecipeView } from "./recipe/views.js";

export const urls = [
    new Url({ urlPath: "/auth/google", routeHandler: GoogleAuthView, name: "google_auth" }),
    new Url({ urlPath: "/auth/signout", routeHandler: SignOutView, name: "signout" }),
    new Url({urlPath: "/recipe", routeHandler: RecipeView, name: "recipe"}),
    new Url({urlPath: "/ai-recipe", routeHandler: AIRecipeView, name: "airecipe"})
];


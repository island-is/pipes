const PipesContextCommandSymbol = Symbol("PipesContextCommand");
export const isPipesContextCommand = (val)=>typeof val === "function" && val._isPipesCommand === true;

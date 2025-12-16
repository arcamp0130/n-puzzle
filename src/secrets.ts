import { config } from "dotenv"
config()

export const PORT               =       process.env.PORT        || 8080
export const ENVIROMENT         =       process.env.NODE_ENV    || "development"
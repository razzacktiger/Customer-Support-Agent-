import { z } from "zod";
import { Logger } from "@/utils/logger";

const logger = new Logger("Config:Env");

// Schema for environment variables
const envSchema = z.object({
  NODE_ENV: z.string(),
  NEXT_PUBLIC_APP_URL: z.string(),
  // API Keys for RAG system
  FIRECRAWL_API_KEY: z.string().min(1, "Firecrawl API key is required"),
  GOOGLE_API_KEY: z.string().min(1, "Google API key is required"),
  OPENAI_API_KEY: z.string().min(1, "OpenAI API key is required"),
  PINECONE_API_KEY: z.string().min(1, "Pinecone API key is required"),
  PINECONE_INDEX_NAME: z.string().default("aven-support-index"),
  EXA_API_KEY: z.string().min(1, "Exa API key is required"),
  // VAPI (optional for voice)
  VAPI_API_KEY: z.string().optional(),
  VAPI_ASSISTANT_ID: z.string().optional(),
});

// Function to validate environment variables
const validateEnv = () => {
  try {
    logger.info("Validating environment variables");
    const env = {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      // API Keys
      FIRECRAWL_API_KEY: process.env.FIRECRAWL_API_KEY,
      GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      PINECONE_API_KEY: process.env.PINECONE_API_KEY,
      PINECONE_INDEX_NAME: process.env.PINECONE_INDEX_NAME,
      EXA_API_KEY: process.env.EXA_API_KEY,
      // VAPI
      VAPI_API_KEY: process.env.VAPI_API_KEY,
      VAPI_ASSISTANT_ID: process.env.VAPI_ASSISTANT_ID,
    };
    const parsed = envSchema.parse(env);
    logger.info("Environment variables validated successfully");
    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => err.path.join("."));
      logger.error("Invalid environment variables", { error: { missingVars } });
      throw new Error(
        `❌ Invalid environment variables: ${missingVars.join(
          ", "
        )}. Please check your .env file`
      );
    }
    throw error;
  }
};

export const env = validateEnv();

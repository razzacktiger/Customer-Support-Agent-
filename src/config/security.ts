// Security configuration and validation utilities

export const validateEnvironment = () => {
  const requiredServerVars = ["OPENAI_API_KEY"];

  const requiredClientVars = ["VAPI_API_KEY", "VAPI_ASSISTANT_ID"];

  const missing: string[] = [];

  // Check server-side variables
  requiredServerVars.forEach(varName => {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  });

  // Check client-side variables
  requiredClientVars.forEach(varName => {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  });

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }
};

export const getClientSafeConfig = () => {
  return {
    vapiApiKey: process.env.VAPI_API_KEY,
    vapiAssistantId: process.env.VAPI_ASSISTANT_ID,
  };
};

export const getServerConfig = () => {
  return {
    openaiApiKey: process.env.OPENAI_API_KEY,
    pineconeApiKey: process.env.PINECONE_API_KEY,
    exaApiKey: process.env.EXA_API_KEY,
  };
};

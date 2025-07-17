import { GoogleGenAI } from "@google/genai";
import { env } from "@/config/env";

export class GeminiEmbeddings {
  private client: GoogleGenAI;

  constructor() {
    this.client = new GoogleGenAI({
      apiKey: env.GOOGLE_API_KEY,
    });
  }

  /**
   * Generate embeddings for a single text query (optimized for search queries)
   */
  async embedQuery(text: string): Promise<number[]> {
    const response = await this.client.models.embedContent({
      model: "gemini-embedding-001",
      contents: text,
      config: {
        taskType: "RETRIEVAL_QUERY",
        outputDimensionality: 1536, // Try to match existing Pinecone index
      },
    });

    const embedding = response.embeddings?.[0]?.values;
    if (!embedding) {
      throw new Error("Failed to generate embedding for query");
    }

    // Normalize the embedding for better semantic similarity
    return this.normalizeEmbedding(embedding);
  }

  /**
   * Generate embeddings for documents (optimized for document indexing)
   */
  async embedDocuments(texts: string[]): Promise<number[][]> {
    const response = await this.client.models.embedContent({
      model: "gemini-embedding-001",
      contents: texts,
      config: {
        taskType: "RETRIEVAL_DOCUMENT",
        outputDimensionality: 1536, // Try to match existing Pinecone index
      },
    });

    const embeddings = response.embeddings;
    if (!embeddings || embeddings.length === 0) {
      throw new Error("Failed to generate embeddings for documents");
    }

    // Normalize all embeddings
    return embeddings.map(embedding => {
      if (!embedding.values) {
        throw new Error("Invalid embedding response");
      }
      return this.normalizeEmbedding(embedding.values);
    });
  }

  /**
   * Normalize embedding vector for accurate semantic similarity
   * Required for dimensions other than 3072 according to docs
   */
  private normalizeEmbedding(embedding: number[]): number[] {
    const magnitude = Math.sqrt(
      embedding.reduce((sum, val) => sum + val * val, 0)
    );

    if (magnitude === 0) {
      return embedding;
    }

    return embedding.map(val => val / magnitude);
  }

  /**
   * Get the embedding dimension (1536 to match existing Pinecone index)
   */
  getEmbeddingDimension(): number {
    return 1536;
  }
}

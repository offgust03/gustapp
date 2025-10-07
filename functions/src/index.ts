import {onCall} from "firebase-functions/v2/https";
import {setGlobalOptions} from "firebase-functions";
import {VertexAI} from "@google-cloud/vertexai";

setGlobalOptions({maxInstances: 10});

const PROJECT_ID = "gustavoapp-b9b70";
const LOCATION = "us-central1";

const vertex_ai = new VertexAI({project: PROJECT_ID, location: LOCATION});
const model = vertex_ai.getGenerativeModel({
  model: "gemini-1.5-flash-001",
});

exports.generateContent = onCall(async (request) => {
  const {prompt} = request.data;

  const req = {
    contents: [{role: "user", parts: [{text: prompt}]}],
  };

  try {
    const result = await model.generateContent(req);
    const response = result.response;

    if (response && response.candidates && response.candidates.length > 0 && response.candidates[0].content.parts.length > 0) {
      const text = response.candidates[0].content.parts[0].text;
      return {text: text ? text.trim() : ""};
    } else {
      console.error("Unexpected API response:", JSON.stringify(response, null, 2));
      return {error: "The API response was empty or in an unexpected format."};
    }
  } catch (error) {
    console.error("Error calling Vertex AI API:", error);
    return {error: "Failed to communicate with the AI service."};
  }
});
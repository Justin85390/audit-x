# API Documentation References

## SpeechAce API
- Documentation URL: https://api.speechace.co/docs
- Base URL: https://api.speechace.co/api/scoring/speech/v0.5/json
- Required Headers: 
  - Authorization: Bearer {API_KEY}
  - Content-Type: multipart/form-data

### Response Structurejson
json
{
"speech_score": {
"speechace_score": {
"pronunciation": number, // 0-100
"fluency": number, // 0-100
"grammar": number, // 0-100
"coherence": number, // 0-100
"vocab": number, // 0-100
"overall": number // 0-100
}
}
}
### TypeScript Types
typescript
export interface SpeechaceScore {
pronunciation: number;
fluency: number;
grammar: number;
coherence: number;
vocab: number;
overall: number;
}
export interface SpeechaceResponse {
speech_score: {
speechace_score: SpeechaceScore;
}
}

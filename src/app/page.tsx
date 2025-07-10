import VapiWidget from "../components/VapiWidget";

export default function Home() {
  return (
    <>
      <h1>Hello World</h1>
      <VapiWidget
        apiKey={process.env.NEXT_PUBLIC_VAPI_API_KEY!}
        assistantId={process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID!}
      />
    </>
  );
}

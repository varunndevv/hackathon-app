import { NextResponse } from "next/server";
import { TriageSchema } from "@/lib/schemas";
import { streamObject } from "ai";
import { google } from "@ai-sdk/google";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const image = formData.get("image") as File;

        if (!image) {
            return NextResponse.json({ error: "No image provided" }, { status: 400 });
        }

        const buffer = await image.arrayBuffer();

        const result = await streamObject({
            model: google("gemini-1.5-pro"),
            schema: TriageSchema,
            system: "You are an expert civic infrastructure inspector for Bengaluru city. Analyze the provided image of a civic issue and categorize it accurately. Always provide a realistic ward context assuming the user is in Bengaluru (e.g., Ward 150 Bellandur, Ward 112 Domlur) and assess its priority. Your reasoning must be precise and actionable by city authorities. If it is a common issue, set isDuplicate to true and give a random upvoteCount between 5 and 50. IMPORTANT: Always generate a random 8-character uppercase string for reportId like 'REP-8D92F3'.",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: "Please analyze this civic issue image and generate a triage report ticket." },
                        {
                            type: "image",
                            image: buffer
                        }
                    ],
                },
            ],
        });

        return result.toTextStreamResponse();

    } catch (e: any) {
        console.error("Triage Error:", e);
        try {
            require('fs').writeFileSync('triage_error_log.json', JSON.stringify(e, Object.getOwnPropertyNames(e), 2));
        } catch (fsErr) { }
        return NextResponse.json({ error: "Failed to process image", details: String(e) }, { status: 500 });
    }
}

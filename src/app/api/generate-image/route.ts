import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import crypto from "crypto"
import { neon } from "@neondatabase/serverless";


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text } = body;
    console.log(text)
    const sql = neon(process.env.DATABASE_URL!);

    const apiSecret = request.headers.get("X-API-SECRET");
    if(apiSecret !== process.env.API_KEY){
      console.log("unauthorized")
      return NextResponse.json({error: "Unauthorized"}, {status: 401})
    }

    const url = new URL("https://alexandra-zavala--ainstagram-model-generate.modal.run/")
    
    url.searchParams.set("prompt", text)
    console.log("Requesting URL", url.toString())

    const response = await fetch(url.toString(), {
      method: "GET",
      headers:{
        "X-API-Key": process.env.API_KEY || "",
        Accept: "image/jpeg",
      }
    })

    if(!response.ok){
      const errorText = await response.text();
      console.error("API Response:", errorText);
      throw new Error(
        `HTTP error status: ${response.status}, message: ${errorText}`
      );
    }

    const imageBuffer = await response.arrayBuffer();

    const filename = `${crypto.randomUUID()}.jpg`

    const blob = await put(filename, imageBuffer,
      {access: "public",
      contentType: "image/jpeg"
    })


    const data = await sql`
    INSERT INTO images (name, value) 
    VALUES (${blob.url}, ${text})
    RETURNING id;
    `;
    const insertedId = data[0].id;

    

    return NextResponse.json({
      success: true,
      imageUrl: blob.url,
      id: insertedId,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to process request" },
      { status: 500 }
    );
  }
}

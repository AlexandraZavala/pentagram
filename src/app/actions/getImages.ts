"use server";

import { neon } from "@neondatabase/serverless";

export async function getImages() {

    try{
        const sql = neon(process.env.DATABASE_URL!);
        const data = await sql`SELECT * FROM images;`;
        //console.log(data)
        return data;
    }catch(error){
        console.error("Server Error: ", error);
    }
    
}
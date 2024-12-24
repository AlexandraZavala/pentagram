"use server";
import ImageGenerated from "./components/ImageGenerated";
import { generateImage } from "./actions/generateImage";
import { getImages } from "./actions/getImages";

export default async function Home() {
  return<ImageGenerated generateImage={generateImage} getImages={getImages}/>
}

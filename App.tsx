import React, { useState, ChangeEvent } from 'react';
import { GoogleGenAI } from "@google/genai";
import Header from './components/Header';
import SparklesIcon from './components/icons/SparklesIcon';
import UploadIcon from './components/icons/UploadIcon';
import ImageDisplay from './components/ImageDisplay';
import Loader from './components/Loader';

const App: React.FC = () => {
  const [clothingType, setClothingType] = useState('casual');
  const [clothingColor, setClothingColor] = useState('white');
  const [pose, setPose] = useState('standing together');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [locationName, setLocationName] = useState('');
  const [locationReferenceFile, setLocationReferenceFile] = useState<File | null>(null);
  const [peopleFiles, setPeopleFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, setter: (files: File[]) => void) => {
    if (e.target.files) {
      setter(Array.from(e.target.files));
    }
  };

  const handleSingleFileChange = (e: ChangeEvent<HTMLInputElement>, setter: (file: File | null) => void) => {
    if (e.target.files && e.target.files[0]) {
      setter(e.target.files[0]);
    }
  };

  const fileToPart = async (file: File) => {
    return new Promise<{ inlineData: { data: string; mimeType: string } }>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const base64String = result.split(',')[1];
        resolve({
          inlineData: {
            data: base64String,
            mimeType: file.type,
          },
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const generateImage = async () => {
    if (peopleFiles.length === 0) {
      setError("Please upload at least one person image.");
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratedImages([]);

    try {
      let clothingPrompt = "";
      if (clothingType === 'sport') clothingPrompt = "sports/jogging/running attire";
      else if (clothingType === 'casual') clothingPrompt = "casual everyday clothes";
      else if (clothingType === 'formal') clothingPrompt = "formal business or evening wear";

      let locationPromptPart = locationName ? `Location: ${locationName}.` : "Location: A scenic beautiful place.";
      if (locationReferenceFile) {
        locationPromptPart += " Use the provided location image as the primary reference for the background environment and lighting.";
      }

      const promptText = `Generate a realistic group selfie photo consisting ONLY of the persons from the uploaded images. Do not add any other people to the scene. The subjects are taking a selfie together. Framing: ${pose}. ${locationPromptPart} The people should be wearing ${clothingColor} ${clothingPrompt}. Ensure they are looking at the camera and interacting naturally. Maintain the exact facial features and identities of the uploaded subjects. Aspect Ratio: ${aspectRatio}.`;

      const parts: any[] = [{ text: promptText }];

      if (locationReferenceFile) {
        parts.push(await fileToPart(locationReferenceFile));
      }

      for (const file of peopleFiles) {
        parts.push(await fileToPart(file));
      }

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: { parts },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio as any,
          },
        }
      });

      const images: string[] = [];
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            images.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
          }
        }
      }
      
      if (images.length === 0) {
           if (response.text) {
             console.log("Model response text:", response.text);
           }
           throw new Error("No image generated.");
      }

      setGeneratedImages(images);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          <div className="bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-700">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Inputs */}
                <div className="space-y-4">
                    <label className="block">
                        <span className="text-gray-300">Clothing Type</span>
                        <select 
                            id="places-clothing-type"
                            value={clothingType} 
                            onChange={(e) => setClothingType(e.target.value)}
                            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 px-3 py-2"
                        >
                            <option value="casual">Casual</option>
                            <option value="sport">Sport</option>
                            <option value="formal">Formal</option>
                        </select>
                    </label>

                     <label className="block">
                        <span className="text-gray-300">Clothing Color</span>
                        <input 
                            type="text" 
                            id="places-clothing-color"
                            value={clothingColor} 
                            onChange={(e) => setClothingColor(e.target.value)}
                            placeholder="e.g. Blue, Red, White"
                            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 px-3 py-2"
                        />
                    </label>

                    <label className="block">
                        <span className="text-gray-300">Pose / Framing</span>
                        <input 
                            type="text" 
                            id="places-pose"
                            value={pose} 
                            onChange={(e) => setPose(e.target.value)}
                            placeholder="e.g. Standing, Sitting"
                            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 px-3 py-2"
                        />
                    </label>

                    <label className="block">
                        <span className="text-gray-300">Aspect Ratio</span>
                        <select 
                            id="places-aspect-ratio"
                            value={aspectRatio} 
                            onChange={(e) => setAspectRatio(e.target.value)}
                            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 px-3 py-2"
                        >
                            <option value="1:1">1:1 (Square)</option>
                            <option value="3:4">3:4 (Portrait)</option>
                            <option value="4:3">4:3 (Landscape)</option>
                            <option value="9:16">9:16 (Tall)</option>
                            <option value="16:9">16:9 (Wide)</option>
                        </select>
                    </label>
                    
                     <label className="block">
                        <span className="text-gray-300">Location Name (Optional)</span>
                        <input 
                            type="text" 
                            value={locationName} 
                            onChange={(e) => setLocationName(e.target.value)}
                            placeholder="e.g. Paris, Beach"
                            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 px-3 py-2"
                        />
                    </label>
                </div>

                {/* Uploads */}
                <div className="space-y-4">
                     <label className="block">
                        <span className="text-gray-300">Location Reference (Optional)</span>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md hover:border-blue-500 transition-colors">
                             <div className="space-y-1 text-center">
                                <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <div className="flex text-sm text-gray-400 justify-center">
                                    <label htmlFor="location-upload" className="relative cursor-pointer bg-gray-800 rounded-md font-medium text-blue-500 hover:text-blue-400 focus-within:outline-none">
                                        <span>Upload a file</span>
                                        <input id="location-upload" name="location-upload" type="file" className="sr-only" onChange={(e) => handleSingleFileChange(e, setLocationReferenceFile)} accept="image/*" />
                                    </label>
                                </div>
                                <p className="text-xs text-gray-500">{locationReferenceFile ? locationReferenceFile.name : "PNG, JPG up to 10MB"}</p>
                             </div>
                        </div>
                    </label>

                    <label className="block">
                        <span className="text-gray-300">People Images (Required)</span>
                         <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md hover:border-blue-500 transition-colors">
                             <div className="space-y-1 text-center">
                                <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <div className="flex text-sm text-gray-400 justify-center">
                                    <label htmlFor="people-upload" className="relative cursor-pointer bg-gray-800 rounded-md font-medium text-blue-500 hover:text-blue-400 focus-within:outline-none">
                                        <span>Upload files</span>
                                        <input id="people-upload" name="people-upload" type="file" multiple className="sr-only" onChange={(e) => handleFileChange(e, setPeopleFiles)} accept="image/*" />
                                    </label>
                                </div>
                                <p className="text-xs text-gray-500">{peopleFiles.length > 0 ? `${peopleFiles.length} files selected` : "PNG, JPG up to 10MB"}</p>
                             </div>
                        </div>
                    </label>
                </div>
             </div>

             <div className="mt-8 flex justify-center">
                <button
                    onClick={generateImage}
                    disabled={loading || peopleFiles.length === 0}
                    className={`flex items-center space-x-2 px-8 py-3 rounded-full text-lg font-semibold transition-all transform hover:scale-105 ${
                        loading || peopleFiles.length === 0 
                        ? 'bg-gray-600 cursor-not-allowed opacity-50' 
                        : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg'
                    }`}
                >
                    <SparklesIcon className="w-6 h-6" />
                    <span>{loading ? 'Generating...' : 'Generate Selfie'}</span>
                </button>
             </div>
          </div>

          {/* Output */}
          <div id="outputContainer" className="bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-700 min-h-[300px] flex items-center justify-center relative flex-col">
               {loading && <Loader />}
               
               {error && (
                   <div id="errorMessage" className="text-red-400 bg-red-900/20 px-4 py-2 rounded-lg mb-4">
                       Error: {error}
                   </div>
               )}

               {!loading && !error && generatedImages.length === 0 && (
                   <div id="placeholderText" className="text-gray-500 text-center">
                       Upload images and set options to generate a group selfie.
                   </div>
               )}

               {generatedImages.length > 0 && (
                   <div className="grid grid-cols-1 gap-4 w-full">
                       {generatedImages.map((img, idx) => (
                           <ImageDisplay key={idx} src={img} alt={`Generated Selfie ${idx + 1}`} />
                       ))}
                   </div>
               )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;

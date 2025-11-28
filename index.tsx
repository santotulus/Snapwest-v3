import { GoogleGenAI } from "@google/genai";

// --- API Key ---
const API_KEY = process.env.API_KEY;

// --- Helper Functions ---

// Convert file to Base64
const fileToPart = async (file: File) => {
    return new Promise<{ inlineData: { data: string; mimeType: string } }>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            // Extract base64 part
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

// --- DOM Elements & State ---
// Navigation Buttons
const navModelBtn = document.getElementById('nav-model');
const navLightroomBtn = document.getElementById('nav-lightroom');
const navPasPhotoBtn = document.getElementById('nav-pasphoto');
const navTravelBtn = document.getElementById('nav-travel');
const navPreweddingBtn = document.getElementById('nav-prewedding');
const navRestorationBtn = document.getElementById('nav-restoration');
const navPlacesBtn = document.getElementById('nav-places');

// Pages
const modelPage = document.getElementById('model-generator-page');
const lightroomPage = document.getElementById('lightroom-generator-page');
const pasPhotoPage = document.getElementById('pasphoto-generator-page');
const travelPage = document.getElementById('travel-generator-page');
const preweddingPage = document.getElementById('prewedding-generator-page');
const restorationPage = document.getElementById('restoration-generator-page');
const placesPage = document.getElementById('places-generator-page');

// --- Navigation Logic ---
function showPage(pageId: string) {
    const pages = [modelPage, lightroomPage, pasPhotoPage, travelPage, preweddingPage, restorationPage, placesPage];
    const navs = [navModelBtn, navLightroomBtn, navPasPhotoBtn, navTravelBtn, navPreweddingBtn, navRestorationBtn, navPlacesBtn];

    pages.forEach(page => {
        if (page) page.classList.add('hidden');
    });
    
    // Reset nav styles
    navs.forEach(nav => {
        if (nav) {
            nav.classList.remove('bg-indigo-600', 'text-white');
            nav.classList.add('text-slate-300', 'hover:bg-slate-800');
        }
    });

    // Show active page
    if (pageId === 'model') {
        modelPage?.classList.remove('hidden');
        navModelBtn?.classList.remove('text-slate-300', 'hover:bg-slate-800');
        navModelBtn?.classList.add('bg-indigo-600', 'text-white');
    } else if (pageId === 'lightroom') {
        lightroomPage?.classList.remove('hidden');
        navLightroomBtn?.classList.remove('text-slate-300', 'hover:bg-slate-800');
        navLightroomBtn?.classList.add('bg-indigo-600', 'text-white');
    } else if (pageId === 'pasphoto') {
        pasPhotoPage?.classList.remove('hidden');
        navPasPhotoBtn?.classList.remove('text-slate-300', 'hover:bg-slate-800');
        navPasPhotoBtn?.classList.add('bg-indigo-600', 'text-white');
    } else if (pageId === 'travel') {
        travelPage?.classList.remove('hidden');
        navTravelBtn?.classList.remove('text-slate-300', 'hover:bg-slate-800');
        navTravelBtn?.classList.add('bg-indigo-600', 'text-white');
    } else if (pageId === 'prewedding') {
        preweddingPage?.classList.remove('hidden');
        navPreweddingBtn?.classList.remove('text-slate-300', 'hover:bg-slate-800');
        navPreweddingBtn?.classList.add('bg-indigo-600', 'text-white');
    } else if (pageId === 'restoration') {
        restorationPage?.classList.remove('hidden');
        navRestorationBtn?.classList.remove('text-slate-300', 'hover:bg-slate-800');
        navRestorationBtn?.classList.add('bg-indigo-600', 'text-white');
    } else if (pageId === 'places') {
        placesPage?.classList.remove('hidden');
        navPlacesBtn?.classList.remove('text-slate-300', 'hover:bg-slate-800');
        navPlacesBtn?.classList.add('bg-indigo-600', 'text-white');
    }
}

navModelBtn?.addEventListener('click', () => showPage('model'));
navLightroomBtn?.addEventListener('click', () => showPage('lightroom'));
navPasPhotoBtn?.addEventListener('click', () => showPage('pasphoto'));
navTravelBtn?.addEventListener('click', () => showPage('travel'));
navPreweddingBtn?.addEventListener('click', () => showPage('prewedding'));
navRestorationBtn?.addEventListener('click', () => showPage('restoration'));
navPlacesBtn?.addEventListener('click', () => showPage('places'));

// Set default page
showPage('model');


// --- UI Helpers ---

// Handle Download Single Image
const downloadSingleImage = (url: string, prefix: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `${prefix}-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};

// Generic Display Results Function
const displayResults = (
    images: string[], 
    resultContainerId: string, 
    placeholderId: string, 
    loadingId: string, 
    outputGridId: string, 
    aspectRatio: string = '1:1'
) => {
    const loadingEl = document.getElementById(loadingId);
    const placeholderEl = document.getElementById(placeholderId);
    const outputGridEl = document.getElementById(outputGridId);

    if (loadingEl) loadingEl.classList.add('hidden');
    if (placeholderEl) placeholderEl.classList.add('hidden');
    if (outputGridEl) {
        outputGridEl.classList.remove('hidden');
        outputGridEl.innerHTML = ''; // Clear previous

        // Set Grid Columns based on image count
        if (images.length === 1) outputGridEl.className = 'grid w-full gap-4 grid-cols-1';
        else if (images.length === 2) outputGridEl.className = 'grid w-full gap-4 grid-cols-2';
        else outputGridEl.className = 'grid w-full gap-4 grid-cols-2 md:grid-cols-3';

        images.forEach((imgSrc, index) => {
            const wrapper = document.createElement('div');
            wrapper.className = "relative group rounded-xl overflow-hidden shadow-lg border border-slate-200 bg-white";
            
            // Aspect Ratio classes
            let aspectClass = "aspect-square";
            if (aspectRatio === "3:4") aspectClass = "aspect-[3/4]";
            else if (aspectRatio === "9:16") aspectClass = "aspect-[9/16]";
            else if (aspectRatio === "16:9") aspectClass = "aspect-[16/9]";
            wrapper.classList.add(aspectClass);

            const img = document.createElement('img');
            img.src = imgSrc;
            img.className = "w-full h-full object-cover";
            
            // Overlay with buttons
            const overlay = document.createElement('div');
            overlay.className = "absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200";

            // Preview Button
            const previewBtn = document.createElement('button');
            previewBtn.className = "bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm";
            previewBtn.innerHTML = '<i class="fas fa-eye"></i>';
            previewBtn.onclick = () => window.open(imgSrc, '_blank');

            // Download Button
            const downloadBtn = document.createElement('button');
            downloadBtn.className = "bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-full backdrop-blur-sm";
            downloadBtn.innerHTML = '<i class="fas fa-download"></i>';
            downloadBtn.onclick = () => downloadSingleImage(imgSrc, 'generated-image');

            overlay.appendChild(previewBtn);
            overlay.appendChild(downloadBtn);
            wrapper.appendChild(img);
            wrapper.appendChild(overlay);
            outputGridEl.appendChild(wrapper);
        });
    }
};

const showLoading = (loadingId: string) => {
    document.getElementById(loadingId)?.classList.remove('hidden');
};

const hideLoading = (loadingId: string) => {
    document.getElementById(loadingId)?.classList.add('hidden');
};

// --- File Input Preview Logic ---
// This function adds visual feedback when a user selects a file
const setupFilePreview = (inputId: string, iconClass: string, defaultText: string, iconColorClass: string = "text-indigo-500") => {
    const input = document.getElementById(inputId) as HTMLInputElement;
    if (!input) return;

    input.addEventListener('change', () => {
        const parent = input.parentElement;
        if (!parent) return;

        // Clear siblings except the input itself
        const children = Array.from(parent.children);
        children.forEach(child => {
            if (child !== input) child.remove();
        });

        if (input.files && input.files.length > 0) {
            // Container for previews
            const previewContainer = document.createElement('div');
            previewContainer.className = "flex flex-col items-center justify-center space-y-2 pointer-events-none w-full h-full p-2";

            if (input.files.length === 1) {
                // Single file preview
                const file = input.files[0];
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = document.createElement('img');
                    img.src = e.target?.result as string;
                    img.className = "h-24 w-auto object-contain rounded-lg shadow-sm";
                    previewContainer.appendChild(img);
                    
                    const name = document.createElement('p');
                    name.className = "text-xs text-slate-500 font-medium truncate w-full text-center";
                    name.textContent = file.name;
                    previewContainer.appendChild(name);
                };
                reader.readAsDataURL(file);
            } else {
                // Multi file preview (Grid)
                const grid = document.createElement('div');
                grid.className = "grid grid-cols-3 gap-2 w-full max-h-32 overflow-hidden";
                
                Array.from(input.files).slice(0, 5).forEach(file => { // Limit preview to 5
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const img = document.createElement('img');
                        img.src = e.target?.result as string;
                        img.className = "aspect-square w-full object-cover rounded-md border border-slate-200";
                        grid.appendChild(img);
                    };
                    reader.readAsDataURL(file);
                });
                
                previewContainer.appendChild(grid);
                
                const count = document.createElement('p');
                count.className = "text-xs text-slate-600 font-bold bg-slate-200 px-2 py-1 rounded-full mt-1";
                count.textContent = `${input.files.length} Foto Dipilih`;
                previewContainer.appendChild(count);
            }
            parent.appendChild(previewContainer);
        } else {
            // Restore default state
            const icon = document.createElement('i');
            icon.className = `${iconClass} text-3xl ${iconColorClass} mb-2`;
            
            const p = document.createElement('p');
            p.className = "text-sm text-slate-500 font-medium";
            p.textContent = defaultText;

            parent.appendChild(icon);
            parent.appendChild(p);
        }
    });
};

// Initialize Previews
setupFilePreview('model-upload', 'fas fa-cloud-upload-alt', 'Klik untuk upload foto', 'text-indigo-500');
setupFilePreview('lightroom-upload', 'fas fa-cloud-upload-alt', 'Klik untuk upload foto', 'text-pink-500');
setupFilePreview('pasphoto-upload', 'fas fa-id-badge', 'Klik untuk upload foto', 'text-blue-500');
setupFilePreview('travel-upload', 'fas fa-map-marked-alt', 'Klik untuk upload foto', 'text-green-500');
setupFilePreview('prewedding-upload', 'fas fa-heart', 'Klik untuk upload foto', 'text-rose-500');
setupFilePreview('restoration-upload', 'fas fa-history', 'Klik untuk upload foto', 'text-amber-500');
setupFilePreview('places-people-upload', 'fas fa-users', 'Klik upload foto wajah (Max 5)', 'text-teal-500');
setupFilePreview('places-location-upload', 'fas fa-map-marker-alt', 'Klik upload referensi tempat', 'text-teal-600');


// ==================== MODEL GENERATOR ====================

const modelForm = document.getElementById('model-form') as HTMLFormElement;
const modelUpload = document.getElementById('model-upload') as HTMLInputElement;

const modelClothingVariations: Record<string, string[]> = {
    casual: [
        "If female: wearing a chic oversized beige blazer over a white t-shirt and light wash jeans, modern street style. If male: wearing a stylish bomber jacket over a crisp white tee and dark chinos, urban casual look.",
        "If female: wearing a soft knitted cardigan in pastel colors paired with a denim skirt. If male: wearing a denim jacket over a grey hoodie and black jeans.",
        "If female: wearing a trendy sundress with floral patterns. If male: wearing a casual linen shirt with rolled sleeves and shorts.",
        "If female: wearing a leather jacket and black skinny jeans. If male: wearing a flannel shirt and corduroy pants.",
        "If female: wearing a modern jumpsuit in earth tones. If male: wearing a polo shirt and slim fit trousers."
    ],
    formal: [
        "wearing a sharp navy blue business suit with a white shirt",
        "wearing a professional charcoal grey blazer and trousers",
        "wearing an elegant black evening gown (female) or tuxedo (male)",
        "wearing a modern corporate outfit, white blouse/shirt and black pants"
    ],
    sport: [
        "wearing nike athletic sportswear, running gear",
        "wearing yoga outfit, leggings and sports bra (female) or gym tank (male)",
        "wearing a tracksuit set, sporty look",
        "wearing a tennis outfit, white sporty polo"
    ],
    glamour: [
        "wearing a sparking sequins dress (female) or velvet dinner jacket (male), red carpet look",
        "wearing high fashion avant-garde clothing, dramatic style",
        "wearing luxury silk dress (female) or designer suit (male), gold accessories"
    ],
    streetwear: [
        "wearing supreme style hoodie and baggy cargo pants, hypebeast style",
        "wearing oversized graphic tee and bucket hat, street fashion",
        "wearing layered urban clothing, sneakers culture style"
    ],
    traditional: [
        "wearing modern Kebaya with Batik skirt (female) or Batik shirt (male)",
        "wearing traditional Balinese ceremonial outfit",
        "wearing intricate woven Songket fabric outfit"
    ]
};

modelForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!modelUpload.files || modelUpload.files.length === 0) {
        alert("Please upload a photo first.");
        return;
    }

    const clothingCat = (document.getElementById('model-clothing') as HTMLSelectElement).value;
    const photoType = (document.getElementById('model-photo-type') as HTMLSelectElement).value;
    const aspectRatio = (document.getElementById('model-aspect-ratio') as HTMLSelectElement).value;
    const count = parseInt((document.getElementById('model-count') as HTMLSelectElement).value);

    showLoading('model-loading');

    try {
        const file = modelUpload.files[0];
        const imagePart = await fileToPart(file);
        const generatedImages: string[] = [];

        // Generate images in a loop to get variety
        for (let i = 0; i < count; i++) {
            // Pick a random specific description from the chosen category dictionary
            const variations = modelClothingVariations[clothingCat] || modelClothingVariations['casual'];
            const specificClothing = variations[Math.floor(Math.random() * variations.length)];

            const prompt = `Generate a high-quality ${photoType} of this person. 
            The person should be ${specificClothing}. 
            Maintain facial features and identity exactly. 
            Pose: Professional model pose. 
            Background: Consistent with the style. 
            Aspect Ratio: ${aspectRatio}.`;

            const ai = new GoogleGenAI({ apiKey: API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-image-preview',
                contents: {
                    parts: [imagePart, { text: prompt }]
                },
                config: {
                    imageConfig: {
                        aspectRatio: aspectRatio as any
                    }
                }
            });

             if (response.candidates?.[0]?.content?.parts) {
                for (const part of response.candidates[0].content.parts) {
                    if (part.inlineData) {
                        generatedImages.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
                    }
                }
            }
        }

        displayResults(generatedImages, 'model-result', 'model-placeholder', 'model-loading', 'model-output-grid', aspectRatio);

    } catch (error) {
        console.error(error);
        alert('Failed to generate image. Please try again.');
        hideLoading('model-loading');
    }
});


// ==================== LIGHTROOM GENERATOR ====================

const lightroomForm = document.getElementById('lightroom-form') as HTMLFormElement;
const lightroomUpload = document.getElementById('lightroom-upload') as HTMLInputElement;

lightroomForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!lightroomUpload.files || lightroomUpload.files.length === 0) {
        alert("Please upload a photo to edit.");
        return;
    }

    const preset = (document.getElementById('lightroom-preset') as HTMLSelectElement).value;
    const temp = (document.getElementById('lightroom-temp') as HTMLSelectElement).value;
    const aspectRatio = (document.getElementById('lightroom-aspect-ratio') as HTMLSelectElement).value;
    const count = parseInt((document.getElementById('lightroom-count') as HTMLSelectElement).value);

    showLoading('lightroom-loading');

    try {
        const file = lightroomUpload.files[0];
        const imagePart = await fileToPart(file);
        const generatedImages: string[] = [];

        let presetPrompt = "";
        if (preset === 'portrait') presetPrompt = "Apply a 'Portrait' preset: Smooth skin texture lightly, enhance eyes, soft lighting, flattering tones.";
        else if (preset === 'natural') presetPrompt = "Apply a 'Natural' preset: Enhance colors slightly, maintain realistic look, balanced contrast.";
        else if (preset === 'bnw') presetPrompt = "Apply a 'Black and White' preset: High contrast artistic monochrome, dramatic lighting.";

        let tempPrompt = "";
        if (temp === 'warm') tempPrompt = "Color Temperature: Warm, golden hour tones, increased saturation in oranges and yellows.";
        else if (temp === 'cold') tempPrompt = "Color Temperature: Cold, moody blue tones, desaturated warmth.";

        const prompt = `Edit this image. ${presetPrompt} ${tempPrompt} Maintain the original composition and content exactly, just change the color grading and style. High quality output.`;

        for (let i = 0; i < count; i++) {
             const ai = new GoogleGenAI({ apiKey: API_KEY });
             const response = await ai.models.generateContent({
                model: 'gemini-3-pro-image-preview',
                contents: {
                    parts: [imagePart, { text: prompt }]
                },
                 config: {
                    imageConfig: {
                        aspectRatio: aspectRatio as any
                    }
                }
            });

             if (response.candidates?.[0]?.content?.parts) {
                for (const part of response.candidates[0].content.parts) {
                    if (part.inlineData) {
                        generatedImages.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
                    }
                }
            }
        }
        
        displayResults(generatedImages, 'lightroom-result', 'lightroom-placeholder', 'lightroom-loading', 'lightroom-output-grid', aspectRatio);

    } catch (error) {
        console.error(error);
        alert('Failed to edit photo.');
        hideLoading('lightroom-loading');
    }
});


// ==================== PAS PHOTO GENERATOR ====================

const pasPhotoForm = document.getElementById('pasphoto-form') as HTMLFormElement;
const pasPhotoUpload = document.getElementById('pasphoto-upload') as HTMLInputElement;

pasPhotoForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!pasPhotoUpload.files || pasPhotoUpload.files.length === 0) {
        alert("Please upload a selfie first.");
        return;
    }

    const bgColor = (document.getElementById('pasphoto-bg') as HTMLSelectElement).value;
    const clothing = (document.getElementById('pasphoto-shirt') as HTMLSelectElement).value;
    
    showLoading('pasphoto-loading');

    try {
        const file = pasPhotoUpload.files[0];
        const imagePart = await fileToPart(file);
        
        const prompt = `Generate a formal ID photo (Pas Photo) of this person.
        Background: ${bgColor}.
        Clothing: ${clothing}.
        Pose: Facing forward, neutral expression, formal posture.
        Ensure the lighting is flat and professional for ID documents. 
        Maintain facial identity exactly. Aspect Ratio 3:4.`;

        const ai = new GoogleGenAI({ apiKey: API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-image-preview',
            contents: {
                parts: [imagePart, { text: prompt }]
            },
            config: {
                imageConfig: {
                    aspectRatio: "3:4"
                }
            }
        });

        const generatedImages: string[] = [];
        if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    generatedImages.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
                }
            }
        }
        displayResults(generatedImages, 'pasphoto-result', 'pasphoto-placeholder', 'pasphoto-loading', 'pasphoto-output-grid', '3:4');

    } catch (error) {
        console.error(error);
        alert('Failed to generate pas photo.');
        hideLoading('pasphoto-loading');
    }
});


// ==================== TRAVEL GENERATOR ====================

const travelForm = document.getElementById('travel-form') as HTMLFormElement;
const travelUpload = document.getElementById('travel-upload') as HTMLInputElement;

travelForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!travelUpload.files || travelUpload.files.length === 0) {
        alert("Please upload a photo first.");
        return;
    }

    const destination = (document.getElementById('travel-destination') as HTMLInputElement).value;
    const season = (document.getElementById('travel-season') as HTMLSelectElement).value;
    const activity = (document.getElementById('travel-activity') as HTMLSelectElement).value;
    const groupType = (document.getElementById('travel-group-type') as HTMLSelectElement).value;
    const aspectRatio = (document.getElementById('travel-aspect-ratio') as HTMLSelectElement).value;
    const count = parseInt((document.getElementById('travel-count') as HTMLSelectElement).value);

    if (!destination) {
        alert("Please enter a destination.");
        return;
    }

    showLoading('travel-loading');

    try {
        const file = travelUpload.files[0];
        const imagePart = await fileToPart(file);
        const generatedImages: string[] = [];

        let seasonPrompt = "";
        if (season === 'auto') {
             seasonPrompt = "Choose the most iconic and beautiful season/weather for this specific destination.";
        } else {
             seasonPrompt = `Season/Weather: ${season}.`;
        }

        let groupPrompt = "";
        if (groupType === 'couple') groupPrompt = "Generate the image as a romantic couple photo. The person should look like they are with a partner or posed romantically.";
        else if (groupType === 'family') groupPrompt = "Generate the image with a family vibe, warm and cheerful.";
        else if (groupType === 'friends') groupPrompt = "Generate the image as a fun trip with friends.";
        else groupPrompt = "Analyze the uploaded photo to determine if it's a solo, couple, or group shot and maintain that composition.";

        const prompt = `Generate a realistic travel photo of this person at ${destination}. 
        ${seasonPrompt}
        Activity: ${activity}.
        ${groupPrompt}
        Ensure the background features the iconic landmarks of ${destination}.
        Lighting: Photorealistic, cinematic travel photography.
        Maintain facial identity exactly.
        Aspect Ratio: ${aspectRatio}.`;

        for (let i = 0; i < count; i++) {
             const ai = new GoogleGenAI({ apiKey: API_KEY });
             const response = await ai.models.generateContent({
                model: 'gemini-3-pro-image-preview',
                contents: {
                    parts: [imagePart, { text: prompt }]
                },
                 config: {
                    imageConfig: {
                        aspectRatio: aspectRatio as any
                    }
                }
            });

             if (response.candidates?.[0]?.content?.parts) {
                for (const part of response.candidates[0].content.parts) {
                    if (part.inlineData) {
                        generatedImages.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
                    }
                }
            }
        }

        displayResults(generatedImages, 'travel-result', 'travel-placeholder', 'travel-loading', 'travel-output-grid', aspectRatio);

    } catch (error) {
        console.error(error);
        alert('Failed to generate travel photo.');
        hideLoading('travel-loading');
    }
});


// ==================== PREWEDDING GENERATOR ====================

const preweddingForm = document.getElementById('prewedding-form') as HTMLFormElement;
const preweddingUpload = document.getElementById('prewedding-upload') as HTMLInputElement;

preweddingForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!preweddingUpload.files || preweddingUpload.files.length === 0) {
        alert("Please upload a photo first.");
        return;
    }

    const theme = (document.getElementById('prewedding-theme') as HTMLSelectElement).value;
    const color = (document.getElementById('prewedding-color') as HTMLSelectElement).value;
    const aspectRatio = (document.getElementById('prewedding-aspect-ratio') as HTMLSelectElement).value;
    const count = parseInt((document.getElementById('prewedding-count') as HTMLSelectElement).value);

    showLoading('prewedding-loading');

    try {
        const file = preweddingUpload.files[0];
        const imagePart = await fileToPart(file);
        const generatedImages: string[] = [];

        const prompt = `Generate a romantic Prewedding photo of the people in this image.
        Theme: ${theme}.
        Clothing Color Palette: ${color}.
        Pose: Romantic, holding hands, or looking at each other, happy expression.
        Background: Scenery matching the ${theme} theme.
        Style: High-end wedding photography, dreamy lighting, bokeh.
        Maintain facial identity exactly.
        Aspect Ratio: ${aspectRatio}.`;

        for (let i = 0; i < count; i++) {
             const ai = new GoogleGenAI({ apiKey: API_KEY });
             const response = await ai.models.generateContent({
                model: 'gemini-3-pro-image-preview',
                contents: {
                    parts: [imagePart, { text: prompt }]
                },
                config: {
                    imageConfig: {
                        aspectRatio: aspectRatio as any
                    }
                }
            });

             if (response.candidates?.[0]?.content?.parts) {
                for (const part of response.candidates[0].content.parts) {
                    if (part.inlineData) {
                        generatedImages.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
                    }
                }
            }
        }

        displayResults(generatedImages, 'prewedding-result', 'prewedding-placeholder', 'prewedding-loading', 'prewedding-output-grid', aspectRatio);

    } catch (error) {
        console.error(error);
        alert('Failed to generate prewedding photo.');
        hideLoading('prewedding-loading');
    }
});


// ==================== RESTORATION GENERATOR ====================

const restorationForm = document.getElementById('restoration-form') as HTMLFormElement;
const restorationUpload = document.getElementById('restoration-upload') as HTMLInputElement;

restorationForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!restorationUpload.files || restorationUpload.files.length === 0) {
        alert("Please upload a photo first.");
        return;
    }

    const type = (document.getElementById('restoration-type') as HTMLSelectElement).value;
    
    showLoading('restoration-loading');

    try {
        const file = restorationUpload.files[0];
        const imagePart = await fileToPart(file);
        
        let prompt = "";
        if (type === 'restoration') {
            prompt = "Restore this old photo. Make it high definition (HD), sharpen details, remove blur, and improve quality significantly. Keep colors natural if present.";
        } else if (type === 'colorize') {
            prompt = "Colorize this black and white photo. Make the colors realistic and vibrant. Improve sharpness.";
        } else if (type === 'repair') {
            prompt = "Fix scratches, tears, and creases in this old photo. Reconstruct missing parts seamlessly. Restore to high quality.";
        }

        const ai = new GoogleGenAI({ apiKey: API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-image-preview',
            contents: {
                parts: [imagePart, { text: prompt }]
            },
            config: {
                imageConfig: {
                    aspectRatio: "1:1"
                }
            }
        });

        const generatedImages: string[] = [];
        if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    generatedImages.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
                }
            }
        }
        
        displayResults(generatedImages, 'restoration-result', 'restoration-placeholder', 'restoration-loading', 'restoration-output-grid', '1:1');

    } catch (error) {
        console.error(error);
        alert('Failed to restore photo.');
        hideLoading('restoration-loading');
    }
});

// ==================== PLACES GENERATOR (FOTO TEMPAT) ====================

const placesForm = document.getElementById('places-form') as HTMLFormElement;
const placesPeopleUpload = document.getElementById('places-people-upload') as HTMLInputElement;
const placesLocationUpload = document.getElementById('places-location-upload') as HTMLInputElement;

placesForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!placesPeopleUpload.files || placesPeopleUpload.files.length === 0) {
        alert("Please upload at least one person.");
        return;
    }

    const locationName = (document.getElementById('places-location-name') as HTMLInputElement).value;
    const clothingType = (document.getElementById('places-clothing-type') as HTMLSelectElement).value;
    const clothingColor = (document.getElementById('places-clothing-color') as HTMLSelectElement).value;
    const pose = (document.getElementById('places-pose') as HTMLSelectElement).value;
    const aspectRatio = (document.getElementById('places-aspect-ratio') as HTMLSelectElement).value;
    const count = parseInt((document.getElementById('places-count') as HTMLSelectElement).value);

    showLoading('places-loading');

    try {
        const parts: any[] = [];
        
        // Add People Images
        for (let i = 0; i < placesPeopleUpload.files.length; i++) {
             parts.push(await fileToPart(placesPeopleUpload.files[i]));
        }

        // Add Location Image if present
        if (placesLocationUpload.files && placesLocationUpload.files.length > 0) {
            parts.push(await fileToPart(placesLocationUpload.files[0]));
        }

        let clothingPrompt = "";
        if (clothingType === 'sport') clothingPrompt = "sports/jogging/running attire";
        else if (clothingType === 'casual') clothingPrompt = "casual everyday clothes";
        else if (clothingType === 'formal') clothingPrompt = "formal business or evening wear";

        let locationPromptPart = locationName ? `Location: ${locationName}.` : "Location: A scenic beautiful place.";
        if (placesLocationUpload.files && placesLocationUpload.files.length > 0) {
            locationPromptPart += " Use the provided location image as the PRIMARY reference for the background environment and lighting.";
        }

        // Selfie Logic
        let selfiePrompt = "";
        if (pose === 'half body') {
            selfiePrompt = "The subjects are taking a group SELFIE. Framing: Half Body (Upper body visible). Camera angle consistent with a handheld selfie.";
        } else {
            selfiePrompt = "The subjects are taking a group SELFIE. Framing: Full Body (Wide angle selfie or mirror selfie).";
        }

        const prompt = `Generate a realistic group photo consisting STRICTLY ONLY of the persons from the uploaded images. 
        Do NOT add any other people to the scene. 
        ${selfiePrompt}
        ${locationPromptPart} 
        The people should be wearing ${clothingColor} ${clothingPrompt}. 
        Ensure they are looking at the camera and interacting naturally. 
        Maintain the exact facial features and identities of the uploaded subjects. 
        Aspect Ratio: ${aspectRatio}.`;

        parts.push({ text: prompt });

        const generatedImages: string[] = [];

        for (let i = 0; i < count; i++) {
             const ai = new GoogleGenAI({ apiKey: API_KEY });
             const response = await ai.models.generateContent({
                model: 'gemini-3-pro-image-preview',
                contents: { parts },
                 config: {
                    imageConfig: {
                        aspectRatio: aspectRatio as any
                    }
                }
            });

             if (response.candidates?.[0]?.content?.parts) {
                for (const part of response.candidates[0].content.parts) {
                    if (part.inlineData) {
                        generatedImages.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
                    }
                }
            }
        }

        displayResults(generatedImages, 'places-result', 'places-placeholder', 'places-loading', 'places-output-grid', aspectRatio);

    } catch (error) {
        console.error(error);
        alert('Failed to generate places photo.');
        hideLoading('places-loading');
    }
});
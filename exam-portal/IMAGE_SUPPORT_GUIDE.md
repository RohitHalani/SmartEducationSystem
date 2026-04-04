# 📸 Image Support for AI Chatbot - Feature Guide

## Overview

The AI chatbot now supports **image uploads and analysis** using Google's Gemini Vision API. Users can share images of diagrams, handwritten notes, equations, or questions, and the AI will analyze them to provide helpful educational assistance.

## Features Added

### ✅ Backend Enhancements

1. **Gemini Pro Vision Integration**
   - Automatically switches between `gemini-pro` (text-only) and `gemini-pro-vision` (with images)
   - Converts uploaded images to base64 format for API transmission
   - Maintains backward compatibility with text-only messages

2. **Image Upload Handling**
   - Uses existing Multer configuration for file uploads
   - Accepts common image formats: JPG, PNG, GIF, WebP
   - Stores image URLs and MIME types in chat history
   - Maximum file size: 50MB

3. **Enhanced Chat Schema**
   - Added `imageUrl` field to store uploaded image paths
   - Added `imageMimeType` field to track image format
   - Maintains full chat history with image references

### ✅ Frontend Enhancements

1. **Image Upload UI**
   - Image attachment button (📷 icon) in chatbot input
   - File picker with image-only filter
   - Visual preview before sending
   - Remove button to cancel image upload

2. **Image Display in Chat**
   - User messages show attached images
   - Images are displayed with proper sizing (max 200x200px)
   - Smooth integration with text messages

3. **Enhanced UX**
   - Automatic default message if only image is sent
   - Image preview in input area before sending
   - Clear visual feedback during upload

## How to Use

### For Users

1. **Open the chatbot** by clicking the chat icon (💬) in the bottom-right corner

2. **Attach an image** by clicking the image button (📷) next to the text input

3. **Select an image** from your device:
   - Diagrams or charts you need help understanding
   - Handwritten notes you want explained
   - Mathematical equations you need solved
   - Screenshots of problems or errors
   - Study material you have questions about

4. **Add optional text** to provide context:
   - "What does this diagram represent?"
   - "Can you explain this equation?"
   - "Help me understand this concept"
   - Or leave blank for general image analysis

5. **Send** by clicking the send button (✈️)

6. **Receive AI analysis** - The AI will:
   - Analyze the image content
   - Provide explanations and insights
   - Answer questions about the image
   - Suggest related study materials

### Example Use Cases

**1. Diagram Analysis**
```
User: *uploads circuit diagram*
User: "How does this circuit work?"
AI: "This appears to be a series-parallel circuit. Let me break down how it works..."
```

**2. Handwritten Notes**
```
User: *uploads handwritten math problem*
User: "I'm stuck on this problem"
AI: "Looking at your work, I can see you've correctly identified the first step..."
```

**3. Concept Visualization**
```
User: *uploads data structure diagram*
AI: "This is a binary search tree. The structure shows..."
```

**4. Error Help**
```
User: *uploads code screenshot with error*
User: "Why am I getting this error?"
AI: "The error indicates a null pointer exception. This occurs because..."
```

## Technical Details

### Backend Changes

**File: `backend/models/Chat.js`**
```javascript
// Added fields for image support
imageUrl: {
    type: String,
    required: false
},
imageMimeType: {
    type: String,
    required: false
}
```

**File: `backend/uploads/server.js`**
```javascript
// Modified chat endpoint to accept images
app.post('/api/chat', authMiddleware, upload.single('image'), async (req, res) => {
    // Automatically selects correct model based on image presence
    const modelName = imageFile ? 'gemini-pro-vision' : 'gemini-pro';

    // Converts image to base64 for Gemini API
    const imageData = fs.readFileSync(imageFile.path);
    const base64Image = imageData.toString('base64');

    // Sends both text and image to Gemini Vision
    result = await model.generateContent([promptText, imagePart]);
});
```

### Frontend Changes

**File: `frontend/index.html`**
```html
<!-- Image upload input (hidden) -->
<input type="file" id="chatImageInput" accept="image/*" style="display: none;">

<!-- Image attach button -->
<button onclick="document.getElementById('chatImageInput').click()">
    <i class="fas fa-image"></i>
</button>

<!-- Image preview area -->
<div id="imagePreview" class="image-preview">
    <img id="previewImg" src="" alt="Preview">
    <button onclick="removeImage()">×</button>
</div>
```

**File: `frontend/script.js`**
```javascript
// Image selection handler
function handleImageSelect(event) {
    const file = event.target.files[0];
    // Creates preview using FileReader
    reader.readAsDataURL(file);
}

// Modified sendMessage to use FormData
async function sendMessage() {
    const formData = new FormData();
    formData.append('message', message);
    formData.append('image', imageFile);

    // Sends multipart form data instead of JSON
    fetch(`${API_URL}/chat`, { body: formData });
}

// Enhanced message display with image support
function addChatMessage(message, sender, imageUrl = null) {
    // Displays image in user messages
    if (imageUrl && sender === 'user') {
        const img = document.createElement('img');
        messageDiv.appendChild(img);
    }
}
```

**File: `frontend/style.css`**
```css
/* Image preview styling */
.image-preview {
    display: flex;
    position: relative;
    background: #f8f9fa;
    border-radius: 8px;
}

/* Image attach button */
.image-attach-btn {
    background: #6c757d;
}
```

## API Reference

### POST /api/chat

**Request Type:** `multipart/form-data`

**Headers:**
```
Authorization: Bearer <token>
```

**Body Parameters:**
```
message: string (required) - User's text message
image: File (optional) - Image file to analyze
```

**Response:**
```json
{
    "response": "AI-generated response based on text and/or image",
    "imageUrl": "/uploads/1234567890-image.jpg" // if image was uploaded
}
```

**Error Responses:**
```json
{
    "error": "Message is required"  // 400 if no message provided
}
{
    "error": "Sorry, I encountered an error. Please try again."  // 500 on server error
}
```

## Supported Image Formats

- **JPEG/JPG** (.jpg, .jpeg)
- **PNG** (.png)
- **GIF** (.gif)
- **WebP** (.webp)

## Limitations

1. **File Size:** Maximum 50MB per image
2. **Model Limitations:**
   - Gemini Vision works best with clear, well-lit images
   - Very small text may be hard to read
   - Complex diagrams may need additional context
3. **API Quota:** Subject to Gemini API free tier limits (60 requests/min, 1500/day)
4. **Fallback:** If Gemini API is unavailable, text-only responses are used

## Troubleshooting

### Issue: Image not uploading

**Solutions:**
- Check file size is under 50MB
- Verify image format is supported (JPG, PNG, GIF, WebP)
- Ensure stable internet connection
- Check browser console for errors

### Issue: Image analysis is inaccurate

**Solutions:**
- Provide clearer, higher-resolution images
- Add text context to guide the AI
- Ensure good lighting and contrast in images
- Crop images to focus on relevant content

### Issue: "Gemini API unavailable" error

**Solutions:**
- Verify `GEMINI_API_KEY` is configured in backend `.env`
- Check API quota hasn't been exceeded
- Ensure API key is valid and active
- System will fall back to text-only mode automatically

## Security Considerations

1. **Image Storage:**
   - Images are stored in `backend/uploads/` directory
   - Files are served via Express static middleware
   - Filenames include timestamps to prevent collisions

2. **Input Validation:**
   - Multer validates file types and sizes
   - Only image MIME types are accepted
   - File extensions are preserved

3. **API Security:**
   - Authentication required via JWT token
   - API key not exposed to frontend
   - Images processed server-side only

## Future Enhancements

Potential improvements for future versions:

- [ ] Multiple image upload support
- [ ] Image cropping/editing before sending
- [ ] Drag-and-drop image upload
- [ ] Image compression before upload
- [ ] OCR text extraction from images
- [ ] Image history in chat sidebar
- [ ] Download/save analyzed images
- [ ] Camera capture directly in browser
- [ ] Image annotation tools

## Testing Checklist

- [x] Backend accepts image uploads via multipart/form-data
- [x] Gemini Pro Vision model is used when image is present
- [x] Images are converted to base64 correctly
- [x] Chat schema stores image URLs and MIME types
- [x] Frontend image button opens file picker
- [x] Image preview displays before sending
- [x] Remove button clears selected image
- [x] Images display in user messages
- [x] FormData is sent correctly to backend
- [ ] End-to-end test with real Gemini API key
- [ ] Test with various image formats
- [ ] Test with large files near 50MB limit
- [ ] Test error handling when API fails

## Summary

The image support feature transforms the chatbot from a text-only assistant into a **multimodal AI tutor** capable of understanding visual content. Students can now get help with:

- 📊 Diagrams and charts
- ✍️ Handwritten notes and problems
- 🔢 Mathematical equations
- 💻 Code screenshots
- 📚 Study materials
- 🖼️ Concept visualizations

All powered by Google's advanced Gemini Vision AI! 🚀

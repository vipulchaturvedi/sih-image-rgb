addEventListener('fetch', (event) => {
    event.respondWith(handleRequest(event.request));
  });
  
  async function handleRequest(request) {
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      const response = new Response(null, {
        status: 204, // No Content
      });
  
       // Append CORS headers to the response
       response.headers.set('Access-Control-Allow-Origin', '*'); // Allow requests from any origin (change for production)
       response.headers.set('Access-Control-Allow-Methods', 'POST'); // Allow only POST requests (adjust as needed)
       response.headers.set('Content-Type', 'image/jpeg');
   
      return response;
    }
    
    try {
      // Check if the request method is POST
      if (request.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
      }
  
      // Read the image data from the request body
      const imageBuffer = await request.arrayBuffer();
  
      // Define the threshold value (adjust as needed)
      const threshold = 128;
  
      // Process the image
      const { modifiedImage, blackPixels } = processImage(imageBuffer, threshold);
  
      // Convert the modified image data back to binary
      const modifiedImageData = new Uint8Array(modifiedImage);
  
        // Create a response with the modified image and black pixels count
        const response = new Response(modifiedImageData, {
          status: 200,
        });
        
        // Append CORS headers to the response
      response.headers.set('Access-Control-Allow-Origin', '*'); // Allow requests from any origin (change for production)
      response.headers.set('Access-Control-Allow-Methods', 'POST'); // Allow only POST requests (adjust as needed)
      response.headers.set('Content-Type', 'image/jpeg');
      response.headers.set('X-Black-Pixels', blackPixels.toString());
    
        return response;
      } catch (error) {
        return new Response('Internal Server Error', { status: 500 });
      }
    }
  
  function processImage(imageBuffer, threshold) {
    // Assuming the image is in RGB format (3 bytes per pixel)
    const bytesPerPixel = 3;
    const view = new DataView(imageBuffer);
  
    let blackPixels = 0;
  
    for (let i = 0; i < imageBuffer.byteLength; i += bytesPerPixel) {
      // Extract RGB values
      const r = view.getUint8(i);
      const g = view.getUint8(i + 1);
      const b = view.getUint8(i + 2);
  
      // Convert R and B values to 0, keeping only G
      view.setUint8(i, 0);
      view.setUint8(i + 2, 0);
  
      // Grayscale the image
      const grayscaleValue = Math.floor((r + g + b) / 3);
  
      // Apply the threshold
      if (grayscaleValue < threshold) {
        view.setUint8(i + 1, 0); // Set G value to 0 for black
        blackPixels++;
      } else {
        view.setUint8(i + 1, 255); // Set G value to 255 for white
      }
    }
  
    return { modifiedImage: imageBuffer, blackPixels };
  }
  
import fs from 'fs/promises'; // Import the 'fs' module with promises
import Jimp from 'jimp'; // Import the 'jimp' module

import data from './data.json'; // Import the data.json file


async function compressAndRenameImage() {
    try {
        if (!data || !data.photoUrl || !data.name) {
            console.error('Error: Invalid data format. Missing required properties.');
            return;
        }

        const imageUrl = data.photoUrl;
        const imageName = data.name.replace(/\s+/g, '-').toLowerCase(); // Convert name to lowercase and replace spaces with dashes
        const imageExtension = imageUrl.split('.').pop(); // Extract image extension
        const originalFilename = `${imageName}.${imageExtension}`; // Construct original filename

        // Download the image (assuming accessibility from the code's environment)
        const imageBuffer = await downloadImage(imageUrl);

        // Create the directory if it doesn't exist
        await fs.mkdir('compressed-images', { recursive: true });

        // Create a new filename with a unique identifier (timestamp)
        const newFilename = `${Date.now()}-${originalFilename}`;

        // Load the image using Jimp
        const image = await Jimp.read(imageBuffer);

        // Compress the image (adjust quality as needed)
        await image.quality(60).write(`compressed-images/${newFilename}`); // Write to a designated folder

        // Update the data.json with the new filename
        data.photoUrl = `compressed-images/${newFilename}`;

        // Save the updated data.json
        await fs.writeFile('data.json', JSON.stringify(data, null, 2)); // Pretty-printed

        console.log(`Image compressed and renamed to: ${newFilename}`);
    } catch (error) {
        console.error('Error:', error);
    }
}

async function downloadImage(url) {
    // Replace with your image downloading logic (e.g., using a library like 'axios')
    // This example assumes the image is accessible and returns a Buffer
    return fs.readFile(url); // Simulate downloading for clarity
}

(async () => {
    try {
        const data = await fs.readFile('data.json', 'utf8');
        const jsonData = JSON.parse(data);
        await compressAndRenameImage(jsonData);
    } catch (error) {
        console.error('Error reading data.json:', error);
    }
})();

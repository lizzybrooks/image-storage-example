let rectangles = [];
let firebaseImages = [];  // Store p5.Element for Firebase images
let uploadedImages = [];  // Store details for uploaded images

function setup() {
    createCanvas(800, 800);
    background('#a2e0bf');

    // Constants for the grid layout
    const cols = 5;
    const rows = 5;
    const gap = 10;
    const cellWidth = (width - (cols + 1) * gap) / cols;
    const cellHeight = (height - (rows + 1) * gap) / rows;

    // Initialize fixed grid of rectangles
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            let rect = {
                x: gap + i * (cellWidth + gap),
                y: gap + j * (cellHeight + gap),
                width: cellWidth,
                height: cellHeight
            };
            rectangles.push(rect);
        }
    }

    // Load Firebase images from the /images folder
    loadFirebaseImages();

    // Enable dropping files on the canvas
    let c = select('canvas');
    c.drop(handleFile);
}

function draw() {
    background('#a2e0bf');
    drawRectangles();
    drawImages();
}

function loadFirebaseImages() {
    const storageRef = firebase.storage().ref('/images'); // Reference to images folder
    storageRef.listAll().then((result) => {
        result.items.forEach((itemRef) => {
            itemRef.getDownloadURL().then((url) => {
                const img = createImg(url, '');
                img.hide(); // Hide the image initially
                firebaseImages.push(img);
            });
        });
    }).catch((error) => {
        console.error("Error loading images from Firebase:", error);
    });
}

function drawRectangles() {
    rectangles.forEach((r) => {
        noFill();
        stroke(77, 41, 13);
        strokeWeight(5);
        rect(r.x, r.y, r.width, r.height, 20);
    });
}

function drawImages() {
    firebaseImages.forEach((img, index) => {
        if (index < rectangles.length) {
            let r = rectangles[index];
            image(img, r.x + r.width * 0.1, r.y + r.height * 0.1, r.width * 0.8, r.height * 0.8);
        }
    });

    uploadedImages.forEach((upload) => {
        image(upload.img, upload.x, upload.y, upload.w, upload.h);
    });
}

function handleFile(file) {
    if (file.type === 'image') {
        let droppedOnRect = rectangles.find(r => mouseX > r.x && mouseX < r.x + r.width && mouseY > r.y && mouseY < r.y + r.height);
        if (droppedOnRect) {
            const img = createImg(file.data, '').hide(); // Create image and hide it
            let imgWidth = droppedOnRect.width * 0.8;
            let imgHeight = droppedOnRect.height * 0.8;
            let imgX = droppedOnRect.x + (droppedOnRect.width - imgWidth) / 2;
            let imgY = droppedOnRect.y + (droppedOnRect.height - imgHeight) / 2;
            uploadedImages.push({ img: img, x: imgX, y: imgY, w: imgWidth, h: imgHeight });

            // Upload file to Firebase Storage
            uploadImageToFirebase(file.file);
        }
    }
}

function uploadImageToFirebase(file) {
    // Create a reference to 'images/[filename]'
    let storageRef = firebase.storage().ref('/images/' + file.name);

    // Upload file
    storageRef.put(file).then((snapshot) => {
        console.log('Uploaded a blob or file to /images folder!', snapshot);
        // Reload or add newly uploaded image to firebaseImages for immediate display
        const url = URL.createObjectURL(file);
        const img = createImg(url, '').hide();
        firebaseImages.push(img);
    }).catch((error) => {
        console.error('Upload failed:', error);
    });
}

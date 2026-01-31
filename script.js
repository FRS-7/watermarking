const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const imageInput = document.getElementById("imageInput");
const encodeBtn = document.getElementById("encodeBtn");
const decodeBtn = document.getElementById("decodeBtn");
const downloadBtn = document.getElementById("downloadBtn");
const output = document.getElementById("output");

const watermarkText = "GRHA_TOSAN_AJI_PEKALONGAN";
const SECRET_KEY = "TEREOS";

let mainImage = new Image();
let logo = new Image();
let logoReady = false;

logo.onload = () => {
    logoReady = true;
};
logo.src = "logo.png";

logo.src = "logo.png";

// Load image
imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];
    if (!file) return;

    mainImage.onload = () => {
        canvas.width = mainImage.width;
        canvas.height = mainImage.height;
        ctx.drawImage(mainImage, 0, 0);
        downloadBtn.disabled = true;
    };
    mainImage.src = URL.createObjectURL(file);
});


function getSeed(key) {
    let seed = 0;
    for (let c of key) seed += c.charCodeAt(0);
    return seed;
}

// Encode invisible - visible watermark
encodeBtn.addEventListener("click", () => {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const binary = watermarkText
        .split("")
        .map(c => c.charCodeAt(0).toString(2).padStart(8, "0"))
        .join("");

    const seed = getSeed(SECRET_KEY);

    for (let i = 0; i < binary.length; i++) {
        const idx = ((seed + i) % (data.length / 4)) * 4;
        data[idx] = (data[idx] & 254) | parseInt(binary[i]);
    }

    ctx.putImageData(imageData, 0, 0);

    // Visible watermark
    if (logoReady) {
    const w = canvas.width * 0.15;
    const h = w * (logo.height / logo.width);

    ctx.globalAlpha = 0.3;
    ctx.drawImage(
        logo,
        canvas.width - w - 20,
        canvas.height - h - 20,
        w,
        h
    );
    ctx.globalAlpha = 1;
}


    output.innerText = "✅ Watermark visible & invisible berhasil diterapkan";
    downloadBtn.disabled = false;
});

// Decode invisible watermark
decodeBtn.addEventListener("click", () => {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const seed = getSeed(SECRET_KEY);
    let binary = "";

    for (let i = 0; i < watermarkText.length * 8; i++) {
        const idx = ((seed + i) % (data.length / 4)) * 4;
        binary += (data[idx] & 1);
    }

    let text = "";
    for (let i = 0; i < binary.length; i += 8) {
        text += String.fromCharCode(parseInt(binary.substr(i, 8), 2));
    }

    output.innerText = "🔍 Invisible watermark terbaca: " + text;
});

// Download
downloadBtn.addEventListener("click", () => {
    const link = document.createElement("a");
    link.download = "GRHA Tosan Aji Pekalongan.png";
    link.href = canvas.toDataURL("image/png");
    link.click();

    output.innerText = "⬇️ Gambar berhasil diunduh";
});

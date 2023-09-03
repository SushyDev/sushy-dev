async function urlToBlob(url) {
  const response = await fetch(url);
  return response.blob();
}

const srcThree = "https://cdn.jsdelivr.net/npm/three@latest/build/three.min.js" 
const srcVanta = "https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.clouds2.min.js" 

function loadScript(src) {
    return new Promise(async (resolve, reject) => {
        const blob = await urlToBlob(src);
        const script = document.createElement("script");
        script.src = URL.createObjectURL(blob);
        document.head.appendChild(script);
        script.onload = () => resolve(script);
        script.onerror = () => reject();
    })
};


async function dingus() {
    await loadScript(srcThree);
    await loadScript(srcVanta);

    VANTA.CLOUDS2({
        el: "body",
        texturePath: "/noise.png"
    })
}

document.addEventListener("mousemove", dingus, {once: true});
document.addEventListener("touchstart", dingus, {once: true});

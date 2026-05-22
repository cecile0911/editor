let introModal = document.getElementById("introDialog");
let undoStack = [];

document.getElementById("introDialog").showModal();

document.getElementById("dialogCloseButton").addEventListener("click", () => {
  introModal.close();
});

// create stage
const stageWidth = Math.min(window.innerWidth * 0.7, 760);
const stageHeight = 560;

var stage = new Konva.Stage({
  container: "stageContainer",
  width: stageWidth,
  height: stageHeight,
});

// create layer
var layer = new Konva.Layer();
stage.add(layer);

let selectedNode = null;
let transformer = null;
let currentStickerStyle = "magazine";

// create / update transformer
function selectNode(node) {
  selectedNode = node;

  if (!transformer) {
    transformer = new Konva.Transformer({
      nodes: [selectedNode],
      keepRatio: true,
    });
    layer.add(transformer);
  } else {
    transformer.nodes([selectedNode]);
  }

  layer.draw();
}

// upload image
document.getElementById("upload").addEventListener("change", function (e) {
  var file = e.target.files[0];
  if (!file) return;

  var reader = new FileReader();

  reader.onload = function (evt) {
    var img = new Image();
    img.src = evt.target.result;

    img.onload = function () {
      var konvaImage = new Konva.Image({
        x: 80,
        y: 80,
        image: img,
        draggable: true,
      });

      const maxWidth = 620;
      const maxHeight = 480;
      const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1);

      konvaImage.width(img.width * scale);
      konvaImage.height(img.height * scale);
      layer.add(konvaImage);

      konvaImage.cache();

      selectNode(konvaImage);
      // 确保图片被添加进konva再滚动
      setTimeout(() => {
        document.getElementById("stageContainer").scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);

      undoStack.push({
        type: "add",
        node: konvaImage,
      });
    };
  };

  reader.readAsDataURL(file);

  /* clear input value so uploading the same image again can still trigger change */
  e.target.value = "";
});

// filters only work on images
function isSelectedImage() {
  return selectedNode && selectedNode.className === "Image";
}

function updateFilters() {
  if (!isSelectedImage()) return;

  const brightness = Number(document.getElementById("brightnessSlider").value);
  const contrast = Number(document.getElementById("contrastSlider").value);

  selectedNode.filters([Konva.Filters.Brighten, Konva.Filters.Contrast]);
  selectedNode.brightness(brightness);
  selectedNode.contrast(contrast);

  layer.batchDraw();
}

document.getElementById("grayBtn").addEventListener("click", () => {
  if (!isSelectedImage()) return;

  selectedNode.filters([Konva.Filters.Grayscale]);
  layer.batchDraw();
});

document.getElementById("sepiaBtn").addEventListener("click", () => {
  if (!isSelectedImage()) return;

  selectedNode.filters([Konva.Filters.Sepia]);
  layer.batchDraw();
});

document.getElementById("invertBtn").addEventListener("click", () => {
  if (!isSelectedImage()) return;

  selectedNode.filters([Konva.Filters.Invert]);
  layer.batchDraw();
});

document.getElementById("resetFilterBtn").addEventListener("click", () => {
  if (!isSelectedImage()) return;

  selectedNode.filters([]);
  selectedNode.brightness(0);
  selectedNode.contrast(0);

  document.getElementById("brightnessSlider").value = 0;
  document.getElementById("contrastSlider").value = 0;

  layer.batchDraw();
});

document
  .getElementById("brightnessSlider")
  .addEventListener("input", updateFilters);

document
  .getElementById("contrastSlider")
  .addEventListener("input", updateFilters);

// sticker function
function getStickerStyle(style, text) {
  const baseSize = text.length > 3 ? 32 : 56;

  const styles = {
    magazine: {
      fontFamily: "Georgia",
      fontStyle: "italic",
      fontSize: baseSize,
      fill: "#e05b7e",
      stroke: "#fff3f8",
      strokeWidth: 1.5,
      shadowColor: "#b05880",
      shadowBlur: 0,
      shadowOffsetX: 4,
      shadowOffsetY: 4,
      shadowOpacity: 0.35,
    },

    cute: {
      fontFamily: "Arial",
      fontStyle: "bold",
      fontSize: baseSize,
      fill: "#f8e2ae",
      stroke: "#e05b7e",
      strokeWidth: 2,
      shadowColor: "#ffffff",
      shadowBlur: 0,
      shadowOffsetX: 3,
      shadowOffsetY: 3,
      shadowOpacity: 0.6,
    },

    bold: {
      fontFamily: "Arial Black",
      fontStyle: "normal",
      fontSize: baseSize,
      fill: "#8f3e67",
      stroke: "#f8e2ae",
      strokeWidth: 2,
      shadowColor: "#e05b7e",
      shadowBlur: 0,
      shadowOffsetX: 5,
      shadowOffsetY: 5,
      shadowOpacity: 0.45,
    },

    soft: {
      fontFamily: "Trebuchet MS",
      fontStyle: "bold",
      fontSize: baseSize,
      fill: "#6fbeb1",
      stroke: "#fff4f8",
      strokeWidth: 1.5,
      shadowColor: "#f49fbe",
      shadowBlur: 6,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      shadowOpacity: 0.7,
    },

    gothic: {
      fontFamily: "Times New Roman",
      fontStyle: "bold",
      fontSize: baseSize,
      fill: "#3c202d",
      stroke: "#efabc5",
      strokeWidth: 1,
      shadowColor: "#f8e2ae",
      shadowBlur: 0,
      shadowOffsetX: 3,
      shadowOffsetY: 3,
      shadowOpacity: 0.5,
    },
  };

  return styles[style];
}

function addTextSticker(text) {
  const styleSettings = getStickerStyle(currentStickerStyle, text);

  const sticker = new Konva.Text({
    x: 160,
    y: 160,
    text: text,
    draggable: true,
    ...styleSettings,
  });

  layer.add(sticker);
  selectNode(sticker);

  undoStack.push({
    type: "add",
    node: sticker,
  });

  layer.draw();
}

// sticker buttons
document.querySelectorAll(".sticker-btn").forEach((button) => {
  button.addEventListener("click", () => {
    const stickerText = button.dataset.sticker;
    addTextSticker(stickerText);
  });
});

// click object to select it
stage.on("click tap", function (e) {
  if (e.target === stage) {
    if (transformer) {
      transformer.nodes([]);
    }
    selectedNode = null;
    layer.draw();
    return;
  }

  if (e.target instanceof Konva.Image || e.target instanceof Konva.Text) {
    selectNode(e.target);
  }
});
document.querySelectorAll(".style-btn").forEach((button) => {
  button.addEventListener("click", () => {
    currentStickerStyle = button.dataset.style;

    document.querySelectorAll(".style-btn").forEach((btn) => {
      btn.classList.remove("active");
    });

    button.classList.add("active");
  });
});
// download image
document.getElementById("downloadBtn").addEventListener("click", () => {
  if (transformer) {
    transformer.hide();
  }

  layer.draw();

  const dataURL = stage.toDataURL({
    pixelRatio: 2,
  });

  const link = document.createElement("a");
  link.download = "edited-image.png";
  link.href = dataURL;
  link.click();

  if (transformer) {
    transformer.show();
  }

  layer.draw();
});
// 确保能删除的包含图片本身
document.getElementById("deleteStickerBtn").addEventListener("click", () => {
  if (!selectedNode) return;

  const deletedNode = selectedNode;

  deletedNode.remove();

  if (transformer) {
    transformer.nodes([]);
  }

  selectedNode = null;

  undoStack.push({
    type: "delete",
    node: deletedNode,
  });

  layer.draw();
});

document.getElementById("undoBtn").addEventListener("click", () => {
  const lastAction = undoStack.pop();
  if (!lastAction) return;

  if (lastAction.type === "add") {
    lastAction.node.remove();

    if (transformer) {
      transformer.nodes([]);
    }

    selectedNode = null;
  }

  if (lastAction.type === "delete") {
    layer.add(lastAction.node);
    selectNode(lastAction.node);
  }

  layer.draw();
});
const clearCanvasBtn = document.getElementById("clearCanvasBtn");
/* =========================================
   clear entire canvas
========================================= */

clearCanvasBtn.addEventListener("click", () => {
  // remove every editable object
  layer.destroyChildren();

  // reset selected object
  selectedNode = null;

  // reset sliders
  brightnessSlider.value = 0;
  contrastSlider.value = 0;

  // redraw
  layer.draw();
});

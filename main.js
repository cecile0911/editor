let introModal = document.getElementById("introDialog");
/* to get the backdrop working we need to open the modal with js */
document.getElementById("introDialog").showModal();
/* find modal close button and add an eventlistener */
document.getElementById("dialogCloseButton").addEventListener("click", () => {
  introModal.close();
});

// 创建舞台
var stage = new Konva.Stage({
  container: "stageContainer",
  width: window.innerWidth,
  height: window.innerHeight,
});

// 图层
var layer = new Konva.Layer();
stage.add(layer);

// 监听上传
document.getElementById("upload").addEventListener("change", function (e) {
  var file = e.target.files[0];
  if (!file) return;

  var reader = new FileReader();

  reader.onload = function (evt) {
    var img = new Image();
    img.src = evt.target.result;

    img.onload = function () {
      // 创建 Konva 图片对象
      var konvaImage = new Konva.Image({
        x: 50,
        y: 50,
        image: img,
        draggable: true, // 可以拖动
      });

      layer.add(konvaImage);
      var tr = new Konva.Transformer({
        nodes: [konvaImage],
        keepRatio: true,
      });

      layer.add(tr);
      layer.draw();
    };
  };

  reader.readAsDataURL(file);
});

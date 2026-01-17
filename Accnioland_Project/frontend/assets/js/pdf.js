let pdfDocJs, basePdfUrl;
let pageIndex = 0;
let scale = 1.5;
let marks = [];

async function loadPdf(token) {
  const r = await fetch(API + "/api/floor-plans/my", {
    headers: authHeaders(),
  });
  const d = await r.json();
  basePdfUrl = d.planPdf;

  pdfDocJs = await pdfjsLib.getDocument(basePdfUrl).promise;
  renderPage();
}

async function renderPage() {
  const p = await pdfDocJs.getPage(pageIndex + 1);
  const vp = p.getViewport({ scale });

  const canvas = document.getElementById("pdfCanvas");
  canvas.width = vp.width;
  canvas.height = vp.height;

  const ctx = canvas.getContext("2d");
  await p.render({ canvasContext: ctx, viewport: vp }).promise;

  marks.forEach(m => {
    if (m.pageIndex === pageIndex) {
      ctx.beginPath();
      ctx.arc(m.x, m.y, 10, 0, Math.PI * 2);
      ctx.strokeStyle = m.color;
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  }


);

// marks.forEach((m, index) => {
//   if (m.pageIndex === pageIndex) {

//     // ✅ use normalized values if available (best)
//     const drawX = (m.xNorm != null) ? (m.xNorm * canvas.width) : m.x;
//     const drawY = (m.yNorm != null) ? (m.yNorm * canvas.height) : m.y;

//     ctx.beginPath();
//     ctx.arc(drawX, drawY, 10, 0, Math.PI * 2);
//     ctx.strokeStyle = m.color;
//     ctx.lineWidth = 3;
//     ctx.stroke();

//     // optional: number label
//     ctx.fillStyle = m.color;
//     ctx.font = "14px Arial";
//     ctx.fillText(index + 1, drawX + 12, drawY - 12);
//   }
// });

}

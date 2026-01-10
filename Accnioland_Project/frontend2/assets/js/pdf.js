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
  });
}

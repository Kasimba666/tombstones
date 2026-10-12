import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

//библиотека pdfjs подгружается лениво - только при первом обращении к превью
let pdfjsLibModule = null;

//часть хостингов отдаёт файлы .mjs с Content-Type application/octet-stream,
//а браузеры строго проверяют MIME у module-воркеров и запрещают их запуск,
//поэтому текст воркера загружается fetch'ем и воркер создаётся из blob-url
//(pdf.worker.min.mjs — ES-модуль с export в конце, значит нужен module-воркер)
function loadWorkerFromBlob() {
    return fetch(pdfWorkerUrl)
        .then((response) => {
            if (!response.ok) throw new Error('Не удалось загрузить pdf-воркер');
            return response.text();
        })
        .then((workerText) => {
            let blobUrl = URL.createObjectURL(new Blob([workerText], {type: 'text/javascript'}));
            return new Worker(blobUrl, {type: 'module'});
        });
}

function loadPdfjsLib() {
    if (!pdfjsLibModule) {
        pdfjsLibModule = Promise.all([import('pdfjs-dist'), loadWorkerFromBlob()])
            .then(([pdfjsLib, worker]) => {
                pdfjsLib.GlobalWorkerOptions.workerPort = worker;
                return pdfjsLib;
            });
    }
    return pdfjsLibModule;
}

//кэш превью по url pdf-файла, чтобы не рендерить первую страницу повторно
const previewCache = new Map();

//рендер первой страницы pdf в data-url jpeg-изображения (для превью публикаций)
export function renderPdfFirstPage(url, maxWidth = 320) {
    if (!previewCache.has(url)) {
        let promise = loadPdfjsLib()
            .then((pdfjsLib) => pdfjsLib.getDocument(url).promise)
            .then((doc) => {
                return doc.getPage(1).then((page) => {
                    let baseViewport = page.getViewport({scale: 1});
                    let scale = maxWidth / baseViewport.width;
                    let viewport = page.getViewport({scale: scale});
                    let canvas = document.createElement('canvas');
                    canvas.width = Math.ceil(viewport.width);
                    canvas.height = Math.ceil(viewport.height);
                    let canvasContext = canvas.getContext('2d');
                    return page.render({canvasContext: canvasContext, viewport: viewport}).promise
                        .then(() => {
                            let dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                            doc.destroy();
                            return dataUrl;
                        });
                });
            })
            .catch(() => {
                //убрать из кэша, чтобы при следующем показе страницы была попытка рендера заново
                previewCache.delete(url);
                throw new Error('Не удалось отрендерить превью pdf');
            });
        previewCache.set(url, promise);
    }
    return previewCache.get(url);
}

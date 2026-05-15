// =========================
// OCR.JS
// =========================
// OCR PUR
// image/PDF -> texte brut
// =========================

pdfjsLib.GlobalWorkerOptions.workerSrc =
'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

// =========================
// OCR PRINCIPAL
// =========================

async function extractTextOCR(file){

    addLog(`[OCR] Analyse : ${file.name}`);

    const isPdf =
    file.name.toLowerCase().endsWith('.pdf');

    try{

        // =========================
        // PDF TEXTE
        // =========================

        if(isPdf){

            const arrayBuffer =
            await file.arrayBuffer();

            const pdf =
            await pdfjsLib.getDocument({
                data: arrayBuffer
            }).promise;

            let fullText = '';

            for(let i=1;i<=pdf.numPages;i++){

                const page =
                await pdf.getPage(i);

                const content =
                await page.getTextContent();

                fullText +=
                content.items
                .map(item => item.str)
                .join(' ') + '\n';
            }

            // =========================
            // SI TEXTE DIRECT
            // =========================

            if(fullText.trim().length > 50){

                addLog(
                `[OCR] Texte PDF détecté.`
                );

                return {

                    text: fullText,

                    preview:
                    await createPDFPreview(pdf)
                };
            }

            // =========================
            // OCR PDF IMAGE
            // =========================

            addLog(
            `[OCR] PDF scanné détecté.`
            );

            const page =
            await pdf.getPage(1);

            const viewport =
            page.getViewport({
                scale:2
            });

            const canvas =
            document.createElement('canvas');

            canvas.width =
            viewport.width;

            canvas.height =
            viewport.height;

            const context =
            canvas.getContext('2d');

            await page.render({

                canvasContext:context,

                viewport:viewport

            }).promise;

            const dataUrl =
            canvas.toDataURL('image/png');

            const worker =
            await Tesseract.createWorker('fra');

            const result =
            await worker.recognize(dataUrl);

            await worker.terminate();

            addLog(
            `[OCR] OCR PDF terminé.`
            );

            return {

                text: result.data.text,

                preview: canvas
            };
        }

        // =========================
        // IMAGE OCR
        // =========================

        const dataUrl =
        await fileToDataURL(file);

        const worker =
        await Tesseract.createWorker('fra');

        const result =
        await worker.recognize(dataUrl);

        await worker.terminate();

        addLog(
        `[OCR] OCR image terminé.`
        );

        return {

            text: result.data.text,

            preview: dataUrl
        };

    }catch(err){

        addLog(
        `[OCR] Erreur : ${err.message}`
        );

        return null;
    }
}

// =========================
// IMAGE -> DATAURL
// =========================

async function fileToDataURL(file){

    return new Promise(resolve => {

        const reader =
        new FileReader();

        reader.onload =
        e => resolve(e.target.result);

        reader.readAsDataURL(file);
    });
}

// =========================
// PREVIEW PDF
// =========================

async function createPDFPreview(pdf){

    const page =
    await pdf.getPage(1);

    const viewport =
    page.getViewport({
        scale:0.5
    });

    const canvas =
    document.createElement('canvas');

    canvas.width =
    viewport.width;

    canvas.height =
    viewport.height;

    const context =
    canvas.getContext('2d');

    await page.render({

        canvasContext:context,

        viewport:viewport

    }).promise;

    return canvas;
}

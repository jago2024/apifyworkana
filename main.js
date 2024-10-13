const Apify = require('apify');

Apify.main(async () => {
    // URL de Workana con los criterios de búsqueda ya aplicados
    const url = 'https://www.workana.com/jobs?has_few_bids=1&language=en%2Ces&publication=1d';

    // Lanzamos el navegador usando Puppeteer
    const browser = await Apify.launchPuppeteer();
    const page = await browser.newPage();
    
    // Vamos a la URL de Workana
    await page.goto(url, { waitUntil: 'networkidle0' });

    // Esperamos a que cargue el listado de trabajos
    await page.waitForSelector('.project-item');

    // Extraemos la información de los trabajos publicados
    const jobs = await page.$$eval('.project-item', (projects) => {
        return projects.map((project) => {
            const titleElement = project.querySelector('.project-title a');
            const descriptionElement = project.querySelector('.project-details p');
            
            return {
                title: titleElement ? titleElement.innerText : null,
                link: titleElement ? titleElement.href : null,
                description: descriptionElement ? descriptionElement.innerText.trim() : null,
            };
        });
    });

    // Cerramos el navegador
    await browser.close();

    // Guardamos los datos extraídos en Apify dataset para su uso posterior
    await Apify.pushData(jobs);

    console.log('Extracción completada con éxito. Aquí están los trabajos encontrados:');
    console.log(jobs);
});

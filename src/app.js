const m = require('mithril');

import {pageService} from './services/page.service.js'
import Page from "./classes/Page.js";


(async () => {
    const pageList = await pageService.getAll();
    const pageModules = await Promise.all(pageList.map(async location => {
        const module = await import(location);
        const {page} = module;

        if (page)
            return page;
    }));

    let router = {};
    pageModules.forEach((module) => {
        router[module.path] = module.component;
    });
    if (!router.hasOwnProperty('/mainMenu'))
        router['/mainMenu'] = new Page('/mainMenu', {view: () => {return ''}});
    m.route(document.body, "/mainMenu", router);
})();
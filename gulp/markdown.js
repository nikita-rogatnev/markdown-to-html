/*
 * Copyright (c) 2018 Omnigon Communications, LLC. All rights reserved.
 *
 * This software is the confidential and proprietary information of Omnigon Communications, LLC
 * ("Confidential Information"). You shall not disclose such Confidential Information and shall access and use it only
 * in accordance with the terms of the license agreement you entered into with Omnigon Communications, LLC, its
 * subsidiaries, affiliates or authorized licensee. Unless required by applicable law or agreed to in writing, this
 * Confidential Information is provided on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the license agreement for the specific language governing permissions and limitations.
 */

const path = require('path');
const fs = require('fs');
const util = require('util');
const readdir = util.promisify(fs.readdir);
const stat = util.promisify(fs.stat);
const readFile = util.promisify(fs.readFile);
const _ = require('lodash');

const marked = require('marked');
const handlebars = require('handlebars');

const config = require('../config');

const TEMPLATE_PATH = './src/blocks';

handlebars.registerHelper('kebab', function(str) {
    if (!str || !_.isString(str)) {
        return '';
    }
    return _.kebabCase(str);
});

module.exports.processMarkdown = async function processMarkdown(pathToFolder, title, level) {
    const items = await readdir(pathToFolder);
    const filesContent = await Promise.all(items.map(async function(item) {
        const itemPath = path.join(pathToFolder, item);
        const itemStat = await stat(itemPath);
        if(itemStat.isFile()) {
            const fileContent = await readFile(itemPath, 'utf-8');
            return marked(fileContent);
        }
        const nextLevel = level + 1;
        return processMarkdown(itemPath, item, nextLevel);
    }));
    const fileContentHTML = filesContent.join('');
    const templateName = config.levels[level] || 'default';
    const hbs = await readFile(path.join(TEMPLATE_PATH, templateName, templateName + '.hbs'), 'utf-8');
    const template = handlebars.compile(hbs);
    return template({content: fileContentHTML, title});
};

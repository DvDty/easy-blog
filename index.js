import {BindServices} from './src/ServiceBinder.js'
import {ServiceContainer} from './src/ServiceContainer.js'
import fs from 'fs'

BindServices()

const config = ServiceContainer.get('config')

const pages = []

fs.readdirSync('posts').forEach(filename => {
    const fileContent = fs.readFileSync('posts/' + filename, {encoding: 'utf8'})

    const builder = ServiceContainer.get('htmlBuilder')
        .withContent(fileContent)

    const htmlFilename = filename.replace('.md', '.html')
    fs.writeFileSync('docs/' + htmlFilename, builder.getHtml())

    pages.push({
        title: builder.getMetadata('title'),
        created_at: builder.getMetadata('created_at'),
        path: './' + htmlFilename,
    })
})

let landingPageContent = config.get('landingDescription') + '\n'

pages.forEach(post => {
    landingPageContent += `## [${post.title}](${post.path})\n${post.created_at}\n___\n`
})

const builder = ServiceContainer.get('htmlBuilder')
    .withContent(landingPageContent)
    .with('title', config.get('blogName'))

fs.writeFileSync('docs/index.html', builder.getHtml())

import { container } from 'tsyringe'
import Storage from './Services/Storage'
import MarkdownConverter from './Services/MarkdownConventer'
import CodeHighlighter from './Services/CodeHighlighter'
import type showdown from 'showdown'
import { type Template } from './Template'

export default abstract class Page {
  public readonly name: string
  public readonly content: string

  private template: Template | undefined
  private highlightCode: boolean = false

  public constructor (name: string) {
    this.name = name
    this.content = container.resolve(Storage).getContent('articles/' + name)
  }

  public withCodeHighlighting (): this {
    this.highlightCode = true

    return this
  }

  public withTemplate (template: Template): this {
    this.template = template

    return this
  }

  public getHtml (): string {
    const markdownConverter: MarkdownConverter = container.resolve(MarkdownConverter)

    let html: string = markdownConverter.toHtml(this.content)
    const metadata: showdown.Metadata = markdownConverter.getMetadata()

    if (this.highlightCode) {
      html = container.resolve(CodeHighlighter).highlightAuto(html)
    }

    if (this.template != null) {
      html = container.resolve(Storage).getContent(this.template).replace('{{ content }}', html)
    }

    for (const key in metadata) {
      html = html.replace(`{{ ${key} }}`, metadata[key])
    }

    return html
  }
}

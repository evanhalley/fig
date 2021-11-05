# fig

![Fig logo](./fig.png)

Fig (Feature Image Generator) is a tool that I use to generate feature images for my website's blog [evanhalley.dev](evanhalley.dev).  Feature images are useful when you need to attach an image to a social media post sharing an article you wrote.

This project has just gotten started and is therefore very light on documentation at the moment.  

## Install

You must have Nodejs v14.14+ installed to execute `fig-cli`.

Run `npm install @evanhalley/fig` to install.

## Setup

1. Clone this repository.

2. Run `npm install` to install the dependencies.

3. Install `fig-cli` locally: `npm link`.

4. Execute `fig-cli --version` and verify a version number is printed to the terminal.

## Usage

Fig is a utility that generates feature images for website articles. The images can be used for sharing the article on social media.

You can use this tool in two ways.

### Pass in argument's via command line

You want to specify the title, published date, and author's name using the command line.

```text
Usage: fig-cli args [options]

Generates an image using the options specified

Options:
  -t, --title <title>                                             Article's title
  -d, --date <date>                                               Article's published date
  -a, --author <author>                                           Article's author's name
  -h, --html-template <path to the folder containing index.html>  Path to index.html template used to generate your feature image
  -o, --output <name and path to output>                          Name and path of the output file, append with .jpg or .png
  -v, --verbose                                                   Turns on verbose logging
  --help                                                          display help for command
```

Example usage:

```
fig-cli args --title "How to do Great Things" --author "Fig Newton" --date 2021-01-09
```

### Read arguments from a text file's frontmatter

You want to retrieve the title, published, and author from the frontmatter embedded in a text file.

```text
Usage: fig-cli fm [options] <input>

Generates an image by parsing metadata from the frontmatter in the input file

Options:
  -o, --output <name and path to output>                          Name and path of the output file, append with .jpg or .png
  -v, --verbose                                                   Turns on verbose logging
  -h, --html-template <path to the folder containing index.html>  Path to index.html template used to generate your feature image
  --help                                                          display help for command
```

Example usage:

```
fig-cli fm /Users/fig/blog/posts/how-to-do-great-things.md 
```

### HTML Template

You can specify you own HTML template or use one included with this library.  Your HTML template must contain the following placeholders:

* `[[TITLE]]`: article title will replace this placeholder
* `[[AUTHOR]]`: article author will replace this placeholder
* `[[DATE]]`: article published date will replace this placeholder

If you want to specify a template, provide the path to it after the `-h / --html-template` option.  If none is specified, `fig` will attempt to use an HTML template at `~/.fig/template/index.html`.  You can include images and CSS as well, but make sure they are accessible by `fig` so they can be copied to a temporary location before processing.

## Attribution

Icons made by [Freepik](https://www.freepik.com)</a> from [Flaticon.com](https://www.flaticon.com/)
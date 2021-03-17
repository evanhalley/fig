# fig

![Fig logo](./fig.png)

Fig (Feature Image Generator) is a tool that I use to generate feature images for my website's blog [evanhalley.dev](evanhalley.dev).  Features images are useful when you need to attach an image to a social media post sharing an article you wrote.

This project has just gotten started and is therefore very light on documentation at the moment.  

## Setup

You must have Nodejs installed to execute `fig-cli`.

1. Clone this repository.

2. Run `npm install` to install the dependencies.

3. Install `fig-cli` locally: `npm link`.

4. Execute `fig-cli --version` and verify a version number is printed to the terminal.

## Usage

```sh
Usage: fig-cli [options]

Fig is a utility that generates feature images for website articles. The images can be used for sharing the article on social media.

Options:
  -V, --version                            output the version number
  -t, --title <title>                      Article's title
  -d, --date <date>                        Article's published Date
  -a, --author <author>                    Article's Author's name
  -h, --html-template <path to HTML file>  Path to HTML template for your feature image
  -i, --author-image <path to image>       Path to article's author's image
  -c, --css <path to CSS file>             Path to CSS to use for your feature image
  -o, --output <name and path to output>   Name and path of the output file, append with .jpg or .png
  -v, --verbose                            Turns on verbose logging
  --help                                   display help for command
```

## Attribution

Icons made by [Freepik](https://www.freepik.com)</a> from [Flaticon.com](https://www.flaticon.com/)
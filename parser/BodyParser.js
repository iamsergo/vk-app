const needle = require("needle")

class BodyParser
{
  static async getHTML(url)
  {
    const res = await needle('get', url)
    const body = await res.body

    return body
  }
}

module.exports = BodyParser
const cheerio = require('cheerio')

class Parser
{
  constructor(body)
  {
    this.$ = cheerio.load(body)
  }

  getTime(nth)
  {
    return [
      ['08:15', '09:50'],
      ['10:00', '11:35'],
      ['11:45', '13:20'],
      ['14:20', '15:55'],
      ['16:05', '17:40'],
      ['17:50', '19:25'],
      ['19:35', '21:10']
    ][nth - 1]
  }

  single($td, postfix, nth, week = 2, group = '')
  {
    const typeLesson = { 'лек' : 0, 'пр' : 1, 'лаб' : 2 }

    const fromWhom = []
    $td.find(`div.sp_${postfix} a`).each( (i, a) => {
      const title = this.$(a).attr('title')
      fromWhom.push({
        href : this.$(a).attr('href'),
        title : title ? title.replace(/^ст.пр.|доц.|преп.|проф./, '') : this.$(a).text()
      })
    } )

    return {
      type : typeLesson[$td.children(`div.place_${postfix}`).contents().eq(0).text().trim()],
      auditory : $td.children(`div.place_${postfix}`).text().trim(),
      subject : $td.children(`div.subject_${postfix}`).text().trim() + group,
      fromWhom,
      time : !!$td.children(`div.break_top`).length ? ['12:35', '14:10'] : this.getTime(nth),
      week
    }
  }

  double($tds, postfix, nth)
  {
    const data = []
    $tds.each( (i, td) => {
      if(this.$(td).text().trim())
        data.push(this.single(this.$(td), postfix, nth, i))      
    } )

    return data
  }

  quarter($tds, postfix, nth)
  {
    const id = [0, 1]
    const data = []
    $tds.each( (i, td) => {
      if(this.$(td).text().trim())
        data.push(this.single(this.$(td), postfix, nth, id[i % 2], `(${(i % 2) + 1} гр.)`))
    } )

    return data
  }

  leftRighht($tds, postfix, nth)
  {
    const data = []
    $tds.each( (i, td) => {
      if(this.$(td).text().trim())
        data.push(this.single(this.$(td), postfix, nth, i, `(${i + 1} гр.)`))
    } )

    return data
  }

  getData()
  {
    const title = this.$('.top_banner').text().trim()
    const days = []

    const $tds = this.$('table.schedule tbody tr > td.schedule_std')
    let j = 0
    $tds.each( (i, td) => {
      if(i % 6 === 0) j++
      if(i < 6) days.push([])
      
      const $td = this.$(td)

      if($td.children('div').length !== 0)
        days[i % 6].push(this.single($td, 'std', j))
        
      else if($td.children('table').length)
      {
        const $tds = $td.find('table tbody tr > td')

        if($tds.eq(0).hasClass('schedule_hq'))
          days[i % 6].push(...this.leftRighht($tds, 'hq', j))
        
        else if($tds.length  === 4)
          days[i % 6].push(...this.quarter($tds, 'quarter', j))

        else if($tds.length === 2)
          days[i % 6].push(...this.double($tds, 'half', j))        
      }        
    } )

    return { title, days }
  }

  getFromWhoms(days)
  {
    const getUnique = arr => {
      const flags = {}

      arr.forEach( el => {
        if(!flags[el.href])
          flags[el.href] = el
      } )

      return [ ...Object.keys(flags).map( id => flags[id] ) ]
    }

    const data = days
      .reduce( (acc, el) => ([ ...acc, ...el.map( c => c.fromWhom ) ]), [])
      .reduce( (acc, el) => ([ ...acc, ...el ]), [] )
    
    return getUnique(data)
  }
}

module.exports = Parser
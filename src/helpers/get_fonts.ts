export interface Font {
  type: string
  name: string
  info?: string
  subtypes?: Subtype[]
}

export interface Subtype {
  style: string
  weight: string
}

const windows_fonts = [
  'Arial',
  'Arial Black',
  'Bahnschrift',
  'Calibri',
  'Cambria',
  'Cambria Math',
  'Candara',
  'Comic Sans MS',
  'Consolas',
  'Constantia',
  'Corbel',
  'Courier New',
  'Ebrima',
  'Franklin Gothic Medium',
  'Gabriola',
  'Gadugi',
  'Georgia',
  'HoloLens MDL2 Assets',
  'Impact',
  'Ink Free',
  'Javanese Text',
  'Leelawadee UI',
  'Lucida Console',
  'Lucida Sans Unicode',
  'Malgun Gothic',
  'Marlett',
  'Microsoft Himalaya',
  'Microsoft JhengHei',
  'Microsoft New Tai Lue',
  'Microsoft PhagsPa',
  'Microsoft Sans Serif',
  'Microsoft Tai Le',
  'Microsoft YaHei',
  'Microsoft Yi Baiti',
  'MingLiU-ExtB',
  'Mongolian Baiti',
  'MS Gothic',
  'MV Boli',
  'Myanmar Text',
  'Nirmala UI',
  'Palatino Linotype',
  'Segoe MDL2 Assets',
  'Segoe Print',
  'Segoe Script',
  'Segoe UI',
  'Segoe UI Historic',
  'Segoe UI Emoji',
  'Segoe UI Symbol',
  'SimSun',
  'Sitka',
  'Sylfaen',
  'Symbol',
  'Tahoma',
  'Times New Roman',
  'Trebuchet MS',
  'Verdana',
  'Webdings',
  'Wingdings',
  'Yu Gothic',
]

const mac_fonts = [
  'American Typewriter',
  'Andale Mono',
  'Arial',
  'Arial Black',
  'Arial Narrow',
  'Arial Rounded MT Bold',
  'Arial Unicode MS',
  'Avenir',
  'Avenir Next',
  'Avenir Next Condensed',
  'Baskerville',
  'Big Caslon',
  'Bodoni 72',
  'Bodoni 72 Oldstyle',
  'Bodoni 72 Smallcaps',
  'Bradley Hand',
  'Brush Script MT',
  'Chalkboard',
  'Chalkboard SE',
  'Chalkduster',
  'Charter',
  'Cochin',
  'Comic Sans MS',
  'Copperplate',
  'Courier',
  'Courier New',
  'Didot',
  'DIN Alternate',
  'DIN Condensed',
  'Futura',
  'Geneva',
  'Georgia',
  'Gill Sans',
  'Helvetica',
  'Helvetica Neue',
  'Herculanum',
  'Hoefler Text',
  'Impact',
  'Lucida Grande',
  'Luminari',
  'Marker Felt',
  'Menlo',
  'Microsoft Sans Serif',
  'Monaco',
  'Noteworthy',
  'Optima',
  'Palatino',
  'Papyrus',
  'Phosphate',
  'Rockwell',
  'Savoye LET',
  'SignPainter',
  'Skia',
  'Snell Roundhand',
  'Tahoma',
  'Times',
  'Times New Roman',
  'Trattatello',
  'Trebuchet MS',
  'Verdana',
  'Zapfino',
]

// 'Condensed',
// 'Flex',
// 'Mono',
// 'Slab',
// 'Serif',
const google_fonts = [
  {
    type: 'google',
    name: 'Roboto',
    sub_types: [
      { style: 'regular', weight: '100' },
      { style: 'italic', weight: '100' },
      { style: 'regular', weight: '300' },
      { style: 'italic', weight: '300' },
      { style: 'regular', weight: '400' },
      { style: 'italic', weight: '400' },
      { style: 'regular', weight: '500' },
      { style: 'italic', weight: '500' },
      { style: 'regular', weight: '700' },
      { style: 'italic', weight: '700' },
      { style: 'regular', weight: '900' },
      { style: 'italic', weight: '900' },
    ],
  },
  {
    type: 'google',
    name: 'Roboto Mono',
    sub_types: [
      { style: 'regular', weight: '100' },
      { style: 'italic', weight: '100' },
      { style: 'regular', weight: '300' },
      { style: 'italic', weight: '300' },
      { style: 'regular', weight: '400' },
      { style: 'italic', weight: '400' },
      { style: 'regular', weight: '500' },
      { style: 'italic', weight: '500' },
      { style: 'regular', weight: '700' },
      { style: 'italic', weight: '700' },
    ],
  },
]

const server_fonts = [
  {
    type: 'system',
    name: 'OpenDyslexic',
    info: 'https://opendyslexic.org/',
    sub_types: [
      { style: 'regular', weight: '400' },
      { style: 'italic', weight: '400' },
      { style: 'regular', weight: '700' },
      { style: 'italic', weight: '700' },
    ],
  },
  {
    type: 'system',
    name: 'にしき的',
    info: 'https://umihotaru.work/',
    sub_types: [
      { style: 'regular', weight: '400' },
      { style: 'italic', weight: '400' },
    ],
  },
]

const font_check = new Set([...windows_fonts, ...mac_fonts].sort())

export async function get_fonts() {
  await document.fonts.ready

  const fonts_available = new Set()

  for (const font of font_check.values()) {
    if (document.fonts.check(`12px "${font}"`)) {
      fonts_available.add({
        type: 'system',
        name: font,
        sub_types: [
          { style: 'regular', weight: '400' },
          { style: 'italic', weight: '400' },
        ],
      })
    }
  }

  return [...server_fonts, ...google_fonts, ...fonts_available] as Font[]
}

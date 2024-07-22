// at1 = aqtk1
// at2 = aqtk2
// at10 = aqtk10

export const api = 'https://www.yukumo.net/api/v2'

export const sub_type = {
  at1: 'aqtk1',
  at2: 'aqtk2',
  at10: 'aqtk10',
}

export function build_api(name: string, input: string) {
  return `${api}/${(sub_type as any)[name.split('-')[0]]}/koe.mp3?type=${name.split('-')[1]}&kanji=${encodeURIComponent(input)}`
}

export const voices = [
  {
    lang: 'ja-JP',
    // voice: 'at1',
    name: 'at1-f1',
    local_service: false,
  },
  {
    lang: 'ja-JP',
    name: 'at1-f2',
    local_service: false,
  },
  {
    lang: 'ja-JP',
    name: 'at1-m1',
    local_service: false,
  },
  {
    lang: 'ja-JP',
    name: 'at1-m2',
    local_service: false,
  },
  {
    lang: 'ja-JP',
    name: 'at1-dvd',
    local_service: false,
  },
  {
    lang: 'ja-JP',
    name: 'at1-imd4',
    local_service: false,
  },
  {
    lang: 'ja-JP',
    name: 'at1-jgr',
    local_service: false,
  },
  {
    lang: 'ja-JP',
    name: 'at1-r1',
    local_service: false,
  },
  {
    lang: 'ja-JP',
    name: 'at2-rm',
    local_service: false,
  },
  {
    lang: 'ja-JP',
    name: 'at2-f1c',
    local_service: false,
  },
  {
    lang: 'ja-JP',
    name: 'at2-f3a',
    local_service: false,
  },
  {
    lang: 'ja-JP',
    name: 'at2-huskey',
    local_service: false,
  },
  {
    lang: 'ja-JP',
    name: 'at2-m4b',
    local_service: false,
  },
  {
    lang: 'ja-JP',
    name: 'at2-mf1',
    local_service: false,
  },
  {
    lang: 'ja-JP',
    name: 'at2-rb2',
    local_service: false,
  },
  {
    lang: 'ja-JP',
    name: 'at2-rb3',
    local_service: false,
  },
  {
    lang: 'ja-JP',
    name: 'at2-robo',
    local_service: false,
  },
  {
    lang: 'ja-JP',
    name: 'at2-yukkuri',
    local_service: false,
  },
  {
    lang: 'ja-JP',
    name: 'at2-f4',
    local_service: false,
  },
  {
    lang: 'ja-JP',
    name: 'at2-m5',
    local_service: false,
  },
  {
    lang: 'ja-JP',
    name: 'at2-mf2',
    local_service: false,
  },
  {
    lang: 'ja-JP',
    name: 'at2-rm3',
    local_service: false,
  },
  {
    lang: 'ja-JP',
    name: 'at10-f1',
    local_service: false,
    // options: {
    //     speed: 100,
    //     volume: 100,
    //     pitch: 100,
    //     accent: 100,
    //     lmd: 100,
    //     fsc: 100,
    // },
  },
  {
    lang: 'ja-JP',
    name: 'at10-f2',
    local_service: false,
    // options: {
    //     speed: 100,
    //     volume: 100,
    //     pitch: 77,
    //     accent: 150,
    //     lmd: 100,
    //     fsc: 100,
    // },
  },
  {
    lang: 'ja-JP',
    name: 'at10-m1',
    local_service: false,
    // options: {
    //     speed: 100,
    //     volume: 100,
    //     pitch: 30,
    //     accent: 100,
    //     lmd: 100,
    //     fsc: 100,
    // },
  },
]

export default { api, build_api, sub_type, voices }

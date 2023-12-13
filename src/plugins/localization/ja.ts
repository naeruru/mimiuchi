// i18n japanese translations
export default {
  welcome: {
    intro: {
      title: '{name}へようこそ！',
      description: '{name}は、話されたや入力された言葉をカスタマイズ可能なテキストウィンドウに表示することができるで、OBSなどのアプリで簡単に結果を表示できるようにすることができます。また、他のアプリ（VRChatなど）へのテキストやコマンドの中継もサポートしています。',
      button: '次へ',
    },
    controls: {
      title: 'コントロール',
      broadcast: 'OSCをトグルする（デスクトップアプリが必要）',
      mic: 'Speech-to-Textをトグルする（ブラウザーとマイクの許可が必要）',
      settings: '設定ページを開く',
      button: '閉じる',
    },
  },
  general: {
    type_message: 'メッセージを送信',
    beta: 'ベータ',
    update: 'アップデート',
  },
  alerts: {
    no_speech: 'このブラウザはWeb Speech APIをサポートしていません（Speech-to-text）',
    mic_error: 'マイクのアクセスに失敗しました。許可する必要があります。',
    device_in_use: 'Error: デバイスが別のブラウザタブで使用中です',
    broadcast_error: 'ブロードキャストに失敗しました. デスクトップアプリが起動していることを確認してください。',
    websocket_error: 'ウェブソケットのURLが無効です',
    version_mismatch: 'デスクトップ版とウェブアプリ版は別物です。壊れるかもしれないので、アップデートを検討してください。',
  },
  settings: {
    title: 'ユーザー設定',
    general: {
      title: '全般設定',
      description: 'アプリ全般の設定',
      language: 'UIの言語を選択',
      transcript: 'セッショントランスクリプトをダウンロードする',
      reset: {
        button: 'アプリの設定をリセットする',
        dialog: {
          title: '設定をリセットする',
          description: 'アプリの設定がリセットされます。本当にリセットしてもいいですか。',
          button: 'リセット',
        },
        snackbar: {
          title: '設定がリセットされた',
          button: '閉じる',
        },
      },
    },
    stt: {
      title: 'Speech-to-Text',
      description: 'Speech-to-textの設定',
      type: 'STTサービスを選択',
      sensitivity: '感度ゲート',
      sensitivity_start: 'マイクテスト',
      sensitivity_stop: 'テストを中...',
      device: 'デバイス： ',
      language: 'Speech-to-textの言語を選択',
      unsupported: {
        text: 'Web Speech APIのSpeech-to-Textは{0}で利用できます。(^・ω・^)',
        link: 'ウェブサイト版',
      },
    },
    tts: {
      title: 'Text-to-Speech',
      description: 'Text-to-speechの設定',
      type: 'TTSサービスを選択',
      enabled: 'テキストを音声に変換',
      rate: 'スピード',
      pitch: 'ピッチ',
      language: 'Text-to-speechの音声を選択',
      unsupported: {
        text: 'Text-to-Speechは{0}で利用できます。 (^・ω・^)',
        link: 'ウェブサイト版',
      },
    },
    appearance: {
      title: 'テーマ',
      description: 'アプリのテーマを変更',
      text: {
        title: '文字設定',
        font_family: 'フォント',
        font_type: 'タイプ',
        font_size: '文字の大きさ',
        fade: 'フェード',
        fade_after: '〇〇秒後にフェード',
        fade_for: '〇〇秒間のフェード',
        new_line_delay: {
          hint: 'テキストが送信されないと、改行を挿入す',
          options: [
            {
              title: 'すぐに',
              value: 0,
            },
            {
              title: '2秒後',
              value: 2,
            },
            {
              title: '4秒後',
              value: 4,
            },
            {
              title: '6秒後',
              value: 6,
            },
            {
              title: '8秒後',
              value: 8,
            },
            {
              title: '10秒後',
              value: 10,
            },
            {
              title: '改行なし',
              value: -1,
            },
          ],
        },
        seconds: '秒',
        color: '文字色',
        interim_color: '中間文字色',
      },
      ui: {
        title: 'UI設定',
        color: 'ウインドウ色',
      },
    },
    word_replace: {
      title: 'テキストリプレース',
      description: 'ここで置き換えるテキストを追加します',
      enabled: 'テキストリプレース',
      info: '新しい置き換えを追加する場合は「＋」バタンを使用してください',
      replacing: 'リプレース',
      replacement: 'リプレースメント',
    },
    translation: {
      title: '翻訳',
      description: '他の言語に翻訳する設定',
      warning: '翻訳は進行中です。完璧なものとして信用しないでください！',
      enabled: '翻訳を有効にする',
      type: '翻訳サービスの選択する',
      source: '翻訳元言語',
      target: '目標言語',
      show_original: '翻訳する前に元のテキストを表示する',
      ml_notice: '{0}はCPUを使用して、デバイス上で翻訳を生成する機械学習を搭載したライブラリです。ローエンドのコンピュータでは、うまく動作しない場合があります。',
      speech_lang: 'Speech-to-text言語は',
    },
    connections: {
      title: '接続',
      description: '{icon}使用時に他のアプリにデータを送信',
      update: 'アップデート接続',
      ws: {
        name: 'デスクトップアプリの接続',
        port: 'ウェブソケットポート',
        description: 'ウェブソケットでテキスト更新を即座に送信できます',
      },
      wh: {
        description: 'テキスト更新をWebhookのPOSTリクエストで送信できます',
      },
    },
    osc: {
      title: 'VRChat',
      general: {
        title: 'OSC設定',
        description: 'OSC接続の設定',
        osc_ip: 'デフォルトのOSC IP',
        osc_port: 'デフォルトのOSC Port',
        enabled: 'OSCで全文送信（ブロードキャスト中）',
        typing_indicator: 'タイピング時にタイピングインジケーターを有効',
        speech_indicator: 'Speech-to-text時のタイピングインジケーターを有効',
        show_keyboard: 'テキスト送信時にVRChatでキーボードを開く',
        sfx: 'テキスト送信後に効果音を再生',
        unsupported: {
          text: 'OSCの設定は{link}で利用できます。インストールすれば、{icon}ボタンでウェブサイト版とデスクトップ版を一緒に使うことができます（Speech-to-text▶︎OSC）(  ᐡᴗ  ̫ ᴗᐡ)',
          link: 'デスクトップアプリ版',
          icon: 'mdi-broadcast',
        },
      },
      params: {
        title: 'カスタムパラメータ',
      },
    },
  },
}

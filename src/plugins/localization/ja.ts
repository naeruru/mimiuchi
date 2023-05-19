// i18n japanese translations
export default {
    welcome: {
        intro: {
            title: '{name}へようこそ！',
            description: '{name}は、話されたや入力された言葉をカスタマイズ可能なテキストウィンドウに表示することができるで、OBSなどのアプリで簡単に結果を表示できるようにすることができます。また、他のアプリ（VRChatなど）へのテキストやコマンドの中継もサポートしています。',
            button: '次へ'
        },
        controls: {
            title: 'コントロール',
            broadcast: 'OSCをトグルする（デスクトップアプリが必要）',
            mic: 'Speech-to-Textをトグルする（ブラウザーとマイクの許可が必要）',
            settings: '設定ページを開く',
            button: '閉じる'
        }
    },
    general: {
        type_message: 'メッセージを送信'
    },
    settings: {
        title: 'ユーザー設定',
        general: {
            title: '全般設定',
            description: 'アプリ全般の設定',
            language: '言語を選択',
            reset: {
                button: 'すべての設定をリセットする',
                dialog: {
                    title: '設定をリセットする',
                    description: 'すべてのアプリの設定をリセットするところです。',
                    button: 'リセット'
                },
                snackbar: {
                    title: '設定がリセットされた',
                    button: '閉じる'
                }
            }
        },
        speech: {
            title: 'スピーチ',
            description: 'スピーチの設定',
            language: 'Speech-to-textの言語を選択',
            unsupported: {
                text: 'Speech-to-Textは{0}で利用できます。(^・ω・^)',
                link: 'ウェブサイト版'
            }
        },
        appearance: {
            title: 'テーマ',
            description: 'アプリのテーマを変更する',
            text: {
                title: '文字設定',
                font_size: '文字の大きさ',
                fade_after: '〇〇秒後にフェード',
                fade_for: '〇〇秒間のフェード',
                seconds: '秒',
                color: '文字色',
                interim_color: '中間文字色'
            },
            ui: {
                title: 'UI設定',
                color: 'ウインドウ色'
            }
        },
        word_replace: {
            title: 'テキストリプレース',
            description: 'ここで置き換えるテキストを追加します',
            enabled: 'テキストリプレース',
            info: '新しい置き換えを追加する場合は「＋」バタンを使用してください',
            replacing: 'リプレース',
            replacement: 'リプレースメント'
        },
        osc: {
            general: {
                title: 'OSC設定',
                description: 'OSC接続の設定',
                osc_ip: 'デフォルトのOSC IP',
                osc_port: 'デフォルトのOSC Port',
                enabled: 'OSCで全文送信（送信中）',
                typing_indicator: 'タイピング時にタイピングインジケーターを有効',
                speech_indicator: 'Speech-to-text時のタイピングインジケーターを有効',
                unsupported: {
                    text: 'OSCの設定は{0}で利用できます。(  ᐡᴗ  ̫ ᴗᐡ)',
                    link: 'デスクトップアプリ版'
                }
            },
            params: {
                title: 'カスタムパラメータ'
            },
        }
    },
}
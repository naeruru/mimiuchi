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
        type_message: 'メッセージを送信',
        beta: 'ベータ'
    },
    alerts: {
        no_speech: 'このブラウザはWeb Speech APIをサポートしていません（Speech-to-text）',
        mic_error: 'マイクのアクセスに失敗しました。許可する必要があります。',
        broadcast_error: 'ブロードキャストに失敗しました. デスクトップアプリが起動していることを確認してください。',
        websocket_error: 'ウェブソケットのURLが無効です',
        version_mismatch: 'デスクトップ版とウェブアプリ版は別物です。壊れるかもしれないので、アップデートを検討してください。'
    },
    settings: {
        title: 'ユーザー設定',
        general: {
            title: '全般設定',
            description: 'アプリ全般の設定',
            language: 'UIの言語を選択',
            reset: {
                button: 'アプリの設定をリセットする',
                dialog: {
                    title: '設定をリセットする',
                    description: 'アプリの設定がリセットされます。本当にリセットしてもいいですか。',
                    button: 'リセット'
                },
                snackbar: {
                    title: '設定がリセットされた',
                    button: '閉じる'
                }
            }
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
                link: 'ウェブサイト版'
            }
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
                link: 'ウェブサイト版'
            }
        },
        appearance: {
            title: 'テーマ',
            description: 'アプリのテーマを変更',
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
        connections: {
            title: '接続',
            description: '{icon}使用時に他のアプリにデータを送信',
            update: 'アップデート接続',
            ws: {
                name: 'デスクトップアプリの接続',
                port: 'ウェブソケットポート',
                description: 'ウェブソケットでテキスト更新を即座に送信できます'
            }
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
                unsupported: {
                    text: 'OSCの設定は{link}で利用できます。インストールすれば、{icon}ボタンでウェブサイト版とデスクトップ版を一緒に使うことができます（Speech-to-text▶︎OSC）(  ᐡᴗ  ̫ ᴗᐡ)',
                    link: 'デスクトップアプリ版',
                    icon: 'mdi-broadcast'
                }
            },
            params: {
                title: 'カスタムパラメータ'
            },
        }
    },
}
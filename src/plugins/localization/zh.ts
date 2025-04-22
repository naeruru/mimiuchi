// i18n 中文翻译
export default {
    welcome: {
      intro: {
        title: '欢迎使用 {name}！',
        description: '{name} 是一个字幕工具，可以将语音或输入的文本显示在一个可自定义的窗口中，方便地在 OBS 等应用中展示结果。它还支持将文本和指令传递到其他应用程序（例如 VRChat）。',
        button: '下一步',
      },
      controls: {
        title: '控制',
        broadcast: '切换 OSC 广播（需要桌面应用）',
        mic: '切换语音转文本功能（需要浏览器权限）',
        settings: '打开设置面板',
        button: '关闭',
      },
    },
    general: {
      type_message: '输入一条消息',
      beta: '测试版',
      update: '更新',
      subject_to_change: '内容可能会更改',
    },
    alerts: {
      no_speech: '您的浏览器不支持 Web Speech API（语音转文本）。',
      speech_recognition_error_event: {
        aborted: '错误：设备被另一个标签页使用中。',
        not_allowed: '启用麦克风时发生错误。您需要授予权限。',
      },
      broadcast_error: '启用广播时发生错误。请确保桌面应用正在运行。',
      websocket_error: '无效的 WebSocket URL。',
      version_mismatch: '桌面应用的版本与网页版本不同。建议更新，否则可能会出问题。',
    },
    settings: {
      title: '设置',
      general: {
        title: '常规设置',
        description: '应用程序的常规设置',
        language: '选择界面语言',
        transcript: '下载会话记录',
        realtime_text: '实时更新文本框',
        reset: {
          button: '重置所有设置',
          dialog: {
            title: '重置设置',
            description: '您将重置整个应用程序的设置。',
            button: '重置',
          },
          snackbar: {
            title: '设置已重置',
            button: '关闭',
          },
        },
      },
      stt: {
        title: '语音转文本',
        description: '语音转文本设置',
        type: '选择语音转文本服务',
        sensitivity: '灵敏度门限',
        sensitivity_start: '开始检测',
        sensitivity_stop: '停止检测',
        device: '正在监听：',
        pinned_languages: '固定语言',
        language: '选择语音识别语言',
        unsupported: {
          text: 'Web Speech API 的语音转文本功能仅在 {0} 上可用。(＾・ω・＾)',
          link: '网页版本',
        },
      },
      tts: {
        title: '文本转语音',
        description: '文本转语音设置',
        enabled: '启用文本转语音播放',
        type: '选择文本转语音服务',
        rate: '语速',
        pitch: '音调',
        language: '选择文本转语音语言',
        unsupported: {
          text: '文本转语音功能仅在 {0} 上可用。(＾・ω・＾)',
          link: '网页版本',
        },
      },
      appearance: {
        title: '外观设置',
        description: '更改应用程序的外观',
        theme: '主题',
        footer: '底部设置',
        footer_size: {
          hint: '底部大小',
          options: [
            {
              title: '小',
              value: 0
            },
            {
              title: '大',
              value: 1
            }
          ]
        },
        text: {
          title: '文本设置',
          font_family: '字体',
          font_type: '样式',
          font_size: '字体大小',
          outline: {
            enabled: '启用文字轮廓',
            size: '轮廓大小',
            color: '轮廓颜色'
          },
          fade: '文字渐隐',
          fade_after: '文字渐隐时间',
          seconds: '秒',
          fade_for: '文字渐隐持续时间',
          new_line_delay: {
            hint: '未发送文本时换行的时间',
            options: [
              { title: '立即', value: 0 },
              { title: '2 秒后', value: 2 },
              { title: '4 秒后', value: 4 },
              { title: '6 秒后', value: 6 },
              { title: '8 秒后', value: 8 },
              { title: '10 秒后', value: 10 },
              { title: '从不', value: -1 },
            ],
          },
          color: '文字颜色',
          interim_color: '临时文字颜色',
        },
        ui: {
          title: '界面设置',
          color: '背景颜色',
        },
      },
      word_replace: {
        title: '单词替换',
        description: '在此添加要替换的单词或短语',
        enabled: '启用单词或短语替换',
        match_whole_word: '仅匹配整个单词',
        match_case: '区分大小写',
        info: '使用 + 按钮添加新的替换！',
        replacing: '被替换',
        replacement: '替换为',
      },
      translation: {
        title: '翻译',
        description: '翻译为另一种语言的设置',
        warning: '翻译功能仍在开发中，请勿完全依赖其结果！',
        enabled: '启用翻译',
        type: '选择翻译服务',
        source: '源语言',
        target: '目标语言',
        show_original: '在翻译前显示原始文本',
        ml_notice: '{0} 是一个基于机器学习的库，它会使用本地计算资源（CPU）在设备上生成翻译结果。在配置较低的计算机上，可能运行不畅。',
        speech_lang: '您的语音转文本语言为 ',
        unsupported: {
          text: '翻译功能目前仅在 {0} 上可用。(＾・ω・＾)',
          link: '桌面版本',
        },
      },
      connections: {
        title: '连接',
        description: '通过 {icon} 向其他应用发送数据',
        update: '更新连接',
        ws: {
          name: '桌面连接',
          port: 'WebSocket 端口',
          description: '通过 WebSocket 实时发送文本更新',
        },
        wh: {
          description: '通过 Webhook POST 请求发送文本更新',
        },
      },
      osc: {
        title: 'VRChat',
        general: {
          title: '通用设置',
          description: '自定义 OSC 连接的设置',
          osc_ip: 'OSC IP',
          osc_port: 'OSC 端口',
          enabled: '启用 OSC 广播（广播时发送所有文本）',
          typing_indicator: '启用输入指示器',
          speech_indicator: '为语音转文本启用输入指示器',
          show_keyboard: '发送文本时在 VRChat 中显示键盘',
          sfx: '发送文本后播放音效',
          unsupported: {
            text: '要使用 OSC，您需要使用 {link}。安装后，可以将网页版本和桌面版本与 {icon} 按钮配合使用。(ᐡᴗ ̫ ᴗᐡ)',
            link: '桌面应用',
            icon: 'mdi-broadcast',
          },
        },
        params: {
          title: '参数触发器',
          description: '添加参数触发器',
          button: {
            cancel: '取消',
            confirm: '确认',
            add: '添加',
            delete: '删除',
          },
          profile: {
            label: '选择一个配置文件',
            dialog: {
              title: {
                add: '添加新配置文件',
                edit: '重命名配置文件',
              },
              field_label: '配置文件名称',
            },
            delete_dialog: {
              title: '删除配置文件',
              text: '您确定要删除此配置文件吗？',
            },
          },
          param: {
            button: {
              edit: '编辑',
              delete: '删除',
            },
            dialog_title: {
              add: '添加参数触发器',
              edit: '编辑参数触发器',
            },
            address: '参数地址',
            empty: '暂无内容 :c',
            trigger_phrases: '触发短语：',
            trigger_phrases_add: '添加触发词/短语',
            assign: {
              phrases: '分配短语：',
              phrases_type: '值类型',
              phrases_value: '值 ',
              phrases_add: '添加分配词/短语（例如：on）',
              behavior: '行为',
              behavior_options: {
                default: '默认',
                pulse: '脉冲',
                pulse_wait: '等待',
              },
            },
            delete_dialog: {
              title: '删除参数',
              text: '您确定要删除此参数吗？',
            },
          },
          empty: '使用 + 按钮添加新的自定义参数触发器！',
        },
      },
    },
  }
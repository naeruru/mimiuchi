export default {
  welcome: {
    intro: {
      title: 'Bienvenido a {name}!',
      description: '{name} es una herramienta de subtítulos que permite transcribir el texto hablado o escrito en una ventana personalizable para que puedas mostrar los resultados sin esfuerzo en aplicaciones como OBS. También admite la transmisión de texto y comandos a otras aplicaciones (como VRChat).',
      button: 'Siguiente',
    },
    controls: {
      title: 'Controles',
      broadcast: 'Transmisión OSC (requiere aplicación de escritorio)',
      mic: 'Voz a texto (requiere permiso del navegador)',
      settings: 'Abrir el panel de ajustes',
      button: 'Cerrar',
    },
  },
  general: {
    type_message: 'Escribe un mensaje',
    beta: 'BETA',
    update: 'Actualizar',
  },
  alerts: {
    no_speech: 'Tu navegador no es compatible con Web Speech API (Voz a Texto).',
    mic_error: 'Error al habilitar el micrófono. Debes dar permiso para usarlo.',
    device_in_use: 'Error: El micrófono está siendo usado por otra pestaña',
    broadcast_error: 'Error al habilitar la transmisión. Asegúrese de que la aplicación de escritorio se esté ejecutando.',
    websocket_error: 'URL de websocket no válida.',
    version_mismatch: 'La aplicación de escritorio tiene una versión diferente a la versión web. Considere la posibilidad de actualizar, ya que la aplicación puede fallar.',
  },
  settings: {
    title: 'Ajustes',
    general: {
      title: 'Ajustes generales',
      description: 'Ajustes generales de la aplicación',
      language: 'Selecciona el lenguaje de la interfaz',
      transcript: 'Descargar transcripción de la sesión',
      reset: {
        button: 'Resetear todos los ajustes.',
        dialog: {
          title: 'Resetear los ajustes.',
          description: 'Está a punto de restablecer la configuración de toda la aplicación.',
          button: 'Resetear',
        },
        snackbar: {
          title: 'Resetear los ajustes',
          button: 'Cerrar',
        },
      },
    },
    stt: {
      title: 'Voz a Texto',
      description: 'Ajustes de Voz a Texto',
      type: 'Selecciones un servicio STT',
      sensitivity: 'Seleccione el nivel de sensibilidad',
      sensitivity_start: 'Probar',
      sensitivity_stop: 'Parar',
      device: 'Escuchando: ',
      language: 'Selecciones un lenguaje de escucha',
      unsupported: {
        text: 'Web Speech API (Voz a Texto) solo está disponible en {0}. (^・ω・^)',
        link: 'la página web',
      },
    },
    tts: {
      title: 'Texto a Voz',
      description: 'Ajustes de Texto a Voz',
      enabled: 'Activar la reproducción de Texto a Voz',
      type: 'Selecciona un servicio TTS',
      rate: 'Tasa',
      pitch: 'Pitch',
      language: 'Seleccione una voz de Texto a Voz',
      unsupported: {
        text: 'Voz a Texto solo está disponible en {0}. (^・ω・^)',
        link: 'la página web',
      },
    },
    appearance: {
      title: 'Apariencia',
      description: 'Cambiar la apariencia de la aplicación',
      text: {
        title: 'Ajusts de Texto',
        font_family: 'Fuente',
        font_type: 'Escribe',
        font_size: 'Tamaño de letra',
        fade: 'Desvanecer el texto',
        fade_after: 'Desvanecer el texto después de ',
        seconds: 'segundos',
        fade_for: 'Desvanecer el texto durante ',
        new_line_delay: {
          hint: 'Saltar de linea cuando no se haya enviado texto en ',
          options: [
            {
              title: 'Instantaneamente',
              value: 0,
            },
            {
              title: 'después de 2 segundos',
              value: 2,
            },
            {
              title: 'después de 4 segundos',
              value: 4,
            },
            {
              title: 'después de 6 segundos',
              value: 6,
            },
            {
              title: 'después de 8 segundos',
              value: 8,
            },
            {
              title: 'después de 10 segundos',
              value: 10,
            },
            {
              title: 'Nunca',
              value: -1,
            },
          ],
        },
        color: 'Color del Texto',
        interim_color: 'Color del texto provisional',
      },
      ui: {
        title: 'Ajuste de la Interfaz',
        color: 'Color de Fondo',
      },
    },
    word_replace: {
      title: 'Sustitución de palabras',
      description: 'Agregue palabras o frases para reemplazar aquí',
      enabled: 'Permitir reemplazar palabras o frases',
      info: 'Utilice el botón + para agregar un nuevo reemplazo.',
      replacing: 'Reemplazando ',
      replacement: 'Reemplazo',
    },
    translation: {
      title: 'Traducciones',
      description: 'Ajustes para traducir a otro idioma',
      warning: 'Las traducciones están en desarrollo. No confie plenamente en ellas',
      enabled: 'Habilitar traducciones',
      type: 'Seleccione un servicio de traducción',
      source: 'Fuente',
      target: 'Objetivo',
      show_original: 'Mostrar frase original antes de traducir',
      ml_notice: '{0} es una biblioteca basada en ML que utiliza recursos locales (CPU) para generar traducciones en su dispositivo. En dispositivos de gama baja, es posible que no funcione bien.',
      speech_lang: 'Tu lenguaje para Voz a Texto es ',
    },
    connections: {
      title: 'Conexiones',
      description: 'Enviar datos a otras aplicaciones cuando se utiliza {icon}',
      update: 'Actualizar conexión',
      ws: {
        name: 'Conexión de escritorio',
        port: 'Puerto websocket',
        description: 'Envia actualizaciones de texto en tiempo real a través de un websocket',
      },
      wh: {
        description: 'Enviar actualizaciones de texto a través de una solicitud POST de Webhook',
      },
    },
    osc: {
      title: 'VRChat',
      general: {
        title: 'General',
        description: 'Configuraciones para personalizar la conexión OSC',
        osc_ip: 'IP OSC predeterminada',
        osc_port: 'Puerto OSC predeterminado',
        enabled: 'Enviar todo el texto con OSC (al transmitir)',
        typing_indicator: 'Habilitar el indicador de escritura al escribir',
        speech_indicator: 'Habilitar indicador de escritura para Voz a Texto',
        show_keyboard: 'Abrir teclado en VRChat al enviar texto',
        sfx: 'Reproduce un efecto de sonido después de enviar un texto.',
        unsupported: {
          text: 'Para utilizar OSC, debe utilizar el {link}.Una vez instaladas, las versiones de sitio web y de escritorio se pueden utilizar junto con el {icon} botón. (  ᐡᴗ  ̫ ᴗᐡ)',
          link: 'Aplicación de Escritorio',
          icon: 'mdi-broadcast',
        },
      },
      params: {
        title: 'Parámetros personalizados',
      },
    },
  },
}

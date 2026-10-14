import '../css/b5.css';
import '../css/main.css';
import './b5.js';

const DICCIONARIO_MORSE = {
  // Alfabeto
  'A': '.-',    'B': '-...',  'C': '-.-.',  'D': '-..',   'E': '.',
  'F': '..-.',  'G': '--.',   'H': '....',  'I': '..',    'J': '.---',
  'K': '-.-',   'L': '.-..',  'M': '--',    'N': '-.',    'O': '---',
  'P': '.--.',  'Q': '--.-',  'R': '.-.',   'S': '...',   'T': '-',
  'U': '..-',   'V': '...-',  'W': '.--',   'X': '-..-',  'Y': '-.--',
  'Z': '--..',

  // Excepción idioma español
  'Ñ': '--.--',

  // Números
  '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
  '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',

  // Signos
  '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.', '!': '-.-.--',
  '/': '-..-.',  '(': '-.--.',  ')': '-.--.-', '&': '.-...',  ':': '---...',
  ';': '-.-.-.', '=': '-...-',  '+': '.-.-.',  '-': '-....-', '_': '..--.-',
  '"': '.-..-.', '$': '...-..-', '@': '.--.-.'
};

const MORSE_A_TEXTO = Object.entries(DICCIONARIO_MORSE).reduce((acc, [char, morse]) => {
  acc[morse] = char;
  return acc;
}, {});

const normalizarTexto = (texto = '') => {
  return texto
    .toUpperCase()
    .replace(/[ÁÀÄÂ]/g, 'A')
    .replace(/[ÉÈËÊ]/g, 'E')
    .replace(/[ÍÌÏÎ]/g, 'I')
    .replace(/[ÓÒÖÔ]/g, 'O')
    .replace(/[ÚÙÜÛ]/g, 'U');
};

// Validación de texto
const validarTexto = (texto) => {
  if (!texto || !texto.trim()) return { esValido: true, mensaje: '' };

  const normalizado = normalizarTexto(texto);
  const invalidos = new Set();

  for (const c of normalizado) {
    if (c !== ' ' && c !== '\n' && c !== '\t' && !(c in DICCIONARIO_MORSE)) {
      invalidos.add(c);
    }
  }

  const lista = Array.from(invalidos);
  return {
    esValido: lista.length === 0,
    mensaje: lista.length === 0 ? '' : `Caracteres no válidos: ${lista.join(', ')}`
  };
};

// Validación de código morse
const validarMorse = (morse) => {
  if (!morse || !morse.trim()) return { esValido: true, mensaje: '' };

  const tokensInvalidos = morse.match(/[^.\-_/ \t\n]/g);
  if (tokensInvalidos) {
    const unicos = Array.from(new Set(tokensInvalidos));
    return {
      esValido: false,
      mensaje: `Símbolos inválidos: ${unicos.join(', ')}. Solo se permite "." "-" y "/"`
    };
  }

  const palabras = morse.replace(/_/g, '-').split(/\s*\/\s*|\s{3,}/);
  const desconocidas = new Set();

  palabras.forEach(palabra => {
    palabra.trim().split(/\s+/).forEach(cod => {
      if (cod && !MORSE_A_TEXTO[cod]) desconocidas.add(cod);
    });
  });

  const lista = Array.from(desconocidas);
  return {
    esValido: lista.length === 0,
    mensaje: lista.length === 0 ? '' : `Códigos no reconocidos: ${lista.map(s => `[${s}]`).join(', ')}`
  };
};

// Traducciones
const traducirTextoAMorse = (texto) => {
  if (!texto || !texto.trim()) return '';
  return normalizarTexto(texto).split(/\r?\n/).map(linea => {
    return linea.trim().split(/\s+/).map(palabra => {
      return [...palabra].map(c => DICCIONARIO_MORSE[c] || '#').join(' ');
    }).join(' / ');
  }).join('\n');
};

const traducirMorseATexto = (morse) => {
  if (!morse || !morse.trim()) return '';
  return morse.replace(/_/g, '-').split(/\r?\n/).map(linea => {
    return linea.trim().split(/\s*\/\s*|\s{3,}/).map(palabra => {
      if (!palabra) return '';
      return palabra.trim().split(/\s+/).map(cod => MORSE_A_TEXTO[cod] || '?').join('');
    }).join(' ');
  }).join('\n');
};

let modoActual = 'TEXTO_A_MORSE';

const elementos = {
  inputText: document.getElementById('inputText'),
  outputText: document.getElementById('outputText'),
  btnToggleMode: document.getElementById('btnToggleMode'),
  sourceModeLabel: document.getElementById('sourceModeLabel'),
  targetModeLabel: document.getElementById('targetModeLabel'),
  inputCardTitle: document.getElementById('inputCardTitle'),
  outputCardTitle: document.getElementById('outputCardTitle'),
  btnClear: document.getElementById('btnClear'),
  btnCopy: document.getElementById('btnCopy'),
  validationFeedback: document.getElementById('validationFeedback'),
  charCountBadge: document.getElementById('charCountBadge'),
  copyToast: document.getElementById('copyToast'),
  morseKeypad: document.getElementById('morseKeypad'),
  lettersContainer: document.getElementById('lettersContainer'),
  numbersContainer: document.getElementById('numbersContainer'),
  symbolsContainer: document.getElementById('symbolsContainer')
};

const procesarTraduccion = () => {
  const entrada = elementos.inputText.value;
  elementos.charCountBadge.textContent = `${entrada.length} caracteres`;

  if (!entrada.trim()) {
    elementos.outputText.value = '';
    elementos.validationFeedback.textContent = '';
    elementos.validationFeedback.classList.add('d-none');
    return;
  }

  if (modoActual === 'TEXTO_A_MORSE') {
    const val = validarTexto(entrada);
    mostrarValidacion(val);
    elementos.outputText.value = traducirTextoAMorse(entrada);
  } else {
    const val = validarMorse(entrada);
    mostrarValidacion(val);
    elementos.outputText.value = traducirMorseATexto(entrada);
  }
};

const mostrarValidacion = (res) => {
  if (!res.esValido && res.mensaje) {
    elementos.validationFeedback.textContent = res.mensaje;
    elementos.validationFeedback.className = 'text-danger small mt-2';
  } else {
    elementos.validationFeedback.textContent = '';
    elementos.validationFeedback.className = 'd-none';
  }
};

const alternarModo = () => {
  modoActual = (modoActual === 'TEXTO_A_MORSE') ? 'MORSE_A_TEXTO' : 'TEXTO_A_MORSE';
  const esTexto = modoActual === 'TEXTO_A_MORSE';

  elementos.sourceModeLabel.textContent = esTexto ? 'Texto' : 'Morse';
  elementos.targetModeLabel.textContent = esTexto ? 'Morse' : 'Texto';
  elementos.inputCardTitle.textContent = esTexto ? 'Texto' : 'Morse';
  elementos.outputCardTitle.textContent = esTexto ? 'Morse' : 'Texto';

  elementos.inputText.placeholder = esTexto
    ? 'Escribe el texto aquí...'
    : 'Ingresa código morse (. para punto, - para raya, / para palabra)...';

  elementos.inputText.className = `form-control textarea-field ${esTexto ? '' : 'font-monospace'}`;
  elementos.outputText.className = `form-control textarea-field ${esTexto ? 'font-monospace' : ''}`;

  if (esTexto) {
    elementos.morseKeypad.classList.add('d-none');
  } else {
    elementos.morseKeypad.classList.remove('d-none');
  }

  const salidaPrevia = elementos.outputText.value;
  if (salidaPrevia.trim()) {
    elementos.inputText.value = salidaPrevia;
  }

  procesarTraduccion();
};

let toastTimer = null;
const mostrarToast = (msg) => {
  if (toastTimer) clearTimeout(toastTimer);
  elementos.copyToast.textContent = msg;
  elementos.copyToast.classList.add('show');
  toastTimer = setTimeout(() => elementos.copyToast.classList.remove('show'), 1500);
};

const inicializarTablaReferencia = () => {
  const letras = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');
  const numeros = '0123456789'.split('');
  const simbolos = ['.', ',', '?', "'", '!', '/', '(', ')', '&', ':', ';', '=', '+', '-', '_', '"', '$', '@'];

  const crearItem = (c, m) => {
    const el = document.createElement('div');
    el.className = 'morse-item';
    el.innerHTML = `<strong>${c}</strong><span>${m}</span>`;
    el.addEventListener('click', () => {
      const agregar = (modoActual === 'TEXTO_A_MORSE') ? c : `${m} `;
      elementos.inputText.value += agregar;
      elementos.inputText.focus();
      procesarTraduccion();
    });
    return el;
  };

  letras.forEach(c => DICCIONARIO_MORSE[c] && elementos.lettersContainer.appendChild(crearItem(c, DICCIONARIO_MORSE[c])));
  numeros.forEach(c => DICCIONARIO_MORSE[c] && elementos.numbersContainer.appendChild(crearItem(c, DICCIONARIO_MORSE[c])));
  simbolos.forEach(c => DICCIONARIO_MORSE[c] && elementos.symbolsContainer.appendChild(crearItem(c, DICCIONARIO_MORSE[c])));
};

document.addEventListener('DOMContentLoaded', () => {
  inicializarTablaReferencia();

  elementos.inputText.addEventListener('input', procesarTraduccion);
  elementos.btnToggleMode.addEventListener('click', alternarModo);

  elementos.btnClear.addEventListener('click', () => {
    elementos.inputText.value = '';
    elementos.inputText.focus();
    procesarTraduccion();
  });

  elementos.btnCopy.addEventListener('click', async () => {
    const valor = elementos.outputText.value;
    if (!valor) return;
    try {
      await navigator.clipboard.writeText(valor);
      mostrarToast('Copiado');
    } catch {
      elementos.outputText.select();
      document.execCommand('copy');
      mostrarToast('Copiado');
    }
  });

  elementos.morseKeypad.querySelectorAll('.btn-key').forEach(btn => {
    btn.addEventListener('click', () => {
      elementos.inputText.value += btn.getAttribute('data-key');
      elementos.inputText.focus();
      procesarTraduccion();
    });
  });

  procesarTraduccion();
});

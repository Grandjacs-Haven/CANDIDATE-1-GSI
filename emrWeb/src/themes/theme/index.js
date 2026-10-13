// ==============================|| PRESET THEME - DEFAULT ||============================== //

export default function Default(colors) {
  const { red, gold, cyan, green, grey } = colors;
  const greyColors = {
    0: grey[0],
    50: grey[1],
    100: grey[2],
    200: grey[3],
    300: grey[4],
    400: grey[5],
    500: grey[6],
    600: grey[7],
    700: grey[8],
    800: grey[9],
    900: grey[10],
    A50: grey[15],
    A100: grey[11],
    A200: grey[12],
    A400: grey[13],
    A700: grey[14],
    A800: grey[16]
  };
  const contrastText = '#fff';

  return {
    primary: {
      lighter: '#fde7e7',
      100: '#f9c9c9',
      200: '#f4aaaa',
      light: '#ef8a8a',
      400: '#e55d5d',
      main: '#c62828',
      dark: '#a61f1f',
      700: '#8f1919',
      darker: '#6f1010',
      900: '#4f0808',
      contrastText
    },
    secondary: {
      lighter: '#e0f3f1',
      100: '#c1e7e3',
      200: '#9ed8d3',
      light: '#72c2bb',
      400: '#43a79f',
      main: '#0f766e',
      600: '#0b5e58',
      dark: '#094944',
      800: '#063734',
      darker: '#042624',
      A100: '#f4fbfa',
      A200: '#bee8e4',
      A300: '#7dd1c6',
      contrastText
    },
    error: {
      lighter: red[0],
      light: red[2],
      main: red[4],
      dark: red[7],
      darker: red[9],
      contrastText
    },
    warning: {
      lighter: gold[0],
      light: gold[3],
      main: gold[5],
      dark: gold[7],
      darker: gold[9],
      contrastText: greyColors[100]
    },
    info: {
      lighter: cyan[0],
      light: cyan[3],
      main: cyan[5],
      dark: cyan[7],
      darker: cyan[9],
      contrastText
    },
    success: {
      lighter: green[0],
      light: green[3],
      main: green[5],
      dark: green[7],
      darker: green[9],
      contrastText
    },
    grey: greyColors
  };
}

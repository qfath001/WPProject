import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#00205B', // Dark blue (ODU's color)
    },
    secondary: {
      main: '#ffffff', // White
    },
    background: {
      default: '#ffffff', // Page background white
      paper: '#F5F5F5', // Slightly lighter background for cards or sections
    },
  },
  typography: {
    fontFamily: 'Arial, sans-serif', // You can customize fonts here
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Rounded buttons for a modern look
          textTransform: 'none', // Remove uppercase styling on buttons
        },
      },
    },
  },
});

export default theme;

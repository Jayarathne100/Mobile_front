import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useNavigate } from "react-router-dom";

export default function ButtonAppBar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");  // example: remove token
    navigate("/"); // Navigate to login page
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ flexGrow: 1 }}
          >
            Shop
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
    </Box>
  );
}

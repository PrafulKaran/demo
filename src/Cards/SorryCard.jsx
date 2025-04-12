import React, { useState } from 'react';
import { Button, Card, Typography, Box } from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';
import Confetti from 'react-confetti';

const SorryCard = () => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [noPosition, setNoPosition] = useState({ x: 0, y: 0 });

  const handleYesClick = () => {
    setShowConfetti(true);
    setTimeout(() => {
      setShowConfetti(false); // Hide confetti after a few seconds
    }, 5000);
  };

  const handleNoHover = () => {
    const maxX = window.innerWidth - 100;
    const maxY = window.innerHeight - 100;
    const randX = Math.random() * maxX;
    const randY = Math.random() * maxY;

    setNoPosition({ x: randX, y: randY });
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(to top right, #ffd6d6, #fef6f9)',
        padding: 2,
      }}
    >
      <Card
        sx={{
          width: 400,
          padding: 4,
          textAlign: 'center',
          boxShadow: 3,
          borderRadius: 3,
          position: 'relative',
          backgroundColor: '#fff',
        }}
      >
        <Box
          sx={{
            marginBottom: 2,
            backgroundColor: 'red',
            borderRadius: '50%',
            width: '100px',
            height: '90px',
            position: 'relative',
            margin: 'auto',
            animation: 'beat 1s infinite',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: '-50px',
              left: 0,
              backgroundColor: 'red',
              width: '100px',
              height: '90px',
              borderRadius: '50%',
            }}
          ></Box>
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: '50px',
              backgroundColor: 'red',
              width: '100px',
              height: '90px',
              borderRadius: '50%',
            }}
          ></Box>
        </Box>

        <Typography variant="h5" sx={{ fontWeight: 'bold', marginBottom: 2 }}>
          I messed up. I'm truly sorry.
        </Typography>

        <Typography variant="body1" sx={{ marginBottom: 2 }}>
          You mean the world to me, and I hate that I made you feel hurt. Every
          moment without your smile feels like a broken code I can't fix.
        </Typography>

        <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'gray' }}>
          "In a world full of bugs, you're my only exception."
        </Typography>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 4,
            position: 'relative',
          }}
        >
          <Button
            variant="contained"
            color="success"
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: 80,
              height: 80,
              borderRadius: '50%',
              boxShadow: 3,
              '&:hover': { backgroundColor: 'green' },
            }}
            onClick={handleYesClick}
          >
            <CheckCircle sx={{ fontSize: 40 }} />
          </Button>

          <Button
            variant="contained"
            color="error"
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: 80,
              height: 80,
              borderRadius: '50%',
              boxShadow: 3,
              position: 'absolute',
              left: `${noPosition.x}px`,
              top: `${noPosition.y}px`,
              '&:hover': { backgroundColor: 'red' },
            }}
            onMouseOver={handleNoHover}
          >
            <Cancel sx={{ fontSize: 40 }} />
          </Button>
        </Box>

        {showConfetti && (
          <Confetti
            width={window.innerWidth}
            height={window.innerHeight}
            recycle={false}
            numberOfPieces={200}
            gravity={0.1}
            colors={['#ff0', '#ff0', '#ff7f00', '#ff00ff']}
          />
        )}
      </Card>
    </Box>
  );
};

export default SorryCard;

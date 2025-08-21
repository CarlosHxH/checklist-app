"use client"
import React from 'react';
import { IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';

// Expanda o ícone de expansão para girar quando expandido
const ExpandMore = styled((props: { expanded: boolean } & React.ComponentProps<typeof IconButton>) => {
    const { expanded, ...other } = props;
    return <IconButton {...other} />;
})(({ theme, expanded }) => ({
    transform: !expanded ? 'rotate(0deg)' : 'rotate(180deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
        duration: theme.transitions.duration.shortest,
    })
}));
export default ExpandMore
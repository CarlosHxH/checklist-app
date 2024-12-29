import React from 'react';
import { Container } from '@mui/material';
import CreateUserForm from './CreateUserForm';

const CreateUserPage: React.FC = () => {
  return (
    <Container maxWidth="sm">
      <h1>Criar usuário</h1>
      <CreateUserForm />
    </Container>
  );
};

export default CreateUserPage;
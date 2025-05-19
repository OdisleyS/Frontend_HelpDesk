// jest.setup.js (na raiz do projeto)
import '@testing-library/jest-dom';


// Configuração do localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(() => null),
    setItem: jest.fn(() => null),
    removeItem: jest.fn(() => null),
  },
  writable: true
});

// Configuração do sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: jest.fn(() => null),
    setItem: jest.fn(() => null),
    removeItem: jest.fn(() => null),
  },
  writable: true
});

// Mock global para fetch
global.fetch = jest.fn();

// Silenciar avisos durante os testes
jest.spyOn(console, 'warn').mockImplementation(() => {});